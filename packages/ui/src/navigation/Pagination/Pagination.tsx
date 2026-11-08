import React, { useState } from 'react';
import { Icons } from '../../iconography/Icons/Icons';
import { Ph } from '../../iconography/Ph/Ph';

export interface PaginationProps {
  /** Página atual (1-indexada), em modo controlado. */
  page?: number;
  /** Página inicial, em modo não controlado. */
  defaultPage?: number;
  /** Número total de páginas. */
  total?: number;
  /** Chamado com o número da página escolhida. */
  onChange?: (page: number) => void;
  /** Quantidade de páginas vizinhas exibidas de cada lado da página atual. */
  siblings?: number;
}

const SALTO = 5;
const LADO = 34;

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

const estiloDoBotao = (ativo: boolean, desabilitado = false): React.CSSProperties => ({
  minWidth: LADO, height: LADO, padding: '0 var(--ob-space-8)', borderRadius: 'var(--ob-r-sm)', boxSizing: 'border-box',
  border: `1px solid ${ativo ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
  background: ativo ? 'var(--ob-blue)' : 'var(--ob-surface)',
  color: ativo ? 'var(--ob-fg-on-color)' : desabilitado ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', fontSize: 14,
  fontWeight: ativo ? 600 : 500, cursor: desabilitado ? 'not-allowed' : 'pointer', transition: 'all var(--ob-dur-fast) var(--ob-ease)',
});

const Seta: React.FC<{ direcao: 'anterior' | 'proxima'; disabled: boolean; onClick: () => void }> = ({ direcao, disabled, onClick }) => (
  <button type="button" disabled={disabled} onClick={onClick} aria-label={direcao === 'anterior' ? 'Página anterior' : 'Próxima página'}
    style={{ ...estiloDoBotao(false, disabled), width: LADO, padding: 0 }}>
    {direcao === 'anterior' ? <Icons.caretL size={16} /> : <Icons.caretR size={16} />}
  </button>
);

const Salto: React.FC<{ direcao: 'antes' | 'depois'; onClick: () => void }> = ({ direcao, onClick }) => {
  const [destacado, setDestacado] = useState(false);
  return (
    <button type="button" onClick={onClick} aria-label={direcao === 'antes' ? `Voltar ${SALTO} páginas` : `Avançar ${SALTO} páginas`}
      onMouseEnter={() => setDestacado(true)} onMouseLeave={() => setDestacado(false)}
      onFocus={() => setDestacado(true)} onBlur={() => setDestacado(false)}
      style={{ ...estiloDoBotao(false), width: LADO, padding: 0, border: '1px solid transparent', background: 'transparent', color: destacado ? 'var(--ob-blue)' : 'var(--ob-fg-mute)' }}>
      {destacado ? <Ph n={direcao === 'antes' ? 'caret-double-left' : 'caret-double-right'} size={16} /> : '…'}
    </button>
  );
};

/** Navegação entre páginas de uma lista, com reticências que saltam páginas nos intervalos longos. */
export const Pagination: React.FC<PaginationProps> = ({ page: pageProp, defaultPage = 1, total: totalProp = 10, onChange, siblings = 1 }) => {
  const total = Math.max(1, Math.floor(totalProp));
  const [interna, setInterna] = useState(defaultPage);
  const page = Math.min(total, Math.max(1, pageProp ?? interna));
  const ir = (destino: number) => {
    const alvo = Math.min(total, Math.max(1, destino));
    if (alvo === page) return;
    if (pageProp === undefined) setInterna(alvo);
    onChange?.(alvo);
  };

  return (
    <nav aria-label="Paginação" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ob-space-6)' }}>
      <Seta direcao="anterior" disabled={page === 1} onClick={() => ir(page - 1)} />
      {itensDaPaginacao(page, total, siblings).map((item) => typeof item === 'number' ? (
        <button key={item} type="button" onClick={() => ir(item)} aria-label={`Página ${item}`} aria-current={item === page ? 'page' : undefined}
          style={estiloDoBotao(item === page)}>{item}</button>
      ) : (
        <Salto key={item} direcao={item} onClick={() => ir(item === 'antes' ? page - SALTO : page + SALTO)} />
      ))}
      <Seta direcao="proxima" disabled={page === total} onClick={() => ir(page + 1)} />
    </nav>
  );
};
