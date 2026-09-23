import React from 'react';
import { Ph } from '../Ph/Ph';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs?: TabItem[];
  active?: string;
  onChange?: (id: string) => void;
  variant?: 'line' | 'pill';
  size?: 'sm' | 'md';
}

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
                boxShadow: (!isLine && isActive) ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.icon && <Ph n={tab.icon} size={15}/>}
              {tab.label}
              {tab.badge != null && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                  background: isActive ? 'var(--ob-blue)' : 'var(--ob-bg-warm)',
                  color: isActive ? '#fff' : 'var(--ob-fg-soft)',
                }}>
                  {tab.badge}
                </span>
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
