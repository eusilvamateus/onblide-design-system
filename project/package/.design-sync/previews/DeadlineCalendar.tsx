import { DeadlineCalendar } from '@onblide/ui';

const feriados = [
  { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2026-11-02', name: 'Finados' },
];

export const Completo = () => (
  <div style={{ padding: 16, width: 360 }}>
    <DeadlineCalendar
      referenceDate="2026-10-01"
      production={{ startDate: '2026-10-05', endDate: '2026-10-16' }}
      delivery={{ startDate: '2026-10-19', endDate: '2026-10-23' }}
      estimatedDate="2026-10-23"
      holidays={feriados}
      holidayCoverage="national"
    />
  </div>
);

export const EntregaPendente = () => (
  <div style={{ padding: 16, width: 360 }}>
    <DeadlineCalendar
      referenceDate="2026-10-01"
      production={{ startDate: '2026-10-05', endDate: '2026-10-16' }}
      deliveryPending
      holidays={feriados}
    />
  </div>
);

export const CoberturaParcial = () => (
  <div style={{ padding: 16, width: 360 }}>
    <DeadlineCalendar
      referenceDate="2026-10-01"
      production={{ startDate: '2026-10-05', endDate: '2026-10-16' }}
      delivery={{ startDate: '2026-10-19', endDate: '2026-10-23' }}
      estimatedDate="2026-10-23"
      holidayCoverage="partial"
    />
  </div>
);

export const RetiradaCombinada = () => (
  <div style={{ padding: 16, width: 360 }}>
    <DeadlineCalendar
      referenceDate="2026-10-01"
      production={{ startDate: '2026-10-05', endDate: '2026-10-16' }}
    />
  </div>
);
