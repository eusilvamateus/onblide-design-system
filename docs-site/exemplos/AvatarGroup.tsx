import { Avatar, AvatarGroup } from '@onblide/ui';

const caixa = { padding: 16 };

export const Padrao = () => (
  <div style={caixa}>
    <AvatarGroup>
      <Avatar name="Ana Lima" />
      <Avatar name="Bruno Dias" color="var(--ob-green)" />
      <Avatar name="Carla Souza" color="var(--ob-orange)" />
      <Avatar name="Diego Reis" color="var(--ob-red)" />
    </AvatarGroup>
  </div>
);

export const ComLimite = () => (
  <div style={caixa}>
    <AvatarGroup max={3}>
      <Avatar name="Ana Lima" />
      <Avatar name="Bruno Dias" color="var(--ob-green)" />
      <Avatar name="Carla Souza" color="var(--ob-orange)" />
      <Avatar name="Diego Reis" color="var(--ob-red)" />
      <Avatar name="Eva Costa" />
    </AvatarGroup>
  </div>
);

export const Tamanhos = () => (
  <div style={{ ...caixa, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
    <AvatarGroup size={24} max={3}>
      <Avatar name="Ana Lima" />
      <Avatar name="Bruno Dias" color="var(--ob-green)" />
      <Avatar name="Carla Souza" color="var(--ob-orange)" />
      <Avatar name="Diego Reis" />
    </AvatarGroup>
    <AvatarGroup size={48} max={3}>
      <Avatar name="Ana Lima" />
      <Avatar name="Bruno Dias" color="var(--ob-green)" />
      <Avatar name="Carla Souza" color="var(--ob-orange)" />
      <Avatar name="Diego Reis" />
    </AvatarGroup>
  </div>
);
