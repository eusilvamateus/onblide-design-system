// project/package/src/components/SearchInput/SearchInput.tsx
import React, { useState } from 'react';
import { FieldShell } from '../../primitives/FieldShell/FieldShell';
import { FloatingPanel } from '../FloatingPanel/FloatingPanel';
import { Ph } from '../Ph/Ph';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export interface SearchInputResult {
  label: string;
  [key: string]: unknown;
}

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  results?: (string | SearchInputResult)[];
  onSelect?: (result: string | SearchInputResult) => void;
  width?: number | string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value = '', onChange, loading = false, placeholder = 'Buscar…', results = [], onSelect, width = 320 }) => {
  const [focus, setFocus] = useState(false);
  const showDrop = focus && results.length > 0;
  return (
    <div style={{ position: 'relative', width }}>
      <FieldShell focused={focus}>
        <Ph n="magnifying-glass" size={18} c="var(--ob-fg-mute)" />
        <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--ob-font)', fontSize: 14.5, color: 'var(--ob-fg-strong)' }} />
        {loading && <i className="ph ph-circle-notch" style={{ fontSize: 17, color: 'var(--ob-blue)', animation: 'ob-spin 0.8s linear infinite', flex: 'none' }} />}
        {!loading && value && <button onClick={() => onChange?.('')} aria-label="Limpar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-mute)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x-circle" size={17} /></button>}
      </FieldShell>
      {showDrop && (
        <FloatingPanel padding={0}>
          {results.map((r, i) => {
            const lbl = typeof r === 'string' ? r : r.label;
            return (
              <button key={i} onMouseDown={() => { onSelect?.(r); onChange?.(lbl); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', borderBottom: i < results.length - 1 ? '1px solid var(--ob-line-soft)' : 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--ob-font)', fontSize: 14, color: 'var(--ob-fg)', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <Ph n="arrow-elbow-down-right" size={14} c="var(--ob-fg-mute)" />{lbl}
              </button>
            );
          })}
        </FloatingPanel>
      )}
    </div>
  );
};

// injeta a keyframe do spinner de loading uma única vez. Mesmo conteúdo que
// Spinner.tsx injeta sob outro id ('ob-prim-kf') — duplicação já existente
// no original (SearchInput.jsx e Primitives.jsx guardam com ids
// diferentes), preservada verbatim; não consolidar com Spinner.tsx.
injectStyleOnce('ob-spin-kf', '@keyframes ob-spin{to{transform:rotate(360deg)}}');
