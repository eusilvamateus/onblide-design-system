import { Menubar } from '@onblide/ui';

const menus = [
  { label: 'Arquivo', items: [{ label: 'Novo', shortcut: 'Ctrl+N' }, { label: 'Abrir…', shortcut: 'Ctrl+O' }, { type: 'separator' as const }, { label: 'Salvar', shortcut: 'Ctrl+S' }] },
  { label: 'Editar', items: [{ label: 'Desfazer', shortcut: 'Ctrl+Z' }, { label: 'Refazer', shortcut: 'Ctrl+Shift+Z', disabled: true }] },
  { label: 'Ver', items: [{ type: 'checkbox' as const, label: 'Régua', checked: true, onChange: () => {} }, { type: 'checkbox' as const, label: 'Grade', checked: false, onChange: () => {} }] },
];

export const Padrao = () => (
  <div style={{ padding: 16, width: 360 }}>
    <div style={{ background: 'var(--ob-surface)', border: '1px solid var(--ob-border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
      <Menubar menus={menus} ariaLabel="Menu do editor" />
    </div>
  </div>
);
