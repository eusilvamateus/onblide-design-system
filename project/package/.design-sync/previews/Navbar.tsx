import { useState } from 'react';
import { Navbar, NavbarIconButton, NavbarAccount, SearchInput, Tabs, Breadcrumbs } from '@onblide/ui';

const itensPrincipais = [
  { id: 'inicio', label: 'Início' },
  { id: 'projetos', label: 'Projetos', badge: 3 },
  { id: 'equipe', label: 'Equipe' },
  { id: 'relatorios', label: 'Relatórios' },
];

export const ComLinks = () => (
  <Navbar
    items={itensPrincipais}
    active="projetos"
    actions={
      <>
        <NavbarIconButton icon="bell" label="Notificações" count={3} />
        <NavbarAccount />
      </>
    }
  />
);

export const BuscaCentral = () => {
  const [busca, setBusca] = useState('');
  return (
    <Navbar
      layout="search"
      search={<SearchInput value={busca} onChange={setBusca} placeholder="Buscar em todo o workspace..." />}
      actions={
        <>
          <NavbarIconButton icon="bell" label="Notificações" />
          <NavbarAccount />
        </>
      }
    />
  );
};

export const ComAbas = () => {
  const [aba, setAba] = useState('geral');
  return (
    <Navbar
      items={itensPrincipais}
      active="projetos"
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
      actions={<NavbarAccount />}
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
          { label: 'Projetos', href: '#' },
          { label: 'Site institucional', href: '#' },
          { label: 'Configurações' },
        ]}
      />
    }
    actions={
      <>
        <NavbarIconButton icon="bell" label="Notificações" />
        <NavbarAccount />
      </>
    }
  />
);
