import React from 'react';
import { Table, type TableColumn } from '@onblide/ui';

type Linha = Record<string, React.ReactNode>;

const filhosDe = (no: React.ReactNode): React.ReactElement<{ children?: React.ReactNode }>[] =>
  React.Children.toArray(no).filter(React.isValidElement) as React.ReactElement<{ children?: React.ReactNode }>[];

const celulasDaLinha = (linha: React.ReactElement<{ children?: React.ReactNode }>) => filhosDe(linha.props.children).map((c) => c.props.children);

export default function TabelaMarkdown({ children }: { children?: React.ReactNode }) {
  const secoes = filhosDe(children);
  const cabecalho = secoes.find((s) => s.type === 'thead');
  const corpo = secoes.find((s) => s.type === 'tbody');
  const rotulos = cabecalho ? celulasDaLinha(filhosDe(cabecalho.props.children)[0]) : [];
  const colunas: TableColumn<Linha>[] = rotulos.map((label, i) => ({ key: `c${i}`, label }));
  const linhas: Linha[] = corpo
    ? filhosDe(corpo.props.children).map((tr) => Object.fromEntries(celulasDaLinha(tr).map((valor, i) => [`c${i}`, valor])))
    : [];
  return <div style={{ margin: '0 0 16px' }}><Table columns={colunas} rows={linhas} /></div>;
}
