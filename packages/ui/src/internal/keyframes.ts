import { injectStyleOnce } from './injectStyleOnce';

/** `ob-spin`: rotação contínua (Spinner e o ícone de carregamento do SearchInput). */
export function injectSpinKeyframes(): void {
  injectStyleOnce('ob-spin-kf', '@keyframes ob-spin{to{transform:rotate(360deg)}}');
}
