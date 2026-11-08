import React from 'react';
import checkFatFill from '@phosphor-icons/core/assets/fill/check-fat-fill.svg';
import minusBold from '@phosphor-icons/core/assets/bold/minus-bold.svg';
import { ESCALA_DE_ESCOLHA, TamanhoDeEscolha } from '../../internal/controlesDeEscolha';

export type CheckboxSize = TamanhoDeEscolha;

export interface CheckboxProps {
  /** Define se a caixa está marcada. */
  checked: boolean;
  /** Chamado com o novo valor sempre que o usuário alterna a marcação. */
  onChange?: (checked: boolean) => void;
  /** Texto ou conteúdo exibido ao lado da caixa. */
  label?: React.ReactNode;
  /** Bloqueia a interação e reduz a opacidade do componente. */
  disabled?: boolean;
  /** Exibe o traço de estado parcial, usado em "selecionar tudo". */
  indeterminate?: boolean;
  /** Texto de apoio exibido abaixo do label. */
  description?: React.ReactNode;
  /** Nome acessível quando não há `label` visível (ex.: seleção de linhas em tabela). */
  ariaLabel?: string;
  /** Tamanho da caixa e do texto: `sm` (16px), `md` (18px) ou `lg` (20px). */
  size?: CheckboxSize;
}

const MARGEM_DO_GLIFO = 3;
const BORDA = 1.5;

const caminho = (svg: string) => svg.match(/ d="([^"]+)"/)?.[1] ?? '';
const GLIFOS = {
  check: { d: caminho(checkFatFill), viewBox: '4 6 256 256', contorno: 0 },
  minus: { d: caminho(minusBold), viewBox: '0 0 256 256', contorno: 37 },
};

/** Caixa de seleção para escolhas múltiplas ou confirmação, com suporte a estado indeterminado. */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description, ariaLabel, size = 'md',
}) => {
  const { caixa, fonte, espaco } = ESCALA_DE_ESCOLHA[size];
  const icone = caixa - MARGEM_DO_GLIFO * 2;
  const ativo = checked || indeterminate;
  const temTexto = label != null || description != null;
  const glifo = GLIFOS[indeterminate ? 'minus' : 'check'];
  return (
    <label
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : !!checked}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => { e.preventDefault(); if (!disabled) onChange?.(!checked); }}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!disabled) onChange?.(!checked); } }}
      style={{
        display: temTexto ? 'flex' : 'inline-flex', alignItems: 'flex-start', gap: espaco,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 'var(--ob-opacity-disabled)' : 1,
      }}>
      <svg width={caixa} height={caixa} viewBox={`0 0 ${caixa} ${caixa}`} aria-hidden="true" style={{ flex: 'none', display: 'block' }}>
        <rect
          x={BORDA / 2} y={BORDA / 2} width={caixa - BORDA} height={caixa - BORDA} strokeWidth={BORDA}
          style={{
            rx: `calc(var(--ob-r-xs) - ${BORDA / 2}px)`,
            fill: ativo ? 'var(--ob-blue)' : 'var(--ob-surface)',
            stroke: ativo ? 'var(--ob-blue)' : 'var(--ob-border)',
            transition: 'fill var(--ob-dur-fast) var(--ob-ease), stroke var(--ob-dur-fast) var(--ob-ease)',
          } as React.CSSProperties}
        />
        {ativo && (
          <svg x={(caixa - icone) / 2} y={(caixa - icone) / 2} width={icone} height={icone} viewBox={glifo.viewBox}>
            <path d={glifo.d} style={{ fill: 'var(--ob-fg-on-color)', stroke: glifo.contorno ? 'var(--ob-fg-on-color)' : undefined }} strokeWidth={glifo.contorno || undefined} strokeLinejoin="round" />
          </svg>
        )}
      </svg>
      {temTexto && (
        <span>
          {label != null && <span style={{ fontSize: fonte, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: `${caixa}px`, display: 'block' }}>{label}</span>}
          {description != null && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 'var(--ob-space-2)', display: 'block' }}>{description}</span>}
        </span>
      )}
    </label>
  );
};
