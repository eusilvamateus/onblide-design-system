import type React from 'react';

export type TamanhoDeCampo = 'sm' | 'md' | 'lg';

export interface EscalaDeCampo {
  altura: number;
  fonte: number;
  recuo: string;
  recuoDaAcao: string;
  icone: number;
  acao: number;
  linha: number;
  recuoVertical: number;
  recuoComChips: string;
  botaoInterno: number;
  chip: 'xs' | 'sm' | 'md';
}

export const ESCALA_DE_CAMPO: Record<TamanhoDeCampo, EscalaDeCampo> = {
  sm: { altura: 32, fonte: 13, recuo: 'var(--ob-space-12)', recuoDaAcao: 'var(--ob-space-4)', icone: 16, acao: 24, linha: 18, recuoVertical: 6, recuoComChips: 'var(--ob-space-2)', botaoInterno: 20, chip: 'xs' },
  md: { altura: 40, fonte: 14, recuo: 'var(--ob-space-16)', recuoDaAcao: 'var(--ob-space-6)', icone: 18, acao: 32, linha: 20, recuoVertical: 10, recuoComChips: 'var(--ob-space-2)', botaoInterno: 24, chip: 'sm' },
  lg: { altura: 48, fonte: 15, recuo: 'var(--ob-space-20)', recuoDaAcao: 'var(--ob-space-8)', icone: 20, acao: 32, linha: 22, recuoVertical: 12, recuoComChips: 'var(--ob-space-4)', botaoInterno: 28, chip: 'md' },
};

export const estiloDaAcao = (tamanho: TamanhoDeCampo): React.CSSProperties | undefined => {
  const { acao } = ESCALA_DE_CAMPO[tamanho];
  return acao < 32 ? { width: acao, height: acao, minHeight: acao } : undefined;
};
