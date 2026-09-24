import { SideNav } from '@onblide/ui';

const itens = [
  { section: 'Geral' },
  { id: 'inicio', label: 'Início', icon: 'house' },
  { id: 'projetos', label: 'Projetos', icon: 'kanban', badge: 4 },
  { id: 'painel', label: 'Painel', icon: 'squares-four' },
  { section: 'Análise' },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart-line' },
  { id: 'config', label: 'Configurações', icon: 'gear' },
];

export const Expandido = () => (
  <div style={{ height: 480, display: 'flex' }}>
    <SideNav items={itens} active="projetos" workspaceName="Estúdio Aurora" userInitials="MS" />
  </div>
);

export const Recolhido = () => (
  <div style={{ height: 480, display: 'flex' }}>
    <SideNav items={itens} active="inicio" collapsed workspaceName="Estúdio Aurora" userInitials="MS" />
  </div>
);
