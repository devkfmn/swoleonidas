/** Firestore rejects undefined values in nested objects. */
export function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function formatFirebaseError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code === 'permission-denied') {
      return 'Firestore permission denied. Security rules may not be deployed yet.'
    }
    if (code === 'unavailable' || code === 'not-found') {
      return 'Firestore database is not available. Check that Firestore is enabled in Firebase Console.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred while saving the program.'
}

export function snapshotErrorHandler(label: string) {
  return (error: Error) => {
    console.error(`Firestore listener error (${label}):`, error)
  }
}
