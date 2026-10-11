import React, { useRef } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export interface CodeInputProps {
  /** Quantidade de células (dígitos) exibidas pelo campo. */
  length?: number;
  /** Código atual, como string de dígitos (uma posição por célula). */
  value?: string;
  /** Chamado com o novo valor sempre que um dígito é digitado, apagado ou colado. */
  onChange?: (value: string) => void;
  /** Estado visual do campo: padrão, erro (com animação de shake) ou sucesso. */
  status?: 'default' | 'error' | 'success';
}

/** Campo de verificação por código (OTP), com uma célula por dígito, navegação por teclado e suporte a colar. */
export const CodeInput: React.FC<CodeInputProps> = ({ length = 6, value = '', onChange, status = 'default' }) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const vals = value.split('');
  const set = (i: number, ch: string) => {
    const next = value.split(''); next[i] = ch;
    onChange?.(next.join('').slice(0, length));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };
  const keyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0)          refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const paste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, length);
    onChange?.(digits.join(''));
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };
  const borderFor = (filled: boolean) =>
    status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green)' : filled ? 'var(--ob-blue)' : 'var(--ob-border)';
  return (
    <div style={{ display: 'inline-flex', gap: 10, animation: status === 'error' ? 'ob-shake 0.4s' : 'none' }} onPaste={paste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} inputMode="numeric" maxLength={1}
          value={vals[i] || ''} onChange={e => set(i, e.target.value.replace(/\D/g, ''))} onKeyDown={e => keyDown(i, e)}
          style={{
            width: 48, height: 56, textAlign: 'center', fontFamily: 'var(--ob-font-mono)', fontSize: 22, fontWeight: 700,
            borderRadius: 'var(--ob-r-md)', caretColor: 'var(--ob-blue)', outline: 'none',
            color: status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green-700)' : 'var(--ob-fg-strong)',
            background: 'var(--ob-surface)', border: `2px solid ${borderFor(!!vals[i])}`,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { if (status === 'default') e.target.style.boxShadow = '0 0 0 4px var(--ob-focus-ring)'; }}
          onBlur={e => { e.target.style.boxShadow = 'none'; }} />
      ))}
    </div>
  );
};

injectStyleOnce(
  'ob-shake-kf',
  '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}',
);
