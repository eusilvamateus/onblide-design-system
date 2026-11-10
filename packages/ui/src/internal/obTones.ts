import type { Tone } from './tone';

export type OBTone = Extract<Tone, 'info' | 'success' | 'warning' | 'danger'>;

export interface OBToneColors {
  fg: string;
  bg: string;
  tint: string;
  strong: string;
  border: string;
  icon: string;
}

export const OB_TONES: Record<OBTone, OBToneColors> = {
  info:    { fg: 'var(--ob-blue)',   bg: 'var(--ob-blue-100)',   tint: 'var(--ob-blue-050)',   strong: 'var(--ob-blue-700)',   border: 'color-mix(in srgb, var(--ob-blue) 35%, transparent)',   icon: 'info' },
  success: { fg: 'var(--ob-green)',  bg: 'var(--ob-green-100)',  tint: 'var(--ob-green-050)',  strong: 'var(--ob-green-700)',  border: 'color-mix(in srgb, var(--ob-green) 35%, transparent)',  icon: 'check-circle' },
  warning: { fg: 'var(--ob-orange)', bg: 'var(--ob-orange-100)', tint: 'var(--ob-orange-050)', strong: 'var(--ob-orange-700)', border: 'color-mix(in srgb, var(--ob-orange) 45%, transparent)', icon: 'warning' },
  danger:  { fg: 'var(--ob-danger)', bg: 'var(--ob-danger-bg)',  tint: 'var(--ob-red-050)',    strong: 'var(--ob-danger)',     border: 'color-mix(in srgb, var(--ob-danger) 40%, transparent)', icon: 'warning-circle' },
};
