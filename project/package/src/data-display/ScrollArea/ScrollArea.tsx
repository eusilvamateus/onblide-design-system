import React from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollAreaVisibility = 'hover' | 'auto' | 'always';

export interface ScrollAreaProps {
  /** Eixo em que a área rola. */
  orientation?: ScrollAreaOrientation;
  /** `hover` mostra a barra ao rolar, passar o mouse ou focar; `auto` a mantém visível enquanto houver o que rolar; `always` a mantém visível, com o trilho. */
  visibility?: ScrollAreaVisibility;
  /** Altura fixa da área. */
  height?: number | string;
  /** Altura máxima da área; acima dela o conteúdo rola. */
  maxHeight?: number | string;
  /** Nome acessível da região rolável. */
  ariaLabel?: string;
  /** Referência do elemento que rola, para ler ou mudar a posição da rolagem. */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Estilos inline adicionais da raiz. */
  style?: React.CSSProperties;
  /** Conteúdo que rola. */
  children?: React.ReactNode;
}

interface Eixo {
  visivel: boolean;
  tamanho: number;
  posicao: number;
}

interface Medidas {
  vertical: Eixo;
  horizontal: Eixo;
}

const SEM_EIXO: Eixo = { visivel: false, tamanho: 0, posicao: 0 };
const POLEGAR_MINIMO = 24;
const MARGEM_DO_TRILHO = 2;
const ESPACO_DO_CANTO = 8;

function calcularEixo(cliente: number, total: number, rolado: number, trilho: number): Eixo {
  if (total <= cliente + 1 || trilho <= 0) return SEM_EIXO;
  const tamanho = Math.min(trilho, Math.max(POLEGAR_MINIMO, Math.round((trilho * cliente) / total)));
  const maximo = total - cliente;
  const posicao = maximo > 0 ? (rolado / maximo) * (trilho - tamanho) : 0;
  return { visivel: true, tamanho, posicao };
}

function medir(el: HTMLDivElement, orientation: ScrollAreaOrientation): Medidas {
  const querVertical = orientation !== 'horizontal';
  const querHorizontal = orientation !== 'vertical';
  const rolaV = querVertical && el.scrollHeight > el.clientHeight + 1;
  const rolaH = querHorizontal && el.scrollWidth > el.clientWidth + 1;
  const trilhoV = el.clientHeight - MARGEM_DO_TRILHO * 2 - (rolaH ? ESPACO_DO_CANTO : 0);
  const trilhoH = el.clientWidth - MARGEM_DO_TRILHO * 2 - (rolaV ? ESPACO_DO_CANTO : 0);
  return {
    vertical: querVertical ? calcularEixo(el.clientHeight, el.scrollHeight, el.scrollTop, trilhoV) : SEM_EIXO,
    horizontal: querHorizontal ? calcularEixo(el.clientWidth, el.scrollWidth, el.scrollLeft, trilhoH) : SEM_EIXO,
  };
}

function igual(a: Medidas, b: Medidas): boolean {
  return a.vertical.visivel === b.vertical.visivel && a.vertical.tamanho === b.vertical.tamanho && a.vertical.posicao === b.vertical.posicao
    && a.horizontal.visivel === b.horizontal.visivel && a.horizontal.tamanho === b.horizontal.tamanho && a.horizontal.posicao === b.horizontal.posicao;
}

function atribuirRef<T>(ref: React.Ref<T> | undefined, valor: T | null) {
  if (typeof ref === 'function') ref(valor);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = valor;
}

injectStyleOnce(
  'ob-scrollarea',
  '.ob-sa-viewport{scrollbar-width:none;-ms-overflow-style:none}.ob-sa-viewport::-webkit-scrollbar{display:none}.ob-sa-viewport:focus{outline:none}.ob-sa-viewport:focus-visible{box-shadow:inset 0 0 0 3px var(--ob-focus-ring)}.ob-sa-barra{position:absolute;z-index:1;box-sizing:border-box;display:flex;touch-action:none;user-select:none;opacity:0;transition:opacity .2s ease}.ob-sa-barra[data-eixo="v"]{top:0;right:0;width:12px;padding:2px 3px;flex-direction:column}.ob-sa-barra[data-eixo="h"]{left:0;bottom:0;height:12px;padding:3px 2px;flex-direction:row}.ob-sa-polegar{position:relative;border-radius:999px;background:var(--ob-scrollbar-thumb);transition:background .15s ease,width .15s ease,height .15s ease;cursor:default}.ob-sa-barra[data-eixo="v"] .ob-sa-polegar{width:6px;align-self:center}.ob-sa-barra[data-eixo="h"] .ob-sa-polegar{height:6px;align-self:center}.ob-sa-barra:hover .ob-sa-polegar,.ob-sa-polegar[data-arrastando]{background:var(--ob-scrollbar-thumb-hover)}.ob-sa-barra[data-eixo="v"]:hover .ob-sa-polegar,.ob-sa-barra[data-eixo="v"] .ob-sa-polegar[data-arrastando]{width:8px}.ob-sa-barra[data-eixo="h"]:hover .ob-sa-polegar,.ob-sa-barra[data-eixo="h"] .ob-sa-polegar[data-arrastando]{height:8px}.ob-sa[data-visibilidade="always"] .ob-sa-barra{background:var(--ob-scrollbar-track);border-radius:999px}.ob-sa[data-visibilidade="auto"] .ob-sa-barra,.ob-sa[data-visibilidade="always"] .ob-sa-barra,.ob-sa:hover .ob-sa-barra,.ob-sa:focus-within .ob-sa-barra,.ob-sa[data-ativa] .ob-sa-barra{opacity:1}@media (prefers-reduced-motion: reduce){.ob-sa-barra,.ob-sa-polegar{transition:none}}',
);

/** Área com rolagem nativa e uma barra fina e discreta, desenhada com os tokens do tema. */
export const ScrollArea: React.FC<ScrollAreaProps> = ({
  orientation = 'vertical', visibility = 'hover', height, maxHeight, ariaLabel, viewportRef, style, children,
}) => {
  const viewport = React.useRef<HTMLDivElement | null>(null);
  const [medidas, setMedidas] = React.useState<Medidas>({ vertical: SEM_EIXO, horizontal: SEM_EIXO });
  const [rolando, setRolando] = React.useState(false);
  const [arrastando, setArrastando] = React.useState<'v' | 'h' | null>(null);
  const temporizador = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrasto = React.useRef({ inicio: 0, rolagem: 0 });
  const ultimas = React.useRef(medidas);

  const atualizar = React.useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const novas = medir(el, orientation);
    if (igual(novas, ultimas.current)) return;
    ultimas.current = novas;
    setMedidas(novas);
  }, [orientation]);

  const definirViewport = React.useCallback((el: HTMLDivElement | null) => {
    viewport.current = el;
    atribuirRef(viewportRef, el);
  }, [viewportRef]);

  React.useEffect(() => { atualizar(); });

  React.useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observadorDeTamanho = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(atualizar) : null;
    const observarFilhos = () => { if (observadorDeTamanho) Array.from(el.children).forEach((filho) => observadorDeTamanho.observe(filho)); };
    observadorDeTamanho?.observe(el);
    observarFilhos();
    const observadorDeConteudo = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => { observarFilhos(); atualizar(); })
      : null;
    observadorDeConteudo?.observe(el, { childList: true, subtree: true, characterData: true });
    return () => { observadorDeTamanho?.disconnect(); observadorDeConteudo?.disconnect(); };
  }, [atualizar]);

  React.useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);

  const aoRolar = () => {
    atualizar();
    setRolando(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setRolando(false), 900);
  };

  const comecarArrasto = (eixo: 'v' | 'h') => (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    if (!el || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = { inicio: eixo === 'v' ? e.clientY : e.clientX, rolagem: eixo === 'v' ? el.scrollTop : el.scrollLeft };
    setArrastando(eixo);
  };

  const arrastar = (eixo: 'v' | 'h') => (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    if (!el || arrastando !== eixo) return;
    const dados = eixo === 'v' ? medidas.vertical : medidas.horizontal;
    const trilho = (eixo === 'v' ? el.clientHeight : el.clientWidth) - MARGEM_DO_TRILHO * 2 - (medidas.vertical.visivel && medidas.horizontal.visivel ? ESPACO_DO_CANTO : 0);
    const livre = trilho - dados.tamanho;
    if (livre <= 0) return;
    const total = eixo === 'v' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    const delta = (eixo === 'v' ? e.clientY : e.clientX) - arrasto.current.inicio;
    const destino = arrasto.current.rolagem + (delta * total) / livre;
    if (eixo === 'v') el.scrollTop = destino; else el.scrollLeft = destino;
  };

  const terminarArrasto = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setArrastando(null);
  };

  const saltarParaTrilho = (eixo: 'v' | 'h') => (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    if (!el || e.target !== e.currentTarget || e.button !== 0) return;
    const caixa = e.currentTarget.getBoundingClientRect();
    const dados = eixo === 'v' ? medidas.vertical : medidas.horizontal;
    const trilho = eixo === 'v' ? caixa.height - MARGEM_DO_TRILHO * 2 : caixa.width - MARGEM_DO_TRILHO * 2;
    const livre = trilho - dados.tamanho;
    if (livre <= 0) return;
    const clique = (eixo === 'v' ? e.clientY - caixa.top : e.clientX - caixa.left) - MARGEM_DO_TRILHO - dados.tamanho / 2;
    const proporcao = Math.min(1, Math.max(0, clique / livre));
    if (eixo === 'v') el.scrollTop = proporcao * (el.scrollHeight - el.clientHeight);
    else el.scrollLeft = proporcao * (el.scrollWidth - el.clientWidth);
  };

  const rolavel = medidas.vertical.visivel || medidas.horizontal.visivel;
  const ativa = rolando || arrastando !== null;
  const cantoCompartilhado = medidas.vertical.visivel && medidas.horizontal.visivel;

  return (
    <div className="ob-sa" data-visibilidade={visibility} data-ativa={ativa ? '' : undefined} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, height, maxHeight, ...style,
    }}>
      <div
        ref={definirViewport} className="ob-sa-viewport" onScroll={aoRolar}
        role={ariaLabel ? 'region' : undefined} aria-label={ariaLabel} tabIndex={rolavel ? 0 : undefined}
        style={{
          position: 'relative', flex: '1 1 auto', minWidth: 0, minHeight: 0,
          overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
          overflowY: orientation === 'horizontal' ? 'hidden' : 'auto',
        }}
      >
        {children}
      </div>
      {medidas.vertical.visivel && (
        <div className="ob-sa-barra" data-eixo="v" aria-hidden="true" onPointerDown={saltarParaTrilho('v')} style={{ bottom: cantoCompartilhado ? ESPACO_DO_CANTO : 0 }}>
          <div
            className="ob-sa-polegar" data-arrastando={arrastando === 'v' ? '' : undefined}
            onPointerDown={comecarArrasto('v')} onPointerMove={arrastar('v')} onPointerUp={terminarArrasto} onPointerCancel={terminarArrasto}
            style={{ height: medidas.vertical.tamanho, transform: `translateY(${medidas.vertical.posicao}px)` }}
          />
        </div>
      )}
      {medidas.horizontal.visivel && (
        <div className="ob-sa-barra" data-eixo="h" aria-hidden="true" onPointerDown={saltarParaTrilho('h')} style={{ right: cantoCompartilhado ? ESPACO_DO_CANTO : 0 }}>
          <div
            className="ob-sa-polegar" data-arrastando={arrastando === 'h' ? '' : undefined}
            onPointerDown={comecarArrasto('h')} onPointerMove={arrastar('h')} onPointerUp={terminarArrasto} onPointerCancel={terminarArrasto}
            style={{ width: medidas.horizontal.tamanho, transform: `translateX(${medidas.horizontal.posicao}px)` }}
          />
        </div>
      )}
    </div>
  );
};
