export type TamanhoDeEscolha = 'sm' | 'md' | 'lg';

export interface EscalaDeEscolha {
  caixa: number;
  fonte: string;
  espaco: string;
  trilho: { largura: number; altura: number };
}

export const ESCALA_DE_ESCOLHA: Record<TamanhoDeEscolha, EscalaDeEscolha> = {
  sm: { caixa: 16, fonte: 'var(--ob-fs-13)', espaco: 'var(--ob-space-8)', trilho: { largura: 32, altura: 18 } },
  md: { caixa: 18, fonte: 'var(--ob-fs-14)', espaco: 'var(--ob-space-10)', trilho: { largura: 40, altura: 22 } },
  lg: { caixa: 20, fonte: 'var(--ob-fs-15)', espaco: 'var(--ob-space-12)', trilho: { largura: 48, altura: 26 } },
};
