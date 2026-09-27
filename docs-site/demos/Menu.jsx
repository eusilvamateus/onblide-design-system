// Ponto de partida da demo interativa do Menu: o elemento <Menu> abaixo define os valores iniciais dos controles.

const itens = [
  { label: 'Editar', icon: 'pencil-simple', shortcut: 'Ctrl+E' },
  { label: 'Duplicar', icon: 'copy' },
  { type: 'separator' },
  { label: 'Excluir', icon: 'trash', tone: 'danger' },
];

<Menu
  trigger={<Button kind="secondary" icon={<Ph n="dots-three" size={16} />}>Ações</Button>}
  items={itens}
/>
