import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreateProgramPanel } from '../components/domain/CreateProgramPanel'
import { ProgramCard } from '../components/domain/ProgramCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { StoneButton } from '../components/ui/StoneButton'
import { usePrograms } from '../hooks/usePrograms'
import { formatFirebaseError } from '../lib/firebase/utils'
import type { Program } from '../lib/validation/programSchema'

type LocationState = {
  showCreate?: boolean
  updateProgramId?: string
  imported?: string
}

export function ProgramsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LocationState | null

  const {
    programs,
    loading,
    activateProgram,
    deactivateProgram,
    deleteProgram,
    importProgram,
    upsertProgram,
    hasProgram,
  } = usePrograms()

  const [importedName] = useState(() => locationState?.imported)
  const [showCreate, setShowCreate] = useState(
    () => !!(locationState?.showCreate || locationState?.updateProgramId),
  )
  const [updateProgramId, setUpdateProgramId] = useState<string | undefined>(
    () => locationState?.updateProgramId,
  )
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [lastImported, setLastImported] = useState<Program | null>(null)
  const [savedBannerName, setSavedBannerName] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (location.state) {
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!loading && programs.length === 0) {
      setShowCreate(true)
    }
  }, [loading, programs.length])

  const handleImport = async (
    program: Program,
    mode: 'create' | 'update',
  ): Promise<'created' | 'updated'> => {
    setImporting(true)
    setImportError(null)
    try {
      if (mode === 'update') {
        await upsertProgram(program)
        setLastImported(program)
        return 'updated'
      }
      await importProgram(program)
      setLastImported(program)
      return 'created'
    } catch (error) {
      setImportError(formatFirebaseError(error))
      throw error
    } finally {
      setImporting(false)
    }
  }

  const handleActivateAndStart = async () => {
    if (!lastImported) return
    setImporting(true)
    setImportError(null)
    try {
      await activateProgram(lastImported.programId)
      navigate('/today', { replace: true })
    } catch (error) {
      setImportError(formatFirebaseError(error))
    } finally {
      setImporting(false)
    }
  }

  const handleDone = () => {
    if (lastImported) {
      setSavedBannerName(lastImported.programName)
      setLastImported(null)
    }
    setShowCreate(false)
    setUpdateProgramId(undefined)
  }

  const handleCancelCreate = () => {
    setShowCreate(false)
    setUpdateProgramId(undefined)
    setLastImported(null)
    setImportError(null)
  }

  const bannerName = savedBannerName ?? importedName

  const subtitle = updateProgramId
    ? `Updating program "${updateProgramId}". Paste a response with the same programId to replace the plan.`
    : showCreate && programs.length === 0
      ? 'Describe your goal, copy the generated prompt, then paste the JSON to save.'
      : 'Your training programs'

  if (loading) return <p className="text-ink-muted">Loading...</p>

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <PageHeader title="Programs" subtitle={subtitle} />
        </div>
        {programs.length > 0 && (
          <div className="shrink-0 pt-1">
            {showCreate ? (
              <StoneButton variant="secondary" onClick={handleCancelCreate}>
                Cancel
              </StoneButton>
            ) : (
              <StoneButton onClick={() => setShowCreate(true)}>Create program</StoneButton>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="mb-6">
          <CreateProgramPanel
            onImport={handleImport}
            importing={importing}
            importError={importError}
            hasProgram={hasProgram}
            lastImported={lastImported}
            onActivateAndStart={handleActivateAndStart}
            onDone={handleDone}
          />
        </div>
      )}

      {bannerName && !showCreate && (
        <GreekCard className="mb-4 border-status-complete/30 bg-status-complete/10">
          <p className="text-sm text-status-complete">
            <span className="font-semibold">{bannerName}</span> saved successfully. Activate it to
            start training.
          </p>
        </GreekCard>
      )}

      {programs.length > 0 && (
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
