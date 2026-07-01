import { GreekCard } from '../components/ui/GreekCard'
import { SpartanHelmet } from '../components/ui/Icons'

export function FirebaseSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-marble px-4 py-12">
      <GreekCard className="w-full max-w-lg shadow-xl">
        <div className="mb-4 flex justify-center text-bronze">
          <SpartanHelmet className="h-16 w-16" />
        </div>
        <h1 className="font-display text-center text-2xl font-bold text-ink">Firebase setup required</h1>
        <p className="mt-3 text-center text-sm text-ink-muted">
          Swoleonidas needs Firebase credentials before it can run. The app loaded successfully —
          you just need to connect it to your Firebase project.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-ink-muted">
          <li>Copy <code className="rounded bg-stone-elevated px-1">.env.example</code> to <code className="rounded bg-stone-elevated px-1">.env.local</code></li>
          <li>Create a Firebase project and register a web app</li>
          <li>Paste your Firebase config values into <code className="rounded bg-stone-elevated px-1">.env.local</code></li>
          <li>Enable Google Authentication and create a Firestore database</li>
          <li>Restart the dev server: <code className="rounded bg-stone-elevated px-1">npm run dev</code></li>
        </ol>
        <p className="mt-6 text-xs text-ink-muted">
          See <code className="rounded bg-stone-elevated px-1">README.md</code> for full setup instructions.
        </p>
      </GreekCard>
    </div>
  )
}
