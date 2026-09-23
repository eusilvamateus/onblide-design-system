// project/package/src/components/Select/Select.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import { Chip } from '../Chip/Chip';
import { FloatingPanel } from '../FloatingPanel/FloatingPanel';
import { Ph } from '../Ph/Ph';
import { FieldShell } from '../../primitives/FieldShell/FieldShell';

export interface SelectOption {
  label: string;
  [key: string]: unknown;
}

export interface SelectBaseProps {
  options?: (string | SelectOption)[];
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  error?: React.ReactNode;
  width?: number | string;
}

export interface SingleSelectProps extends SelectBaseProps {
  multi?: false;
  value?: string | null;
  onChange?: (value: string) => void;
}

export interface MultiSelectProps extends SelectBaseProps {
  multi: true;
  value?: string[] | null;
  onChange?: (value: string[]) => void;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

// Forma frouxa (idêntica à SelectProps original), usada só dentro do corpo:
// a discriminação por `multi` existe na API pública, não na implementação.
interface SelectLooseProps extends SelectBaseProps {
  multi?: boolean;
  value?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
}

export const Select: React.FC<SelectProps> = (props) => {
  const {
    options = [],
    value = null,
    onChange,
    multi = false,
    label,
    placeholder = 'Selecione…',
    disabled = false,
    error,
    width,
  } = props as SelectLooseProps;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // normaliza o valor
  const selected: string | string[] | null = multi
    ? (Array.isArray(value) ? value : [])
    : value;

  const getLabel = (o: string | SelectOption) => typeof o === 'string' ? o : o.label;

  const filtered = options.filter(o =>
    getLabel(o).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) setHighlighted(0);
  }, [open, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt: string | SelectOption) => {
    const lbl = getLabel(opt);
    if (multi) {
      const list = selected as string[];
      const next = list.includes(lbl)
        ? list.filter(s => s !== lbl)
        : [...list, lbl];
      onChange?.(next);
    } else {
      onChange?.(lbl);
      setOpen(false);
      setQuery('');
    }
  };

  const removeChip = (lbl: string) => onChange?.((selected as string[]).filter(s => s !== lbl));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && filtered[highlighted]) { e.preventDefault(); toggle(filtered[highlighted]); }
    if (e.key === 'Backspace' && multi && !query && (selected as string[]).length) {
      onChange?.((selected as string[]).slice(0, -1));
    }
  };

  const displayValue = !multi && selected && !open ? (selected as string) : '';

  return (
    <div ref={rootRef} style={{ position: 'relative', width: width || '100%', fontFamily: 'var(--ob-font)' }}>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: 6 }}>{label}</div>
      )}
      <FieldShell
        focused={open} error={!!error} disabled={disabled}
        padding={multi && (selected as string[]).length ? '6px 10px' : '0 12px'}
        onClick={() => { if (!disabled) { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 0); } }}
        style={{ flexWrap: 'wrap', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {/* Chips do modo multi — Chip real */}
        {multi && (selected as string[]).map(s => (
          <Chip key={s} label={s} size="sm" selected removable
            onToggle={() => {}} onRemove={() => removeChip(s)} />
        ))}
        <input
          ref={inputRef}
          value={open ? query : displayValue}
          placeholder={(!multi || !(selected as string[]).length) ? placeholder : ''}
          disabled={disabled}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => { if (!disabled) setOpen(true); }}
          style={{
            flex: 1, minWidth: 60, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: 'var(--ob-fg-strong)', cursor: disabled ? 'not-allowed' : 'text',
            padding: multi && (selected as string[]).length ? '0' : '0 2px', height: multi && (selected as string[]).length ? 26 : 40,
          }}
        />
        <Ph n="caret-down" size={16} c="var(--ob-fg-mute)"
          style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </FieldShell>

      {/* Dropdown */}
      {open && (
        <FloatingPanel maxHeight={240} padding={4}>
          {filtered.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ob-fg-mute)', textAlign: 'center' }}>
              Nenhuma opção encontrada
            </div>
          )}
          {filtered.map((opt, i) => {
            const lbl = getLabel(opt);
            const isSelected = multi ? (selected as string[]).includes(lbl) : selected === lbl;
            const isHigh = i === highlighted;
            return (
              <div key={lbl}
                onMouseDown={(e) => { e.preventDefault(); toggle(opt); }}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--ob-r-sm)', cursor: 'pointer',
                  fontSize: 14, fontWeight: (isSelected && !multi) ? 600 : 400,
                  color: (isSelected && !multi) ? 'var(--ob-blue-700)' : 'var(--ob-fg)',
                  background: isHigh ? 'var(--ob-bg-warm)' : (isSelected && !multi ? 'var(--ob-blue-100)' : 'transparent'),
                  transition: 'background 0.1s',
                }}>
                {multi ? (
                  /* Item de lista multi — Checkbox real */
                  <Checkbox checked={isSelected} onChange={() => {}} label={lbl} />
                ) : (
                  <>
                    <span>{lbl}</span>
                    {isSelected && <Ph n="check" size={15} c="var(--ob-blue)" />}
                  </>
                )}
              </div>
            );
          })}
        </FloatingPanel>
      )}

      {error && (
        <div style={{ fontSize: 12, color: 'var(--ob-danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Ph n="warning-circle" size={13} c="var(--ob-danger)" />
          {error}
        </div>
      )}
    </div>
  );
};
