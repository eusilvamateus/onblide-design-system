import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Badge } from '../../data-display/Badge/Badge';

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
}

/** Alterna entre seções de conteúdo relacionado sem mudar de página. */
export const Tabs: React.FC<TabsProps> = ({ tabs = [], active, onChange, variant = 'line', size = 'md' }) => {
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
                background: isLine ? 'none' : (isActive ? 'var(--ob-surface)' : 'none'),
                color: isActive ? 'var(--ob-fg-strong)' : 'var(--ob-fg-mute)',
                opacity: tab.disabled ? 0.45 : 1,
                boxShadow: (!isLine && isActive) ? 'var(--ob-shadow-xs)' : 'none',
              }}
            >
              {tab.icon && <Ph n={tab.icon} size={15} weight={isActive ? 'fill' : 'regular'}/>}
              {tab.label}
              {tab.badge != null && (
                <Badge tone={isActive ? 'blue' : 'grey'} variant={isActive ? 'solid' : 'subtle'} size="sm" dot={false}>{tab.badge}</Badge>
              )}
              {isLine && isActive && (
                <span style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                  background: 'var(--ob-blue)', borderRadius: '2px 2px 0 0',
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
