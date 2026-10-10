const itens = [
  { section: 'Geral' },
  { id: 'inicio', label: 'Início', icon: 'house' },
  { id: 'projetos', label: 'Projetos', icon: 'kanban', badge: 4 },
  { id: 'painel', label: 'Painel', icon: 'squares-four' },
  { section: 'Análise' },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart-line' },
  { id: 'config', label: 'Configurações', icon: 'gear' },
];

const paginas = { inicio: 'Início', projetos: 'Projetos', painel: 'Painel', relatorios: 'Relatórios', config: 'Configurações' };

function Aplicacao({ children }) {
  const [pagina, setPagina] = useState('projetos');
  const [colapsada, setColapsada] = useState(false);
  const [aviso, setAviso] = useState('nenhuma ainda');
  const estado = { pagina, irPara: setPagina, colapsada, alternar: () => setColapsada((c) => !c), avisar: setAviso };
  return (
    <div style={{ display: 'flex', gap: 12, height: 520, padding: 12, background: 'var(--ob-bg-alt)', borderRadius: 14 }}>
      <div style={{ display: 'flex', flex: 'none', width: colapsada ? 72 : 240 }}>{children(estado)}</div>
      <main style={{ flex: 1, minWidth: 0, padding: '16px 24px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--ob-fs-lg)', color: 'var(--ob-fg-strong)' }}>{paginas[pagina]}</h3>
        <p style={{ margin: 0, fontSize: 'var(--ob-fs-sm)', color: 'var(--ob-fg-mute)' }}>Última ação do menu de conta: {aviso}</p>
      </main>
    </div>
  );
}

<Aplicacao>
  {(e) => (
    <SideNav
      items={itens}
      brand={<Logo size={24} />}
      brandMark={<LogoMark size={22} />}
      active={e.pagina}
      onNav={e.irPara}
      collapsed={e.colapsada}
      onToggle={e.alternar}
      onProfile={() => e.avisar('Perfil')}
      onSettings={() => e.avisar('Configurações')}
      onSignOut={() => e.avisar('Sair')}
      accountName="Mateus Silva"
      accountDetail="mateus@onblide.com"
    />
  )}
</Aplicacao>
