// Ponto de partida da demo interativa do RadioGroup: o elemento <RadioGroup> abaixo define os valores iniciais dos controles.

const planos = [
  { value: 'mensal', label: 'Plano mensal', description: 'R$ 49 por usuário, cancele quando quiser' },
  { value: 'anual', label: 'Plano anual', description: 'R$ 39 por usuário, cobrado uma vez por ano' },
  { value: 'equipe', label: 'Plano equipe', description: 'Sob consulta, com suporte dedicado', disabled: true },
];

<RadioGroup
  name="plano"
  value="anual"
  options={planos}
/>
