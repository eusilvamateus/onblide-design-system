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

export const Acao = () => (
  <div style={row}>
    <Chip label="Ver detalhes" tone="primary" icon="eye" onClick={() => {}} />
    <Chip label="Aprovado" tone="success" icon="check-circle" onClick={() => {}} />
    <Chip label="Pendente" tone="warning" icon="clock" onClick={() => {}} />
    <Chip label="Recusado" tone="danger" icon="x-circle" onClick={() => {}} />
  </div>
);

export const Suaves = () => (
  <div style={row}>
    <Chip label="Todos" appearance="soft" selected />
    <Chip label="Em andamento" appearance="soft" />
    <Chip label="Frete" appearance="soft" tone="primary" icon="plus" onClick={() => {}} />
    <Chip label="Comissão" appearance="soft" tone="primary" icon="plus" onClick={() => {}} />
    <Chip label="Atrasado" appearance="soft" tone="danger" removable />
  </div>
);

export const Removiveis = () => (
  <div style={row}>
    <Chip label="Design" selected removable />
    <Chip label="Marketing" removable />
    <Chip label="Financeiro" size="sm" removable />
  </div>
);

export const Pequeno = () => (
  <div style={row}>
    <Chip label="Mensal" size="sm" selected />
    <Chip label="Semanal" size="sm" />
    <Chip label="Diário" size="sm" />
  </div>
);

export const Grande = () => (
  <div style={row}>
    <Chip label="Mensal" size="lg" selected />
    <Chip label="Semanal" size="lg" icon="calendar-blank" />
    <Chip label="Design" size="lg" removable onRemove={() => {}} />
  </div>
);

export const Desabilitado = () => (
  <div style={row}>
    <Chip label="Arquivados" disabled />
    <Chip label="Rascunhos" selected disabled />
  </div>
);
