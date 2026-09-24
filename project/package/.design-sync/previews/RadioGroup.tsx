import { RadioGroup } from '@onblide/ui';

const planos = [
  { value: 'mensal', label: 'Plano mensal', description: 'R$ 49 por usuário, cancele quando quiser' },
  { value: 'anual', label: 'Plano anual', description: 'R$ 39 por usuário, cobrado uma vez por ano' },
  { value: 'equipe', label: 'Plano equipe', description: 'Sob consulta, com suporte dedicado', disabled: true },
];

export const Padrao = () => (
  <div style={{ padding: 16, width: 380 }}>
    <RadioGroup name="plano" options={planos} value="anual" />
  </div>
);

export const SemDescricao = () => (
  <div style={{ padding: 16, width: 380 }}>
    <RadioGroup name="prioridade" value="media" options={[
      { value: 'baixa', label: 'Baixa' },
      { value: 'media', label: 'Média' },
      { value: 'alta', label: 'Alta' },
    ]} />
  </div>
);
