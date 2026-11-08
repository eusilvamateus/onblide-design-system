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

const tipos = [
  { id: 'todas', label: 'Todas' },
  { id: 'campanhas', label: 'Campanhas', tone: 'primary' as const },
  { id: 'cupons', label: 'Cupons', tone: 'warning' as const },
];

export const ComCor = () => (
  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
    <Tabs tabs={tipos} active="campanhas" variant="pill" size="sm" appearance="soft" />
    <Tabs tabs={tipos} active="cupons" variant="pill" size="sm" />
    <Tabs tabs={tipos} active="campanhas" variant="pill" size="sm" appearance="solid" />
    <Tabs tabs={tipos} active="todas" variant="pill" size="sm" dot />
  </div>
);

export const LinhaComCor = () => (
  <div style={{ padding: 16 }}>
    <Tabs tabs={tipos} active="cupons" variant="line" size="sm" />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
    <Tabs tabs={abas.slice(0, 3)} active="historico" size="sm" />
    <Tabs tabs={abas.slice(0, 3)} active="historico" size="md" />
    <Tabs tabs={abas.slice(0, 3)} active="historico" size="lg" />
  </div>
);
