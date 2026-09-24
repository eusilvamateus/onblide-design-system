import { Chip } from '@onblide/ui';

const row = { display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap' as const, alignItems: 'center' };

export const Filtros = () => (
  <div style={row}>
    <Chip label="Todos" selected />
    <Chip label="Em andamento" />
    <Chip label="Concluídos" />
    <Chip label="Atrasados" icon="warning" />
  </div>
);

export const Removiveis = () => (
  <div style={row}>
    <Chip label="Design" selected removable />
    <Chip label="Marketing" removable />
    <Chip label="Financeiro" size="sm" removable />
  </div>
);

export const Desabilitado = () => (
  <div style={row}>
    <Chip label="Arquivados" disabled />
    <Chip label="Rascunhos" selected disabled />
  </div>
);
