import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { ACTION_TONES, type ActionTone } from '../../internal/actionTones';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'onToggle'> {
  /** Texto ou conteúdo exibido no chip. */
  label: React.ReactNode;
  /** Marca o chip como selecionado, aplicando o estilo preenchido. Passar `selected` (ou `onToggle`) faz do chip uma alternância, anunciada como pressionada ou não; sem nenhum dos dois ele é um botão de ação simples. */
  selected?: boolean;
  /** Chamado ao clicar ou ativar o chip por teclado. */
  onToggle?: () => void;
  /** Exibe o botão de remoção (✕) ao final do chip. */
  removable?: boolean;
  /** Chamado ao clicar no botão de remoção. */
  onRemove?: () => void;
  /** Nome do ícone Phosphor (sem o prefixo "ph-"), ex.: "check". */
  icon?: string;
  /** Cor do chip: com um tom diferente de `neutral` o chip tem fundo leve e texto no tom, e selecionado fica preenchido com a cor forte do mesmo tom. */
  tone?: ActionTone;
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
  label, selected, onToggle, removable = false, onRemove, icon, tone = 'neutral', size = 'md', disabled = false,
  className, style, onClick, onKeyDown, onFocus, onBlur, ...rest
}) => {
  const escala = ESCALA[size];
  const [comFoco, setComFoco] = React.useState(false);
  const ligado = selected === true;
  const alternancia = selected !== undefined || onToggle !== undefined;
  const tom = ACTION_TONES[tone];

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
  const corForte = tone === 'neutral' ? 'var(--ob-blue)' : tom.fg;
  const stateStyle: React.CSSProperties = ligado
    ? { background: corForte, color: 'var(--ob-fg-on-color)', borderColor: corForte }
    : tone === 'neutral'
      ? { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', borderColor: 'var(--ob-border)' }
      : { background: tom.bg, color: tom.fg, borderColor: `color-mix(in srgb, ${tom.fg} 35%, transparent)` };

  return (
    <span
      {...rest}
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={alternancia ? ligado : undefined}
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
      onFocus={e => { setComFoco(e.currentTarget === e.target && e.currentTarget.matches(':focus-visible')); onFocus?.(e); }}
      onBlur={e => { setComFoco(false); onBlur?.(e); }}
      style={{ ...base, ...stateStyle, ...(comFoco ? { boxShadow: '0 0 0 3px var(--ob-focus-ring)' } : null), ...style }}
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
            background: ligado ? 'color-mix(in srgb, var(--ob-fg-on-color) 25%, transparent)' : tone === 'neutral' ? 'var(--ob-bg-warm)' : `color-mix(in srgb, ${tom.fg} 15%, transparent)`,
            color: ligado ? 'var(--ob-fg-on-color)' : tone === 'neutral' ? 'var(--ob-fg-soft)' : tom.fg,
            fontSize: escala.iconeDoBotao, fontWeight: 700, lineHeight: 1, flexShrink: 0,
          }}
        ><Ph n="x" size={escala.iconeDoBotao} weight="bold" /></button>
      )}
    </span>
  );
};
