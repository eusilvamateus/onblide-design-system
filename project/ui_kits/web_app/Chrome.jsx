/* global React, Dropdown, SideNav, SearchInput */
const { useState } = React;

const Sidebar = ({ active = 'home', onNav }) => {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { id: 'home',         label: 'Início',       icon: 'house' },
    { id: 'tasks',        label: 'Tarefas',       icon: 'kanban',      badge: 2 },
    { id: 'docs',         label: 'Documentos',    icon: 'folder' },
    { id: 'metrics',      label: 'Métricas',      icon: 'chart-bar' },
    { id: 'integrations', label: 'Integrações',   icon: 'grid-four' },
    { id: 'agenda',       label: 'Agenda',        icon: 'calendar' },
    { section: 'Config' },
    { id: 'settings',     label: 'Ajustes',       icon: 'gear' },
    { id: 'help',         label: 'Ajuda',         icon: 'chat-circle' },
  ];

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      flexShrink: 0,
      height: '100%',
      transition: 'width 0.2s var(--ob-ease)',
      overflow: 'hidden',
    }}>
      <SideNav
        items={items}
        active={active}
        onNav={onNav}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        flush
        workspaceName="Workspace pessoal"
        userInitials="OB"
      />
    </aside>
  );
};

const Topbar = ({ title, action }) => {
  const [searchQ, setSearchQ] = useState('');
  const allSuggestions = [
    'Mapa de jornada do usuário',
    'API de pagamentos',
    'Wireframes do dashboard',
    'Landing page v2',
    'Pesquisa com usuários',
    'Plano editorial Q3',
    'Auditoria de tipografia',
    'Onboarding refeito',
  ];
  const results = searchQ.length > 1
    ? allSuggestions.filter(s => s.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 4)
    : [];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px', borderBottom: '1px solid var(--ob-border)', background: 'var(--ob-surface)',
      minHeight: 64,
    }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.01em' }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SearchInput
          value={searchQ}
          onChange={setSearchQ}
          placeholder="Buscar tarefas, docs…"
          results={results}
          onSelect={(r) => { setSearchQ(typeof r === 'string' ? r : r.label); }}
          width={260}
        />
        <Dropdown align="right" trigger={
          <button style={{
            width: 38, height: 38, borderRadius: 10, border: '1.5px solid var(--ob-border)',
            background: 'var(--ob-surface)', color: 'var(--ob-fg)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <i className="ph ph-bell" style={{ fontSize: 18 }}/>
            <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: 'var(--ob-orange)', border: '2px solid var(--ob-surface)' }}/>
          </button>
        } items={[
          { label: 'Cliente Soluções respondeu',  icon: <i className="ph ph-chat-circle" style={{ fontSize: 16 }}/>, onClick: () => {} },
          { label: 'Deploy concluído',            icon: <i className="ph ph-check-circle" style={{ fontSize: 16 }}/>, onClick: () => {} },
          { label: '2 tarefas vencem hoje',       icon: <i className="ph ph-calendar" style={{ fontSize: 16 }}/>, onClick: () => {} },
          { divider: true },
          { label: 'Ver todas', icon: <i className="ph ph-arrow-right" style={{ fontSize: 16 }}/>, onClick: () => {} },
        ]} />
        {action}
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar });
