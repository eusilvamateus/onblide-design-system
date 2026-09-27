// Ponto de partida da demo interativa do Breadcrumbs: o elemento <Breadcrumbs> abaixo define os valores iniciais dos controles.

const caminho = [
  { icon: 'house', ariaLabel: 'Início' },
  { label: 'Clientes' },
  { label: 'Padaria Estrela' },
  { label: 'Campanha de fim de ano' },
];

<Breadcrumbs
  items={caminho}
  maxItems={4}
/>
