import { useState } from 'react';
import { Table, Badge, Button, Pagination } from '@onblide/ui';

const nota = { fontSize: 13, color: 'var(--ob-fg-soft)' };

const colunas = [
  { key: 'tarefa', label: 'Tarefa', bold: true, sortable: true },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'prazo', label: 'Prazo', sortable: true },
  { key: 'status', label: 'Status' },
];
const linhas = [
  { id: 1, tarefa: 'Revisar proposta comercial', responsavel: 'Ana Souza', prazo: '12/10/2026', status: 'Em andamento' },
  { id: 2, tarefa: 'Atualizar guia de marca', responsavel: 'Bruno Lima', prazo: '15/10/2026', status: 'Pendente' },
  { id: 3, tarefa: 'Publicar relatório mensal', responsavel: 'Carla Dias', prazo: '18/10/2026', status: 'Concluída' },
];

export const Padrao = () => (
  <div style={{ padding: 16, maxWidth: 720 }}>
    <Table columns={colunas} rows={linhas} sort={{ key: 'prazo', dir: 'asc' }} />
  </div>
);

export const Selecionavel = () => (
  <div style={{ padding: 16, maxWidth: 720 }}>
    <Table columns={colunas} rows={linhas} selectable />
  </div>
);

export const Vazio = () => (
  <div style={{ padding: 16, maxWidth: 720 }}>
    <Table columns={colunas} rows={[]} emptyState="Nenhuma tarefa encontrada" />
  </div>
);

export const Carregando = () => (
  <div style={{ padding: 16, maxWidth: 720 }}>
    <Table columns={colunas} rows={[]} loading />
  </div>
);

const linhasComStatus = [
  { id: 1, tarefa: 'Revisar proposta comercial', status: 'progress', prioridade: 'Alta' },
  { id: 2, tarefa: 'Atualizar guia de marca', status: 'pending', prioridade: 'Média' },
  { id: 3, tarefa: 'Publicar relatório mensal', status: 'done', prioridade: 'Baixa' },
];
const statusMap: Record<string, ['primary' | 'warning' | 'success', string]> = {
  progress: ['primary', 'Em andamento'], pending: ['warning', 'Pendente'], done: ['success', 'Concluído'],
};

export const ComBadges = () => (
  <div style={{ padding: 16, maxWidth: 640 }}>
    <Table
      selectable
      columns={[
        { key: 'tarefa', label: 'Tarefa', bold: true },
        { key: 'status', label: 'Status', render: (v) => { const [tom, rotulo] = statusMap[v as string]; return <Badge tone={tom}>{rotulo}</Badge>; } },
        { key: 'prioridade', label: 'Prioridade', render: (v) => <Badge tone={v === 'Alta' ? 'danger' : v === 'Média' ? 'warning' : 'primary'}>{v as string}</Badge> },
      ]}
      rows={linhasComStatus}
    />
  </div>
);

export const Tamanhos = () => (
  <div style={{ padding: 16, maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
    <Table size="sm" caption="sm" columns={colunas} rows={linhas} selectable />
    <Table size="md" caption="md" columns={colunas} rows={linhas} selectable />
    <Table size="lg" caption="lg" columns={colunas} rows={linhas} selectable />
  </div>
);

const moeda = (v: unknown) => (v as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pedidos = [
  { id: 1042, cliente: 'Ana Souza', itens: 3, total: 1250, entrega: 'Rua das Flores, 120 · São Paulo' },
  { id: 1043, cliente: 'Bruno Lima', itens: 1, total: 89.9, entrega: 'Av. Brasil, 45 · Curitiba' },
  { id: 1044, cliente: 'Carla Dias', itens: 2, total: 432.1, entrega: 'Rua XV, 8 · Recife' },
];
const colunasDePedidos = [
  { key: 'id', label: 'Pedido', bold: true, render: (v: unknown) => `#${v}` },
  { key: 'cliente', label: 'Cliente' },
  { key: 'itens', label: 'Itens', numeric: true, sortable: true },
  { key: 'total', label: 'Total', numeric: true, sortable: true, render: moeda },
];

export const ColunasNumericas = () => (
  <div style={{ padding: 16, maxWidth: 640 }}>
    <Table columns={colunasDePedidos} rows={pedidos} />
  </div>
);

export const Expansivel = () => (
  <div style={{ padding: 16, maxWidth: 640 }}>
    <Table
      columns={colunasDePedidos}
      rows={pedidos}
      defaultExpandedKeys={[1042]}
      renderExpanded={(p) => <>Entrega em {p.entrega}</>}
    />
  </div>
);

export const LinhaClicavel = () => {
  const [aberto, setAberto] = useState<string | null>(null);
  return (
    <div style={{ padding: 16, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Table columns={colunasDePedidos} rows={pedidos} onRowClick={(p) => setAberto(`#${p.id} · ${p.cliente}`)} />
      <span style={nota}>{aberto ? `Abrir pedido ${aberto}` : 'Clique numa linha ou use Tab e Enter.'}</span>
    </div>
  );
};

const clientes = Array.from({ length: 24 }, (_, i) => ({ id: i + 1, nome: `Cliente ${String(i + 1).padStart(2, '0')}`, cidade: ['São Paulo', 'Curitiba', 'Recife', 'Belém'][i % 4], pedidos: (i * 7) % 13 + 1 }));
const colunasDeClientes = [
  { key: 'nome', label: 'Cliente', bold: true },
  { key: 'cidade', label: 'Cidade' },
  { key: 'pedidos', label: 'Pedidos', numeric: true },
];

export const CabecalhoFixo = () => (
  <div style={{ padding: 16, maxWidth: 560 }}>
    <Table caption="Clientes ativos" maxHeight={280} columns={colunasDeClientes} rows={clientes} />
  </div>
);

export const SelecaoEntrePaginas = () => {
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState<(string | number)[]>([]);
  const porPagina = 6;
  return (
    <div style={{ padding: 16, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }}>
        <span style={nota}>{selecionados.length ? `${selecionados.length} selecionados` : 'Nenhum selecionado'}</span>
        {selecionados.length > 0 && <Button kind="ghost" size="sm" onClick={() => setSelecionados([])}>Limpar seleção</Button>}
      </div>
      <Table
        ariaLabel="Clientes"
        selectable
        columns={colunasDeClientes}
        rows={clientes.slice((pagina - 1) * porPagina, pagina * porPagina)}
        selectedKeys={selecionados}
        onSelect={(_, chaves) => setSelecionados(chaves)}
      />
      <Pagination size="sm" page={pagina} totalItems={clientes.length} pageSize={porPagina} onChange={setPagina} />
    </div>
  );
};
