import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProgramCard } from '../components/domain/ProgramCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { usePrograms } from '../hooks/usePrograms'

export function ProgramsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const importedName = (location.state as { imported?: string } | null)?.imported
  const { programs, loading, activateProgram, deactivateProgram, deleteProgram } = usePrograms()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (loading) return <p className="text-ink-muted">Loading...</p>

  return (
    <>
      <PageHeader title="Programs" subtitle="Imported training programs" />

      {importedName && (
        <GreekCard className="mb-4 border-status-complete/30 bg-status-complete/10">
          <p className="text-sm text-status-complete">
            <span className="font-semibold">{importedName}</span> imported successfully. Activate it to start training.
          </p>
        </GreekCard>
      )}

      {programs.length === 0 ? (
        <EmptyState
          title="No programs yet"
          description="Import a structured JSON program to get started."
          actionLabel="Import Program"
          onAction={() => navigate('/import')}
        />
      ) : (
        <div className="space-y-4">
          {programs.map((stored) => (
            <ProgramCard
              key={stored.program.programId}
              stored={stored}
              onActivate={() => activateProgram(stored.program.programId)}
              onDeactivate={deactivateProgram}
              onDelete={() => setDeleteId(stored.program.programId)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete program?"
        message="This will permanently delete the program and all its completion logs."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteProgram(deleteId)
          setDeleteId(null)
        }}
      />
    </>
  )
}
