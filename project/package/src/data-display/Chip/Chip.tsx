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
  size?: 'sm' | 'md';
  /** Desabilita interações e reduz a opacidade. */
  disabled?: boolean;
}

/** Elemento compacto e interativo para seleção, filtro ou remoção de itens. */
export const Chip: React.FC<ChipProps> = ({
  label, selected = false, onToggle, removable = false, onRemove, icon, size = 'md', disabled = false,
  className, style, onClick, onKeyDown, ...rest
}) => {
  const fs  = size === 'sm' ? 12 : 13;
  const pad = size === 'sm' ? '5px 10px' : '7px 14px';
  const gap = size === 'sm' ? 5 : 6;

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap,
    padding: removable ? (size === 'sm' ? '5px 6px 5px 10px' : '7px 8px 7px 14px') : pad,
    borderRadius: 999, fontSize: fs, fontWeight: 600,
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
      {icon && <Ph n={icon} size={size === 'sm' ? 13 : 15} weight={size === 'sm' ? 'bold' : 'regular'} />}
      {label}
      {removable && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); if (!disabled) onRemove?.(); }}
          aria-label={`Remover ${typeof label === 'string' ? label : ''}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: size === 'sm' ? 16 : 18, height: size === 'sm' ? 16 : 18,
            boxSizing: 'border-box', margin: 0, padding: 0, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: selected ? 'color-mix(in srgb, var(--ob-fg-on-color) 25%, transparent)' : 'var(--ob-bg-warm)',
            color: selected ? 'var(--ob-fg-on-color)' : 'var(--ob-fg-soft)',
            fontSize: size === 'sm' ? 10 : 11, fontWeight: 700, lineHeight: 1, flexShrink: 0,
          }}
        ><Ph n="x" size={size === 'sm' ? 10 : 11} weight="bold" /></button>
      )}
    </span>
  );
};
