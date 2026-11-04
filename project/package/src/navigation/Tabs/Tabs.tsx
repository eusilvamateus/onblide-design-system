import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Badge } from '../../data-display/Badge/Badge';
import type { BadgeTone } from '../../internal/badgeTones';
import { ACTION_TONES, type ActionTone } from '../../internal/actionTones';
import type { Appearance } from '../../internal/appearance';

export type TabTone = ActionTone;
export type TabsAppearance = Extract<Appearance, 'soft' | 'solid'>;

const useMedicao = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

interface Indicador { x: number; largura: number }

const TOM_DO_CONTADOR: Record<TabTone, BadgeTone> = { neutral: 'primary', primary: 'primary', success: 'success', warning: 'warning', danger: 'danger' };

export interface TabItem {
  /** Identificador único da aba, usado em `active` e `onChange`. */
  id: string;
  /** Rótulo exibido na aba — substantivo curto, nunca verbo. */
  label: React.ReactNode;
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido à esquerda do rótulo. */
  icon?: string;
  /** Conteúdo do badge exibido ao lado do rótulo, geralmente uma contagem. */
  badge?: React.ReactNode;
  /** Desabilita a aba, impedindo a seleção. */
  disabled?: boolean;
  /** Cor da aba quando ativa: pinta o texto (e o traço, na variante `line`). Com `neutral` ou sem tom, a aba usa o visual padrão. */
  tone?: TabTone;
}

export interface TabsProps {
  /** Lista de abas a exibir. */
  tabs?: TabItem[];
  /** Id da aba atualmente ativa. */
  active?: string;
  /** Chamado com o id da aba clicada. */
  onChange?: (id: string) => void;
  /** Estilo visual: sublinhado (`line`) ou segmentado (`pill`). */
  variant?: 'line' | 'pill';
  /** Tamanho do texto e do espaçamento interno das abas. */
  size?: 'sm' | 'md';
  /** Pintura da aba ativa na variante `pill`, quando ela tem `tone`: `soft` usa o fundo clarinho do tom e `solid` preenche com a cor forte do tom. Sem ela, a aba ativa fica com fundo de superfície e só o texto no tom. Ignorada na variante `line`. */
  appearance?: TabsAppearance;
  /** Mostra um ponto na cor do `tone` antes do rótulo de cada aba que tem tom. */
  dot?: boolean;
}

/** Alterna entre seções de conteúdo relacionado sem mudar de página. */
export const Tabs: React.FC<TabsProps> = ({ tabs = [], active, onChange, variant = 'line', size = 'md', appearance, dot = false }) => {
  const isLine = variant === 'line';
  const pad = size === 'sm' ? 'var(--ob-space-8) var(--ob-space-16)' : 'var(--ob-space-10) var(--ob-space-20)';
  const fs  = size === 'sm' ? 13 : 14;
  const lista = React.useRef<HTMLDivElement>(null);
  const [indicador, setIndicador] = React.useState<Indicador | null>(null);
  const ids = tabs.map(tab => tab.id).join('|');

  const medir = React.useCallback(() => {
    const ativa = lista.current?.querySelector<HTMLElement>('[data-ativa]');
    const novo = ativa ? { x: ativa.offsetLeft, largura: ativa.offsetWidth } : null;
    setIndicador(atual => (atual?.x === novo?.x && atual?.largura === novo?.largura ? atual : novo));
  }, []);

  useMedicao(() => { medir(); }, [medir, active, ids, variant, size, appearance, dot]);

  React.useEffect(() => {
    const el = lista.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    Array.from(el.children).forEach(filho => observador.observe(filho));
    return () => observador.disconnect();
  }, [medir, ids]);

  const ativa = tabs.find(tab => tab.id === active);
  const tomAtivo = ACTION_TONES[ativa?.tone ?? 'neutral'];
  const ativaColorida = !!ativa?.tone && ativa.tone !== 'neutral';
  let fundoDoIndicador = 'var(--ob-surface)';
  if (isLine) fundoDoIndicador = ativaColorida ? tomAtivo.fg : 'var(--ob-blue)';
  else if (ativaColorida && appearance === 'solid') fundoDoIndicador = tomAtivo.fg;
  else if (ativaColorida && appearance === 'soft') fundoDoIndicador = tomAtivo.bg;
  const sombraDoIndicador = !isLine && !(ativaColorida && appearance) ? 'var(--ob-shadow-xs)' : 'none';
  const deslizando = 'var(--ob-dur-base) var(--ob-ease-out)';

  return (
    <div style={{ position: 'relative' }}>
      {isLine && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--ob-border)' }}/>}
      <div ref={lista} style={{
        display: 'inline-flex', gap: isLine ? 0 : 'var(--ob-space-4)',
        background: isLine ? 'none' : 'var(--ob-bg-alt)',
        border: isLine ? 'none' : '1px solid var(--ob-border)',
        borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
        padding: isLine ? 0 : 'var(--ob-space-4)',
        position: 'relative',
      }}>
        {indicador && (
          <span aria-hidden="true" data-indicador="" style={{
            position: 'absolute', left: 0,
            top: isLine ? 'auto' : 'var(--ob-space-4)', bottom: isLine ? -1 : 'var(--ob-space-4)',
            height: isLine ? 2 : 'auto',
            width: indicador.largura, transform: `translateX(${indicador.x}px)`,
            background: fundoDoIndicador, boxShadow: sombraDoIndicador,
            borderRadius: isLine ? 'var(--ob-r-2xs) var(--ob-r-2xs) 0 0' : 'var(--ob-r-sm)',
            transition: `transform ${deslizando}, width ${deslizando}, background-color ${deslizando}, box-shadow ${deslizando}`,
            pointerEvents: 'none',
          }}/>
        )}
        {tabs.map(tab => {
          const isActive = tab.id === active;
          const colorida = !!tab.tone && tab.tone !== 'neutral';
          const tom = ACTION_TONES[tab.tone ?? 'neutral'];
          const preenchida = !isLine && colorida && isActive && appearance === 'solid';
          const pintaFundo = !isLine && colorida && isActive && appearance === 'soft';
          const pintaTexto = colorida && isActive;
          let fundo = 'none';
          if (!isLine && isActive) fundo = preenchida ? tom.fg : pintaFundo ? tom.bg : 'var(--ob-surface)';
          let cor = isActive ? 'var(--ob-fg-strong)' : 'var(--ob-fg-mute)';
          if (preenchida) cor = 'var(--ob-surface)';
          else if (pintaTexto) cor = tom.fg;
          const comSombra = !indicador && !isLine && isActive && !preenchida && !pintaFundo;
          if (indicador) fundo = 'none';
          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              disabled={tab.disabled}
              data-ativa={isActive ? '' : undefined}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-8)',
                padding: pad, border: 'none', cursor: tab.disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--ob-font)', fontSize: fs, fontWeight: 600,
                borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
                transition: `color ${deslizando}`,
                position: 'relative',
                background: fundo,
                color: cor,
                opacity: tab.disabled ? 'var(--ob-opacity-disabled)' : 1,
                boxShadow: comSombra ? 'var(--ob-shadow-xs)' : 'none',
              }}
            >
              {dot && colorida && (
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 'var(--ob-r-circle)', background: tom.fg, flex: 'none' }}/>
              )}
              {tab.icon && <Ph n={tab.icon} size={15} weight={isActive ? 'fill' : 'regular'}/>}
              {tab.label}
              {tab.badge != null && (
                preenchida
                  ? <Badge tone="neutral" size="sm" dot={false}>{tab.badge}</Badge>
                  : <Badge tone={isActive ? (colorida ? TOM_DO_CONTADOR[tab.tone as TabTone] : 'primary') : 'neutral'} appearance={isActive ? 'solid' : 'soft'} size="sm" dot={false}>{tab.badge}</Badge>
              )}
              {!indicador && isLine && isActive && (
                <span style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                  background: colorida ? tom.fg : 'var(--ob-blue)', borderRadius: 'var(--ob-r-2xs) var(--ob-r-2xs) 0 0',
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
