import React from 'react';
import { FieldShell } from '../FieldShell/FieldShell';

const LINE_HEIGHT = 20;
const PAD_Y = 10;

export type TextareaResize = 'vertical' | 'none';

export interface TextareaProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Altura inicial em linhas, quando `autosize` está desligado. */
  rows?: number;
  /** Cresce e encolhe com o conteúdo, entre `minRows` e `maxRows`. */
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Limite rígido de caracteres. */
  maxLength?: number;
  /** Mostra o contador `usados / limite`; ligado automaticamente quando há `maxLength`. */
  counter?: boolean;
  resize?: TextareaResize;
  /** Slot de ações dentro do campo, abaixo do texto. */
  footer?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number | string;
  ariaLabel?: string;
}

/** Campo de texto de várias linhas, com contador de caracteres e altura fixa ou autoajustável. */
export const Textarea: React.FC<TextareaProps> = ({
  label, hint, error, value: valueProp, defaultValue = '', onChange, placeholder, rows = 3,
  autosize = false, minRows = 2, maxRows = 8, maxLength, counter, resize = 'vertical', footer,
  disabled = false, readOnly = false, width, ariaLabel,
}) => {
  const [val, setVal] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : val;
  const [focused, setFocused] = React.useState(false);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const uid = React.useId();
  const showCounter = counter ?? maxLength != null;

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!autosize || !el) return;
    const min = minRows * LINE_HEIGHT + PAD_Y * 2, max = maxRows * LINE_HEIGHT + PAD_Y * 2;
    el.style.height = 'auto';
    const h = Math.min(max, Math.max(min, el.scrollHeight));
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, autosize, minRows, maxRows]);

  const len = value.length;
  const full = maxLength != null && len >= maxLength;
  const near = maxLength != null && len >= maxLength * 0.9;
  const describe = [hint || error ? `${uid}-h` : null, showCounter ? `${uid}-c` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)', width: width || '100%', fontFamily: 'var(--ob-font)' }}>
      {label && <label htmlFor={uid} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell focused={focused} error={!!error} disabled={disabled} padding="0" minHeight={0}
        style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, overflow: 'hidden', background: readOnly && !disabled ? 'var(--ob-bg-alt)' : undefined }}>
        <textarea id={uid} ref={ref} value={value} placeholder={placeholder} rows={autosize ? minRows : rows} maxLength={maxLength} disabled={disabled} readOnly={readOnly}
          aria-invalid={error ? true : undefined} aria-describedby={describe} aria-label={label ? undefined : ariaLabel}
          onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            display: 'block', width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, lineHeight: `${LINE_HEIGHT}px`, color: 'var(--ob-fg-strong)', padding: `${PAD_Y}px 14px`,
            resize: autosize || disabled || readOnly ? 'none' : resize, minHeight: minRows * LINE_HEIGHT + PAD_Y * 2, cursor: disabled ? 'not-allowed' : 'text',
          }} />
        {footer && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)', padding: 'var(--ob-space-6) var(--ob-space-8) var(--ob-space-8) var(--ob-space-10)' }}>{footer}</div>}
      </FieldShell>
      {(hint || error || showCounter) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ob-space-12)', fontSize: 11 }}>
          <span id={`${uid}-h`} style={{ color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>
          {showCounter && (
            <span id={`${uid}-c`} aria-live={near ? 'polite' : 'off'} style={{
              flex: 'none', fontVariantNumeric: 'tabular-nums',
              color: full ? 'var(--ob-danger)' : near ? 'var(--ob-warning)' : 'var(--ob-fg-mute)', fontWeight: full ? 600 : 400,
            }}>{len}{maxLength != null ? ` / ${maxLength}` : ''}</span>
          )}
        </div>
      )}
    </div>
  );
};
