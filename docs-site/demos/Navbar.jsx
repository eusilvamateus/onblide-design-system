// Ponto de partida da demo interativa do Navbar: o elemento <Navbar> abaixo define os valores iniciais dos controles.

const itens = [
  { id: 'inicio', label: 'Início' },
  { id: 'projetos', label: 'Projetos', badge: 3 },
  { id: 'equipe', label: 'Equipe' },
  { id: 'relatorios', label: 'Relatórios' },
];

<Navbar
  items={itens}
  active="projetos"
  actions={
    <>
      <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} count={3} />
      <NavbarAccount />
    </>
  }
/>
