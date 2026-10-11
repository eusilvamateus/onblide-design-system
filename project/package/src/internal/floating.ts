export type Lado = 'top' | 'right' | 'bottom' | 'left';
export type Alinhamento = 'start' | 'center' | 'end';

export interface Retangulo {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Dimensoes {
  largura: number;
  altura: number;
}

export interface PosicaoFixa {
  top: number;
  left: number;
  side: Lado;
  ax?: number;
  ay?: number;
}

const OPOSTO: Record<Lado, Lado> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

const limitar = (valor: number, minimo: number, maximo: number) => Math.max(minimo, Math.min(maximo, valor));

export const escolherLado = (
  preferido: Lado,
  gatilho: Retangulo,
  painel: Dimensoes,
  viewport: Dimensoes,
  folga: number,
  margem: number,
): Lado => {
  const cabe: Record<Lado, boolean> = {
    bottom: gatilho.bottom + folga + painel.altura <= viewport.altura - margem,
    top: gatilho.top - folga - painel.altura >= margem,
    right: gatilho.right + folga + painel.largura <= viewport.largura - margem,
    left: gatilho.left - folga - painel.largura >= margem,
  };
  return !cabe[preferido] && cabe[OPOSTO[preferido]] ? OPOSTO[preferido] : preferido;
};

export const posicionarPainel = (
  preferido: Lado,
  alinhamento: Alinhamento,
  gatilho: Retangulo,
  painel: Dimensoes,
  viewport: Dimensoes,
  folga: number,
  margem = 8,
): PosicaoFixa => {
  const side = escolherLado(preferido, gatilho, painel, viewport, folga, margem);
  const { largura: w, altura: h } = painel;
  if (side === 'top' || side === 'bottom') {
    const top = side === 'bottom' ? gatilho.bottom + folga : gatilho.top - folga - h;
    const base = alinhamento === 'center' ? gatilho.left + gatilho.width / 2 - w / 2 : alinhamento === 'end' ? gatilho.right - w : gatilho.left;
    const left = limitar(base, margem, viewport.largura - w - margem);
    return { top, left, side, ax: limitar(gatilho.left + gatilho.width / 2 - left, 14, w - 14) };
  }
  const left = side === 'right' ? gatilho.right + folga : gatilho.left - folga - w;
  const base = alinhamento === 'center' ? gatilho.top + gatilho.height / 2 - h / 2 : alinhamento === 'end' ? gatilho.bottom - h : gatilho.top;
  const top = limitar(base, margem, viewport.altura - h - margem);
  return { top, left, side, ay: limitar(gatilho.top + gatilho.height / 2 - top, 14, h - 14) };
};
