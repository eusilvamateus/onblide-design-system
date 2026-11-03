import React from 'react';
import { Tooltip } from '../../overlays/Tooltip/Tooltip';
import { ToggleButton, type ToggleButtonAppearance } from '../ToggleButton/ToggleButton';
import type { ButtonKind, ButtonSize, ButtonTone } from '../Button/Button';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export type ButtonGroupJustify = 'start' | 'end' | 'between';
export type ButtonGroupSelection = 'single' | 'multiple';

export interface ButtonGroupProps {
  /** Anexado (padrão): os botões compartilham bordas, só as pontas arredondam. `false`: espaçados por `--ob-s-2`. */
  attached?: boolean;
  orientation?: ButtonGroupOrientation;
  /** Repassado a todo `Button` filho que não define o próprio `kind`. */
  kind?: ButtonKind;
  /** Repassado a todos os filhos. */
  size?: ButtonSize;
  /** Cor repassada a todo filho que não define o próprio `tone`. No `Button` só tem efeito no estilo `quiet`; no `ToggleButton` colore o estado pressionado. `neutral` não altera os `ToggleButton`. */
  tone?: ButtonTone;
  /** Repassado a todo `ToggleButton` filho que não define o próprio `appearance`: `outline` (com borda) ou `ghost` (sem borda). Não afeta `Button`, que usa `kind`. */
  appearance?: ToggleButtonAppearance;
  fullWidth?: boolean;
  /** Só com `attached={false}`. */
  justify?: ButtonGroupJustify;
  disabled?: boolean;
  /** Com `ToggleButton` filhos: `single` vira `radiogroup`, `multiple` vira um grupo de toggles independentes. */
  selection?: ButtonGroupSelection;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  /** `selection="single"`: permite desmarcar tudo (clicar no item já selecionado). */
  allowEmpty?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

type AnyElement = React.ReactElement<Record<string, unknown>>;

function leaf(el: AnyElement): AnyElement {
  if (el.props.trigger) return leaf(el.props.trigger as AnyElement);
  if (el.type === Tooltip) return leaf(React.Children.only(el.props.children) as AnyElement);
  return el;
}
function patch(el: AnyElement, extra: Record<string, unknown> & { style?: React.CSSProperties }): AnyElement {
  if (el.props.trigger) return React.cloneElement(el, { trigger: patch(el.props.trigger as AnyElement, extra) });
  if (el.type === Tooltip) return React.cloneElement(el, {}, patch(React.Children.only(el.props.children) as AnyElement, extra));
  return React.cloneElement(el, { ...extra, style: { ...(el.props.style as React.CSSProperties), ...extra.style } });
}

/** Agrupa `Button`/`ToggleButton` relacionados com bordas, cantos e espaçamento consistentes. */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children, orientation = 'horizontal', attached = true, kind, size, tone, appearance, fullWidth, disabled,
  selection, value, defaultValue, onChange, allowEmpty = false, ariaLabel, justify = 'start', style,
}) => {
  const multi = selection === 'multiple';
  const [inner, setInner] = React.useState<string | string[] | null>(defaultValue ?? (multi ? [] : null));
  const val = value ?? inner;
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const items = React.Children.toArray(children).filter(Boolean) as AnyElement[];
  const n = items.length;
  const vertical = orientation === 'vertical';

  const set = (next: string | string[] | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const pick = (itemVal: string, pressed: boolean) => {
    if (multi) set(pressed ? [...(val as string[]), itemVal] : (val as string[]).filter((x) => x !== itemVal));
    else if (pressed) set(itemVal);
    else if (allowEmpty) set(null);
  };

  const values = items.map((c) => leaf(c).props.value as string | undefined);
  const selIdx = Math.max(0, values.indexOf(val as string));

  const onKey = (i: number): React.KeyboardEventHandler<HTMLButtonElement> => (e) => {
    if (selection !== 'single') return;
    const keys = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const d = e.key === keys[0] ? -1 : e.key === keys[1] ? 1 : 0;
    if (!d) return;
    e.preventDefault();
    let j = i;
    for (let k = 0; k < n; k++) {
      j = (j + d + n) % n;
      if (!leaf(items[j]).props.disabled && !disabled) break;
    }
    refs.current[j]?.focus();
    set(values[j] ?? null);
  };

  const R = 'var(--ob-r-control)';
  const out = items.map((child, i) => {
    const lf = leaf(child);
    const isToggle = lf.type === ToggleButton;
    const k = isToggle ? null : ((lf.props.kind as ButtonKind | undefined) ?? kind ?? 'primary');
    const bordered = isToggle ? ((lf.props.appearance as string | undefined) ?? appearance ?? 'outline') === 'outline' : k === 'secondary';
    const first = i === 0, last = i === n - 1;
    const s: React.CSSProperties = {};
    if (attached && n > 1) {
      s.borderRadius = vertical
        ? `${first ? R : 0} ${first ? R : 0} ${last ? R : 0} ${last ? R : 0}`
        : `${first ? R : 0} ${last ? R : 0} ${last ? R : 0} ${first ? R : 0}`;
      if (!first) {
        if (bordered) s[vertical ? 'marginTop' : 'marginLeft'] = -1.5;
        else if (!isToggle) s[vertical ? 'borderTop' : 'borderLeft'] = '1px solid color-mix(in srgb, var(--ob-fg-on-color) 32%, transparent)';
      }
    }
    const wrapped = !!child.props.trigger;
    if (fullWidth && !wrapped) s.flex = 1;
    const extra: Record<string, unknown> & { style: React.CSSProperties } = { style: s };
    if (size) extra.size = size;
    if (disabled) extra.disabled = true;
    if (!isToggle && kind && !lf.props.kind) extra.kind = kind;
    if (tone && !lf.props.tone && !(isToggle && tone === 'neutral')) extra.tone = tone;
    if (isToggle && appearance && !lf.props.appearance) extra.appearance = appearance;
    if (isToggle && selection) {
      extra.pressed = multi ? (val as string[]).includes(lf.props.value as string) : val === lf.props.value;
      extra.onChange = (p: boolean) => pick(lf.props.value as string, p);
      if (selection === 'single') {
        extra._role = 'radio';
        extra._tabIndex = i === selIdx ? 0 : -1;
        extra.onKeyDown = onKey(i);
        extra._btnRef = (el: HTMLButtonElement | null) => { refs.current[i] = el; };
      }
    }
    if (wrapped) {
      return (
        <span
          key={i}
          data-bg-split=""
          style={{
            display: 'flex', alignItems: 'stretch', flex: fullWidth ? 1 : undefined,
            marginLeft: attached && !vertical && !first && bordered ? -1.5 : undefined,
            marginTop: attached && vertical && !first && bordered ? -1.5 : undefined,
          }}
        >
          {patch(child, { ...extra, style: { ...s, marginLeft: 0, marginTop: 0 } })}
        </span>
      );
    }
    return <React.Fragment key={i}>{patch(child, extra)}</React.Fragment>;
  });

  const role = selection === 'single' ? 'radiogroup' : attached || selection ? 'group' : undefined;
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', flexDirection: vertical ? 'column' : 'row',
        alignItems: 'stretch', gap: attached ? 0 : 'var(--ob-s-2)',
        justifyContent: { start: 'flex-start', end: 'flex-end', between: 'space-between' }[justify],
        width: fullWidth || (!attached && justify !== 'start') ? '100%' : undefined,
        ...style,
      }}
    >
      {out}
    </div>
  );
};

injectStyleOnce(
  'ob-buttongroup-split-css',
  '[data-bg-split]>*{display:flex!important;align-items:stretch}[data-bg-split]>*>span{display:flex!important;align-items:stretch}[data-bg-split]>*>span>button{height:auto!important;align-self:stretch}',
);
