import React, { useEffect, useRef, useState } from 'react';

export type SliderValue = number | [number, number];
export type SliderTone = 'default' | 'success' | 'warning' | 'danger';

export interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  showValue?: boolean;
  marks?: boolean;
  tone?: SliderTone;
}

export interface SingleSliderProps extends SliderBaseProps {
  range?: false;
  value?: number;
  onChange?: (value: number) => void;
}

export interface RangeSliderProps extends SliderBaseProps {
  range: true;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
}

export type SliderProps = SingleSliderProps | RangeSliderProps;

// Forma frouxa (idêntica à SliderProps original), usada só dentro do corpo:
// a discriminação por `range` existe na API pública, não na implementação.
interface SliderLooseProps extends SliderBaseProps {
  range?: boolean;
  value?: SliderValue;
  onChange?: (value: SliderValue) => void;
}

type Thumb = 'lo' | 'hi';

export const Slider: React.FC<SliderProps> = (props) => {
  const {
    value, min = 0, max = 100, step = 1,
    onChange, label, hint, error, disabled = false,
    showValue = true, marks = false,
    tone = 'default',
    range = false,
  } = props as SliderLooseProps;
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<Thumb | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Listeners de arrasto ativos (no document). Se o componente desmontar no meio de
  // um arrasto, o `pointerup` nunca chega ao onUp e os listeners ficariam pendurados,
  // chamando valFromX com trackRef.current === null.
  const dragCleanups = useRef(new Set<() => void>());
  useEffect(() => () => { dragCleanups.current.forEach((limpar) => limpar()); }, []);

  const rangeValue = range ? (value as [number, number] | undefined) : undefined;
  const singleValue = !range ? (value as number | undefined) : undefined;
  const lo = range ? (rangeValue?.[0] ?? min) : (singleValue ?? min);
  const hi = range ? (rangeValue?.[1] ?? max) : null;

  const toneColor = tone === 'success' ? 'var(--ob-green)'
                  : tone === 'warning' ? 'var(--ob-orange)'
                  : tone === 'danger'  ? 'var(--ob-danger)'
                  : 'var(--ob-blue)';
  const toneRing  = tone === 'success' ? 'rgba(119,158,61,.28)'
                  : tone === 'warning' ? 'rgba(235,124,45,.28)'
                  : tone === 'danger'  ? 'rgba(214,54,54,.28)'
                  : 'var(--ob-focus-ring)';

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap  = (v: number) => Math.round((v - min) / step) * step + min;
  const pct   = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100);
  const fmt   = (v: number) => Number.isInteger(v) ? v : v.toFixed(1);

  const valFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return clamp(snap(min + ((clientX - rect.left) / rect.width) * (max - min)));
  };

  const applyVal = (which: Thumb, v: number) => {
    const cb = onChangeRef.current;
    if (!cb) return;
    if (!range) { cb(v); return; }
    if (which === 'lo') cb([Math.min(v, hi ?? max), hi ?? max]);
    else cb([lo, Math.max(v, lo)]);
  };

  const startDrag = (which: Thumb, e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    draggingRef.current = which;
    applyVal(which, valFromX(e.clientX));

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      applyVal(draggingRef.current, valFromX(ev.clientX));
    };
    const onUp = () => {
      draggingRef.current = null;
      dragCleanups.current.delete(onUp);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    dragCleanups.current.add(onUp);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  };

  const onKeyThumb = (which: Thumb) => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const delta = e.shiftKey ? step * 10 : step;
    const cur = which === 'hi' ? (hi ?? max) : lo;
    let next = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = clamp(cur + delta);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = clamp(cur - delta);
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    else return;
    e.preventDefault();
    applyVal(which, next);
  };

  const [loFocus, setLoFocus] = useState(false);
  const [hiFocus, setHiFocus] = useState(false);

  const thumbStyle = (val: number, focused: boolean): React.CSSProperties => ({
    position: 'absolute', top: '50%', left: `${pct(val)}%`,
    transform: 'translate(-50%, -50%)',
    width: 20, height: 20, borderRadius: '50%',
    background: 'var(--ob-surface)',
    border: `2px solid ${error ? 'var(--ob-danger)' : toneColor}`,
    boxShadow: focused
      ? `0 0 0 4px ${error ? 'rgba(214,54,54,.22)' : toneRing}, var(--ob-shadow-sm)`
      : 'var(--ob-shadow-sm)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: 'box-shadow .15s',
    zIndex: 2, outline: 'none',
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box',
    touchAction: 'none', userSelect: 'none',
  });

  const fillLeft  = range ? pct(lo) : 0;
  const fillRight = range ? 100 - pct(hi ?? max) : 100 - pct(lo);

  const stepCount = Math.round((max - min) / step);
  const markPositions = marks && stepCount <= 20
    ? Array.from({ length: stepCount + 1 }, (_, i) => min + i * step)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: disabled ? 0.6 : 1 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
          {showValue && (
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--ob-font-mono)', color: error ? 'var(--ob-danger)' : toneColor }}>
              {range ? `${fmt(lo)} – ${fmt(hi ?? max)}` : fmt(lo)}
            </span>
          )}
        </div>
      )}
      <div ref={trackRef}
        style={{ position: 'relative', height: 20, cursor: disabled ? 'not-allowed' : 'pointer', touchAction: 'none', userSelect: 'none' }}
        onClick={(e) => {
          if (disabled || draggingRef.current) return;
          const v = valFromX(e.clientX);
          if (!range) { onChange?.(v); return; }
          const mid = (lo + (hi ?? max)) / 2;
          onChange?.(v <= mid ? [clamp(snap(v)), hi ?? max] : [lo, clamp(snap(v))]);
        }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 5, transform: 'translateY(-50%)',
          background: 'var(--ob-bg-alt)', borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${fillLeft}%`, right: `${fillRight}%`,
            background: error ? 'var(--ob-danger)' : toneColor, borderRadius: 999,
          }}/>
        </div>
        {markPositions.map((v) => (
          <div key={v} style={{
            position: 'absolute', top: '50%', left: `${pct(v)}%`,
            width: 4, height: 4, borderRadius: '50%',
            background: v <= lo ? 'var(--ob-surface)' : 'var(--ob-fg-mute)',
            transform: 'translate(-50%, -50%)', opacity: 0.7, zIndex: 1, pointerEvents: 'none',
          }}/>
        ))}
        <div role="slider" tabIndex={disabled ? -1 : 0}
          aria-valuemin={min} aria-valuemax={max} aria-valuenow={lo}
          onPointerDown={(e) => { e.stopPropagation(); startDrag('lo', e); }}
          onKeyDown={onKeyThumb('lo')}
          onFocus={() => setLoFocus(true)} onBlur={() => setLoFocus(false)}
          style={thumbStyle(lo, loFocus)} />
        {range && (
          <div role="slider" tabIndex={disabled ? -1 : 0}
            aria-valuemin={min} aria-valuemax={max} aria-valuenow={hi ?? max}
            onPointerDown={(e) => { e.stopPropagation(); startDrag('hi', e); }}
            onKeyDown={onKeyThumb('hi')}
            onFocus={() => setHiFocus(true)} onBlur={() => setHiFocus(false)}
            style={thumbStyle(hi ?? max, hiFocus)} />
        )}
      </div>
      {marks && markPositions.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)' }}>{min}</span>
          <span style={{ fontSize: 10, color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)' }}>{max}</span>
        </div>
      )}
      {(hint || error) && (
        <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>
      )}
    </div>
  );
};
