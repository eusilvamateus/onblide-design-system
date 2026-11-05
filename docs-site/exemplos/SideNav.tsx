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
    <SideNav items={itens} active="projetos" onToggle={() => {}} accountName="Mateus Silva" accountDetail="mateus@onblide.com" />
  </div>
);

export const Recolhido = () => (
  <div style={{ height: 480, display: 'flex' }}>
    <SideNav items={itens} active="inicio" collapsed onToggle={() => {}} accountName="Mateus Silva" accountDetail="mateus@onblide.com" />
  </div>
);

export const Flush = () => (
  <div style={{ height: 480, display: 'flex', border: '1px solid var(--ob-border)', borderRadius: 14, overflow: 'hidden' }}>
    <SideNav items={itens} active="painel" flush accountName="Mateus Silva" accountDetail="mateus@onblide.com" />
    <div style={{ flex: 1, background: 'var(--ob-bg-alt)', padding: 20, color: 'var(--ob-fg-mute)', fontSize: 13 }}>
      Conteúdo da aplicação, sem borda própria do menu lateral.
    </div>
  </div>
);

export const ComGrupos = () => (
  <div style={{ height: 420, width: 260 }}>
    <SideNav
      hideAccount
      menuLabel={null}
      active="button"
      items={[
        { id: 'inicio', label: 'Início', icon: 'house' },
        { section: 'Componentes' },
        { id: 'acoes', label: 'Ações', children: [{ id: 'button', label: 'Button' }, { id: 'link', label: 'Link' }] },
        { id: 'formularios', label: 'Formulários', children: [{ id: 'input', label: 'Input' }, { id: 'select', label: 'Select' }] },
      ]}
    />
  </div>
);

export const ComFoto = () => (
  <div style={{ height: 480, display: 'flex' }}>
    <SideNav items={itens} active="projetos" onToggle={() => {}} accountName="Camila Duarte" accountDetail="camila@onblide.com" accountImage="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23F4A261'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23FFF'/%3E%3Cpath d='M10 64c2-16 12-22 22-22s20 6 22 22z' fill='%23FFF'/%3E%3C/svg%3E" accountImageAlt="Foto de Camila Duarte" />
  </div>
);
