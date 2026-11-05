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

export const IniciaisProprias = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Avatar name="Mateus Silva" />
    <Avatar name="Mateus Silva" initials="M" />
    <Avatar name="Equipe de Produto" initials="EP" color="#1F9D62" />
  </div>
);

export const ComFoto = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Avatar name="Camila Duarte" src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23F4A261'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23FFF'/%3E%3Cpath d='M10 64c2-16 12-22 22-22s20 6 22 22z' fill='%23FFF'/%3E%3C/svg%3E" alt="Foto de Camila Duarte" size={48} />
    <Avatar name="Camila Duarte" src="https://exemplo.invalid/foto-que-falha.jpg" size={48} />
  </div>
);
