// Ponto de partida da demo interativa do Tabs: o elemento <Tabs> abaixo define os valores iniciais dos controles.

const abas = [
  { id: 'visao', label: 'Visão geral', icon: 'house' },
  { id: 'equipe', label: 'Equipe', icon: 'users', badge: 8, tone: 'primary' },
  { id: 'historico', label: 'Histórico', icon: 'clock', tone: 'warning' },
  { id: 'arquivo', label: 'Arquivadas', icon: 'archive', disabled: true },
];

<Tabs
  active="equipe"
  variant="line"
  tabs={abas}
/>
