import { BrandTile } from '@onblide/ui';

export const Integracoes = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, flexWrap: 'wrap' }}>
    <BrandTile brand="slack" />
    <BrandTile brand="notion" />
    <BrandTile brand="figma" />
    <BrandTile brand="github" />
    <BrandTile brand="spotify" />
    <BrandTile brand="dropbox" />
    <BrandTile brand="discord" />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <BrandTile brand="slack" size={24} />
    <BrandTile brand="slack" size={40} />
    <BrandTile brand="slack" size={64} />
  </div>
);
