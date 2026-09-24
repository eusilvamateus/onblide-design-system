import { Tabs } from '@onblide/ui';

const abas = [
  { id: 'visao', label: 'Visão geral', icon: 'house' },
  { id: 'equipe', label: 'Equipe', icon: 'users', badge: 8 },
  { id: 'historico', label: 'Histórico', icon: 'clock' },
  { id: 'arquivo', label: 'Arquivadas', icon: 'archive', disabled: true },
];

export const Linha = () => (
  <div style={{ padding: 16 }}>
    <Tabs tabs={abas} active="equipe" variant="line" />
  </div>
);

export const Pilula = () => (
  <div style={{ padding: 16 }}>
    <Tabs tabs={abas} active="visao" variant="pill" />
  </div>
);

export const Pequeno = () => (
  <div style={{ padding: 16 }}>
    <Tabs tabs={abas.slice(0, 3)} active="historico" size="sm" />
  </div>
);
