// project/package/src/data-display/Table/Table.tsx
import React, { useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

// `ob-pulse`: pulsação das linhas-esqueleto do estado `loading`.
injectStyleOnce('ob-pulse-kf', '@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}');

export interface TableColumn<T> {
  /** Chave da coluna, usada para ler o valor da linha e identificar ordenação. */
  key: string;
  /** Rótulo exibido no cabeçalho da coluna. */
  label: React.ReactNode;
  /** Largura fixa da coluna. */
  width?: number | string;
  /** Habilita clique no cabeçalho para ordenar por essa coluna. */
  sortable?: boolean;
  /** Exibe o valor da coluna em negrito e com cor de destaque. */
  bold?: boolean;
  /** Customiza a renderização da célula a partir do valor bruto e da linha. */
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableSort {
  /** Chave da coluna pela qual a tabela está ordenada. */
  key: string;
  /** Direção da ordenação atual. */
  dir: 'asc' | 'desc';
}

export interface TableProps<T> {
  /** Definição das colunas exibidas. */
  columns?: TableColumn<T>[];
  /** Linhas de dados exibidas na tabela. */
  rows?: T[];
  /** Exibe checkboxes para seleção de linhas. */
  selectable?: boolean;
  /** Chamado com as linhas selecionadas sempre que a seleção muda. */
  onSelect?: (rows: T[]) => void;
  /** Exibe linhas-esqueleto animadas no lugar dos dados. */
  loading?: boolean;
  /** Conteúdo exibido quando não há linhas; padrão: mensagem de nenhum resultado. */
  emptyState?: React.ReactNode;
  /** Chamado com a chave da coluna clicada, quando `sortable`. */
  onSort?: (key: string) => void;
  /** Coluna e direção de ordenação atualmente aplicadas. */
  sort?: TableSort;
}

// Componente genérico — React.FC<TableProps<T>> não permite que TS infira T
// a partir do uso (React.FC não é genérico), então Table é declarado como
// função direta, igual a como o React documenta componentes genéricos.
// `T extends object` (e não Record<string, unknown>) para aceitar também
// `interface` sem index signature como tipo de linha.
/** Tabela de dados com seleção, ordenação, carregamento e estado vazio. */
export function Table<T extends object = Record<string, unknown>>({
  columns = [], rows = [], selectable = false, onSelect, loading = false, emptyState, onSort, sort,
}: TableProps<T>) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleAll = () => {
    const next = selected.length === rows.length ? [] : rows.map((_, i) => i);
    setSelected(next);
    onSelect?.(next.map(i => rows[i]));
  };
  const toggleRow = (i: number) => {
    const next = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
    setSelected(next);
    onSelect?.(next.map(j => rows[j]));
  };

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const partChecked = selected.length > 0 && selected.length < rows.length;

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--ob-font-mono)',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--ob-fg-mute)', borderBottom: '1.5px solid var(--ob-border)',
    background: 'var(--ob-surface)', whiteSpace: 'nowrap', userSelect: 'none',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 14, color: 'var(--ob-fg)',
    borderBottom: '1px solid var(--ob-line-soft)', verticalAlign: 'middle',
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: 'var(--ob-r-md)', border: '1px solid var(--ob-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--ob-surface)' }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...thStyle, width: 44, padding: '10px 14px' }}>
                <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = partChecked; }}
                  onChange={toggleAll} style={{ accentColor: 'var(--ob-blue)', width: 15, height: 15, cursor: 'pointer' }}/>
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} style={{ ...thStyle, cursor: col.sortable ? 'pointer' : 'default', width: col.width }}
                onClick={() => col.sortable && onSort?.(col.key)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {col.label}
                  {col.sortable && (
                    <span style={{ opacity: sort?.key === col.key ? 1 : 0.35, color: 'var(--ob-blue)' }}>
                      {sort?.key === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                {selectable && <td style={tdStyle}><div style={{ width: 15, height: 15, borderRadius: 3, background: 'var(--ob-bg-alt)' }}/></td>}
                {columns.map(col => (
                  <td key={col.key} style={tdStyle}>
                    <div style={{ height: 14, borderRadius: 4, background: 'var(--ob-bg-alt)', width: `${60 + Math.random() * 30}%`, animation: 'ob-pulse 1.4s ease-in-out infinite' }}/>
                  </td>
                ))}
              </tr>
            ))
            : rows.length === 0
            ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ ...tdStyle, textAlign: 'center', padding: '40px 14px', color: 'var(--ob-fg-mute)' }}>
                  {emptyState || 'Nenhum resultado encontrado.'}
                </td>
              </tr>
            )
            : rows.map((row, i) => (
              <tr key={i} style={{ background: selected.includes(i) ? 'var(--ob-blue-100)' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!selected.includes(i)) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selected.includes(i) ? 'var(--ob-blue-100)' : 'none'; }}>
                {selectable && (
                  <td style={tdStyle}>
                    <input type="checkbox" checked={selected.includes(i)} onChange={() => toggleRow(i)}
                      style={{ accentColor: 'var(--ob-blue)', width: 15, height: 15, cursor: 'pointer' }}/>
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} style={{ ...tdStyle, fontWeight: col.bold ? 600 : 400, color: col.bold ? 'var(--ob-fg-strong)' : 'var(--ob-fg)' }}>
                    {col.render ? col.render((row as Record<string, unknown>)[col.key], row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
