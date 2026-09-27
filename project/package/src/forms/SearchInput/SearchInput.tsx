// project/package/src/forms/SearchInput/SearchInput.tsx
import React, { useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { FloatingPanel } from '../../overlays/FloatingPanel/FloatingPanel';
import { Ph } from '../../iconography/Ph/Ph';
import { injectSpinKeyframes } from '../../internal/keyframes';

export interface SearchInputResult {
  /** Texto exibido para o resultado na lista de sugestões. */
  label: string;
  /** Dados adicionais associados ao resultado, repassados como estão para `onSelect`. */
  [key: string]: unknown;
}

export interface SearchInputProps {
  /** Texto atual do campo de busca. */
  value?: string;
  /** Chamado a cada alteração do texto digitado, recebendo o novo valor. */
  onChange?: (value: string) => void;
  /** Exibe um spinner no lugar do ícone de lupa, indicando uma busca em andamento. */
  loading?: boolean;
  /** Texto de apoio exibido quando o campo está vazio. */
  placeholder?: string;
  /** Lista de sugestões exibidas no dropdown; cada item pode ser uma string ou um objeto com `label`. */
  results?: (string | SearchInputResult)[];
  /** Chamado ao escolher um item da lista de sugestões. */
  onSelect?: (result: string | SearchInputResult) => void;
  /** Largura do campo de busca. */
  width?: number | string;
}

/** Campo de busca com ícone de lupa, botão de limpar e dropdown de sugestões. */
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
        {loading && <Ph n="circle-notch" size={17} c="var(--ob-blue)" style={{ animation: 'ob-spin 0.8s linear infinite' }} />}
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
                <Ph n="arrow-elbow-down-right" size={14} c="var(--ob-fg-mute)" weight="bold" />{lbl}
              </button>
            );
          })}
        </FloatingPanel>
      )}
    </div>
  );
};

injectSpinKeyframes();
