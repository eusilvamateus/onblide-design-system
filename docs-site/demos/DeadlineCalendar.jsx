// Ponto de partida da demo interativa do DeadlineCalendar: o elemento <DeadlineCalendar> abaixo define os valores iniciais dos controles.

const feriados = [
  { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2026-11-02', name: 'Finados' },
];

<DeadlineCalendar
  referenceDate="2026-10-01"
  estimatedDate="2026-10-23"
  holidayCoverage="national"
  production={{ startDate: '2026-10-05', endDate: '2026-10-16' }}
  delivery={{ startDate: '2026-10-19', endDate: '2026-10-23' }}
  holidays={feriados}
/>
