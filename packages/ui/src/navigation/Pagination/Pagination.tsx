import React, { useRef, useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Select } from '../../forms/Select/Select';
import { NumberField } from '../../forms/NumberField/NumberField';
import { Popover } from '../../overlays/Popover/Popover';
import { Button } from '../../actions/Button/Button';
import { ESCALA_DE_CAMPO } from '../../internal/tamanhoDeCampo';

/** Tamanho dos botões e campos: `sm` 32px, `md` 40px e `lg` 48px, as mesmas alturas do `Button` e dos campos. */
export type PaginationSize = 'sm' | 'md' | 'lg';
/** Forma: `numbered` mostra os números das páginas; `compact` mostra só "Página 3 de 20" entre as setas, com a página atual editável. */
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
  /** Quantidade total de itens da lista. Com ela, o total de páginas vem de `totalItems` e `pageSize`, e aparece o resumo "11–20 de 200". */
  totalItems?: number;
  /** Itens por página, em modo controlado. */
  pageSize?: number;
  /** Itens por página iniciais, em modo não controlado. */
  defaultPageSize?: number;
  /** Opções de itens por página. Com elas, aparece o seletor "Itens por página". */
  pageSizeOptions?: number[];
  /** Chamado com a nova quantidade de itens por página. */
  onPageSizeChange?: (pageSize: number) => void;
}

interface EscalaDaPaginacao { lado: number; fonte: string; icone: number; espaco: string; seletor: number; campo: number }

const ESCALA: Record<PaginationSize, EscalaDaPaginacao> = {
  sm: { lado: 32, fonte: 'var(--ob-fs-13)', icone: 14, espaco: 'var(--ob-space-4)', seletor: 72, campo: 56 },
  md: { lado: 40, fonte: 'var(--ob-fs-14)', icone: 16, espaco: 'var(--ob-space-6)', seletor: 80, campo: 64 },
  lg: { lado: 48, fonte: 'var(--ob-fs-15)', icone: 18, espaco: 'var(--ob-space-8)', seletor: 88, campo: 72 },
};

const formatar = (n: number) => n.toLocaleString('pt-BR');
const somenteLeitor: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

interface Faixa { de: number; ate: number }
type Item = number | Faixa;

const intervalo = (inicio: number, fim: number) => Array.from({ length: Math.max(0, fim - inicio + 1) }, (_, i) => inicio + i);

function itensDaPaginacao(page: number, total: number, siblings: number): Item[] {
  if (total <= 1) return [1];
  let esquerda = Math.max(2, page - siblings);
  let direita = Math.min(total - 1, page + siblings);
  if (esquerda === 3) esquerda = 2;
  if (direita === total - 2) direita = total - 1;
  return [
    1,
    ...(esquerda > 2 ? [{ de: 2, ate: esquerda - 1 }] : []),
    ...intervalo(esquerda, direita),
    ...(direita < total - 1 ? [{ de: direita + 1, ate: total - 1 }] : []),
    total,
  ];
}

const estiloDoBotao = (escala: EscalaDaPaginacao, ativo: boolean, desabilitado = false): React.CSSProperties => ({
  minWidth: escala.lado, height: escala.lado, padding: '0 var(--ob-space-8)', borderRadius: 'var(--ob-r-control)', boxSizing: 'border-box',
  border: `1px solid ${ativo ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
  background: ativo ? 'var(--ob-blue)' : 'var(--ob-surface)',
  color: ativo ? 'var(--ob-fg-on-color)' : desabilitado ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ob-font-mono)', fontSize: escala.fonte,
  fontWeight: ativo ? 'var(--ob-w-semibold)' : 'var(--ob-w-medium)', cursor: desabilitado ? 'not-allowed' : 'pointer',
  transition: 'all var(--ob-dur-fast) var(--ob-ease)',
});

const ICONES = { primeira: 'caret-line-left', anterior: 'caret-left', proxima: 'caret-right', ultima: 'caret-line-right' } as const;
const NOMES = { primeira: 'Primeira página', anterior: 'Página anterior', proxima: 'Próxima página', ultima: 'Última página' } as const;

const Seta: React.FC<{ direcao: keyof typeof ICONES; escala: EscalaDaPaginacao; disabled: boolean; onClick: () => void }> = ({ direcao, escala, disabled, onClick }) => (
  <button type="button" disabled={disabled} onClick={onClick} aria-label={NOMES[direcao]}
    style={{ ...estiloDoBotao(escala, false, disabled), width: escala.lado, padding: 0, visibility: disabled ? 'hidden' : undefined }}>
    <Ph n={ICONES[direcao]} size={escala.icone} />
  </button>
);

const Reticencias: React.FC<{ faixa: Faixa; total: number; escala: EscalaDaPaginacao; ir: (pagina: number) => void }> = ({ faixa, total, escala, ir }) => {
  const [destacado, setDestacado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const dica = `${formatar(faixa.de)}–${formatar(faixa.ate)}`;
  const digitado = useRef<number | null>(null);
  const ativo = destacado || aberto;
  const legenda: React.CSSProperties = { fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-soft)' };
  return (
    <Popover placement="top" align="center" arrow width="auto" padding="var(--ob-space-12)" ariaLabel="Ir para uma página"
      onOpenChange={(v) => { setAberto(v); digitado.current = null; }}
      trigger={(
        <button type="button" aria-label={`Ir para uma página (escondidas: ${faixa.de} a ${faixa.ate})`}
          onMouseEnter={() => setDestacado(true)} onMouseLeave={() => setDestacado(false)}
          onFocus={() => setDestacado(true)} onBlur={() => setDestacado(false)}
          style={{
            ...estiloDoBotao(escala, false), width: escala.lado, padding: 0,
            border: `1px solid ${aberto ? 'var(--ob-blue)' : ativo ? 'var(--ob-border)' : 'transparent'}`,
            background: ativo ? 'var(--ob-surface)' : 'transparent',
            color: aberto ? 'var(--ob-blue)' : ativo ? 'var(--ob-fg)' : 'var(--ob-fg-mute)',
          }}>
          …
        </button>
      )}>
      {(fechar) => {
        const confirmar = () => { if (digitado.current == null) return; ir(digitado.current); fechar(); };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)', whiteSpace: 'nowrap' }}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmar(); }}>
            <span style={legenda}>Página</span>
            <span style={{ display: 'flex', fontSize: ESCALA_DE_CAMPO.sm.fonte }}>
              <NumberField size="sm" controls="none" align="center" min={1} max={total}
                width={`max(${ESCALA.sm.campo}px, calc(${dica.length + 1}ch + 2 * ${ESCALA_DE_CAMPO.sm.recuo} + var(--ob-space-2)))`}
                placeholder={dica} ariaLabel={`Página, de 1 a ${total}`}
                onChange={(n) => { digitado.current = n; }} />
            </span>
            <span style={legenda}>de {formatar(total)}</span>
            <Button size="sm" onClick={confirmar}>Ir</Button>
          </div>
        );
      }}
    </Popover>
  );
};

const PaginaEditavel: React.FC<{ page: number; total: number; size: PaginationSize; escala: EscalaDaPaginacao; ir: (pagina: number) => void }> = ({ page, total, size, escala, ir }) => {
  const digitado = useRef<number | null>(null);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-8)', padding: '0 var(--ob-space-4)', fontSize: escala.fonte, color: 'var(--ob-fg)', whiteSpace: 'nowrap' }}
      onFocus={(e) => { const alvo = e.target as HTMLInputElement; digitado.current = null; requestAnimationFrame(() => alvo.select?.()); }}
      onKeyDown={(e) => {
        const alvo = e.target as HTMLInputElement;
        if (e.key === 'Enter' && digitado.current != null) { ir(digitado.current); alvo.blur(); }
        if (e.key === 'Escape') { digitado.current = null; alvo.blur(); }
      }}>
      <span aria-hidden="true">Página</span>
      <NumberField size={size} controls="none" align="center" width={escala.campo} min={1} max={total} value={page}
        ariaLabel={`Página atual, de 1 a ${total}`} onChange={(n) => { digitado.current = n; }} />
      <span aria-hidden="true">de {formatar(total)}</span>
      <span aria-live="polite" style={somenteLeitor}>{`Página ${formatar(page)} de ${formatar(total)}`}</span>
    </span>
  );
};

/** Navegação entre páginas de uma lista: as reticências abrem um campo para ir a qualquer página; tem primeira e última página, itens por página e forma compacta com a página editável. */
export const Pagination: React.FC<PaginationProps> = ({
  page: pageProp, defaultPage = 1, total: totalProp = 10, onChange, siblings = 1, size = 'md', variant = 'numbered',
  showEdges = false, totalItems, pageSize: pageSizeProp, defaultPageSize, pageSizeOptions, onPageSizeChange,
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
  const ir = (destino: number) => mudarPara(Math.min(total, Math.max(1, Math.round(destino))));

  const mudarTamanho = (novo: number) => {
    if (novo === pageSize) return;
    const primeiroItem = (page - 1) * pageSize;
    if (pageSizeProp === undefined) setTamanhoInterno(novo);
    onPageSizeChange?.(novo);
    mudarPara(Math.floor(primeiroItem / novo) + 1);
  };

  const texto: React.CSSProperties = { fontSize: escala.fonte, color: 'var(--ob-fg-soft)', whiteSpace: 'nowrap' };
  const grupo: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: escala.espaco };
  const resumo = totalItems != null && (totalItems > 0
    ? `${formatar((page - 1) * pageSize + 1)}–${formatar(Math.min(page * pageSize, totalItems))} de ${formatar(totalItems)}`
    : 'Nenhum item');
  const opcoes = (pageSizeOptions ?? []).map(formatar);

  return (
    <nav aria-label="Paginação" style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--ob-space-8) var(--ob-space-16)', fontFamily: 'var(--ob-font)' }}>
      {opcoes.length > 0 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-8)' }}>
          <span aria-hidden="true" style={texto}>Itens por página</span>
          <Select size={size} width={escala.seletor} ariaLabel="Itens por página" value={formatar(pageSize)} placeholder={formatar(pageSize)}
            options={opcoes} onChange={(rotulo: string) => mudarTamanho(pageSizeOptions![opcoes.indexOf(rotulo)])} />
        </div>
      )}
      {resumo && <span style={texto}>{resumo}</span>}
      <div style={grupo}>
        {showEdges && <Seta direcao="primeira" escala={escala} disabled={page === 1} onClick={() => ir(1)} />}
        <Seta direcao="anterior" escala={escala} disabled={page === 1} onClick={() => ir(page - 1)} />
        {variant === 'compact'
          ? <PaginaEditavel page={page} total={total} size={size} escala={escala} ir={ir} />
          : itensDaPaginacao(page, total, siblings).map((item) => (typeof item === 'number' ? (
            <button key={item} type="button" onClick={() => ir(item)} aria-label={`Página ${item}`} aria-current={item === page ? 'page' : undefined}
              style={estiloDoBotao(escala, item === page)}>{formatar(item)}</button>
          ) : (
            <Reticencias key={item.de} faixa={item} total={total} escala={escala} ir={ir} />
          )))}
        <Seta direcao="proxima" escala={escala} disabled={page === total} onClick={() => ir(page + 1)} />
        {showEdges && <Seta direcao="ultima" escala={escala} disabled={page === total} onClick={() => ir(total)} />}
      </div>
    </nav>
  );
};
