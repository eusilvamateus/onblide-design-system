import React, { useRef, useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

/** Tamanho das células: `sm`, `md` e `lg`. As células ficam maiores que um campo comum do mesmo tamanho, para o código ser lido de relance. */
export type CodeInputSize = 'sm' | 'md' | 'lg';

interface EscalaDaCelula { largura: number; altura: number; fonte: string; espaco: string }

const ESCALA_DA_CELULA: Record<CodeInputSize, EscalaDaCelula> = {
  sm: { largura: 40, altura: 48, fonte: 'var(--ob-fs-18)', espaco: 'var(--ob-space-8)' },
  md: { largura: 48, altura: 56, fonte: 'var(--ob-fs-22)', espaco: 'var(--ob-space-10)' },
  lg: { largura: 56, altura: 64, fonte: 'var(--ob-fs-28)', espaco: 'var(--ob-space-12)' },
};

export interface CodeInputProps {
  /** Quantidade de células (dígitos) exibidas pelo campo. */
  length?: number;
  /** Código atual, como string de dígitos (uma posição por célula). */
  value?: string;
  /** Chamado com o novo valor sempre que um dígito é digitado, apagado ou colado. */
  onChange?: (value: string) => void;
  /** Estado visual do campo: padrão, erro (com animação de shake) ou sucesso. Só aparece depois que todas as células estão preenchidas. */
  status?: 'default' | 'error' | 'success';
  /** Tamanho das células, que ajusta largura, altura, fonte e o espaço entre elas. */
  size?: CodeInputSize;
}

/** Campo de verificação por código (OTP), com uma célula por dígito, navegação por teclado e suporte a colar. */
export const CodeInput: React.FC<CodeInputProps> = ({ length = 6, value = '', onChange, status = 'default', size = 'md' }) => {
  const celula = ESCALA_DA_CELULA[size];
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [ativo, setAtivo] = useState<number | null>(null);
  const vals = value.split('');
  const completo = vals.filter(Boolean).length >= length;
  const situacao = completo ? status : 'default';
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
  const bordaDe = (filled: boolean, focado: boolean) =>
    situacao === 'error' ? 'var(--ob-danger)' : situacao === 'success' ? 'var(--ob-green)' : focado || filled ? 'var(--ob-blue)' : 'var(--ob-border)';
  const fundoDe = (focado: boolean) =>
    situacao === 'error' ? 'var(--ob-danger-bg)' : situacao === 'success' ? 'var(--ob-success-bg)' : focado ? 'var(--ob-blue-050)' : 'var(--ob-surface)';
  return (
    <div style={{ display: 'inline-flex', gap: celula.espaco, animation: situacao === 'error' ? 'ob-shake var(--ob-dur-slow) var(--ob-ease)' : 'none' }} onPaste={paste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} inputMode="numeric" maxLength={1}
          value={vals[i] || ''} onChange={e => set(i, e.target.value.replace(/\D/g, ''))} onKeyDown={e => keyDown(i, e)}
          onFocus={e => { setAtivo(i); e.target.select(); }} onBlur={() => setAtivo(null)}
          style={{
            width: celula.largura, height: celula.altura, textAlign: 'center', fontFamily: 'var(--ob-font-mono)', fontSize: celula.fonte, fontWeight: 'var(--ob-w-bold)',
            borderRadius: 'var(--ob-r-md)', caretColor: 'var(--ob-blue)', outline: 'none', boxSizing: 'border-box',
            color: situacao === 'error' ? 'var(--ob-danger)' : situacao === 'success' ? 'var(--ob-green-700)' : 'var(--ob-fg-strong)',
            background: fundoDe(ativo === i), border: `2px solid ${bordaDe(!!vals[i], ativo === i)}`,
            boxShadow: ativo === i && situacao === 'default' ? '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)' : 'none',
            transform: ativo === i ? 'translateY(-2px)' : 'none',
            transition: 'border-color var(--ob-dur-fast) var(--ob-ease), box-shadow var(--ob-dur-fast) var(--ob-ease), background var(--ob-dur-fast) var(--ob-ease), transform var(--ob-dur-fast) var(--ob-ease)',
          }} />
      ))}
    </div>
  );
};

injectStyleOnce(
  'ob-shake-kf',
  '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}',
);
