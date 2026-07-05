import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreateProgramPanel } from '../components/domain/CreateProgramPanel'
import { PageHeader } from '../components/ui/Icons'
import { usePrograms } from '../hooks/usePrograms'
import { formatFirebaseError } from '../lib/firebase/utils'
import type { Program } from '../lib/validation/programSchema'

export function CreateProgramPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const updateProgramId = (location.state as { updateProgramId?: string } | null)?.updateProgramId
  const { importProgram, upsertProgram, activateProgram, hasProgram } = usePrograms()
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [lastImported, setLastImported] = useState<Program | null>(null)

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

  return (
    <>
      <PageHeader
        title="Create Program"
        subtitle={
          updateProgramId
            ? `Updating program "${updateProgramId}". Paste a response with the same programId to replace the plan.`
            : 'Describe your goal, copy the generated prompt, then paste the JSON to save.'
        }
      />
      <CreateProgramPanel
        onImport={handleImport}
        importing={importing}
        importError={importError}
        hasProgram={hasProgram}
        lastImported={lastImported}
        onActivateAndStart={handleActivateAndStart}
        onViewPrograms={() => navigate('/programs', { replace: true })}
      />
    </>
  )
}
