import { useSyncExternalStore } from 'react';
import { BREAKPOINTS, BREAKPOINT_ORDER, mediaQuery } from './breakpoints';
import type { Breakpoint, BreakpointName } from './breakpoints';

const NOMES = Object.keys(BREAKPOINTS) as BreakpointName[];

const temMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

function faixaAtual(): Breakpoint {
  if (!temMatchMedia()) return 'base';
  let faixa: Breakpoint = 'base';
  for (const nome of NOMES) if (window.matchMedia(mediaQuery(nome)).matches) faixa = nome;
  return faixa;
}

function assinar(avisar: () => void): () => void {
  if (!temMatchMedia()) return () => {};
  const consultas = NOMES.map((nome) => window.matchMedia(mediaQuery(nome)));
  consultas.forEach((consulta) => consulta.addEventListener('change', avisar));
  return () => consultas.forEach((consulta) => consulta.removeEventListener('change', avisar));
}

const faixaDoServidor = (): Breakpoint => 'base';

/**
 * Faixa de tela atual, atualizada quando a janela cruza um breakpoint. `atLeast('md')` diz se a tela tem pelo
 * menos a largura de `md`. No servidor e na hidratação a faixa é `base`, como no CSS mobile-first.
 */
export function useBreakpoint(): { current: Breakpoint; atLeast: (breakpoint: Breakpoint) => boolean } {
  const current = useSyncExternalStore(assinar, faixaAtual, faixaDoServidor);
  const atLeast = (breakpoint: Breakpoint) => BREAKPOINT_ORDER.indexOf(current) >= BREAKPOINT_ORDER.indexOf(breakpoint);
  return { current, atLeast };
}
