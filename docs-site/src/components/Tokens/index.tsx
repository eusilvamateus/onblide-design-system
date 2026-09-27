import React from 'react';
import { Table, type TableColumn } from '@onblide/ui';
import tokens from '@site/src/data/tokens.json';

type Token = { nome: string; valor: string; escuro: string | null };
type Tipo = 'cor' | 'raio' | 'sombra' | 'espaco' | 'texto' | 'nenhuma';

const todos = tokens as Token[];
const filtrar = (prefixos: string[]) =>
  todos.filter((t) => prefixos.some((p) => t.nome === p || t.nome.startsWith(`${p}-`)));

function Amostra({ nome, tipo }: { nome: string; tipo: Tipo }) {
  const v = `var(${nome})`;
  const base: React.CSSProperties = { width: 44, height: 28, border: '1px solid var(--ob-border)' };
  if (tipo === 'cor') return <div style={{ ...base, borderRadius: 6, background: v }} />;
  if (tipo === 'raio') return <div style={{ ...base, borderRadius: v, background: 'var(--ob-blue-100)' }} />;
  if (tipo === 'sombra') return <div style={{ ...base, border: 'none', borderRadius: 6, background: 'var(--ob-surface)', boxShadow: v }} />;
  if (tipo === 'espaco') return <div style={{ height: 12, width: v, minWidth: 2, background: 'var(--ob-blue)', borderRadius: 2 }} />;
  if (tipo === 'texto') return <span style={{ fontSize: v, lineHeight: 1 }}>Aa</span>;
  return null;
}

// A tabela de tokens é a própria Table do design system — mesma regra da PropsTable: nenhuma tabela do site
// nasce como <table> crua.
export function TokenTable({ prefixos, tipo = 'nenhuma' }: { prefixos: string[]; tipo?: Tipo }) {
  const linhas = filtrar(prefixos);
  const colunas: TableColumn<Token>[] = [
    ...(tipo !== 'nenhuma' ? [{ key: 'amostra', label: 'Amostra', render: (_v, row) => <Amostra nome={row.nome} tipo={tipo} /> } satisfies TableColumn<Token>] : []),
    { key: 'nome', label: 'Token', sortable: true, render: (v) => <code>{v as string}</code> },
    { key: 'valor', label: 'Valor (claro)', render: (v) => <code>{v as string}</code> },
    { key: 'escuro', label: 'Valor (escuro)', render: (v) => (v ? <code>{v as string}</code> : '—') },
  ];
  return <Table columns={colunas} rows={linhas} />;
}
