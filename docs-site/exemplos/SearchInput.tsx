import { SearchInput } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 16 }}>
    <SearchInput placeholder="Buscar tarefas e projetos…" />
  </div>
);

export const ComValor = () => (
  <div style={{ padding: 16 }}>
    <SearchInput value="relatório trimestral" />
  </div>
);

export const Carregando = () => (
  <div style={{ padding: 16 }}>
    <SearchInput value="onboarding" loading />
  </div>
);

export const Desabilitado = () => (
  <div style={{ padding: 16 }}>
    <SearchInput value="relatório trimestral" disabled />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
    <SearchInput size="sm" value="relatório" />
    <SearchInput size="md" value="relatório" />
    <SearchInput size="lg" value="relatório" />
  </div>
);
