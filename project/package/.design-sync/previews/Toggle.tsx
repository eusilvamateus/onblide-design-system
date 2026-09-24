import { Toggle } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 14, padding: 16 };

export const Estados = () => (
  <div style={col}>
    <Toggle checked label="Notificações por e-mail" />
    <Toggle checked={false} label="Resumo semanal" />
  </div>
);

export const Tamanhos = () => (
  <div style={col}>
    <Toggle checked size="sm" label="Modo compacto" />
    <Toggle checked size="md" label="Modo compacto" />
  </div>
);

export const Desabilitado = () => (
  <div style={col}>
    <Toggle checked disabled label="Sincronização automática" />
    <Toggle checked={false} disabled label="Compartilhar com a equipe" />
  </div>
);
