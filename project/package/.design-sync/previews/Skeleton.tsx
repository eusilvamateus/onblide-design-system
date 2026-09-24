import { Skeleton } from '@onblide/ui';

export const Formas = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}>
    <Skeleton circle width={48} height={48} />
    <Skeleton width={200} height={16} />
    <Skeleton width={96} height={40} radius={8} />
  </div>
);

export const CartaoCarregando = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, width: 360 }}>
    <Skeleton circle width={44} height={44} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton width="60%" height={14} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="85%" height={12} />
    </div>
  </div>
);
