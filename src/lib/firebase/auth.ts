import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './config'

const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured')
  }
  return signInWithPopup(getFirebaseAuth(), provider)
}

export async function signOut() {
  if (!isFirebaseConfigured()) return
  return firebaseSignOut(getFirebaseAuth())
}
