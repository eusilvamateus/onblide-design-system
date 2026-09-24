import { Datepicker } from '@onblide/ui';

export const Periodo = () => (
  <div style={{ padding: 16, minHeight: 420 }}>
    <Datepicker
      label="Período da campanha"
      startDateLabel="Início"
      endDateLabel="Fim"
      defaultValues={{ startDate: '2026-10-05', endDate: '2026-10-12' }}
      showSubmitButton
      submitLabel="Aplicar"
      clearLabel="Limpar"
    />
  </div>
);

export const DataUnica = () => (
  <div style={{ padding: 16, minHeight: 420 }}>
    <Datepicker singleDate label="Data de entrega" hint="Escolha um dia útil" startDateLabel="Entrega" />
  </div>
);

export const ComErro = () => (
  <div style={{ padding: 16, minHeight: 420 }}>
    <Datepicker singleDate label="Data de entrega" error="Selecione uma data válida" startDateLabel="Entrega" />
  </div>
);
