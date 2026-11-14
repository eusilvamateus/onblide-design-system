import React from 'react';
import ReactDOM from 'react-dom';
import { posicionarPainel } from './floating';
import type { Lado, Retangulo } from './floating';

const CamadaContext = React.createContext<readonly string[]>([]);

export interface Camada {
  id: string;
  ancestrais: readonly string[];
}

export const useCamada = (): Camada => ({ id: React.useId(), ancestrais: React.useContext(CamadaContext) });

export const ProvedorDeCamada: React.FC<{ camada: Camada; children?: React.ReactNode }> = ({ camada, children }) => (
  <CamadaContext.Provider value={[...camada.ancestrais, camada.id]}>{children}</CamadaContext.Provider>
);

export const atributosDaCamada = (camada: Camada) => ({
  'data-ob-camada': camada.id,
  'data-ob-camada-ancestrais': camada.ancestrais.join(' ') || undefined,
});

export const estaDentro = (alvo: EventTarget | null, camada: Camada, ...elementos: (Element | null | undefined)[]): boolean => {
  if (typeof Node === 'undefined' || !(alvo instanceof Node)) return false;
  if (elementos.some((el) => el && el.contains(alvo))) return true;
  const el = alvo instanceof Element ? alvo : alvo.parentElement;
  const filha = el?.closest<HTMLElement>('[data-ob-camada-ancestrais]');
  return filha?.dataset.obCamadaAncestrais?.split(' ').includes(camada.id) ?? false;
};

let montadoNoCliente = false;

export const useNoCliente = (): boolean => {
  const [pronto, setPronto] = React.useState(montadoNoCliente);
  React.useEffect(() => {
    montadoNoCliente = true;
    if (!pronto) setPronto(true);
  }, []);
  return pronto;
};

export const NaCamada: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const noCliente = useNoCliente();
  return noCliente ? ReactDOM.createPortal(children, document.body) : <>{children}</>;
};

const useLayoutNoCliente = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export type AlinhamentoDoAncorado = 'start' | 'center' | 'end' | 'stretch';

export interface AncoradoProps {
  ancora: () => Retangulo | null;
  camada: Camada;
  lado?: Lado;
  alinhamento?: AlinhamentoDoAncorado;
  folga?: number;
  style?: React.CSSProperties;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

interface Posicao { top: number; left: number; largura?: number; visivel: boolean }

const mesmaPosicao = (a: Posicao | null, b: Posicao) => !!a && a.top === b.top && a.left === b.left && a.largura === b.largura && a.visivel === b.visivel;

export const Ancorado = React.forwardRef<HTMLDivElement, AncoradoProps>(({
  ancora, camada, lado = 'bottom', alinhamento = 'start', folga = 6, style, children, onKeyDown,
}, ref) => {
  const interno = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<Posicao | null>(null);
  const noCliente = useNoCliente();
  const ancoraAtual = React.useRef(ancora);
  ancoraAtual.current = ancora;

  const juntarRef = (el: HTMLDivElement | null) => {
    interno.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  const posicionar = React.useCallback(() => {
    const r = ancoraAtual.current();
    const p = interno.current;
    if (!r || !p) return;
    const esticado = alinhamento === 'stretch';
    const viewport = { largura: window.innerWidth, altura: window.innerHeight };
    const calculada = posicionarPainel(lado, esticado ? 'start' : alinhamento, r, { largura: Math.max(p.offsetWidth, esticado ? r.width : 0), altura: p.offsetHeight }, viewport, folga);
    const visivel = r.bottom > 0 && r.top < viewport.altura && r.right > 0 && r.left < viewport.largura;
    const nova: Posicao = { top: Math.round(calculada.top), left: Math.round(calculada.left), largura: esticado ? r.width : undefined, visivel };
    setPos((atual) => (mesmaPosicao(atual, nova) ? atual : nova));
  }, [lado, alinhamento, folga]);

  useLayoutNoCliente(() => { if (noCliente) posicionar(); });

  React.useEffect(() => {
    if (!noCliente) return undefined;
    const h = () => posicionar();
    window.addEventListener('scroll', h, true);
    window.addEventListener('resize', h);
    const observador = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(h);
    if (interno.current) observador?.observe(interno.current);
    return () => {
      window.removeEventListener('scroll', h, true);
      window.removeEventListener('resize', h);
      observador?.disconnect();
    };
  }, [noCliente, posicionar]);

  const conteudo = (
    <ProvedorDeCamada camada={camada}>
      <div ref={juntarRef} {...atributosDaCamada(camada)} onKeyDown={onKeyDown} style={{
        position: noCliente ? 'fixed' : 'absolute',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        minWidth: pos?.largura,
        maxWidth: 'calc(100vw - 16px)',
        zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'],
        opacity: noCliente && pos ? 1 : 0,
        visibility: noCliente && pos && !pos.visivel ? 'hidden' : undefined,
        ...style,
      }}>
        {children}
      </div>
    </ProvedorDeCamada>
  );
  return noCliente ? ReactDOM.createPortal(conteudo, document.body) : conteudo;
});

Ancorado.displayName = 'Ancorado';

export const retanguloDe = (el: Element | null | undefined): Retangulo | null => (el ? el.getBoundingClientRect() : null);
