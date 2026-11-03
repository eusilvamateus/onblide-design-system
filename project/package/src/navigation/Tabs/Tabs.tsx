import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Badge } from '../../data-display/Badge/Badge';
import type { BadgeTone } from '../../internal/badgeTones';
import { ACTION_TONES, type ActionTone } from '../../internal/actionTones';
import type { Appearance } from '../../internal/appearance';

export type TabTone = ActionTone;
export type TabsAppearance = Extract<Appearance, 'soft' | 'solid'>;

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
  const pad = size === 'sm' ? '7px 14px' : '10px 18px';
  const fs  = size === 'sm' ? 13 : 14;

  return (
    <div style={{ position: 'relative' }}>
      {isLine && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--ob-border)' }}/>}
      <div style={{
        display: 'inline-flex', gap: isLine ? 0 : 4,
        background: isLine ? 'none' : 'var(--ob-bg-alt)',
        border: isLine ? 'none' : '1px solid var(--ob-border)',
        borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
        padding: isLine ? 0 : 3,
        position: 'relative',
      }}>
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
          const comSombra = !isLine && isActive && !preenchida && !pintaFundo;
          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              disabled={tab.disabled}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: pad, border: 'none', cursor: tab.disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--ob-font)', fontSize: fs, fontWeight: 600,
                borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
                transition: 'all 0.15s',
                position: 'relative',
                background: fundo,
                color: cor,
                opacity: tab.disabled ? 0.45 : 1,
                boxShadow: comSombra ? 'var(--ob-shadow-xs)' : 'none',
              }}
            >
              {dot && colorida && (
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: tom.fg, flex: 'none' }}/>
              )}
              {tab.icon && <Ph n={tab.icon} size={15} weight={isActive ? 'fill' : 'regular'}/>}
              {tab.label}
              {tab.badge != null && (
                preenchida
                  ? <Badge tone="neutral" size="sm" dot={false}>{tab.badge}</Badge>
                  : <Badge tone={isActive ? (colorida ? TOM_DO_CONTADOR[tab.tone as TabTone] : 'primary') : 'neutral'} appearance={isActive ? 'solid' : 'soft'} size="sm" dot={false}>{tab.badge}</Badge>
              )}
              {isLine && isActive && (
                <span style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                  background: colorida ? tom.fg : 'var(--ob-blue)', borderRadius: '2px 2px 0 0',
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
