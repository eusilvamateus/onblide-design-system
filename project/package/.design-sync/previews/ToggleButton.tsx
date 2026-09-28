import { ToggleButton, Tooltip } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16 }}>
    <ToggleButton icon="push-pin">Fixar</ToggleButton>
    <ToggleButton icon="push-pin" defaultPressed>Fixar</ToggleButton>
  </div>
);

export const Aparencia = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16 }}>
    <ToggleButton appearance="outline" icon="bell" defaultPressed>Seguir</ToggleButton>
    <ToggleButton appearance="ghost" icon="bell" defaultPressed>Seguir</ToggleButton>
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <ToggleButton size="sm" icon="eye" defaultPressed>Pré-visualizar</ToggleButton>
    <ToggleButton size="md" icon="eye" defaultPressed>Pré-visualizar</ToggleButton>
    <ToggleButton size="lg" icon="eye" defaultPressed>Pré-visualizar</ToggleButton>
  </div>
);

export const SoIcone = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16 }}>
    <Tooltip label="Modo foco"><ToggleButton icon="crosshair" ariaLabel="Modo foco" /></Tooltip>
    <Tooltip label="Favoritar"><ToggleButton icon="star" fillWhenPressed defaultPressed ariaLabel="Favoritar" /></Tooltip>
  </div>
);

export const Desabilitado = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16 }}>
    <ToggleButton icon="push-pin" disabled>Fixar</ToggleButton>
    <ToggleButton icon="push-pin" disabled defaultPressed>Fixar</ToggleButton>
  </div>
);
