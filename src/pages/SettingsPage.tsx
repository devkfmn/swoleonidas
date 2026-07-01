import { useState } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { StoneButton } from '../components/ui/StoneButton'
import { useAuth } from '../hooks/useAuth'
import { useActiveProgram } from '../hooks/useActiveProgram'
import { useCompletionLog } from '../hooks/useCompletionLog'
import { deleteAllUserData } from '../lib/firebase/firestore'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { activeProgram } = useActiveProgram()
  const programId = activeProgram?.program.programId ?? null
  const { resetAllForProgram } = useCompletionLog('', programId, null)

  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <PageHeader title="Settings" />

      <GreekCard title="Profile" className="mb-4">
        {user && (
          <div className="flex items-center gap-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="h-14 w-14 rounded-full border border-stone-border"
              />
            )}
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-ink-muted">{user.email}</p>
            </div>
          </div>
        )}
        <StoneButton variant="secondary" className="mt-4" onClick={signOut}>
          Sign out
        </StoneButton>
      </GreekCard>

      <GreekCard title="Active Program" className="mb-4">
        {activeProgram ? (
          <div>
            <p className="font-medium">{activeProgram.program.programName}</p>
            <p className="text-sm text-ink-muted">{activeProgram.program.programId}</p>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No active program.</p>
        )}
      </GreekCard>

      <GreekCard title="Data" className="mb-4">
        <div className="space-y-3">
          <StoneButton
            variant="secondary"
            disabled={!programId}
            onClick={() => setConfirmReset(true)}
          >
            Reset completion logs for active program
          </StoneButton>
          <StoneButton variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete all user data
          </StoneButton>
        </div>
      </GreekCard>

      <GreekCard title="Theme Preview" className="mb-4">
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-lg bg-marble border border-stone-border" title="Marble" />
          <div className="h-10 w-10 rounded-lg bg-bronze" title="Bronze" />
          <div className="h-10 w-10 rounded-lg bg-ink" title="Ink" />
          <div className="h-10 w-10 rounded-lg bg-status-complete" title="Complete" />
        </div>
        <p className="mt-2 text-xs text-ink-muted">Ancient Sparta meets modern habit tracker.</p>
      </GreekCard>

      <p className="text-xs text-ink-muted">Swoleonidas v1.0.0</p>

      <ConfirmDialog
        open={confirmReset}
        title="Reset completion logs?"
        message="This will delete all completion logs for the active program. The program itself will not be deleted."
        confirmLabel="Reset logs"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          if (programId) await resetAllForProgram(programId)
          setConfirmReset(false)
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete all data?"
        message="This will permanently delete all your programs, completion logs, and settings. This cannot be undone."
        confirmLabel="Delete everything"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (user) await deleteAllUserData(user.uid)
          setConfirmDelete(false)
        }}
      />
    </>
  )
}
