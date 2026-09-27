import React from 'react';
import checkFatFill from '@phosphor-icons/core/assets/fill/check-fat-fill.svg';
import minusBold from '@phosphor-icons/core/assets/bold/minus-bold.svg';

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
}

const CAIXA = 18;
const ICONE = 12;

// Glifos oficiais do Phosphor em SVG: centralizam pela geometria, não pela linha de base de uma fonte.
// Marcado usa o check-fat (fill), sólido o bastante para ler como "ligado" numa caixa de 18px — o check bold em
// 14px fica com traço de ~1,3px, visualmente igual ao regular. O viewBox desloca cada glifo para que o centro do
// desenho (medido com getBBox) caia no centro da caixa: o check-fat fica 4 unidades à direita e 6 abaixo do centro.
// O Phosphor não tem "minus-fat": o indeterminado usa o path oficial do minus bold (24 de espessura) com contorno
// extra de 37, somando ~61 — a mesma espessura do braço do check-fat. Exceção documentada no CLAUDE.md.
const caminho = (svg: string) => svg.match(/ d="([^"]+)"/)?.[1] ?? '';
const GLIFOS = {
  check: { d: caminho(checkFatFill), viewBox: '4 6 256 256', contorno: 0 },
  minus: { d: caminho(minusBold), viewBox: '0 0 256 256', contorno: 37 },
};

/** Caixa de seleção para escolhas múltiplas ou confirmação, com suporte a estado indeterminado. */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description, ariaLabel,
}) => {
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
        display: temTexto ? 'flex' : 'inline-flex', alignItems: 'flex-start', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      }}>
      {/* Contorno como sombra interna (não border): o miolo fica com os 18px inteiros e o ícone de 12px sobra 3px de
          cada lado. translateZ(0) põe a caixa numa camada própria, alinhada ao pixel mesmo em posição fracionada. */}
      <span style={{
        flex: 'none', width: CAIXA, height: CAIXA, borderRadius: 6,
        boxShadow: `inset 0 0 0 1.5px ${ativo ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
        background: ativo ? 'var(--ob-blue)' : 'var(--ob-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'translateZ(0)',
        transition: 'background 160ms var(--ob-ease), box-shadow 160ms var(--ob-ease)',
      }}>
        {ativo && (
          <svg width={ICONE} height={ICONE} viewBox={glifo.viewBox} fill="#fff" aria-hidden="true" style={{ display: 'block' }}>
            <path d={glifo.d} stroke={glifo.contorno ? '#fff' : undefined} strokeWidth={glifo.contorno || undefined} strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {temTexto && (
        <span>
          {/* Entrelinha igual à altura da caixa (18px): o texto não empurra a caixa para meio pixel. */}
          {label != null && <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: `${CAIXA}px`, display: 'block' }}>{label}</span>}
          {description != null && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
        </span>
      )}
    </label>
  );
};
