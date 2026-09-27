// Ponto de partida da demo interativa do Dropdown: o elemento <Dropdown> abaixo define os valores iniciais dos controles.

const itens = [
  { label: 'Editar', icon: <Icons.file size={16} /> },
  { label: 'Duplicar', icon: <Icons.folder size={16} /> },
  { label: 'Arquivar', disabled: true },
  { divider: true },
  { label: 'Excluir', danger: true },
];

<Dropdown
  align="right"
  trigger={<Button kind="ghost" icon={<Icons.more size={16} />}>Mais</Button>}
  items={itens}
/>
