import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'onToggle'> {
  /** Texto ou conteúdo exibido no chip. */
  label: React.ReactNode;
  /** Marca o chip como selecionado, aplicando o estilo preenchido. */
  selected?: boolean;
  /** Chamado ao clicar ou ativar o chip por teclado. */
  onToggle?: () => void;
  /** Exibe o botão de remoção (✕) ao final do chip. */
  removable?: boolean;
  /** Chamado ao clicar no botão de remoção. */
  onRemove?: () => void;
  /** Nome do ícone Phosphor (sem o prefixo "ph-"), ex.: "check". */
  icon?: string;
  /** Tamanho do texto e do espaçamento interno. */
  size?: 'sm' | 'md' | 'lg';
  /** Desabilita interações e reduz a opacidade. */
  disabled?: boolean;
}

interface EscalaDoChip {
  fonte: number;
  padding: string;
  paddingRemovivel: string;
  gap: number;
  icone: number;
  pesoDoIcone: 'bold' | 'regular';
  botao: number;
  iconeDoBotao: number;
}

const ESCALA: Record<NonNullable<ChipProps['size']>, EscalaDoChip> = {
  sm: { fonte: 12, padding: '5px 10px', paddingRemovivel: '5px 6px 5px 10px', gap: 5, icone: 13, pesoDoIcone: 'bold', botao: 16, iconeDoBotao: 10 },
  md: { fonte: 13, padding: '7px 14px', paddingRemovivel: '7px 8px 7px 14px', gap: 6, icone: 15, pesoDoIcone: 'regular', botao: 18, iconeDoBotao: 11 },
  lg: { fonte: 15, padding: '10px 18px', paddingRemovivel: '10px 10px 10px 18px', gap: 8, icone: 18, pesoDoIcone: 'regular', botao: 22, iconeDoBotao: 13 },
};

/** Elemento compacto e interativo para seleção, filtro ou remoção de itens. */
export const Chip: React.FC<ChipProps> = ({
  label, selected = false, onToggle, removable = false, onRemove, icon, size = 'md', disabled = false,
  className, style, onClick, onKeyDown, ...rest
}) => {
  const escala = ESCALA[size];

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: escala.gap,
    padding: removable ? escala.paddingRemovivel : escala.padding,
    borderRadius: 999, fontSize: escala.fonte, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', userSelect: 'none',
    opacity: disabled ? 0.45 : 1,
    border: '1.5px solid',
    outline: 'none',
    fontFamily: 'var(--ob-font)',
  };
  const stateStyle: React.CSSProperties = selected
    ? { background: 'var(--ob-blue)', color: 'var(--ob-fg-on-color)', borderColor: 'var(--ob-blue)' }
    : { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', borderColor: 'var(--ob-border)' };

  return (
    <span
      {...rest}
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={e => {
        if (disabled) return;
        onClick?.(e);
        if (!e.defaultPrevented) onToggle?.();
      }}
      onKeyDown={e => {
        onKeyDown?.(e);
        if (!disabled && !e.defaultPrevented && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
      style={{ ...base, ...stateStyle, ...style }}
    >
      {icon && <Ph n={icon} size={escala.icone} weight={escala.pesoDoIcone} />}
      {label}
      {removable && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); if (!disabled) onRemove?.(); }}
          aria-label={`Remover ${typeof label === 'string' ? label : ''}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: escala.botao, height: escala.botao,
            boxSizing: 'border-box', margin: 0, padding: 0, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: selected ? 'color-mix(in srgb, var(--ob-fg-on-color) 25%, transparent)' : 'var(--ob-bg-warm)',
            color: selected ? 'var(--ob-fg-on-color)' : 'var(--ob-fg-soft)',
            fontSize: escala.iconeDoBotao, fontWeight: 700, lineHeight: 1, flexShrink: 0,
          }}
        ><Ph n="x" size={escala.iconeDoBotao} weight="bold" /></button>
      )}
    </span>
  );
};
