import { Button, Datepicker, Ph, Tooltip, formatarPeriodo } from '@onblide/ui';

const caixa = { padding: 16, minHeight: 110, maxWidth: 360 };

export const DataUnica = () => (
  <div style={caixa}>
    <Datepicker label="Data de entrega" hint="Escolha um dia útil" />
  </div>
);

export const Intervalo = () => (
  <div style={caixa}>
    <Datepicker mode="range" label="Período da campanha" />
  </div>
);

export const PreEnchido = () => (
  <div style={caixa}>
    <Datepicker mode="range" label="Período da campanha" defaultValue={{ start: new Date(2026, 9, 5), end: new Date(2026, 9, 12) }} />
  </div>
);

export const ComSetasPorDia = () => (
  <div style={caixa}>
    <Datepicker label="Data de entrega" stepper="day" defaultValue={new Date(2026, 9, 14)} />
  </div>
);

export const ComSetasPorMes = () => (
  <div style={caixa}>
    <Datepicker label="Mês de referência" stepper="month" defaultValue={new Date(2026, 9, 1)} />
  </div>
);

export const DataMinima = () => (
  <div style={caixa}>
    <Datepicker label="Data de entrega" hint="Datas antes de 20/05/2026 ficam indisponíveis" min={new Date(2026, 4, 20)} />
  </div>
);

export const DatasIndisponiveis = () => (
  <div style={caixa}>
    <Datepicker label="Data da reunião" hint="Fins de semana ficam indisponíveis" isDateDisabled={(data) => data.getDay() === 0 || data.getDay() === 6} />
  </div>
);

export const ComErro = () => (
  <div style={caixa}>
    <Datepicker label="Data de entrega" error="Selecione uma data válida" />
  </div>
);

export const Desabilitado = () => (
  <div style={caixa}>
    <Datepicker label="Data de entrega" defaultValue={new Date(2026, 9, 14)} disabled />
  </div>
);

const hoje = new Date(2026, 9, 14);

const ChipDePeriodo = ({ inicio, fim }: { inicio: Date; fim: Date }) => (
  <Tooltip label="Período">
    <Button kind="secondary" size="sm" icon={<Ph n="calendar-dots" size={16} />}>
      {formatarPeriodo(inicio, fim, { hoje })}
    </Button>
  </Tooltip>
);

export const ResumoDoPeriodo = () => (
  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
    <ChipDePeriodo inicio={new Date(2026, 7, 1)} fim={new Date(2026, 9, 31)} />
    <ChipDePeriodo inicio={new Date(2026, 7, 5)} fim={new Date(2026, 9, 14)} />
    <ChipDePeriodo inicio={new Date(2026, 8, 1)} fim={new Date(2027, 0, 31)} />
    <ChipDePeriodo inicio={new Date(2026, 8, 2)} fim={new Date(2027, 0, 31)} />
  </div>
);
