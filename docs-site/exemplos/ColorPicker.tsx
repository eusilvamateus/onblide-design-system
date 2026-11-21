import { useState } from 'react';
import { ColorPicker } from '@onblide/ui';

const caixa = { padding: 16 };

const MARCA = [
  { color: '#0a4ee4', label: 'Azul onblide' },
  { color: '#c2410c', label: 'Terracota' },
  { color: '#1f6f5c', label: 'Musgo' },
  { color: '#ca8a04', label: 'Mostarda' },
  { color: '#7c3aed', label: 'Violeta' },
  { color: '#be185d', label: 'Framboesa' },
  { color: '#1f1f1f', label: 'Grafite' },
  { color: '#faf9f5', label: 'Papel' },
];

export const Padrao = () => (
  <div style={caixa}>
    <ColorPicker defaultValue="#0a4ee4" />
  </div>
);

export const ComTransparencia = () => (
  <div style={caixa}>
    <ColorPicker defaultValue="#0a4ee4cc" alpha />
  </div>
);

export const Formas = () => (
  <div style={caixa}>
    <ColorPicker defaultValue="#1f6f5c" modes={['grid', 'spectrum', 'sliders']} />
  </div>
);

export const ComAmostras = () => (
  <div style={caixa}>
    <ColorPicker defaultValue="#c2410c" swatches={MARCA} />
  </div>
);

export const AmostrasQuadradas = () => (
  <div style={caixa}>
    <ColorPicker defaultValue="#1f6f5c" swatches={MARCA} swatchesOnly swatchShape="square" />
  </div>
);

export const SoAmostras = () => (
  <div style={caixa}>
    <ColorPicker defaultValue="#1f6f5c" swatches={MARCA} swatchesOnly />
  </div>
);

export const AoTerminar = () => {
  const [cor, setCor] = useState('#0a4ee4');
  const [salvo, setSalvo] = useState('nada ainda');
  return (
    <div style={{ ...caixa, display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)' }}>
      <ColorPicker value={cor} onChange={setCor} onChangeEnd={(v) => setSalvo(v ?? 'sem cor')} />
      <span style={{ fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-mute)' }}>Salvo: {salvo}</span>
    </div>
  );
};
