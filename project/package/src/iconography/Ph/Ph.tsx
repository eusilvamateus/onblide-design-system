import React from 'react';

/**
 * Pesos do Phosphor. Cada um tem um papel no design system:
 * `regular` é o padrão da interface; `fill` é o estado "ligado" (em par com `regular`);
 * `bold` dá legibilidade a ícones de até 14px ou sobre fundo sólido; `light` é para ícones grandes (32–48px);
 * `thin` só em momentos editoriais (64px+); `duotone` só em destaques ilustrativos, nunca em interface densa.
 */
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export interface PhProps {
  /** Nome do ícone do Phosphor, sem o prefixo "ph-" (ex.: "check" renderiza o glifo ph-check). */
  n: string;
  /** Tamanho do ícone em px. */
  size?: number;
  /** Cor do ícone; por padrão herda a cor do texto (`currentColor`). */
  c?: string;
  /** Peso do ícone; veja as regras de uso de cada peso em Fundações › Iconografia. */
  weight?: IconWeight;
  /** Estilos inline adicionais aplicados ao ícone. */
  style?: React.CSSProperties;
}

/** Renderiza um glifo do Phosphor via webfont, a partir do nome e do peso. */
export const Ph: React.FC<PhProps> = ({ n, size = 18, c, weight = 'regular', style }) => (
  <i
    className={`${weight === 'regular' ? 'ph' : `ph-${weight}`} ph-${n}`}
    aria-hidden="true"
    style={{
      fontSize: size,
      width: size,
      height: size,
      color: c || 'currentColor',
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
      ...style,
    }}
  />
);
