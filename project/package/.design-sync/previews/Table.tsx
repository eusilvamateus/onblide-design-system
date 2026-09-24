import { Table } from '@onblide/ui';

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
