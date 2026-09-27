// Ponto de partida da demo interativa do Timeline: o elemento <Timeline> abaixo define os valores iniciais dos controles.

const eventos = [
  { title: 'Pedido criado', time: '12/10 · 09:12', status: 'done' },
  { title: 'Em separação', time: '12/10 · 10:40', status: 'current' },
  { title: 'A caminho', status: 'pending' },
  { title: 'Entregue', status: 'pending' },
];

<Timeline
  items={eventos}
/>
