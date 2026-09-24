import { useEffect, useRef } from 'react';
import { Button, Dropdown, Icons } from '@onblide/ui';

const Abre = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector('button')?.click(); }, []);
  return <div ref={ref} style={{ position: 'relative', minHeight: 260, padding: 16 }}>{children}</div>;
};

const itens = [
  { label: 'Editar', icon: <Icons.file size={16} /> },
  { label: 'Duplicar', icon: <Icons.folder size={16} /> },
  { label: 'Arquivar', disabled: true },
  { divider: true },
  { label: 'Excluir', danger: true },
];

export const Fechado = () => (
  <div style={{ padding: 16, minHeight: 80 }}>
    <Dropdown trigger={<Button kind="secondary">Ações</Button>} items={itens} />
  </div>
);

export const Aberto = () => (
  <Abre><Dropdown trigger={<Button kind="secondary">Ações</Button>} items={itens} /></Abre>
);

export const AlinhadoADireita = () => (
  <Abre>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown align="right" trigger={<Button kind="ghost" icon={<Icons.more size={16} />}>Mais</Button>} items={itens} />
    </div>
  </Abre>
);
