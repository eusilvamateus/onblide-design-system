import { Table, Badge } from '@onblide/ui';

const colunas = [
  { key: 'tarefa', label: 'Tarefa', bold: true, sortable: true },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'prazo', label: 'Prazo', sortable: true },
  { key: 'status', label: 'Status' },
];
const linhas = [
  { tarefa: 'Revisar proposta comercial', responsavel: 'Ana Souza', prazo: '12/10/2026', status: 'Em andamento' },
  { tarefa: 'Atualizar guia de marca', responsavel: 'Bruno Lima', prazo: '15/10/2026', status: 'Pendente' },
  { tarefa: 'Publicar relatório mensal', responsavel: 'Carla Dias', prazo: '18/10/2026', status: 'Concluída' },
];

export const Padrao = () => (
  <div style={{ padding: 16, width: 720 }}>
    <Table columns={colunas} rows={linhas} sort={{ key: 'prazo', dir: 'asc' }} />
  </div>
);

export const Selecionavel = () => (
  <div style={{ padding: 16, width: 720 }}>
    <Table columns={colunas} rows={linhas} selectable />
  </div>
);

export const Vazio = () => (
  <div style={{ padding: 16, width: 720 }}>
    <Table columns={colunas} rows={[]} emptyState="Nenhuma tarefa encontrada" />
  </div>
);

export const Carregando = () => (
  <div style={{ padding: 16, width: 720 }}>
    <Table columns={colunas} rows={[]} loading />
  </div>
);

const linhasComStatus = [
  { tarefa: 'Revisar proposta comercial', status: 'progress', prioridade: 'Alta' },
  { tarefa: 'Atualizar guia de marca', status: 'pending', prioridade: 'Média' },
  { tarefa: 'Publicar relatório mensal', status: 'done', prioridade: 'Baixa' },
];
const statusMap: Record<string, ['primary' | 'warning' | 'success', string]> = {
  progress: ['primary', 'Em andamento'], pending: ['warning', 'Pendente'], done: ['success', 'Concluído'],
};

export const ComBadges = () => (
  <div style={{ padding: 16, width: 640 }}>
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
