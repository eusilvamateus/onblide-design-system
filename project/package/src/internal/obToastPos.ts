// project/package/src/internal/obToastPos.ts
//
// Tabela de âncoras de posição usada só por ToastStack.
export type OBToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface OBToastAnchor {
  top?: number;
  bottom?: number;
  left?: number | string;
  right?: number;
  align: 'flex-start' | 'flex-end' | 'center';
  cx?: boolean;
}

export const OB_TOAST_POS: Record<OBToastPosition, OBToastAnchor> = {
  'top-left':      { top: 24, left: 24,  align: 'flex-start' },
  'top-center':    { top: 24, left: '50%', align: 'center', cx: true },
  'top-right':     { top: 24, right: 24, align: 'flex-end' },
  'bottom-left':   { bottom: 24, left: 24,  align: 'flex-start' },
  'bottom-center': { bottom: 24, left: '50%', align: 'center', cx: true },
  'bottom-right':  { bottom: 24, right: 24, align: 'flex-end' },
};
