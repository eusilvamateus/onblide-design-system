import { useState } from 'react';
import { Navbar, Menu, Avatar, LogoMark, Button, Icons, SearchInput, Tabs, Breadcrumbs } from '@onblide/ui';

const itensPrincipais = [
  { id: 'inicio', label: 'Início', href: '#inicio' },
  { id: 'projetos', label: 'Projetos', href: '#projetos', badge: 3 },
  { id: 'equipe', label: 'Equipe', href: '#equipe' },
  { id: 'relatorios', label: 'Relatórios', href: '#relatorios' },
];

const marca = <LogoMark size={30} />;

const Conta = () => (
  <Menu align="right" size="sm" ariaLabel="Conta" items={[
    { type: 'account', name: 'Mateus Silva', email: 'mateus@onblide.com', large: true },
    { type: 'separator' },
    { label: 'Perfil', icon: 'user' },
    { label: 'Configurações', icon: 'gear' },
    { type: 'separator' },
    { label: 'Sair', icon: 'sign-out', tone: 'danger' },
  ]} trigger={<Button kind="quiet" iconOnly aria-label="Conta de Mateus Silva" icon={<Avatar name="Mateus Silva" size={32} />} />} />
);

export const ComLinks = () => {
  const [ativo, setAtivo] = useState('projetos');
  return (
    <Navbar
      items={itensPrincipais}
      active={ativo}
      onNav={setAtivo}
      brand={marca}
      actions={
        <>
          <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} count={3} />
          <Conta />
        </>
      }
    />
  );
};

export const BuscaCentral = () => {
  const [busca, setBusca] = useState('');
  return (
    <Navbar
      layout="search"
      brand={marca}
      search={<SearchInput value={busca} onChange={setBusca} placeholder="Buscar em todo o workspace..." />}
      actions={
        <>
          <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} />
          <Conta />
        </>
      }
    />
  );
};

export const ComAbas = () => {
  const [aba, setAba] = useState('geral');
  const [ativo, setAtivo] = useState('projetos');
  return (
    <Navbar
      items={itensPrincipais}
      active={ativo}
      onNav={setAtivo}
      brand={marca}
      secondary={
        <Tabs
          variant="line"
          size="sm"
          active={aba}
          onChange={setAba}
          tabs={[
            { id: 'geral', label: 'Geral' },
            { id: 'tarefas', label: 'Tarefas' },
            { id: 'arquivos', label: 'Arquivos' },
          ]}
        />
      }
      actions={<Conta />}
    />
  );
};

export const Contexto = () => (
  <Navbar
    layout="context"
    onMenuToggle={() => {}}
    crumbs={
      <Breadcrumbs
        items={[
          { label: 'Projetos' },
          { label: 'Site institucional' },
          { label: 'Configurações' },
        ]}
      />
    }
    actions={
      <>
        <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} />
        <Conta />
      </>
    }
  />
);
