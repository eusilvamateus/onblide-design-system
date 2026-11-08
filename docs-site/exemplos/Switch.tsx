import { Switch } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 14, padding: 16 };

export const Estados = () => (
  <div style={col}>
    <Switch checked label="Notificações por e-mail" />
    <Switch checked={false} label="Resumo semanal" />
  </div>
);

export const Tamanhos = () => (
  <div style={col}>
    <Switch checked size="sm" label="Modo compacto" />
    <Switch checked size="md" label="Modo compacto" />
    <Switch checked size="lg" label="Modo compacto" />
  </div>
);

export const Desabilitado = () => (
  <div style={col}>
    <Switch checked disabled label="Sincronização automática" />
    <Switch checked={false} disabled label="Compartilhar com a equipe" />
  </div>
);
