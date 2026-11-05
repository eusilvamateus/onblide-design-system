import { Logo } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 24 }}>
    <Logo size={32} />
  </div>
);

export const Tamanhos = () => (
  <div style={{ padding: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
    <Logo size={20} />
    <Logo size={40} />
    <Logo size={64} />
  </div>
);
