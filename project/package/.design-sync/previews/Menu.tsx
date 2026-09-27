import { Menu, ContextMenu, Button, Ph } from '@onblide/ui';

const itens = [
  { label: 'Editar', icon: 'pencil-simple', shortcut: 'Ctrl+E' },
  { label: 'Duplicar', icon: 'copy' },
  { type: 'separator' as const },
  { label: 'Excluir', icon: 'trash', tone: 'danger' as const },
];

export const Padrao = () => (
  <div style={{ padding: 16, width: 240 }}>
    <Menu trigger={<Button kind="secondary" icon={<Ph n="dots-three" size={16} />}>Ações</Button>} items={itens} />
  </div>
);

export const ComSelecao = () => (
  <div style={{ padding: 16, width: 240 }}>
    <Menu
      trigger={<Button kind="secondary">Zoom: 100%</Button>}
      items={[
        { type: 'radio', group: 'zoom', label: '50%', checked: false, onSelect: () => {} },
        { type: 'radio', group: 'zoom', label: '100%', checked: true, onSelect: () => {} },
        { type: 'radio', group: 'zoom', label: '200%', checked: false, onSelect: () => {} },
      ]}
    />
  </div>
);

export const ContextoDireito = () => (
  <div style={{ padding: 16, width: 240 }}>
    <ContextMenu items={itens}>
      <div style={{ border: '1px dashed var(--ob-border)', borderRadius: 8, padding: 24, textAlign: 'center', color: 'var(--ob-fg-soft)', fontSize: 13 }}>
        Clique com o botão direito aqui
      </div>
    </ContextMenu>
  </div>
);
