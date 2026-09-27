// project/package/src/data-display/Table/Table.tsx
import React, { useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import { Checkbox } from '../../forms/Checkbox/Checkbox';

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
  /** Chamado com a chave da coluna clicada, quando `sortable`. Com `onSort`, a Table só avisa o clique — quem usa
   * decide a próxima direção e passa as linhas já ordenadas (ordenação no servidor, por exemplo). Sem `onSort`,
   * a Table ordena as linhas sozinha, ciclando crescente → decrescente → sem ordenação a cada clique. */
  onSort?: (key: string) => void;
  /** Coluna e direção de ordenação atualmente aplicadas (controla as setas do cabeçalho). Sem `onSort`, também
   * serve de valor inicial da ordenação automática. */
  sort?: TableSort;
}

// Compara dois valores de célula para a ordenação automática (sem `onSort`): datas no formato dd/mm/aaaa, depois
// números (nativos ou em texto) e por fim texto, em pt-BR. Cobre os tipos de dado mais comuns numa tabela sem
// exigir que quem usa escreva um comparador.
const paraData = (v: unknown): number | null => {
  if (typeof v !== 'string') return null;
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime() : null;
};
const comparar = (a: unknown, b: unknown): number => {
  const da = paraData(a), db = paraData(b);
  if (da !== null && db !== null) return da - db;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const na = typeof a === 'string' && a.trim() !== '' && !Number.isNaN(Number(a)) ? Number(a) : null;
  const nb = typeof b === 'string' && b.trim() !== '' && !Number.isNaN(Number(b)) ? Number(b) : null;
  if (na !== null && nb !== null) return na - nb;
  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
};
// Ordena os índices originais (não as linhas em si): mantém `selected`/`toggleRow` funcionando por índice mesmo
// com a tabela reordenada na tela.
function indicesOrdenados<T extends object>(rows: T[], s: TableSort): number[] {
  const idx = rows.map((_, i) => i);
  const dir = s.dir === 'asc' ? 1 : -1;
  idx.sort((a, b) => comparar((rows[a] as Record<string, unknown>)[s.key], (rows[b] as Record<string, unknown>)[s.key]) * dir);
  return idx;
}
// Crescente → decrescente → sem ordenação; clicar numa coluna diferente sempre recomeça em crescente.
function proximaOrdenacao(atual: TableSort | undefined, key: string): TableSort | undefined {
  if (atual?.key !== key) return { key, dir: 'asc' };
  return atual.dir === 'asc' ? { key, dir: 'desc' } : undefined;
}

// Componente genérico — React.FC<TableProps<T>> não permite que TS infira T
// a partir do uso (React.FC não é genérico), então Table é declarado como
// função direta, igual a como o React documenta componentes genéricos.
// `T extends object` (e não Record<string, unknown>) para aceitar também
// `interface` sem index signature como tipo de linha.
/** Tabela de dados com seleção, ordenação, carregamento e estado vazio. */
const LINHAS_ESQUELETO = 4;

export function Table<T extends object = Record<string, unknown>>({
  columns = [], rows = [], selectable = false, onSelect, loading = false, emptyState, onSort, sort,
}: TableProps<T>) {
  const [selected, setSelected] = useState<number[]>([]);
  // Valor inicial da ordenação automática; ignora mudanças depois disso (mesmo padrão não controlado de `selected`
  // acima). Some quando há `onSort`: aí quem usa é quem decide e passa as linhas já na ordem certa.
  const [sortInterno, setSortInterno] = useState<TableSort | undefined>(sort);
  const sortAtivo = onSort ? sort : sortInterno;
  const ordemExibida = sortAtivo && !onSort ? indicesOrdenados(rows, sortAtivo) : rows.map((_, i) => i);
  const alternarOrdenacao = (key: string) => {
    if (onSort) { onSort(key); return; }
    setSortInterno((atual) => proximaOrdenacao(atual, key));
  };

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
    color: 'var(--ob-fg-mute)', borderBottom: '1px solid var(--ob-line-soft)',
    background: 'var(--ob-surface)', whiteSpace: 'nowrap', userSelect: 'none',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 14, color: 'var(--ob-fg)',
    borderBottom: '1px solid var(--ob-line-soft)', verticalAlign: 'middle',
  };
  // A borda do invólucro já fecha a tabela: a última linha fica sem borda de baixo, senão as duas se somam
  // numa linha de 2px no rodapé.
  const celula = (ultima: boolean): React.CSSProperties => (ultima ? { ...tdStyle, borderBottom: 'none' } : tdStyle);

  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: 'var(--ob-r-md)', border: '1px solid var(--ob-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--ob-surface)' }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...thStyle, width: 44, padding: '10px 14px' }}>
                <Checkbox checked={allChecked} indeterminate={partChecked} onChange={toggleAll} ariaLabel="Selecionar todas as linhas" />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} style={{ ...thStyle, cursor: col.sortable ? 'pointer' : 'default', width: col.width }}
                onClick={() => col.sortable && alternarOrdenacao(col.key)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {col.label}
                  {col.sortable && (
                    <span style={{ opacity: sortAtivo?.key === col.key ? 1 : 0.35, color: 'var(--ob-blue)' }}>
                      {sortAtivo?.key === col.key ? (sortAtivo.dir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: LINHAS_ESQUELETO }).map((_, i) => (
              <tr key={i}>
                {selectable && <td style={celula(i === LINHAS_ESQUELETO - 1)}><div style={{ width: 15, height: 15, borderRadius: 3, background: 'var(--ob-bg-alt)' }}/></td>}
                {columns.map(col => (
                  <td key={col.key} style={celula(i === LINHAS_ESQUELETO - 1)}>
                    <div style={{ height: 14, borderRadius: 4, background: 'var(--ob-bg-alt)', width: `${60 + Math.random() * 30}%`, animation: 'ob-pulse 1.4s ease-in-out infinite' }}/>
                  </td>
                ))}
              </tr>
            ))
            : rows.length === 0
            ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ ...celula(true), textAlign: 'center', padding: '40px 14px', color: 'var(--ob-fg-mute)' }}>
                  {emptyState || 'Nenhum resultado encontrado.'}
                </td>
              </tr>
            )
            : ordemExibida.map((i) => { const row = rows[i]; return (
              <tr key={i} style={{ background: selected.includes(i) ? 'var(--ob-blue-100)' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!selected.includes(i)) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selected.includes(i) ? 'var(--ob-blue-100)' : 'none'; }}>
                {selectable && (
                  <td style={celula(i === rows.length - 1)}>
                    <Checkbox checked={selected.includes(i)} onChange={() => toggleRow(i)} ariaLabel={`Selecionar linha ${i + 1}`} />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} style={{ ...celula(i === rows.length - 1), fontWeight: col.bold ? 600 : 400, color: col.bold ? 'var(--ob-fg-strong)' : 'var(--ob-fg)' }}>
                    {col.render ? col.render((row as Record<string, unknown>)[col.key], row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ); })}
        </tbody>
      </table>
    </div>
  );
}
