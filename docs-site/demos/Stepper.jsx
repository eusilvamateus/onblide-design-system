// Ponto de partida da demo interativa do Stepper: o elemento <Stepper> abaixo define os valores iniciais dos controles.

const etapas = [
  { label: 'Escopo', hint: 'Entregáveis' },
  { label: 'Orçamento' },
  { label: 'Aprovação', optional: true },
  { label: 'Entrega' },
];

<Stepper
  steps={etapas}
  current={1}
/>
