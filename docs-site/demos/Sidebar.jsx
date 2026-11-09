const grupos = [
  { items: [
    { id: 'inicio', label: 'Início', icon: 'house', href: '#inicio' },
    { id: 'projetos', label: 'Projetos', icon: 'kanban', href: '#projetos', badge: 4 },
    { id: 'painel', label: 'Painel', icon: 'squares-four', href: '#painel' },
  ] },
  { label: 'Análise', items: [
    { id: 'relatorios', label: 'Relatórios', icon: 'chart-line', children: [
      { id: 'vendas', label: 'Vendas', href: '#vendas' },
      { id: 'clientes', label: 'Clientes', href: '#clientes' },
    ] },
    { id: 'config', label: 'Configurações', icon: 'gear', href: '#config' },
  ] },
];

const paginas = { inicio: 'Início', projetos: 'Projetos', painel: 'Painel', vendas: 'Vendas', clientes: 'Clientes', config: 'Configurações' };

function Conta({ compacta }) {
  return (
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
}

function Aplicacao({ children }) {
  const [pagina, setPagina] = useState('projetos');
  return (
    <div style={{ display: 'flex', gap: 12, height: 520, padding: 12, background: 'var(--ob-bg-alt)', borderRadius: 14 }}>
      {children({ pagina, irPara: setPagina })}
      <main style={{ flex: 1, minWidth: 0, padding: '16px 24px' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--ob-fs-22)', color: 'var(--ob-fg-strong)' }}>{paginas[pagina]}</h3>
      </main>
    </div>
  );
}

<Aplicacao>
  {(e) => (
    <Sidebar
      groups={grupos}
      active={e.pagina}
      onNav={e.irPara}
      collapsible
      toggleShortcut="b"
      header={({ collapsed }) => (collapsed ? <LogoMark size={22} /> : <Logo size={24} />)}
      footer={({ collapsed }) => <Conta compacta={collapsed} />}
    />
  )}
</Aplicacao>
