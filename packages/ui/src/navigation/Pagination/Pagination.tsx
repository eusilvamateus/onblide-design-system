import React, { useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Select } from '../../forms/Select/Select';
import { NumberField } from '../../forms/NumberField/NumberField';

/** Tamanho dos botões e campos: `sm` 32px, `md` 40px e `lg` 48px, as mesmas alturas do `Button` e dos campos. */
export type PaginationSize = 'sm' | 'md' | 'lg';
/** Forma: `numbered` mostra os números das páginas; `compact` mostra só "Página 3 de 20" entre as setas. */
export type PaginationVariant = 'numbered' | 'compact';

export interface PaginationProps {
  /** Página atual (1-indexada), em modo controlado. */
  page?: number;
  /** Página inicial, em modo não controlado. */
  defaultPage?: number;
  /** Número total de páginas. Ignorado quando há `totalItems`. */
  total?: number;
  /** Chamado com o número da página escolhida. */
  onChange?: (page: number) => void;
  /** Quantidade de páginas vizinhas exibidas de cada lado da página atual. */
  siblings?: number;
  /** Tamanho dos botões, do texto e dos campos. */
  size?: PaginationSize;
  /** Forma da paginação: números das páginas (padrão) ou o texto compacto "Página 3 de 20", para telas estreitas. */
  variant?: PaginationVariant;
  /** Mostra os botões de ir para a primeira e para a última página. */
  showEdges?: boolean;
  /** Mostra o campo "Ir para", onde a pessoa digita a página e confirma com Enter. */
  showJumper?: boolean;
  /** Quantidade total de itens da lista. Com ela, o total de páginas vem de `totalItems` e `pageSize`, e aparece o resumo "11–20 de 200". */
  totalItems?: number;
  /** Itens por página, em modo controlado. */
  pageSize?: number;
  /** Itens por página iniciais, em modo não controlado. */
  defaultPageSize?: number;
  /** Opções de itens por página. Com elas, aparece o seletor "10 por página". */
  pageSizeOptions?: number[];
  /** Chamado com a nova quantidade de itens por página. */
  onPageSizeChange?: (pageSize: number) => void;
}

interface EscalaDaPaginacao { lado: number; fonte: number; icone: number; espaco: string; seletor: number; campo: number }

const ESCALA: Record<PaginationSize, EscalaDaPaginacao> = {
  sm: { lado: 32, fonte: 13, icone: 14, espaco: 'var(--ob-space-4)', seletor: 136, campo: 64 },
  md: { lado: 40, fonte: 14, icone: 16, espaco: 'var(--ob-space-6)', seletor: 152, campo: 72 },
  lg: { lado: 48, fonte: 15, icone: 18, espaco: 'var(--ob-space-8)', seletor: 168, campo: 80 },
};

const SALTO = 5;
const formatar = (n: number) => n.toLocaleString('pt-BR');
const rotuloDoTamanho = (n: number) => `${n} por página`;

type Item = number | 'antes' | 'depois';

const intervalo = (inicio: number, fim: number) => Array.from({ length: Math.max(0, fim - inicio + 1) }, (_, i) => inicio + i);

function itensDaPaginacao(page: number, total: number, siblings: number): Item[] {
  if (total <= 1) return [1];
  let esquerda = Math.max(2, page - siblings);
  let direita = Math.min(total - 1, page + siblings);
  if (esquerda === 3) esquerda = 2;
  if (direita === total - 2) direita = total - 1;
  return [
    1,
    ...(esquerda > 2 ? ['antes' as const] : []),
    ...intervalo(esquerda, direita),
    ...(direita < total - 1 ? ['depois' as const] : []),
    total,
  ];
}

const estiloDoBotao = (escala: EscalaDaPaginacao, ativo: boolean, desabilitado = false): React.CSSProperties => ({
  minWidth: escala.lado, height: escala.lado, padding: '0 var(--ob-space-8)', borderRadius: 'var(--ob-r-control)', boxSizing: 'border-box',
  border: `1px solid ${ativo ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
  background: ativo ? 'var(--ob-blue)' : 'var(--ob-surface)',
  color: ativo ? 'var(--ob-fg-on-color)' : desabilitado ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', fontSize: escala.fonte,
  fontVariantNumeric: 'tabular-nums', fontWeight: ativo ? 600 : 500, cursor: desabilitado ? 'not-allowed' : 'pointer',
  transition: 'all var(--ob-dur-fast) var(--ob-ease)',
});

const ICONES = { primeira: 'caret-line-left', anterior: 'caret-left', proxima: 'caret-right', ultima: 'caret-line-right' } as const;
const NOMES = { primeira: 'Primeira página', anterior: 'Página anterior', proxima: 'Próxima página', ultima: 'Última página' } as const;

const Seta: React.FC<{ direcao: keyof typeof ICONES; escala: EscalaDaPaginacao; disabled: boolean; onClick: () => void }> = ({ direcao, escala, disabled, onClick }) => (
  <button type="button" disabled={disabled} onClick={onClick} aria-label={NOMES[direcao]}
    style={{ ...estiloDoBotao(escala, false, disabled), width: escala.lado, padding: 0 }}>
    <Ph n={ICONES[direcao]} size={escala.icone} />
  </button>
);

const Salto: React.FC<{ direcao: 'antes' | 'depois'; escala: EscalaDaPaginacao; onClick: () => void }> = ({ direcao, escala, onClick }) => {
  const [destacado, setDestacado] = useState(false);
  return (
    <button type="button" onClick={onClick} aria-label={direcao === 'antes' ? `Voltar ${SALTO} páginas` : `Avançar ${SALTO} páginas`}
      onMouseEnter={() => setDestacado(true)} onMouseLeave={() => setDestacado(false)}
      onFocus={() => setDestacado(true)} onBlur={() => setDestacado(false)}
      style={{ ...estiloDoBotao(escala, false), width: escala.lado, padding: 0, border: '1px solid transparent', background: 'transparent', color: destacado ? 'var(--ob-blue)' : 'var(--ob-fg-mute)' }}>
      {destacado ? <Ph n={direcao === 'antes' ? 'caret-double-left' : 'caret-double-right'} size={escala.icone} /> : '…'}
    </button>
  );
};

/** Navegação entre páginas de uma lista, com reticências que saltam páginas, primeira e última página, campo "Ir para", itens por página e forma compacta. */
export const Pagination: React.FC<PaginationProps> = ({
  page: pageProp, defaultPage = 1, total: totalProp = 10, onChange, siblings = 1, size = 'md', variant = 'numbered',
  showEdges = false, showJumper = false, totalItems, pageSize: pageSizeProp, defaultPageSize, pageSizeOptions, onPageSizeChange,
}) => {
  const escala = ESCALA[size];
  const [paginaInterna, setPaginaInterna] = useState(defaultPage);
  const [tamanhoInterno, setTamanhoInterno] = useState(defaultPageSize ?? pageSizeOptions?.[0] ?? 10);
  const pageSize = Math.max(1, pageSizeProp ?? tamanhoInterno);
  const total = Math.max(1, totalItems != null ? Math.ceil(totalItems / pageSize) : Math.floor(totalProp));
  const page = Math.min(total, Math.max(1, pageProp ?? paginaInterna));

  const mudarPara = (alvo: number) => {
    if (alvo === page) return;
    if (pageProp === undefined) setPaginaInterna(alvo);
    onChange?.(alvo);
  };
  const ir = (destino: number) => mudarPara(Math.min(total, Math.max(1, destino)));

  const mudarTamanho = (novo: number) => {
    if (novo === pageSize) return;
    const primeiroItem = (page - 1) * pageSize;
    if (pageSizeProp === undefined) setTamanhoInterno(novo);
    onPageSizeChange?.(novo);
    mudarPara(Math.floor(primeiroItem / novo) + 1);
  };

  const texto: React.CSSProperties = { fontSize: escala.fonte, color: 'var(--ob-fg-soft)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' };
  const grupo: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: escala.espaco };
  const resumo = totalItems != null && (totalItems > 0
    ? `${formatar((page - 1) * pageSize + 1)}–${formatar(Math.min(page * pageSize, totalItems))} de ${formatar(totalItems)}`
    : 'Nenhum item');

  return (
    <nav aria-label="Paginação" style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--ob-space-8) var(--ob-space-16)', fontFamily: 'var(--ob-font)' }}>
      {resumo && <span style={texto}>{resumo}</span>}
      {pageSizeOptions && pageSizeOptions.length > 0 && (
        <Select size={size} width={escala.seletor} ariaLabel="Itens por página" value={rotuloDoTamanho(pageSize)}
          options={pageSizeOptions.map(rotuloDoTamanho)} onChange={(rotulo: string) => mudarTamanho(parseInt(rotulo, 10))} />
      )}
      <div style={grupo}>
        {showEdges && <Seta direcao="primeira" escala={escala} disabled={page === 1} onClick={() => ir(1)} />}
        <Seta direcao="anterior" escala={escala} disabled={page === 1} onClick={() => ir(page - 1)} />
        {variant === 'compact' ? (
          <span aria-live="polite" style={{ ...texto, color: 'var(--ob-fg)', padding: '0 var(--ob-space-8)' }}>
            Página <strong style={{ fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{formatar(page)}</strong> de {formatar(total)}
          </span>
        ) : itensDaPaginacao(page, total, siblings).map((item) => typeof item === 'number' ? (
          <button key={item} type="button" onClick={() => ir(item)} aria-label={`Página ${item}`} aria-current={item === page ? 'page' : undefined}
            style={estiloDoBotao(escala, item === page)}>{formatar(item)}</button>
        ) : (
          <Salto key={item} direcao={item} escala={escala} onClick={() => ir(item === 'antes' ? page - SALTO : page + SALTO)} />
        ))}
        <Seta direcao="proxima" escala={escala} disabled={page === total} onClick={() => ir(page + 1)} />
        {showEdges && <Seta direcao="ultima" escala={escala} disabled={page === total} onClick={() => ir(total)} />}
      </div>
      {showJumper && (
        <div style={grupo}>
          <span style={texto}>Ir para</span>
          <NumberField size={size} controls="none" align="center" width={escala.campo} min={1} max={total} value={null}
            ariaLabel="Ir para a página" onChange={(n) => { if (n != null) ir(n); }} />
        </div>
      )}
    </nav>
  );
};
