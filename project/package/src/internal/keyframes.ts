// Keyframes usadas por mais de um componente. Cada uma é injetada uma única vez
// (por id) pelo primeiro módulo que a pede. Módulo interno: NÃO é reexportado
// em src/index.ts.
import { injectStyleOnce } from './injectStyleOnce';

/** `ob-spin`: rotação contínua (Spinner e o ícone de carregamento do SearchInput). */
export function injectSpinKeyframes(): void {
  injectStyleOnce('ob-spin-kf', '@keyframes ob-spin{to{transform:rotate(360deg)}}');
}
