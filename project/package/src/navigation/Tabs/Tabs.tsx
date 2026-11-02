import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Badge } from '../../data-display/Badge/Badge';
import type { BadgeTone } from '../../internal/badgeTones';
import { ACTION_TONES, type ActionTone } from '../../internal/actionTones';

export type TabTone = ActionTone;
export type TabsAppearance = 'soft' | 'text' | 'solid' | 'dot';

const TOM_DO_CONTADOR: Record<TabTone, BadgeTone> = { neutral: 'blue', primary: 'blue', success: 'green', warning: 'orange', danger: 'red' };

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
  /** Cor da aba. Só tem efeito quando o `Tabs` recebe `appearance`; sem `appearance`, ou com `neutral`, a aba usa o visual padrão. */
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
  /** Liga a cor de `tone` das abas. Sem ele, as abas usam sempre o visual padrão. Na pílula: `soft` pinta o fundo e o texto da aba ativa com o tom, `text` só o texto, `solid` preenche a aba ativa com o tom e `dot` mostra um ponto do tom em cada aba. Na variante `line`, qualquer valor pinta o texto e o traço da aba ativa com o tom. */
  appearance?: TabsAppearance;
}

/** Alterna entre seções de conteúdo relacionado sem mudar de página. */
export const Tabs: React.FC<TabsProps> = ({ tabs = [], active, onChange, variant = 'line', size = 'md', appearance }) => {
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
          const colorida = !!appearance && !!tab.tone && tab.tone !== 'neutral';
          const tom = ACTION_TONES[tab.tone ?? 'neutral'];
          const preenchida = !isLine && colorida && isActive && appearance === 'solid';
          const pintaFundo = !isLine && colorida && isActive && appearance === 'soft';
          const pintaTexto = colorida && isActive && (isLine || appearance !== 'dot');
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
              {!isLine && colorida && appearance === 'dot' && (
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: tom.fg, flex: 'none' }}/>
              )}
              {tab.icon && <Ph n={tab.icon} size={15} weight={isActive ? 'fill' : 'regular'}/>}
              {tab.label}
              {tab.badge != null && (
                preenchida
                  ? <Badge tone="grey" variant="subtle" size="sm" dot={false}>{tab.badge}</Badge>
                  : <Badge tone={isActive ? (colorida ? TOM_DO_CONTADOR[tab.tone as TabTone] : 'blue') : 'grey'} variant={isActive ? 'solid' : 'subtle'} size="sm" dot={false}>{tab.badge}</Badge>
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
