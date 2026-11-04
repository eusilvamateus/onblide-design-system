import React from 'react';
import { Badge, BREAKPOINTS, useBreakpoint } from '@onblide/ui';

const LARGURAS: Record<string, string> = {
  base: `menos de ${BREAKPOINTS.sm}px`,
  sm: `de ${BREAKPOINTS.sm}px a ${BREAKPOINTS.md - 1}px`,
  md: `de ${BREAKPOINTS.md}px a ${BREAKPOINTS.lg - 1}px`,
  lg: `de ${BREAKPOINTS.lg}px a ${BREAKPOINTS.xl - 1}px`,
  xl: `${BREAKPOINTS.xl}px ou mais`,
};

export function FaixaAtual() {
  const { current } = useBreakpoint();
  return (
    <p className="ob-faixa-atual" data-faixa-atual={current}>
      Esta janela está na faixa <Badge tone="primary">{current}</Badge> ({LARGURAS[current]}). Redimensione para ver mudar.
    </p>
  );
}
