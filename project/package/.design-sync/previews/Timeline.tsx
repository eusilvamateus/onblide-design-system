import { Timeline } from '@onblide/ui';

const eventos = [
  { title: 'Pedido criado', time: '09:12', status: 'done' as const },
  { title: 'Em separação', time: '10:40', status: 'current' as const },
  { title: 'A caminho', status: 'pending' as const },
  { title: 'Entregue', status: 'pending' as const },
];

export const Vertical = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Timeline items={eventos} />
  </div>
);

export const Horizontal = () => (
  <div style={{ padding: 16, width: 480 }}>
    <Timeline items={eventos} orientation="horizontal" />
  </div>
);

export const ComAvatar = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Timeline
      marker="avatar"
      items={[
        { title: 'Ana aprovou o orçamento', person: 'Ana Souza', status: 'done' },
        { title: 'Bruno está revisando', person: 'Bruno Lima', status: 'current' },
      ]}
    />
  </div>
);
