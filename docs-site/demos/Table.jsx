// Ponto de partida da demo interativa do Table: o elemento <Table> abaixo define os valores iniciais dos controles.

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

// Sem onSort, a Table ordena sozinha ao clicar no cabeçalho de uma coluna sortable (crescente → decrescente → sem
// ordenação); as datas em dd/mm/aaaa já ordenam como data, não como texto.
<Table
  columns={colunas}
  rows={linhas}
/>
