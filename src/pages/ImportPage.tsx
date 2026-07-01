import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImportJsonPanel } from '../components/domain/ImportJsonPanel'
import { PageHeader } from '../components/ui/Icons'
import { usePrograms } from '../hooks/usePrograms'
import { formatFirebaseError } from '../lib/firebase/utils'

export function ImportPage() {
  const { importProgram } = usePrograms()
  const navigate = useNavigate()
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleImport = async (program: Parameters<typeof importProgram>[0]) => {
    setImporting(true)
    setImportError(null)
    try {
      await importProgram(program)
      navigate('/programs', { state: { imported: program.programName }, replace: true })
    } catch (error) {
      setImportError(formatFirebaseError(error))
      throw error
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Import Program"
        subtitle="Describe your goal, copy the generated prompt, then import the JSON your AI returns."
      />
      <ImportJsonPanel
        onImport={handleImport}
        importing={importing}
        importError={importError}
      />
    </>
  )
}
