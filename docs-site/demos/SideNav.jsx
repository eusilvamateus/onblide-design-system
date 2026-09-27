// Ponto de partida da demo interativa do SideNav: o elemento <SideNav> abaixo define os valores iniciais dos controles.

const itens = [
  { section: 'Geral' },
  { id: 'inicio', label: 'Início', icon: 'house' },
  { id: 'projetos', label: 'Projetos', icon: 'kanban', badge: 4 },
  { id: 'painel', label: 'Painel', icon: 'squares-four' },
  { section: 'Análise' },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart-line' },
  { id: 'config', label: 'Configurações', icon: 'gear' },
];

<SideNav
  active="projetos"
  workspaceName="Estúdio Aurora"
  userInitials="MS"
  items={itens}
/>
