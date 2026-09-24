import { Avatar } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Avatar name="Mariana Costa" />
    <Avatar name="Rafael Lima" />
    <Avatar name="Beatriz Nogueira" />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Avatar name="Camila Duarte" size={24} />
    <Avatar name="Camila Duarte" size={32} />
    <Avatar name="Camila Duarte" size={48} />
    <Avatar name="Camila Duarte" size={64} />
  </div>
);

export const Cores = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Avatar name="Pedro Alves" color="#2F6BFF" />
    <Avatar name="Julia Reis" color="#1F9D62" />
    <Avatar name="Tiago Melo" color="#E5484D" />
  </div>
);
