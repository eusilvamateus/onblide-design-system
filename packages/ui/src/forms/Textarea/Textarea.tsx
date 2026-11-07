import React from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Ph } from '../../iconography/Ph/Ph';
import { useBarrasDeRolagem } from '../../internal/barrasDeRolagem';

const LINE_HEIGHT = 20;
const PAD_Y = 10;
const ALCA = 16;
const LARGURA_MINIMA = 160;

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

const ICONE_DA_ALCA: Record<Exclude<TextareaResize, 'none'>, string> = {
  vertical: 'arrows-vertical',
  horizontal: 'arrows-horizontal',
  both: 'arrows-out-simple',
};

const CURSOR_DA_ALCA: Record<Exclude<TextareaResize, 'none'>, string> = {
  vertical: 'ns-resize',
  horizontal: 'ew-resize',
  both: 'nwse-resize',
};

export interface TextareaProps {
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio abaixo do campo; some quando `error` está presente. */
  hint?: React.ReactNode;
  /** Mensagem de erro exibida abaixo do campo, que deixa a borda vermelha. */
  error?: React.ReactNode;
  /** Texto atual, em modo controlado. */
  value?: string;
  /** Texto inicial, em modo não controlado. */
  defaultValue?: string;
  /** Chamado com o texto a cada alteração. */
  onChange?: (value: string) => void;
  /** Texto exibido enquanto o campo está vazio. */
  placeholder?: string;
  /** Altura inicial em linhas, quando `autosize` está desligado. */
  rows?: number;
  /** Cresce e encolhe com o conteúdo, entre `minRows` e `maxRows`. */
  autosize?: boolean;
  /** Altura mínima em linhas; também é o menor tamanho ao redimensionar. */
  minRows?: number;
  /** Altura máxima em linhas com `autosize`; acima dela o texto rola. */
  maxRows?: number;
  /** Limite rígido de caracteres. */
  maxLength?: number;
  /** Mostra o contador `usados / limite`; ligado automaticamente quando há `maxLength`. */
  counter?: boolean;
  /** Direções em que a pessoa pode redimensionar o campo pela alça no canto: `vertical`, `horizontal`, `both` ou `none`. Ignorado com `autosize`, `disabled` ou `readOnly`. */
  resize?: TextareaResize;
  /** Slot de ações dentro do campo, abaixo do texto. */
  footer?: React.ReactNode;
  /** Bloqueia a edição e reduz a opacidade do campo. */
  disabled?: boolean;
  /** Mostra o texto sem permitir edição, com fundo diferenciado. */
  readOnly?: boolean;
  /** Largura inicial do campo. */
  width?: number | string;
  /** Nome acessível quando não há `label` visível. */
  ariaLabel?: string;
}

/** Campo de texto de várias linhas, com contador de caracteres, altura fixa ou autoajustável e alça para redimensionar. */
export const Textarea: React.FC<TextareaProps> = ({
  label, hint, error, value: valueProp, defaultValue = '', onChange, placeholder, rows = 3,
  autosize = false, minRows = 2, maxRows = 8, maxLength, counter, resize = 'vertical', footer,
  disabled = false, readOnly = false, width, ariaLabel,
}) => {
  const [val, setVal] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : val;
  const [focused, setFocused] = React.useState(false);
  const [tamanho, setTamanho] = React.useState<{ altura?: number; largura?: number }>({});
  const raiz = React.useRef<HTMLDivElement>(null);
  const arrasto = React.useRef<{ x: number; y: number; altura: number; largura: number; maximo: number } | null>(null);
  const uid = React.useId();
  const showCounter = counter ?? maxLength != null;
  const alca = resize !== 'none' && !autosize && !disabled && !readOnly ? resize : null;
  const alturaMinima = minRows * LINE_HEIGHT + PAD_Y * 2;
  const { alvo, aoRolar, ativa, barras } = useBarrasDeRolagem<HTMLTextAreaElement>('vertical', alca ? ALCA : 0);

  React.useLayoutEffect(() => {
    const el = alvo.current;
    if (!autosize || !el) return;
    const max = maxRows * LINE_HEIGHT + PAD_Y * 2;
    el.style.height = 'auto';
    const h = Math.min(max, Math.max(alturaMinima, el.scrollHeight));
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, autosize, alturaMinima, maxRows, alvo]);

  const comecarRedimensionar = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = alvo.current, caixa = raiz.current;
    if (!el || !caixa || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = {
      x: e.clientX, y: e.clientY, altura: el.offsetHeight, largura: caixa.offsetWidth,
      maximo: caixa.parentElement ? caixa.parentElement.clientWidth : Infinity,
    };
  };

  const redimensionar = (e: React.PointerEvent<HTMLSpanElement>) => {
    const a = arrasto.current;
    if (!a || !alca) return;
    setTamanho((atual) => ({
      altura: alca === 'horizontal' ? atual.altura : Math.max(alturaMinima, Math.round(a.altura + e.clientY - a.y)),
      largura: alca === 'vertical' ? atual.largura : Math.min(a.maximo, Math.max(LARGURA_MINIMA, Math.round(a.largura + e.clientX - a.x))),
    }));
  };

  const terminarRedimensionar = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    arrasto.current = null;
  };

  const len = value.length;
  const full = maxLength != null && len >= maxLength;
  const near = maxLength != null && len >= maxLength * 0.9;
  const describe = [hint || error ? `${uid}-h` : null, showCounter ? `${uid}-c` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div ref={raiz} style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)', width: tamanho.largura ?? (width || '100%'), maxWidth: '100%',
      fontFamily: 'var(--ob-font)',
    }}>
      {label && <label htmlFor={uid} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell focused={focused} error={!!error} disabled={disabled} padding="0" minHeight={0}
        style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, overflow: 'hidden', background: readOnly && !disabled ? 'var(--ob-bg-alt)' : undefined }}>
        <div className="ob-sa" data-visibilidade="hover" data-ativa={ativa ? '' : undefined} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <textarea id={uid} ref={alvo} className="ob-sa-alvo" value={value} placeholder={placeholder} rows={autosize ? minRows : rows} maxLength={maxLength} disabled={disabled} readOnly={readOnly}
            aria-invalid={error ? true : undefined} aria-describedby={describe} aria-label={label ? undefined : ariaLabel}
            onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onScroll={aoRolar}
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 14, lineHeight: `${LINE_HEIGHT}px`, color: 'var(--ob-fg-strong)', padding: `${PAD_Y}px 14px`,
              resize: 'none', minHeight: alturaMinima, height: autosize ? undefined : tamanho.altura, cursor: disabled ? 'not-allowed' : 'text',
            }} />
          {barras}
          {alca && (
            <span aria-hidden="true" data-alca={alca}
              onPointerDown={comecarRedimensionar} onPointerMove={redimensionar} onPointerUp={terminarRedimensionar} onPointerCancel={terminarRedimensionar}
              style={{
                position: 'absolute', right: 0, bottom: 0, width: ALCA, height: ALCA, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ob-fg-mute)', cursor: CURSOR_DA_ALCA[alca], touchAction: 'none', userSelect: 'none',
              }}>
              <Ph n={ICONE_DA_ALCA[alca]} size={10} weight="bold" style={alca === 'both' ? { transform: 'rotate(90deg)' } : undefined} />
            </span>
          )}
        </div>
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
