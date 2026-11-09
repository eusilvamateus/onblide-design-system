import { useState } from 'react';
import { Sidebar, Menu, Button, Avatar, Logo, LogoMark, type SidebarGroup } from '@onblide/ui';

const grupos: SidebarGroup[] = [
  { items: [
    { id: 'inicio', label: 'Início', icon: 'house', href: '#inicio' },
    { id: 'projetos', label: 'Projetos', icon: 'kanban', href: '#projetos', badge: 4 },
    { id: 'painel', label: 'Painel', icon: 'squares-four', href: '#painel' },
  ] },
  { label: 'Análise', items: [
    { id: 'relatorios', label: 'Relatórios', icon: 'chart-line', href: '#relatorios' },
    { id: 'alertas', label: 'Alertas', icon: 'bell', href: '#alertas', badge: 2, badgeTone: 'danger' },
    { id: 'config', label: 'Configurações', icon: 'gear', href: '#config' },
  ] },
];

const Conta = ({ compacta }: { compacta: boolean }) => (
  <Menu block placement={compacta ? 'right-end' : 'top'} ariaLabel="Conta" items={[
    { type: 'account', name: 'Mateus Silva', email: 'mateus@onblide.com' },
    { type: 'separator' },
    { label: 'Perfil', icon: 'user' },
    { label: 'Configurações', icon: 'gear' },
    { type: 'separator' },
    { label: 'Sair', icon: 'sign-out', tone: 'danger' },
  ]} trigger={
    <Button kind="quiet" iconOnly={compacta} aria-label="Conta de Mateus Silva" icon={<Avatar name="Mateus Silva" size={28} />}
      style={compacta ? undefined : { width: '100%', justifyContent: 'flex-start', paddingLeft: 'var(--ob-space-8)' }}>
      {!compacta && 'Mateus Silva'}
    </Button>
  } />
);

const marca = ({ collapsed }: { collapsed: boolean }) => (collapsed ? <LogoMark size={22} /> : <Logo size={24} />);

export const Expandida = () => {
  const [ativo, setAtivo] = useState('projetos');
  return (
    <div style={{ height: 520, display: 'flex' }}>
      <Sidebar groups={grupos} active={ativo} onNav={setAtivo} collapsible header={marca} footer={({ collapsed }) => <Conta compacta={collapsed} />} />
    </div>
  );
};

export const Recolhida = () => {
  const [ativo, setAtivo] = useState('inicio');
  return (
    <div style={{ height: 520, display: 'flex' }}>
      <Sidebar groups={grupos} active={ativo} onNav={setAtivo} collapsible defaultCollapsed header={marca} footer={({ collapsed }) => <Conta compacta={collapsed} />} />
    </div>
  );
};

export const ComSubitens = () => {
  const [ativo, setAtivo] = useState('button');
  return (
    <div style={{ height: 420, display: 'flex' }}>
      <Sidebar
        active={ativo}
        onNav={setAtivo}
        collapsible
        groups={[
          { items: [{ id: 'inicio', label: 'Início', icon: 'house', href: '#inicio' }] },
          { label: 'Componentes', items: [
            { id: 'acoes', label: 'Ações', icon: 'cursor-click', children: [{ id: 'button', label: 'Button', href: '#button' }, { id: 'link', label: 'Link', href: '#link' }] },
            { id: 'formularios', label: 'Formulários', icon: 'textbox', children: [{ id: 'input', label: 'Input', href: '#input' }, { id: 'select', label: 'Select', href: '#select' }] },
          ] },
        ]}
      />
    </div>
  );
};

export const Flush = () => {
  const [ativo, setAtivo] = useState('painel');
  return (
    <div style={{ height: 480, display: 'flex', border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-lg)', overflow: 'hidden' }}>
      <div style={{ width: 240, flex: 'none', display: 'flex' }}>
        <Sidebar variant="flush" groups={grupos} active={ativo} onNav={setAtivo} header={<Logo size={24} />} />
      </div>
      <div style={{ flex: 1, background: 'var(--ob-bg-alt)', padding: 'var(--ob-space-20)', color: 'var(--ob-fg-mute)', fontSize: 'var(--ob-fs-13)' }}>
        Conteúdo da aplicação. A barra ocupa a coluna inteira, só com a divisória à direita.
      </div>
    </div>
  );
};
