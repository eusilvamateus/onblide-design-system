import type { Tone } from './tone';

export type BadgeTone = Extract<Tone, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'>;

export interface BadgeToneColors {
  bg: string;
  fg: string;
  dot: string;
  solid: string;
  border: string;
}

export const BADGE_TONES: Record<BadgeTone, BadgeToneColors> = {
  primary: { bg: 'var(--ob-blue-100)',    fg: 'var(--ob-blue-700)',    dot: 'var(--ob-blue)',    solid: 'var(--ob-blue)',    border: 'color-mix(in srgb, var(--ob-blue) 35%, transparent)' },
  success: { bg: 'var(--ob-green-100)',   fg: 'var(--ob-green-700)',   dot: 'var(--ob-green)',   solid: 'var(--ob-green)',   border: 'color-mix(in srgb, var(--ob-green) 35%, transparent)' },
  warning: { bg: 'color-mix(in srgb, var(--ob-orange) 15%, var(--ob-surface))', fg: 'var(--ob-warning-fg)', dot: 'var(--ob-orange)', solid: 'var(--ob-orange)', border: 'color-mix(in srgb, var(--ob-orange) 45%, transparent)' },
  danger:  { bg: 'var(--ob-danger-bg)',   fg: 'var(--ob-danger)',      dot: 'var(--ob-danger)',  solid: 'var(--ob-danger)',  border: 'color-mix(in srgb, var(--ob-danger) 40%, transparent)' },
  neutral: { bg: 'var(--ob-bg-warm)',     fg: 'var(--ob-fg-soft)',     dot: 'var(--ob-fg-mute)', solid: 'var(--ob-fg-mute)', border: 'var(--ob-border)' },
};
