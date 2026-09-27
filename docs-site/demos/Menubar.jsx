// Ponto de partida da demo interativa do Menubar: o elemento <Menubar> abaixo define os valores iniciais dos controles.

const menus = [
  { label: 'Arquivo', items: [{ label: 'Novo', shortcut: 'Ctrl+N' }, { label: 'Abrir…', shortcut: 'Ctrl+O' }, { type: 'separator' }, { label: 'Salvar', shortcut: 'Ctrl+S' }] },
  { label: 'Editar', items: [{ label: 'Desfazer', shortcut: 'Ctrl+Z' }, { label: 'Refazer', shortcut: 'Ctrl+Shift+Z', disabled: true }] },
  { label: 'Ver', items: [{ type: 'checkbox', label: 'Régua', checked: true, onChange: () => {} }, { type: 'checkbox', label: 'Grade', checked: false, onChange: () => {} }] },
];

<Menubar
  menus={menus}
  ariaLabel="Menu do editor"
/>
