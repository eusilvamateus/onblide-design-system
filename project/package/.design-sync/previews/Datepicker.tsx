import { Datepicker } from '@onblide/ui';

const box = { padding: 16, minHeight: 130 };

export const Intervalo = () => (
  <div style={box}>
    <Datepicker label="Período da campanha" startDateLabel="de" endDateLabel="até" submitLabel="Aplicar" clearLabel="Limpar" />
  </div>
);

export const DataUnica = () => (
  <div style={box}>
    <Datepicker singleDate label="Data de entrega" hint="Escolha um dia útil" startDateLabel="Entrega" />
  </div>
);

export const SemBotaoEnviar = () => (
  <div style={box}>
    <Datepicker label="Período do relatório" showSubmitButton={false} startDateLabel="de" endDateLabel="até" />
  </div>
);

export const ResetAoEnviar = () => (
  <div style={box}>
    <Datepicker label="Nova busca" resetOnSubmit submitLabel="Buscar" startDateLabel="de" endDateLabel="até" />
  </div>
);

export const PreEnchido = () => (
  <div style={box}>
    <Datepicker
      label="Período da campanha"
      defaultValues={{ startDate: '2026-10-05', endDate: '2026-10-12' }}
      startDateLabel="de"
      endDateLabel="até"
    />
  </div>
);

export const DataMinima = () => (
  <div style={box}>
    <Datepicker singleDate label="Data de entrega" hint="Datas antes de 20/05/2026 ficam desabilitadas" minBookingDate={new Date(2026, 4, 20)} startDateLabel="Entrega" />
  </div>
);

export const LimiteDeDias = () => (
  <div style={box}>
    <Datepicker label="Reserva" hint="No máximo 5 dias" maxBookingDays={5} defaultValues={{ startDate: '2026-10-15', endDate: null }} startDateLabel="de" endDateLabel="até" />
  </div>
);

export const ComErro = () => (
  <div style={box}>
    <Datepicker singleDate label="Data de entrega" error="Selecione uma data válida" startDateLabel="Entrega" />
  </div>
);
