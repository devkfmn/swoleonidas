import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  deleteDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Program } from '../validation/programSchema'
import type { CompletionLog, StoredProgram, UserSettings } from '../../types/program'
import { getFirebaseDb } from './config'
import { sanitizeForFirestore, snapshotErrorHandler } from './utils'

const db = () => getFirebaseDb()

export function programsRef(userId: string) {
  return collection(db(), 'users', userId, 'programs')
}

export function programDocRef(userId: string, programId: string) {
  return doc(db(), 'users', userId, 'programs', programId)
}

export function completionLogsRef(userId: string) {
  return collection(db(), 'users', userId, 'completionLogs')
}

export function completionLogDocRef(userId: string, logId: string) {
  return doc(db(), 'users', userId, 'completionLogs', logId)
}

export function settingsDocRef(userId: string) {
  return doc(db(), 'users', userId, 'settings', 'main')
}

export function completionLogId(date: string, programId: string) {
  return `${date}_${programId}`
}

export function subscribePrograms(
  userId: string,
  callback: (programs: StoredProgram[]) => void,
): Unsubscribe {
  return onSnapshot(
    programsRef(userId),
    (snapshot) => {
      const programs = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          program: data.program as Program,
          importedAt: data.importedAt,
          updatedAt: data.updatedAt,
          isActive: Boolean(data.isActive),
        }
      })
      callback(programs)
    },
    snapshotErrorHandler('programs'),
  )
}

export function subscribeSettings(
  userId: string,
  callback: (settings: UserSettings | null) => void,
): Unsubscribe {
  return onSnapshot(
    settingsDocRef(userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }
      const data = snapshot.data()
      callback({
        activeProgramId: (data.activeProgramId as string | null) ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    },
    snapshotErrorHandler('settings'),
  )
}

export async function importProgram(userId: string, program: Program) {
  const ref = programDocRef(userId, program.programId)
  const sanitizedProgram = sanitizeForFirestore(program)
  await setDoc(ref, {
    program: sanitizedProgram,
    importedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: false,
  })
}

export async function activateProgram(userId: string, programId: string) {
  const programsSnap = await getDocs(programsRef(userId))
  const batch = writeBatch(db())

  programsSnap.docs.forEach((d) => {
    batch.update(d.ref, {
      isActive: d.id === programId,
      updatedAt: serverTimestamp(),
    })
  })

  batch.set(
    settingsDocRef(userId),
    {
      activeProgramId: programId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )

  await batch.commit()
}

export async function deactivateProgram(userId: string) {
  const programsSnap = await getDocs(programsRef(userId))
  const batch = writeBatch(db())

  programsSnap.docs.forEach((d) => {
    batch.update(d.ref, { isActive: false, updatedAt: serverTimestamp() })
  })

  batch.set(
    settingsDocRef(userId),
    { activeProgramId: null, updatedAt: serverTimestamp() },
    { merge: true },
  )

  await batch.commit()
}

export async function deleteProgram(userId: string, programId: string) {
  const logsQuery = query(completionLogsRef(userId), where('programId', '==', programId))
  const logsSnap = await getDocs(logsQuery)
  const batch = writeBatch(db())

  logsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(programDocRef(userId, programId))

  const settingsSnap = await getDoc(settingsDocRef(userId))
  if (settingsSnap.exists() && settingsSnap.data().activeProgramId === programId) {
    batch.set(
      settingsDocRef(userId),
      { activeProgramId: null, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  await batch.commit()
}

export function subscribeCompletionLog(
  userId: string,
  date: string,
  programId: string,
  callback: (log: CompletionLog | null) => void,
): Unsubscribe {
  const id = completionLogId(date, programId)
  return onSnapshot(
    completionLogDocRef(userId, id),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }
      callback(snapshot.data() as CompletionLog)
    },
    snapshotErrorHandler('completionLog'),
  )
}

export async function saveCompletionLog(userId: string, log: CompletionLog) {
  const id = completionLogId(log.date, log.programId)
  const ref = completionLogDocRef(userId, id)
  const existing = await getDoc(ref)
  await setDoc(
    ref,
    {
      ...log,
      updatedAt: serverTimestamp(),
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    },
    { merge: true },
  )
}

export async function deleteCompletionLog(userId: string, date: string, programId: string) {
  await deleteDoc(completionLogDocRef(userId, completionLogId(date, programId)))
}

export async function getCompletionLogsForRange(
  userId: string,
  programId: string,
  startDate: string,
  endDate: string,
): Promise<CompletionLog[]> {
  const q = query(
    completionLogsRef(userId),
    where('programId', '==', programId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as CompletionLog)
}

export async function resetAllLogsForProgram(userId: string, programId: string) {
  const q = query(completionLogsRef(userId), where('programId', '==', programId))
  const snap = await getDocs(q)
  const batch = writeBatch(db())
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

export async function deleteAllUserData(userId: string) {
  const programsSnap = await getDocs(programsRef(userId))
  const logsSnap = await getDocs(completionLogsRef(userId))
  const batch = writeBatch(db())
  programsSnap.docs.forEach((d) => batch.delete(d.ref))
  logsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(settingsDocRef(userId))
  await batch.commit()
}
