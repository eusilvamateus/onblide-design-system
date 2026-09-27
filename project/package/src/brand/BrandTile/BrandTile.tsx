import React from 'react';
import { Brands, BrandKey } from '../Brands/Brands';

export interface BrandTileProps {
  /** Chave da marca a exibir, conforme o catálogo `Brands`. */
  brand: BrandKey;
  /** Tamanho do lado da moldura quadrada, em px. */
  size?: number;
}

// Moldura que emoldura a marca — mantém um fundo claro constante nos dois
// temas para que marcas escuras (GitHub, Notion) continuem legíveis.
/** Moldura quadrada com fundo claro fixo que exibe o logotipo de uma marca. */
export const BrandTile: React.FC<BrandTileProps> = ({ brand, size = 44 }) => {
  const b = Brands[brand];
  if (!b) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 11, background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
    }}>
      {b.mark(Math.round(size * 0.56))}
    </div>
  );
};
