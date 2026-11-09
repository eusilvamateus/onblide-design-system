import React from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { ESCALA_DE_CAMPO, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

const LARGURA_MINIMA = 160;

/** Tamanho do campo, na mesma escala dos campos de uma linha: `sm`, `md` e `lg`. */
export type TextareaSize = TamanhoDeCampo;

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

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
  /** Direções em que a pessoa pode redimensionar o campo pela alça nativa do navegador: `vertical`, `horizontal`, `both` ou `none`. Ignorado com `autosize`, `disabled` ou `readOnly`. */
  resize?: TextareaResize;
  /** Slot de ações dentro do campo, abaixo do texto. */
  footer?: React.ReactNode;
  /** Bloqueia a edição e reduz a opacidade do campo. */
  disabled?: boolean;
  /** Mostra o texto sem permitir edição, com fundo diferenciado. */
  readOnly?: boolean;
  /** Largura inicial do campo. */
  width?: number | string;
  /** Tamanho do campo, que ajusta fonte, altura da linha e recuo interno. */
  size?: TextareaSize;
  /** Nome acessível quando não há `label` visível. */
  ariaLabel?: string;
}

/** Campo de texto de várias linhas, com contador de caracteres, altura fixa ou autoajustável e redimensionamento nativo. */
export const Textarea: React.FC<TextareaProps> = ({
  label, hint, error, value: valueProp, defaultValue = '', onChange, placeholder, rows = 3,
  autosize = false, minRows = 2, maxRows = 8, maxLength, counter, resize = 'vertical', footer,
  disabled = false, readOnly = false, width, size = 'md', ariaLabel,
}) => {
  const escala = ESCALA_DE_CAMPO[size];
  const linha = escala.linha;
  const recuoY = escala.recuoVertical;
  const [val, setVal] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : val;
  const [focused, setFocused] = React.useState(false);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const uid = React.useId();
  const showCounter = counter ?? maxLength != null;
  const redimensiona = autosize || disabled || readOnly ? 'none' : resize;
  const horizontal = redimensiona === 'horizontal' || redimensiona === 'both';
  const [larguraInicial, setLarguraInicial] = React.useState<number | null>(null);
  const larguraLivre = horizontal && larguraInicial !== null;

  React.useLayoutEffect(() => {
    if (!horizontal) { setLarguraInicial(null); return; }
    if (ref.current && larguraInicial === null) setLarguraInicial(ref.current.offsetWidth);
  }, [horizontal, larguraInicial]);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!autosize || !el) return;
    const min = minRows * linha + recuoY * 2, max = maxRows * linha + recuoY * 2;
    el.style.height = 'auto';
    const h = Math.min(max, Math.max(min, el.scrollHeight));
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, autosize, minRows, maxRows, linha, recuoY]);

  const len = value.length;
  const full = maxLength != null && len >= maxLength;
  const near = maxLength != null && len >= maxLength * 0.9;
  const describe = [hint || error ? `${uid}-h` : null, showCounter ? `${uid}-c` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)', width: larguraLivre ? 'fit-content' : width || '100%', maxWidth: '100%',
      fontFamily: 'var(--ob-font)',
    }}>
      {label && <label htmlFor={uid} style={{ fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell focused={focused} error={!!error} disabled={disabled} size={size} padding="0" minHeight={0}
        style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, overflow: 'hidden', background: readOnly && !disabled ? 'var(--ob-bg-alt)' : undefined }}>
        <textarea id={uid} ref={ref} value={value} placeholder={placeholder} rows={autosize ? minRows : rows} maxLength={maxLength} disabled={disabled} readOnly={readOnly}
          aria-invalid={error ? true : undefined} aria-describedby={describe} aria-label={label ? undefined : ariaLabel}
          onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            display: 'block', width: larguraLivre ? larguraInicial! : '100%', minWidth: horizontal ? LARGURA_MINIMA : undefined, maxWidth: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: escala.fonte, lineHeight: `${linha}px`, color: 'var(--ob-fg-strong)', padding: `var(--ob-space-${recuoY}) ${escala.recuo}`,
            scrollbarWidth: 'thin', scrollbarColor: 'var(--ob-scrollbar-thumb) transparent',
            resize: redimensiona, minHeight: minRows * linha + recuoY * 2, cursor: disabled ? 'not-allowed' : 'text',
          }} />
        {footer && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)', padding: 'var(--ob-space-6) var(--ob-space-8) var(--ob-space-8) var(--ob-space-10)' }}>{footer}</div>}
      </FieldShell>
      {(hint || error || showCounter) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ob-space-12)', fontSize: 'var(--ob-fs-11)', width: 0, minWidth: '100%' }}>
          <span id={`${uid}-h`} style={{ color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>
          {showCounter && (
            <span id={`${uid}-c`} aria-live={near ? 'polite' : 'off'} style={{
              flex: 'none', fontFamily: 'var(--ob-font-mono)',
              color: full ? 'var(--ob-danger)' : near ? 'var(--ob-warning)' : 'var(--ob-fg-mute)', fontWeight: full ? 'var(--ob-w-semibold)' : 'var(--ob-w-regular)',
            }}>{len}{maxLength != null ? ` / ${maxLength}` : ''}</span>
          )}
        </div>
      )}
    </div>
  );
};
