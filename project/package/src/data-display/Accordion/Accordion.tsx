import React, { useId, useRef, useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

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
  /** Nome acessível do grupo de itens. */
  ariaLabel?: string;
}

injectStyleOnce(
  'ob-accordion',
  '.ob-accordion-cabecalho{transition:background var(--ob-dur-fast) var(--ob-ease)}.ob-accordion-cabecalho:hover:not(:disabled){background:var(--ob-bg-alt)}.ob-accordion-cabecalho:focus-visible{outline:var(--ob-focus-ring-width) solid var(--ob-focus-ring);outline-offset:calc(var(--ob-focus-ring-width) * -1)}',
);

/** Lista de seções que abrem e fecham, para revelar conteúdo secundário sem sair da página. */
export const Accordion: React.FC<AccordionProps> = ({ items, type = 'single', value, defaultValue = [], onChange, ariaLabel }) => {
  const [interno, setInterno] = useState<string[]>(defaultValue);
  const abertos = value ?? interno;
  const uid = useId();
  const raiz = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={raiz} role="group" aria-label={ariaLabel} onKeyDown={aoTeclar} style={{
      border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', overflow: 'hidden',
      background: 'var(--ob-surface)', fontFamily: 'var(--ob-font)',
    }}>
      {items.map((item, i) => {
        const aberto = abertos.includes(item.id);
        const idCabecalho = `${uid}-c-${item.id}`;
        const idPainel = `${uid}-p-${item.id}`;
        return (
          <div key={item.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--ob-border)' }}>
            <h3 style={{ margin: 0 }}>
              <button type="button" id={idCabecalho} className="ob-accordion-cabecalho" aria-expanded={aberto} aria-controls={idPainel}
                disabled={item.disabled} onClick={() => alternar(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 16px', border: 'none',
                  background: 'transparent', textAlign: 'left', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  color: 'var(--ob-fg-strong)', cursor: item.disabled ? 'not-allowed' : 'pointer', opacity: item.disabled ? 'var(--ob-opacity-disabled)' : 1,
                }}>
                {item.icon && <Ph n={item.icon} size={18} c="var(--ob-fg-soft)" />}
                <span style={{ flex: 1, minWidth: 0 }}>{item.title}</span>
                <Ph n="caret-down" size={16} c="var(--ob-fg-soft)" style={{ flex: 'none', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform var(--ob-dur-fast) var(--ob-ease)' }} />
              </button>
            </h3>
            <div id={idPainel} role="region" aria-labelledby={idCabecalho} hidden={!aberto}
              style={{ padding: '0 16px 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--ob-fg)' }}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
