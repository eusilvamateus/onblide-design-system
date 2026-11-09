// Ponto de partida da demo interativa do Navbar: o elemento <Navbar> abaixo define os valores iniciais dos controles.

const itens = [
  { id: 'inicio', label: 'Início', href: '#inicio' },
  { id: 'projetos', label: 'Projetos', href: '#projetos', badge: 3 },
  { id: 'equipe', label: 'Equipe', href: '#equipe' },
  { id: 'relatorios', label: 'Relatórios', href: '#relatorios' },
];

function Conta() {
  return (
    <Menu align="right" size="sm" ariaLabel="Conta" items={[
      { type: 'account', name: 'Mateus Silva', email: 'mateus@onblide.com', large: true },
      { type: 'separator' },
      { label: 'Perfil', icon: 'user' },
      { label: 'Configurações', icon: 'gear' },
      { type: 'separator' },
      { label: 'Sair', icon: 'sign-out', tone: 'danger' },
    ]} trigger={<Button kind="quiet" iconOnly aria-label="Conta de Mateus Silva" icon={<Avatar name="Mateus Silva" size={32} />} />} />
  );
}

<Navbar
  items={itens}
  active="projetos"
  brand={<LogoMark size={30} />}
  actions={
    <>
      <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} count={3} />
      <Conta />
    </>
  }
/>
