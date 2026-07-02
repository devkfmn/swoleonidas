import type { Program, ProgramSettings } from '../validation/programSchema'

export interface ResolvedProgramSettings {
  missedBehavior: 'mark_missed'
  trackingLevel: 'exercise'
  allowPartialCompletion: boolean
  restDayStatus: 'rest'
}

const DEFAULTS: ResolvedProgramSettings = {
  missedBehavior: 'mark_missed',
  trackingLevel: 'exercise',
  allowPartialCompletion: true,
  restDayStatus: 'rest',
}

export function getProgramSettings(program: Program): ResolvedProgramSettings {
  const settings: ProgramSettings | undefined = program.settings
  return {
    missedBehavior: settings?.missedBehavior ?? DEFAULTS.missedBehavior,
    trackingLevel: settings?.trackingLevel ?? DEFAULTS.trackingLevel,
    allowPartialCompletion: settings?.allowPartialCompletion ?? DEFAULTS.allowPartialCompletion,
    restDayStatus: settings?.restDayStatus ?? DEFAULTS.restDayStatus,
  }
}
