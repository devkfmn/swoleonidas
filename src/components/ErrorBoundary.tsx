import { Component, type ErrorInfo, type ReactNode } from 'react'
import { GreekCard } from './ui/GreekCard'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Swoleonidas render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-marble p-4">
          <GreekCard className="max-w-lg">
            <h1 className="font-display text-xl font-semibold text-status-missed">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-muted">{this.state.error.message}</p>
          </GreekCard>
        </div>
      )
    }
    return this.props.children
  }
}
