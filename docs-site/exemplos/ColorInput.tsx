import { ColorInput } from '@onblide/ui';

const caixa = { padding: 16, minHeight: 110, maxWidth: 280 };

export const Padrao = () => (
  <div style={caixa}>
    <ColorInput label="Cor principal" hint="Botões, links e destaques" defaultValue="#0a4ee4" />
  </div>
);

export const Vazio = () => (
  <div style={caixa}>
    <ColorInput label="Cor do selo" hint="Opcional" />
  </div>
);

export const ComTransparencia = () => (
  <div style={caixa}>
    <ColorInput label="Faixa sobre as fotos" alpha defaultValue="#1f1f1fb3" />
  </div>
);

export const ComAmostras = () => (
  <div style={caixa}>
    <ColorInput
      label="Cor da etiqueta"
      defaultValue="#1f6f5c"
      modes={['grid', 'spectrum', 'sliders']}
      swatches={['#0a4ee4', '#c2410c', '#1f6f5c', '#ca8a04', '#7c3aed', '#be185d', '#1f1f1f', '#faf9f5']}
    />
  </div>
);

export const Tamanhos = () => (
  <div style={{ ...caixa, display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)' }}>
    <ColorInput size="sm" ariaLabel="Cor pequena" defaultValue="#0a4ee4" />
    <ColorInput size="md" ariaLabel="Cor média" defaultValue="#0a4ee4" />
    <ColorInput size="lg" ariaLabel="Cor grande" defaultValue="#0a4ee4" />
  </div>
);

export const ComErro = () => (
  <div style={caixa}>
    <ColorInput label="Texto sobre o fundo" defaultValue="#d4d4d4" error="Contraste baixo com o fundo branco" />
  </div>
);

export const Desabilitado = () => (
  <div style={caixa}>
    <ColorInput label="Cor principal" defaultValue="#0a4ee4" disabled />
  </div>
);
