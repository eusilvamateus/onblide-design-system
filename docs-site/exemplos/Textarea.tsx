import { Textarea } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Textarea label="Observações" placeholder="Escreva uma nota sobre o cliente…" />
  </div>
);

export const ComContador = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Textarea label="Resumo" defaultValue="Cliente satisfeito com a entrega." maxLength={120} />
  </div>
);

export const Autoajustavel = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Textarea label="Descrição" autosize minRows={2} maxRows={6} defaultValue={'Primeira linha.\nSegunda linha.\nTerceira linha.'} />
  </div>
);

export const Erro = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Textarea label="Observações" error="Descreva o motivo do cancelamento" />
  </div>
);
