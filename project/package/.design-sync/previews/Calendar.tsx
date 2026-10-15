import { Calendar } from '@onblide/ui';

const caixa = { padding: 16 };

export const Unico = () => (
  <div style={caixa}>
    <Calendar defaultMonth={new Date(2026, 9, 1)} defaultValue={new Date(2026, 9, 14)} />
  </div>
);

export const Intervalo = () => (
  <div style={caixa}>
    <Calendar mode="range" defaultMonth={new Date(2026, 9, 1)} defaultValue={{ start: new Date(2026, 9, 12), end: new Date(2026, 9, 19) }} />
  </div>
);

export const DataMinima = () => (
  <div style={caixa}>
    <Calendar defaultMonth={new Date(2026, 9, 1)} min={new Date(2026, 9, 8)} max={new Date(2026, 9, 24)} />
  </div>
);

export const DatasIndisponiveis = () => (
  <div style={caixa}>
    <Calendar defaultMonth={new Date(2026, 9, 1)} isDateDisabled={(data) => data.getDay() === 0 || data.getDay() === 6} />
  </div>
);

export const SemanaNaSegunda = () => (
  <div style={caixa}>
    <Calendar defaultMonth={new Date(2026, 9, 1)} weekStartsOn={1} defaultValue={new Date(2026, 9, 5)} />
  </div>
);

export const Desabilitado = () => (
  <div style={caixa}>
    <Calendar defaultMonth={new Date(2026, 9, 1)} defaultValue={new Date(2026, 9, 14)} disabled />
  </div>
);

export const Meses = () => (
  <div style={caixa}>
    <Calendar openTo="months" defaultMonth={new Date(2026, 9, 1)} />
  </div>
);

export const Anos = () => (
  <div style={caixa}>
    <Calendar openTo="years" defaultMonth={new Date(2026, 9, 1)} />
  </div>
);

export const AnosComLimites = () => (
  <div style={caixa}>
    <Calendar openTo="years" defaultMonth={new Date(2026, 9, 1)} min={new Date(2020, 0, 1)} max={new Date(2030, 11, 31)} />
  </div>
);

export const MesInteiro = () => (
  <div style={caixa}>
    <Calendar precision="month" defaultMonth={new Date(2026, 9, 1)} defaultValue={new Date(2026, 9, 1)} />
  </div>
);

export const IntervaloDeMeses = () => (
  <div style={caixa}>
    <Calendar mode="range" precision="month" defaultMonth={new Date(2026, 9, 1)} defaultValue={{ start: new Date(2026, 7, 1), end: new Date(2026, 9, 31) }} />
  </div>
);

export const IntervaloDeAnos = () => (
  <div style={caixa}>
    <Calendar mode="range" precision="year" defaultMonth={new Date(2026, 9, 1)} defaultValue={{ start: new Date(2024, 0, 1), end: new Date(2026, 11, 31) }} />
  </div>
);
