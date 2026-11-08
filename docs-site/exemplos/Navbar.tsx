import { useState } from 'react';
import { Navbar, NavbarAccount, Button, Icons, SearchInput, Tabs, Breadcrumbs } from '@onblide/ui';

const itensPrincipais = [
  { id: 'inicio', label: 'Início' },
  { id: 'projetos', label: 'Projetos', badge: 3 },
  { id: 'equipe', label: 'Equipe' },
  { id: 'relatorios', label: 'Relatórios' },
];

export const ComLinks = () => {
  const [ativo, setAtivo] = useState('projetos');
  return (
    <Navbar
      items={itensPrincipais}
      active={ativo}
      onNav={setAtivo}
      actions={
        <>
          <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} count={3} />
          <NavbarAccount />
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
      search={<SearchInput value={busca} onChange={setBusca} placeholder="Buscar em todo o workspace..." />}
      actions={
        <>
          <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} />
          <NavbarAccount />
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
          { label: 'Projetos' },
          { label: 'Site institucional' },
          { label: 'Configurações' },
        ]}
      />
    }
    actions={
      <>
        <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} />
        <NavbarAccount />
      </>
    }
  />
);
