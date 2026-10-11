export type OBTone = 'info' | 'success' | 'warning' | 'danger';

export interface OBToneColors {
  fg: string;
  bg: string;
  strong: string;
  icon: string;
}

export const OB_TONES: Record<OBTone, OBToneColors> = {
  info:    { fg: 'var(--ob-blue)',   bg: 'var(--ob-blue-100)',   strong: 'var(--ob-blue-700)',   icon: 'info' },
  success: { fg: 'var(--ob-green)',  bg: 'var(--ob-green-100)',  strong: 'var(--ob-green-700)',  icon: 'check-circle' },
  warning: { fg: 'var(--ob-orange)', bg: 'var(--ob-orange-100)', strong: 'var(--ob-orange-700)', icon: 'warning' },
  danger:  { fg: 'var(--ob-danger)', bg: 'var(--ob-danger-bg)',  strong: 'var(--ob-danger)',     icon: 'warning-circle' },
};
