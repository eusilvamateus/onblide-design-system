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
