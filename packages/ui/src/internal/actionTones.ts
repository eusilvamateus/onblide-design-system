import { OB_TONES } from './obTones';
import type { Tone } from './tone';

export type ActionTone = Extract<Tone, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'>;

export interface ActionToneColors {
  fg: string;
  bg: string;
}

export const ACTION_TONES: Record<ActionTone, ActionToneColors> = {
  neutral: { fg: 'var(--ob-fg-strong)', bg: 'var(--ob-surface-2)' },
  primary: { fg: 'var(--ob-blue)', bg: 'var(--ob-blue-050)' },
  success: { fg: OB_TONES.success.strong, bg: OB_TONES.success.bg },
  warning: { fg: OB_TONES.warning.strong, bg: OB_TONES.warning.bg },
  danger:  { fg: OB_TONES.danger.strong, bg: OB_TONES.danger.bg },
};
