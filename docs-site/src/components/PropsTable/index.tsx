import React from 'react';
import { Table, type TableColumn } from '@onblide/ui';
import props from '@site/src/data/props.json';

type Prop = { nome: string; tipo: string; obrigatoria: boolean; padrao: string | null; descricao: string };
const dados = props as Record<string, { descricao: string; props: Prop[] }>;

// A tabela de props é a própria Table do design system: se o componente tem uma tabela para exibir, é assim
// que ela deve aparecer em qualquer lugar do site, a começar por aqui.
const colunas: TableColumn<Prop>[] = [
  {
    key: 'nome', label: 'Prop', sortable: true, bold: true,
    render: (_v, row) => <code>{row.nome}{row.obrigatoria ? <sup title="obrigatória"> *</sup> : null}</code>,
  },
  { key: 'tipo', label: 'Tipo', render: (v) => <code>{v as string}</code> },
  { key: 'padrao', label: 'Padrão', render: (v) => (v ? <code>{v as string}</code> : '—') },
  { key: 'descricao', label: 'Descrição' },
];

export default function PropsTable({ nome }: { nome: string }) {
  const item = dados[nome];
  if (!item || item.props.length === 0) return <p>Este componente não tem props próprias.</p>;
  return <Table columns={colunas} rows={item.props} />;
}
