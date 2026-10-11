import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { escolherLado } from './floating';

const FOLGA = 6;
const MARGEM = 8;

export const useLadoVertical = (
  ancora: RefObject<HTMLElement | null>,
  painel: RefObject<HTMLElement | null>,
  aberto: boolean,
): 'bottom' | 'top' => {
  const [lado, setLado] = useState<'bottom' | 'top'>('bottom');
  useLayoutEffect(() => {
    if (!aberto) {
      setLado('bottom');
      return;
    }
    const a = ancora.current;
    const p = painel.current;
    if (!a || !p) return;
    const escolhido = escolherLado(
      'bottom',
      a.getBoundingClientRect(),
      { largura: p.offsetWidth, altura: p.offsetHeight },
      { largura: window.innerWidth, altura: window.innerHeight },
      FOLGA,
      MARGEM,
    ) as 'bottom' | 'top';
    if (escolhido !== lado) setLado(escolhido);
  });
  return lado;
};
