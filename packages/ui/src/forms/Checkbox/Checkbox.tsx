import React, { useEffect, useId, useRef } from 'react';
import checkBold from '@phosphor-icons/core/assets/bold/check-bold.svg';
import minusBold from '@phosphor-icons/core/assets/bold/minus-bold.svg';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
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
  /** Texto de apoio exibido abaixo do label. Some quando `error` está presente. */
  description?: React.ReactNode;
  /** Mensagem de erro exibida no lugar da descrição, que também deixa a borda da caixa vermelha. */
  error?: React.ReactNode;
  /** Nome do campo enviado com o formulário. */
  name?: string;
  /** Valor enviado com o formulário quando a caixa está marcada. O navegador usa `on` quando ausente. */
  value?: string;
  /** Marca o campo como obrigatório para a validação nativa do formulário. */
  required?: boolean;
  /** Nome acessível quando não há `label` visível (ex.: seleção de linhas em tabela). */
  ariaLabel?: string;
  /** Tamanho da caixa e do texto: `sm` (16px), `md` (18px) ou `lg` (20px). */
  size?: CheckboxSize;
}

type Estado = 'off' | 'on' | 'mixed';

const MARGEM_DO_GLIFO = 3;
const BORDA = 1;
const CONTORNO_DO_GLIFO = 18;

const caminho = (svg: string) => svg.match(/ d="([^"]+)"/)?.[1] ?? '';
const GLIFOS = {
  on: { d: caminho(checkBold), viewBox: '4 8 256 256' },
  mixed: { d: caminho(minusBold), viewBox: '0 0 256 256' },
};

injectStyleOnce(
  'ob-checkbox',
  '.ob-checkbox-input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit}'
  + '.ob-checkbox-caixa{display:block;pointer-events:none;border-radius:var(--ob-r-xs);transition:box-shadow var(--ob-dur-fast) var(--ob-ease),transform var(--ob-dur-fast) var(--ob-ease)}'
  + '.ob-checkbox-fundo{fill:var(--ob-surface);stroke:var(--ob-fg-mute);transition:fill var(--ob-dur-fast) var(--ob-ease),stroke var(--ob-dur-fast) var(--ob-ease)}'
  + '.ob-checkbox-caixa:not([data-estado="off"]) .ob-checkbox-fundo{fill:var(--ob-blue);stroke:var(--ob-blue)}'
  + '.ob-checkbox-caixa[data-estado="off"][data-erro] .ob-checkbox-fundo{stroke:var(--ob-danger)}'
  + '.ob-checkbox:not([data-disabled]):hover .ob-checkbox-caixa[data-estado="off"]:not([data-erro]) .ob-checkbox-fundo{stroke:var(--ob-fg-soft)}'
  + '.ob-checkbox:not([data-disabled]):hover .ob-checkbox-caixa:not([data-estado="off"]) .ob-checkbox-fundo{fill:var(--ob-blue-700);stroke:var(--ob-blue-700)}'
  + '.ob-checkbox:not([data-disabled]):active .ob-checkbox-caixa{transform:scale(0.9)}'
  + '.ob-checkbox-input:focus-visible+.ob-checkbox-caixa{box-shadow:0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)}'
  + '.ob-checkbox-glifo{fill:var(--ob-fg-on-color);stroke:var(--ob-fg-on-color);transform-box:fill-box;transform-origin:center}'
  + '.ob-checkbox-glifo[data-animar]{animation:ob-checkbox-entra var(--ob-dur-fast) var(--ob-ease-out) both}'
  + '@keyframes ob-checkbox-entra{from{opacity:0;transform:scale(0.5)}}',
);

/** Caixa de seleção para escolhas múltiplas ou confirmação, com suporte a estado indeterminado, erro e envio em formulário. */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description, error, name, value, required, ariaLabel, size = 'md',
}) => {
  const { caixa, fonte, espaco } = ESCALA_DE_ESCOLHA[size];
  const icone = caixa - MARGEM_DO_GLIFO * 2;
  const estado: Estado = indeterminate ? 'mixed' : checked ? 'on' : 'off';
  const temErro = error != null && error !== false;
  const apoio = temErro ? error : description;
  const temTexto = label != null || apoio != null;
  const id = useId();
  const idDoRotulo = `${id}-rotulo`;
  const idDoApoio = `${id}-apoio`;
  const input = useRef<HTMLInputElement>(null);
  const estadoAnterior = useRef(estado);
  const animar = useRef(false);
  if (estadoAnterior.current !== estado) {
    animar.current = estado !== 'off';
    estadoAnterior.current = estado;
  }
  useEffect(() => { if (input.current) input.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <label
      className="ob-checkbox"
      data-disabled={disabled || undefined}
      style={{
        display: temTexto ? 'flex' : 'inline-flex', alignItems: 'flex-start', gap: espaco,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 'var(--ob-opacity-disabled)' : 1,
      }}>
      <span style={{ position: 'relative', flex: 'none', display: 'block', width: caixa, height: caixa }}>
        <input
          ref={input}
          className="ob-checkbox-input"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          name={name}
          value={value}
          required={required}
          aria-label={label == null ? ariaLabel : undefined}
          aria-labelledby={label != null ? idDoRotulo : undefined}
          aria-describedby={apoio != null ? idDoApoio : undefined}
          aria-invalid={temErro || undefined}
        />
        <svg
          className="ob-checkbox-caixa"
          data-estado={estado}
          data-erro={temErro || undefined}
          width={caixa} height={caixa} viewBox={`0 0 ${caixa} ${caixa}`} aria-hidden="true">
          <rect
            className="ob-checkbox-fundo"
            x={BORDA / 2} y={BORDA / 2} width={caixa - BORDA} height={caixa - BORDA} strokeWidth={BORDA}
            style={{ rx: `calc(var(--ob-r-xs) - ${BORDA / 2}px)` } as React.CSSProperties}
          />
          {estado !== 'off' && (
            <svg key={estado} x={(caixa - icone) / 2} y={(caixa - icone) / 2} width={icone} height={icone} viewBox={GLIFOS[estado].viewBox}>
              <path
                className="ob-checkbox-glifo"
                data-animar={animar.current || undefined}
                d={GLIFOS[estado].d} strokeWidth={CONTORNO_DO_GLIFO} strokeLinejoin="round"
              />
            </svg>
          )}
        </svg>
      </span>
      {temTexto && (
        <span>
          {label != null && <span id={idDoRotulo} style={{ fontSize: fonte, color: 'var(--ob-fg-strong)', fontWeight: 'var(--ob-w-medium)', lineHeight: `${caixa}px`, display: 'block' }}>{label}</span>}
          {apoio != null && <span id={idDoApoio} style={{ fontSize: 'var(--ob-fs-12)', color: temErro ? 'var(--ob-danger)' : 'var(--ob-fg-soft)', marginTop: 'var(--ob-space-2)', display: 'block' }}>{apoio}</span>}
        </span>
      )}
    </label>
  );
};
