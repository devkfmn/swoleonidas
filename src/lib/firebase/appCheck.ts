import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check'
import type { FirebaseApp } from 'firebase/app'

let appCheck: AppCheck | undefined
let initialized = false

declare global {
  // Debug token support for local development when enforcement is on
  // and reCAPTCHA cannot attest the environment.
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined
}

export function initFirebaseAppCheck(app: FirebaseApp): AppCheck | undefined {
  if (initialized) return appCheck
  initialized = true

  // reCAPTCHA Enterprise site keys are public client identifiers (not secrets).
  const siteKey =
    (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY as string | undefined) ||
    '6LfKZ2AtAAAAAEMiFK7ue7TNDdU4_vLnOwaqhiE1'

  // Opt-in debug attestation for environments reCAPTCHA cannot score.
  // Set VITE_FIREBASE_APPCHECK_DEBUG=true, copy the console debug token,
  // and register it in Firebase Console → App Check → Manage debug tokens.
  if (import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG === 'true') {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      self.FIREBASE_APPCHECK_DEBUG_TOKEN ?? true
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })

  return appCheck
}
