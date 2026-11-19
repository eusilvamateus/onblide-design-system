import React from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Ph } from '../../iconography/Ph/Ph';
import { FieldAddon, FieldIcon, focoNoAddon, recuoDoIcone, temConteudo } from '../../internal/FieldAddon';
import { ESCALA_DE_CAMPO, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

const numberFormat = (n: number | null | undefined, decimals: number, group = true): string =>
  n == null || Number.isNaN(n) ? '' : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: group }).format(n);

const numberParse = (s: string): number | null => {
  const t = s.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (t === '' || t === '-' || t === ',') return null;
  return Number(t);
};

const round = (n: number, decimals: number) => Math.round(n * 10 ** decimals) / 10 ** decimals;

export type NumberFieldControls = 'split' | 'stacked' | 'none';
export type NumberFieldAlign = 'left' | 'center' | 'right';
/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. */
export type NumberFieldSize = TamanhoDeCampo;

const LARGURA_DO_EMPILHADO: Record<NumberFieldSize, number> = { sm: 24, md: 28, lg: 32 };

export interface NumberFieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Passo do PageUp/PageDown; padrão `step × 10`. */
  largeStep?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Estilo dos botões de incrementar/decrementar. */
  controls?: NumberFieldControls;
  /** Ajusta o valor ao limite ao sair do campo; com `false`, mantém o valor digitado e mostra erro. */
  clamp?: boolean;
  align?: NumberFieldAlign;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  width?: number | string;
  /** Tamanho do campo, que ajusta altura, fonte, recuo e os botões de incrementar e decrementar. */
  size?: NumberFieldSize;
  ariaLabel?: string;
  /** Conteúdo no início do campo, dentro da mesma borda e separado por uma divisória: texto, `Select` com `embedded` ou botão compacto. */
  startAddon?: React.ReactNode;
  /** Conteúdo no fim do campo, dentro da mesma borda e separado por uma divisória: texto, `Select` com `embedded` ou botão compacto. */
  endAddon?: React.ReactNode;
  /** Ícone ou botão compacto antes do número, dentro da mesma borda e sem divisória, depois do botão de diminuir. Um `Button` com `iconOnly` e `size="sm"` se ajusta ao tamanho do campo. */
  startIcon?: React.ReactNode;
  /** Ícone ou botão compacto depois do número, dentro da mesma borda e sem divisória, antes dos botões de incrementar. Um `Button` com `iconOnly` e `size="sm"` se ajusta ao tamanho do campo. */
  endIcon?: React.ReactNode;
}

const btnBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent',
  color: 'var(--ob-fg-mute)', cursor: 'pointer', padding: 0, flex: 'none', transition: 'background var(--ob-dur-fast) var(--ob-ease), color var(--ob-dur-fast) var(--ob-ease)',
};

/** Campo numérico com incremento/decremento, limites, passo e formato pt-BR (vírgula decimal). */
export const NumberField: React.FC<NumberFieldProps> = ({
  label, hint, error, value: valueProp, defaultValue = null, onChange, min = -Infinity, max = Infinity,
  step = 1, largeStep, decimals = 0, prefix, suffix, controls = 'split', clamp = true, align, disabled = false,
  readOnly = false, placeholder, width, size = 'md', ariaLabel, startAddon, endAddon, startIcon, endIcon,
}) => {
  const escala = ESCALA_DE_CAMPO[size];
  const [val, setVal] = React.useState<number | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : val;
  const [text, setText] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [addonFocused, setAddonFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const uid = React.useId();
  const live = React.useRef({ value, text, focused });
  live.current = { value, text, focused };
  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (n: number | null) => { setVal(n); onChange?.(n); };
  const limit = (n: number) => Math.min(max, Math.max(min, n));
  const current = (): number | null => {
    const { value: v, text: t, focused: f } = live.current;
    const p = f ? numberParse(t) : v;
    return p == null || Number.isNaN(p) ? null : p;
  };
  const setTo = (n: number) => {
    const rounded = round(limit(n), decimals);
    commit(rounded);
    if (live.current.focused) setText(numberFormat(rounded, decimals, false));
    live.current.value = rounded; live.current.text = numberFormat(rounded, decimals, false);
  };
  const stepBy = (d: number) => {
    const c = current();
    setTo(c == null ? (d > 0 ? Math.max(min, Number.isFinite(min) ? min : 0) : Math.min(max, Number.isFinite(max) ? max : 0)) : c + d);
  };
  const finish = () => {
    const n = numberParse(text);
    if (n === null) commit(null);
    else if (!Number.isNaN(n)) commit(clamp ? round(limit(n), decimals) : round(n, decimals));
  };

  const locked = disabled || readOnly;
  const cur = current();
  const atMin = cur != null && cur <= min, atMax = cur != null && cur >= max;
  const outOfRange = value != null && (value < min || value > max);
  const rangeMsg = Number.isFinite(min) && Number.isFinite(max) ? `Use um valor entre ${numberFormat(min, decimals)} e ${numberFormat(max, decimals)}`
    : Number.isFinite(min) ? `O mínimo é ${numberFormat(min, decimals)}` : `O máximo é ${numberFormat(max, decimals)}`;
  const err = error || (outOfRange && !focused ? rangeMsg : null);

  const hold = (d: number) => (e: React.PointerEvent) => {
    if (locked || e.button > 0) return;
    e.preventDefault();
    stepBy(d);
    const rep = (delay: number) => { timer.current = setTimeout(() => { stepBy(d); rep(60); }, delay); };
    rep(400);
    const stop = () => { clearTimeout(timer.current); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); };
    window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;
    const big = largeStep ?? step * 10, k = e.key, m = e.shiftKey ? 10 : 1;
    if (k === 'ArrowUp') { e.preventDefault(); stepBy(step * m); }
    else if (k === 'ArrowDown') { e.preventDefault(); stepBy(-step * m); }
    else if (k === 'PageUp') { e.preventDefault(); stepBy(big); }
    else if (k === 'PageDown') { e.preventDefault(); stepBy(-big); }
    else if (k === 'Home' && Number.isFinite(min)) { e.preventDefault(); setTo(min); }
    else if (k === 'End' && Number.isFinite(max)) { e.preventDefault(); setTo(max); }
    else if (k === 'Enter') {
      finish();
      const n = numberParse(text);
      if (n != null && !Number.isNaN(n)) setText(numberFormat(clamp ? limit(round(n, decimals)) : round(n, decimals), decimals, false));
    }
  };

  const btn = (d: number, name: string, lbl: string, extra: React.CSSProperties) => (
    <button type="button" tabIndex={-1} aria-label={lbl} aria-controls={uid} disabled={locked || (d < 0 ? atMin : atMax)} onPointerDown={hold(d)}
      style={{ ...btnBase, ...extra, cursor: locked || (d < 0 ? atMin : atMax) ? 'not-allowed' : 'pointer', opacity: !locked && (d < 0 ? atMin : atMax) ? 'var(--ob-opacity-disabled)' : 1 }}>
      <Ph n={name} size={controls === 'stacked' ? 12 : escala.icone - 2} c="currentColor" weight={controls === 'stacked' ? 'bold' : undefined} />
    </button>
  );
  const adorn = (t?: string) => t != null && <span style={{ fontSize: escala.fonte, color: 'var(--ob-fg-mute)', flex: 'none', whiteSpace: 'nowrap' }}>{t}</span>;
  const textAlign = align || (controls === 'split' ? 'center' : 'left');
  const shown = focused ? text : numberFormat(value, decimals);
  const temInicio = temConteudo(startAddon);
  const temFim = temConteudo(endAddon);
  const temIconeNoInicio = temConteudo(startIcon);
  const temIconeNoFim = temConteudo(endIcon);
  const emFoco = focused || addonFocused;
  const [padEsq, padDir] = controls === 'split' ? [escala.recuoDaAcao, escala.recuoDaAcao] : controls === 'stacked' ? [temIconeNoInicio ? recuoDoIcone(startIcon, size) : escala.recuo, '0'] : [temIconeNoInicio ? recuoDoIcone(startIcon, size) : escala.recuo, temIconeNoFim ? recuoDoIcone(endIcon, size) : escala.recuo];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)', width: width || '100%', fontFamily: 'var(--ob-font)' }}>
      {label && <label htmlFor={uid} style={{ fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell focused={emFoco} error={!!err} disabled={disabled} size={size}
        padding={`0 ${temFim ? 0 : padDir} 0 ${temInicio ? 0 : padEsq}`}
        onClick={(e) => { if (focoNoAddon(e.target)) inputRef.current?.focus(); }}
        style={{ gap: 'var(--ob-space-8)', overflow: temInicio || temFim ? 'visible' : 'hidden', background: readOnly && !disabled ? 'var(--ob-bg-alt)' : undefined, alignItems: controls === 'stacked' ? 'stretch' : 'center' }}>
        {temInicio && <FieldAddon side="start" size={size} focused={emFoco} error={!!err} onFocusChange={setAddonFocused}>{startAddon}</FieldAddon>}
        {controls === 'split' && btn(-step, 'minus', 'Diminuir', { width: escala.acao, height: escala.acao, borderRadius: 'var(--ob-r-sm)', alignSelf: 'center' })}
        {temIconeNoInicio && <FieldIcon size={size}>{startIcon}</FieldIcon>}
        <span style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', gap: 'var(--ob-space-6)', flex: 1, minWidth: 0, justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
          {adorn(prefix)}
          <input id={uid} ref={inputRef} role="spinbutton" inputMode={decimals > 0 || min < 0 ? 'decimal' : 'numeric'} autoComplete="off"
            aria-valuenow={value ?? undefined} aria-valuemin={Number.isFinite(min) ? min : undefined} aria-valuemax={Number.isFinite(max) ? max : undefined}
            aria-valuetext={value != null ? [prefix, numberFormat(value, decimals), suffix].filter(Boolean).join(' ') : undefined}
            aria-invalid={err ? true : undefined} aria-label={label ? undefined : ariaLabel}
            value={shown} placeholder={placeholder} disabled={disabled} readOnly={readOnly}
            onFocus={() => { setText(value == null ? '' : numberFormat(value, decimals, false)); setFocused(true); }}
            onBlur={() => { finish(); setFocused(false); }}
            onChange={(e) => setText(e.target.value.replace(/[^\d,.-]/g, ''))} onKeyDown={onKeyDown}
            style={{
              flex: textAlign === 'left' ? 1 : '0 1 auto', width: textAlign === 'left' ? 'auto' : `${Math.max(2, (shown || placeholder || '').length + 1)}ch`,
              minWidth: 0, maxWidth: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: escala.fonte,
              color: 'var(--ob-fg-strong)', padding: 0, alignSelf: 'stretch', textAlign, cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
            }} />
          {adorn(suffix)}
        </span>
        {temIconeNoFim && <FieldIcon size={size}>{endIcon}</FieldIcon>}
        {controls === 'split' && btn(step, 'plus', 'Aumentar', { width: escala.acao, height: escala.acao, borderRadius: 'var(--ob-r-sm)', alignSelf: 'center' })}
        {controls === 'stacked' && (
          <span style={{ display: 'flex', flexDirection: 'column', width: LARGURA_DO_EMPILHADO[size], flex: 'none', borderLeft: '1px solid var(--ob-border)' }}>
            {btn(step, 'caret-up', 'Aumentar', { flex: 1, width: '100%', borderBottom: '1px solid var(--ob-border)' })}
            {btn(-step, 'caret-down', 'Diminuir', { flex: 1, width: '100%' })}
          </span>
        )}
        {temFim && <FieldAddon side="end" size={size} focused={emFoco} error={!!err} onFocusChange={setAddonFocused}>{endAddon}</FieldAddon>}
      </FieldShell>
      {(hint || err) && <span style={{ fontSize: 'var(--ob-fs-11)', color: err ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{err || hint}</span>}
    </div>
  );
};
