import { Slider, Input, Button } from '@onblide/ui';

export const Simples = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Slider label="Orçamento mensal" value={60} min={0} max={100} showValue hint="Em milhares de reais" />
  </div>
);

export const Faixa = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Slider range label="Faixa de prazo (dias)" value={[10, 45]} min={0} max={90} step={5} marks showValue />
  </div>
);

export const Estados = () => (
  <div style={{ padding: 16, width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Slider label="Bloqueado" value={30} disabled showValue />
    <Slider label="Consumo" value={90} tone="danger" showValue error="Limite quase atingido" />
  </div>
);

export const PassoFracionado = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Slider
      label="Opacidade"
      hint="Valores de 0 a 10 em passos de 0,5"
      value={2.5}
      min={0}
      max={10}
      step={0.5}
      marks
      showValue
    />
  </div>
);

export const TonsSemanticos = () => (
  <div style={{ padding: 16, width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Slider label="Prioridade baixa" value={20} tone="success" showValue />
    <Slider label="Prioridade média" value={55} tone="warning" showValue />
    <Slider label="Prioridade crítica" value={90} tone="danger" showValue />
  </div>
);

export const ComposicaoFormulario = () => (
  <div style={{ padding: 16, width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Input label="Nome do projeto" placeholder="Ex: Campanha de verão" />
    <Slider label="Prioridade" value={65} tone="warning" showValue />
    <Button kind="primary">Salvar</Button>
  </div>
);
