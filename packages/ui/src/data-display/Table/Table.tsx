import React, { useId, useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { Checkbox, type CheckboxSize } from '../../forms/Checkbox/Checkbox';
import { Skeleton } from '../../feedback/Skeleton/Skeleton';
import { Button, type ButtonSize } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';

/** Densidade da tabela: `sm` (texto de 13px, linhas compactas), `md` (14px, padrão) e `lg` (15px, mais espaço). */
export type TableSize = 'sm' | 'md' | 'lg';
/** Alinhamento do conteúdo de uma coluna; use `right` para números e valores. */
export type TableAlign = 'left' | 'center' | 'right';
/** Identificador único de uma linha. */
export type TableRowKey = string | number;

export interface TableColumn<T> {
  /** Chave da coluna, usada para ler o valor da linha e identificar ordenação. */
  key: string;
  /** Rótulo exibido no cabeçalho da coluna. */
  label: React.ReactNode;
  /** Largura fixa da coluna. */
  width?: number | string;
  /** Alinhamento do cabeçalho e das células; `right` para números e valores. */
  align?: TableAlign;
  /** Habilita a ordenação por essa coluna, pelo clique ou pelo teclado no cabeçalho. */
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
  /** Identifica cada linha: o nome de um campo ou uma função. Sem ele, usa o campo `id` da linha e, na falta dele, a posição. A seleção e as linhas abertas seguem esse identificador, então continuam certas ao paginar, filtrar ou excluir. */
  rowKey?: keyof T | ((row: T) => TableRowKey);
  /** Densidade: tamanho do texto e espaço das células. */
  size?: TableSize;
  /** Título visível da tabela, exibido acima do cabeçalho e lido por leitores de tela. */
  caption?: React.ReactNode;
  /** Nome acessível da tabela, quando não há `caption` visível. */
  ariaLabel?: string;
  /** Altura máxima da tabela; acima dela o corpo rola e o cabeçalho fica fixo no topo. */
  maxHeight?: number | string;
  /** Exibe checkboxes para seleção de linhas. */
  selectable?: boolean;
  /** Identificadores das linhas selecionadas, em modo controlado. Podem incluir linhas de outras páginas. */
  selectedKeys?: TableRowKey[];
  /** Identificadores das linhas selecionadas no início, em modo não controlado. */
  defaultSelectedKeys?: TableRowKey[];
  /** Chamado sempre que a seleção muda, com as linhas de `rows` selecionadas e todos os identificadores selecionados (inclusive de outras páginas). */
  onSelect?: (rows: T[], keys: TableRowKey[]) => void;
  /** Chamado ao clicar numa linha ou ao apertar Enter ou Espaço com ela em foco. Cliques em botões, links e campos dentro da linha não disparam. */
  onRowClick?: (row: T) => void;
  /** Conteúdo exibido abaixo da linha quando ela é aberta. As linhas para as quais a função devolve `null` não podem ser abertas. */
  renderExpanded?: (row: T) => React.ReactNode;
  /** Identificadores das linhas abertas, em modo controlado. */
  expandedKeys?: TableRowKey[];
  /** Identificadores das linhas abertas no início, em modo não controlado. */
  defaultExpandedKeys?: TableRowKey[];
  /** Chamado com os identificadores das linhas abertas sempre que uma linha abre ou fecha. */
  onExpandedChange?: (keys: TableRowKey[]) => void;
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

interface EscalaDaTabela {
  recuoY: string; recuoX: string; fonte: number; linha: number; cabecalho: number; seta: number;
  esqueleto: number; escolha: CheckboxSize; botao: ButtonSize; icone: number;
}

const ESCALA: Record<TableSize, EscalaDaTabela> = {
  sm: { recuoY: 'var(--ob-space-6)', recuoX: 'var(--ob-space-12)', fonte: 13, linha: 18, cabecalho: 11, seta: 12, esqueleto: 12, escolha: 'sm', botao: 'sm', icone: 14 },
  md: { recuoY: 'var(--ob-space-10)', recuoX: 'var(--ob-space-16)', fonte: 14, linha: 20, cabecalho: 11, seta: 12, esqueleto: 14, escolha: 'md', botao: 'sm', icone: 16 },
  lg: { recuoY: 'var(--ob-space-12)', recuoX: 'var(--ob-space-20)', fonte: 15, linha: 22, cabecalho: 12, seta: 14, esqueleto: 16, escolha: 'lg', botao: 'md', icone: 18 },
};

const LINHAS_ESQUELETO = 4;
const LARGURAS_DO_ESQUELETO = ['72%', '56%', '84%', '64%'];
const DIVISORIA = '1px solid var(--ob-line-soft)';
const DESLIZE = 'var(--ob-dur-base) var(--ob-ease)';
const INTERATIVOS = 'button, a, input, select, textarea, label, [role="button"], [role="checkbox"], [role="menuitem"], [role="switch"]';
const somenteLeitor: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

injectStyleOnce(
  'ob-table',
  '.ob-table-ordenar{transition:color var(--ob-dur-fast) var(--ob-ease)}.ob-table-ordenar:hover{color:var(--ob-fg)}.ob-table-ordenar:focus-visible,.ob-table-linha:focus-visible{outline:var(--ob-focus-ring-width) solid var(--ob-focus-ring);outline-offset:calc(var(--ob-focus-ring-width) * -1)}.ob-table-ordenar:focus-visible{outline-offset:var(--ob-space-2)}',
);

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
function indicesOrdenados<T extends object>(rows: T[], s: TableSort): number[] {
  const idx = rows.map((_, i) => i);
  const dir = s.dir === 'asc' ? 1 : -1;
  idx.sort((a, b) => comparar((rows[a] as Record<string, unknown>)[s.key], (rows[b] as Record<string, unknown>)[s.key]) * dir);
  return idx;
}
function proximaOrdenacao(atual: TableSort | undefined, key: string): TableSort | undefined {
  if (atual?.key !== key) return { key, dir: 'asc' };
  return atual.dir === 'asc' ? { key, dir: 'desc' } : undefined;
}
const alternar = (lista: TableRowKey[], chave: TableRowKey) => (lista.includes(chave) ? lista.filter((k) => k !== chave) : [...lista, chave]);

/** Tabela de dados com seleção, ordenação, linhas clicáveis e expansíveis, cabeçalho fixo, densidades, carregamento e estado vazio. */
export function Table<T extends object = Record<string, unknown>>({
  columns = [], rows = [], rowKey, size = 'md', caption, ariaLabel, maxHeight, selectable = false, selectedKeys, defaultSelectedKeys,
  onSelect, onRowClick, renderExpanded, expandedKeys, defaultExpandedKeys, onExpandedChange, loading = false, emptyState, onSort, sort,
}: TableProps<T>) {
  const uid = useId();
  const escala = ESCALA[size];
  const [selecaoInterna, setSelecaoInterna] = useState<TableRowKey[]>(defaultSelectedKeys ?? []);
  const [abertasInternas, setAbertasInternas] = useState<TableRowKey[]>(defaultExpandedKeys ?? []);
  const [sortInterno, setSortInterno] = useState<TableSort | undefined>(sort);
  const selecionadas = selectedKeys ?? selecaoInterna;
  const abertas = expandedKeys ?? abertasInternas;
  const sortAtivo = onSort ? sort : sortInterno;
  const ordemExibida = sortAtivo && !onSort ? indicesOrdenados(rows, sortAtivo) : rows.map((_, i) => i);
  const temDetalhes = !!renderExpanded;
  const totalDeColunas = columns.length + (selectable ? 1 : 0) + (temDetalhes ? 1 : 0);

  const chaveDe = (row: T, i: number): TableRowKey => {
    if (typeof rowKey === 'function') return rowKey(row);
    const valor = rowKey !== undefined ? row[rowKey] : (row as Record<string, unknown>).id;
    return typeof valor === 'string' || typeof valor === 'number' ? valor : i;
  };
  const chaves = rows.map(chaveDe);

  const alternarOrdenacao = (key: string) => {
    if (onSort) { onSort(key); return; }
    setSortInterno((atual) => proximaOrdenacao(atual, key));
  };
  const mudarSelecao = (proximas: TableRowKey[]) => {
    if (selectedKeys === undefined) setSelecaoInterna(proximas);
    onSelect?.(rows.filter((_, i) => proximas.includes(chaves[i])), proximas);
  };
  const todasMarcadas = rows.length > 0 && chaves.every((k) => selecionadas.includes(k));
  const algumaMarcada = !todasMarcadas && chaves.some((k) => selecionadas.includes(k));
  const alternarTodas = () => mudarSelecao(todasMarcadas
    ? selecionadas.filter((k) => !chaves.includes(k))
    : [...selecionadas, ...chaves.filter((k) => !selecionadas.includes(k))]);
  const alternarDetalhes = (chave: TableRowKey) => {
    const proximas = alternar(abertas, chave);
    if (expandedKeys === undefined) setAbertasInternas(proximas);
    onExpandedChange?.(proximas);
  };

  const th: React.CSSProperties = {
    padding: `${escala.recuoY} ${escala.recuoX}`, textAlign: 'left', fontFamily: 'var(--ob-font-mono)',
    fontSize: escala.cabecalho, lineHeight: `${escala.linha}px`, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--ob-fg-mute)', border: 'none', borderBottom: DIVISORIA,
    background: 'var(--ob-surface)', whiteSpace: 'nowrap', userSelect: 'none', verticalAlign: 'middle',
    ...(maxHeight !== undefined ? { position: 'sticky' as const, top: 0, zIndex: 1 } : {}),
  };
  const td: React.CSSProperties = {
    padding: `${escala.recuoY} ${escala.recuoX}`, fontSize: escala.fonte, lineHeight: `${escala.linha}px`, color: 'var(--ob-fg)',
    border: 'none', borderBottom: DIVISORIA, background: 'none', verticalAlign: 'middle',
  };
  const linhaSemBorda: React.CSSProperties = { border: 'none', background: 'none' };
  const celula = (ultima: boolean, extra?: React.CSSProperties): React.CSSProperties => ({ ...td, ...(ultima ? { borderBottom: 'none' } : {}), ...extra });
  const colunaDeControle: React.CSSProperties = { width: 1, paddingRight: 0 };
  const alinhar = (col: TableColumn<T>): React.CSSProperties => ({
    textAlign: col.align ?? 'left', ...(col.align === 'right' ? { fontVariantNumeric: 'tabular-nums' } : {}),
  });
  const pararClique = (e: React.MouseEvent) => e.stopPropagation();

  const cabecalho = (col: TableColumn<T>) => {
    if (!col.sortable) return col.label;
    const ativa = sortAtivo?.key === col.key;
    const icone = ativa ? (sortAtivo.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'arrows-down-up';
    return (
      <button type="button" className="ob-table-ordenar" onClick={() => alternarOrdenacao(col.key)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-6)', flexDirection: col.align === 'right' ? 'row-reverse' : 'row',
        margin: 0, padding: 0, border: 'none', background: 'none', borderRadius: 'var(--ob-r-2xs)', cursor: 'pointer',
        font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: ativa ? 'var(--ob-fg)' : 'inherit',
      }}>
        {col.label}
        <Ph n={icone} size={escala.seta} c={ativa ? 'var(--ob-blue)' : undefined} style={{ opacity: ativa ? 1 : 'var(--ob-opacity-muted)' }} />
      </button>
    );
  };

  const corpo = () => {
    if (loading) {
      return Array.from({ length: LINHAS_ESQUELETO }).map((_, i) => {
        const ultima = i === LINHAS_ESQUELETO - 1;
        return (
          <tr key={i} style={linhaSemBorda}>
            {selectable && <td style={celula(ultima, colunaDeControle)}><Skeleton width={16} height={16} radius="var(--ob-r-2xs)" /></td>}
            {temDetalhes && <td style={celula(ultima, colunaDeControle)} />}
            {columns.map((col, c) => (
              <td key={col.key} style={celula(ultima)}>
                <Skeleton height={escala.esqueleto} width={LARGURAS_DO_ESQUELETO[(i + c) % LARGURAS_DO_ESQUELETO.length]}
                  style={col.align === 'right' ? { marginLeft: 'auto' } : col.align === 'center' ? { margin: '0 auto' } : undefined} />
              </td>
            ))}
          </tr>
        );
      });
    }
    if (rows.length === 0) {
      return (
        <tr style={linhaSemBorda}>
          <td colSpan={totalDeColunas} style={celula(true, { textAlign: 'center', padding: 'var(--ob-space-40) var(--ob-space-16)', color: 'var(--ob-fg-mute)' })}>
            {emptyState || 'Nenhum resultado encontrado.'}
          </td>
        </tr>
      );
    }
    return ordemExibida.map((i, posicao) => {
      const row = rows[i];
      const chave = chaves[i];
      const ultima = posicao === ordemExibida.length - 1;
      const marcada = selecionadas.includes(chave);
      const detalhe = renderExpanded?.(row);
      const expansivel = detalhe !== null && detalhe !== undefined && detalhe !== false;
      const aberta = expansivel && abertas.includes(chave);
      const idDoDetalhe = `${uid}-detalhe-${posicao}`;
      const fundo = marcada ? 'var(--ob-blue-100)' : 'none';
      const semDivisoria = ultima && !aberta;
      return (
        <React.Fragment key={String(chave)}>
          <tr
            className={onRowClick ? 'ob-table-linha' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            style={{ border: 'none', background: fundo, cursor: onRowClick ? 'pointer' : undefined, transition: 'background var(--ob-dur-fast) var(--ob-ease)' }}
            onMouseEnter={(e) => { if (!marcada) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = fundo; }}
            onClick={onRowClick ? (e) => {
              const alvo = (e.target as HTMLElement).closest(INTERATIVOS);
              if (alvo && e.currentTarget.contains(alvo)) return;
              onRowClick(row);
            } : undefined}
            onKeyDown={onRowClick ? (e) => {
              if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
              e.preventDefault();
              onRowClick(row);
            } : undefined}
          >
            {selectable && (
              <td style={celula(semDivisoria, colunaDeControle)} onClick={pararClique}>
                <Checkbox size={escala.escolha} checked={marcada} onChange={() => mudarSelecao(alternar(selecionadas, chave))} ariaLabel={`Selecionar linha ${posicao + 1}`} />
              </td>
            )}
            {temDetalhes && (
              <td style={celula(semDivisoria, { ...colunaDeControle, paddingTop: 0, paddingBottom: 0 })} onClick={pararClique}>
                {expansivel && (
                  <Button kind="quiet" size={escala.botao} iconOnly aria-label={`Detalhes da linha ${posicao + 1}`} aria-expanded={aberta} aria-controls={idDoDetalhe}
                    onClick={() => alternarDetalhes(chave)}
                    icon={<Ph n="caret-right" size={escala.icone} style={{ transform: aberta ? 'rotate(90deg)' : 'none', transition: `transform ${DESLIZE}` }} />} />
                )}
              </td>
            )}
            {columns.map((col) => (
              <td key={col.key} style={celula(semDivisoria, { ...alinhar(col), fontWeight: col.bold ? 600 : 400, color: col.bold ? 'var(--ob-fg-strong)' : 'var(--ob-fg)' })}>
                {col.render ? col.render((row as Record<string, unknown>)[col.key], row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
              </td>
            ))}
          </tr>
          {expansivel && (
            <tr style={linhaSemBorda}>
              <td colSpan={totalDeColunas} style={{ padding: 0, border: 'none', borderBottom: aberta && !ultima ? DIVISORIA : 'none', background: 'var(--ob-bg-alt)' }}>
                <div id={idDoDetalhe} style={{
                  display: 'grid', gridTemplateRows: aberta ? '1fr' : '0fr', visibility: aberta ? 'visible' : 'hidden',
                  transition: `grid-template-rows ${DESLIZE}, visibility ${DESLIZE}`,
                }}>
                  <div style={{ minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ padding: `${escala.recuoY} ${escala.recuoX}`, fontSize: escala.fonte, lineHeight: `${escala.linha}px`, color: 'var(--ob-fg)' }}>{detalhe}</div>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--ob-r-md)', border: '1px solid var(--ob-border)', fontFamily: 'var(--ob-font)' }}>
      <ScrollArea orientation={maxHeight !== undefined ? 'both' : 'horizontal'} maxHeight={maxHeight}>
        <table aria-label={caption ? undefined : ariaLabel} style={{ display: 'table', width: '100%', margin: 0, border: 'none', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--ob-surface)' }}>
          {caption && (
            <caption style={{
              captionSide: 'top', textAlign: 'left', padding: `${escala.recuoY} ${escala.recuoX}`, fontSize: escala.fonte, lineHeight: `${escala.linha}px`,
              fontWeight: 600, color: 'var(--ob-fg-strong)', background: 'var(--ob-surface)', borderBottom: DIVISORIA,
            }}>{caption}</caption>
          )}
          <thead style={{ background: 'none' }}>
            <tr style={linhaSemBorda}>
              {selectable && (
                <th style={{ ...th, ...colunaDeControle }}>
                  <Checkbox size={escala.escolha} checked={todasMarcadas} indeterminate={algumaMarcada} onChange={alternarTodas} ariaLabel="Selecionar todas as linhas" />
                </th>
              )}
              {temDetalhes && <th style={{ ...th, ...colunaDeControle }}><span style={somenteLeitor}>Detalhes</span></th>}
              {columns.map((col) => (
                <th key={col.key} scope="col" aria-sort={col.sortable && sortAtivo?.key === col.key ? (sortAtivo.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  style={{ ...th, ...alinhar(col), width: col.width }}>
                  {cabecalho(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{corpo()}</tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
