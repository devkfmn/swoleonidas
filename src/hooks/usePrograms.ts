import { useCallback, useEffect, useState } from 'react'
import type { Program } from '../lib/validation/programSchema'
import type { StoredProgram } from '../types/program'
import {
  activateProgram as activateProgramDb,
  deactivateProgram as deactivateProgramDb,
  deleteProgram as deleteProgramDb,
  duplicateProgram as duplicateProgramDb,
  importProgram as importProgramDb,
  subscribePrograms,
  updateProgramStartDate as updateProgramStartDateDb,
  upsertProgram as upsertProgramDb,
} from '../lib/firebase/firestore'
import { useAuth } from './useAuth'

export function usePrograms() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<StoredProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPrograms([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribePrograms(user.uid, (data) => {
      setPrograms(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const importProgram = useCallback(
    async (program: Program) => {
      if (!user) {
        throw new Error('You must be signed in to import a program.')
      }
      await importProgramDb(user.uid, program)
    },
    [user],
  )

  const upsertProgram = useCallback(
    async (program: Program) => {
      if (!user) {
        throw new Error('You must be signed in to import a program.')
      }
      return upsertProgramDb(user.uid, program)
    },
    [user],
  )

  const updateStartDate = useCallback(
    async (programId: string, startDate: string) => {
      if (!user) {
        throw new Error('You must be signed in to update a program.')
      }
      await updateProgramStartDateDb(user.uid, programId, startDate)
    },
    [user],
  )

  const duplicateProgram = useCallback(
    async (
      sourceProgramId: string,
      newProgramId: string,
      newStartDate: string,
      newProgramName?: string,
    ) => {
      if (!user) {
        throw new Error('You must be signed in to duplicate a program.')
      }
      return duplicateProgramDb(
        user.uid,
        sourceProgramId,
        newProgramId,
        newStartDate,
        newProgramName,
      )
    },
    [user],
  )

  const activateProgram = useCallback(
    async (programId: string) => {
      if (!user) {
        throw new Error('You must be signed in to activate a program.')
      }
      await activateProgramDb(user.uid, programId)
    },
    [user],
  )

  const deactivateProgram = useCallback(async () => {
    if (!user) {
      throw new Error('You must be signed in to deactivate a program.')
    }
    await deactivateProgramDb(user.uid)
  }, [user])

  const deleteProgram = useCallback(
    async (programId: string) => {
      if (!user) {
        throw new Error('You must be signed in to delete a program.')
      }
      await deleteProgramDb(user.uid, programId)
    },
    [user],
  )

  const hasProgram = useCallback(
    (programId: string) => programs.some((p) => p.program.programId === programId),
    [programs],
  )

  return {
    programs,
    loading,
    importProgram,
    upsertProgram,
    updateStartDate,
    duplicateProgram,
    activateProgram,
    deactivateProgram,
    deleteProgram,
    hasProgram,
  }
}
