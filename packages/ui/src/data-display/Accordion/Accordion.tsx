import React, { useId, useRef, useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import type { Appearance } from '../../internal/appearance';

export interface AccordionItem {
  /** Identificador estável do item, usado em `value`. */
  id: string;
  /** Título exibido no cabeçalho, sempre visível. */
  title: React.ReactNode;
  /** Conteúdo revelado ao abrir o item. */
  content: React.ReactNode;
  /** Nome do ícone Phosphor exibido antes do título. */
  icon?: string;
  /** Impede abrir e fechar o item. */
  disabled?: boolean;
}

/** Pintura do acordeão: `outline` com borda e fundo de superfície, `ghost` sem borda externa nem fundo. */
export type AccordionAppearance = Extract<Appearance, 'outline' | 'ghost'>;
/** Tamanho do acordeão, que ajusta texto, ícones e espaçamento interno. */
export type AccordionSize = 'sm' | 'md' | 'lg';
/** Nível do título (`h2` a `h6`) que envolve cada cabeçalho. */
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AccordionProps {
  /** Itens do acordeão, na ordem exibida. */
  items: AccordionItem[];
  /** `single` mantém um item aberto por vez; `multiple` permite abrir vários. */
  type?: 'single' | 'multiple';
  /** Ids dos itens abertos, em modo controlado. */
  value?: string[];
  /** Ids dos itens abertos inicialmente, em modo não controlado. */
  defaultValue?: string[];
  /** Chamado ao abrir ou fechar um item, com os ids abertos. */
  onChange?: (value: string[]) => void;
  /** Itens juntos numa só unidade, separados por divisórias. Com `false`, cada item fica solto, com espaço entre eles. */
  attached?: boolean;
  /** Pintura: `outline` tem borda e fundo de superfície; `ghost` não tem borda externa nem fundo, para ficar dentro de um `Card` ou painel. */
  appearance?: AccordionAppearance;
  /** Tamanho do texto, dos ícones e do espaçamento interno. */
  size?: AccordionSize;
  /** Nível do título que envolve cada cabeçalho, para seguir a hierarquia da página: o acordeão abaixo de um `h2` usa `3`. */
  headingLevel?: AccordionHeadingLevel;
  /** Nome acessível do grupo de itens. */
  ariaLabel?: string;
}

interface EscalaDoAcordeao { fonte: string; cabecalho: string; painel: string; icone: number; seta: number; espaco: string }

const ESCALA: Record<AccordionSize, EscalaDoAcordeao> = {
  sm: { fonte: 'var(--ob-fs-13)', cabecalho: 'var(--ob-space-10) var(--ob-space-12)', painel: '0 var(--ob-space-12) var(--ob-space-12)', icone: 16, seta: 14, espaco: 'var(--ob-space-8)' },
  md: { fonte: 'var(--ob-fs-14)', cabecalho: 'var(--ob-space-16) var(--ob-space-16)', painel: '0 var(--ob-space-16) var(--ob-space-16)', icone: 18, seta: 16, espaco: 'var(--ob-space-10)' },
  lg: { fonte: 'var(--ob-fs-15)', cabecalho: 'var(--ob-space-20) var(--ob-space-20)', painel: '0 var(--ob-space-20) var(--ob-space-20)', icone: 20, seta: 18, espaco: 'var(--ob-space-12)' },
};

const DIVISORIA = '1px solid var(--ob-border)';
const DESLIZE = 'var(--ob-dur-base) var(--ob-ease)';

injectStyleOnce(
  'ob-accordion',
  '.ob-accordion-cabecalho{transition:background var(--ob-dur-fast) var(--ob-ease)}.ob-accordion-cabecalho:hover:not(:disabled){background:var(--ob-bg-alt)}.ob-accordion-cabecalho:focus-visible{outline:var(--ob-focus-ring-width) solid var(--ob-focus-ring);outline-offset:calc(var(--ob-focus-ring-width) * -1)}',
);

/** Lista de seções que abrem e fecham, para revelar conteúdo secundário sem sair da página. */
export const Accordion: React.FC<AccordionProps> = ({
  items, type = 'single', value, defaultValue = [], onChange, attached = true, appearance = 'outline', size = 'md', headingLevel = 3, ariaLabel,
}) => {
  const [interno, setInterno] = useState<string[]>(defaultValue);
  const abertos = value ?? interno;
  const uid = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const escala = ESCALA[size];
  const contorno = appearance === 'outline';
  const Titulo = `h${headingLevel}` as 'h3';

  const alternar = (id: string) => {
    const aberto = abertos.includes(id);
    const proximo = type === 'single' ? (aberto ? [] : [id]) : aberto ? abertos.filter((i) => i !== id) : [...abertos, id];
    if (value === undefined) setInterno(proximo);
    onChange?.(proximo);
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    const cabecalhos = Array.from(raiz.current?.querySelectorAll<HTMLButtonElement>('button.ob-accordion-cabecalho:not(:disabled)') ?? []);
    const atual = cabecalhos.indexOf(document.activeElement as HTMLButtonElement);
    if (atual < 0) return;
    const alvo = e.key === 'ArrowDown' ? (atual + 1) % cabecalhos.length
      : e.key === 'ArrowUp' ? (atual - 1 + cabecalhos.length) % cabecalhos.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? cabecalhos.length - 1
      : -1;
    if (alvo < 0) return;
    e.preventDefault();
    cabecalhos[alvo].focus();
  };

  const caixa: React.CSSProperties = contorno
    ? { border: DIVISORIA, borderRadius: 'var(--ob-r-surface)', overflow: 'hidden', background: 'var(--ob-surface)' }
    : {};

  return (
    <div ref={raiz} role="group" aria-label={ariaLabel} onKeyDown={aoTeclar} style={{
      display: 'flex', flexDirection: 'column', gap: attached ? 0 : 'var(--ob-space-8)', fontFamily: 'var(--ob-font)',
      ...(attached ? caixa : null),
    }}>
      {items.map((item, i) => {
        const aberto = abertos.includes(item.id);
        const idCabecalho = `${uid}-c-${item.id}`;
        const idPainel = `${uid}-p-${item.id}`;
        return (
          <div key={item.id} style={attached ? { borderTop: i === 0 ? 'none' : DIVISORIA } : caixa}>
            <Titulo style={{ margin: 0 }}>
              <button type="button" id={idCabecalho} className="ob-accordion-cabecalho" aria-expanded={aberto} aria-controls={idPainel}
                disabled={item.disabled} onClick={() => alternar(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: escala.espaco, width: '100%', padding: escala.cabecalho, border: 'none',
                  borderRadius: contorno ? 0 : 'var(--ob-r-control)',
                  background: 'transparent', textAlign: 'left', fontFamily: 'inherit', fontSize: escala.fonte, fontWeight: 'var(--ob-w-semibold)',
                  color: 'var(--ob-fg-strong)', cursor: item.disabled ? 'not-allowed' : 'pointer', opacity: item.disabled ? 'var(--ob-opacity-disabled)' : 1,
                }}>
                {item.icon && <Ph n={item.icon} size={escala.icone} c="var(--ob-fg-soft)" />}
                <span style={{ flex: 1, minWidth: 0 }}>{item.title}</span>
                <Ph n="caret-down" size={escala.seta} c="var(--ob-fg-soft)" style={{ flex: 'none', transform: aberto ? 'rotate(180deg)' : 'none', transition: `transform ${DESLIZE}` }} />
              </button>
            </Titulo>
            <div id={idPainel} role="region" aria-labelledby={idCabecalho} style={{
              display: 'grid', gridTemplateRows: aberto ? '1fr' : '0fr', visibility: aberto ? 'visible' : 'hidden',
              transition: `grid-template-rows ${DESLIZE}, visibility ${DESLIZE}`,
            }}>
              <div style={{ minHeight: 0, overflow: 'hidden' }}>
                <div style={{ padding: escala.painel, fontSize: escala.fonte, lineHeight: 1.6, color: 'var(--ob-fg)' }}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
