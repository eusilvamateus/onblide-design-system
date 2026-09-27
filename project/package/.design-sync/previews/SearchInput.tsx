import { useEffect, useRef } from 'react';
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

export const ComResultados = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector('input')?.focus(); }, []);
  return (
    <div ref={ref} style={{ padding: 16, minHeight: 240 }}>
      <SearchInput
        value="tare"
        onChange={() => {}}
        placeholder="Buscar tarefas e projetos…"
        results={['Tarefas atrasadas', 'Relatório de maio', 'Configurações de conta']}
      />
    </div>
  );
};
