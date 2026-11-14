import React, { useEffect, useRef, useState } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import { Chip } from '../../data-display/Chip/Chip';
import { FloatingPanel } from '../../internal/FloatingPanel';
import { Ancorado, estaDentro, retanguloDe, useCamada } from '../../internal/camada';
import { Ph } from '../../iconography/Ph/Ph';
import { FieldShell } from '../FieldShell/FieldShell';
import { ESCALA_DE_CAMPO, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. */
export type SelectSize = TamanhoDeCampo;

const RECUO_DA_OPCAO: Record<SelectSize, string> = {
  sm: 'var(--ob-space-6) var(--ob-space-10)',
  md: 'var(--ob-space-10) var(--ob-space-12)',
  lg: 'var(--ob-space-12) var(--ob-space-16)',
};

/** Uma opção da lista, no formato de objeto — aceita campos extras além do rótulo exibido. */
export interface SelectOption {
  /** Texto exibido para a opção e usado como valor selecionado. */
  label: string;
  [key: string]: unknown;
}

export interface SelectBaseProps {
  /** Lista de opções, como strings ou objetos `{ label }`. */
  options?: (string | SelectOption)[];
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto exibido quando nenhuma opção está selecionada. */
  placeholder?: string;
  /** Desabilita a interação com o campo. */
  disabled?: boolean;
  /** Mensagem de erro exibida abaixo do campo. */
  error?: React.ReactNode;
  /** Largura do campo. */
  width?: number | string;
  /** Tamanho do campo, que ajusta altura, fonte, recuo e as opções da lista. Com `embedded`, use o mesmo tamanho do campo que o contém. */
  size?: SelectSize;
  /** Nome acessível do campo quando não há `label` visível. */
  ariaLabel?: string;
}

export interface SingleSelectProps extends SelectBaseProps {
  /** Modo de seleção única (uma opção por vez). */
  multi?: false;
  /** Rótulo da opção selecionada, em modo controlado. */
  value?: string | null;
  /** Rótulo da opção selecionada inicialmente, em modo não controlado. */
  defaultValue?: string | null;
  /** Chamado com o rótulo da opção escolhida. */
  onChange?: (value: string) => void;
  /** Remove a borda, o fundo e o rótulo do campo, para ser usado dentro de outro campo (`startAddon` e `endAddon` do `Input` e do `NumberField`). O foco e o erro passam a ser do campo que o contém. */
  embedded?: boolean;
}

export interface MultiSelectProps extends SelectBaseProps {
  /** Ativa o modo de seleção múltipla, com opções escolhidas exibidas como chips. */
  multi: true;
  /** Rótulos das opções selecionadas, em modo controlado. */
  value?: string[] | null;
  /** Rótulos das opções selecionadas inicialmente, em modo não controlado. */
  defaultValue?: string[] | null;
  /** Chamado com a lista atualizada de rótulos selecionados. */
  onChange?: (value: string[]) => void;
}

/** Props do Select, discriminadas pelo modo `multi` (seleção única ou múltipla). */
export type SelectProps = SingleSelectProps | MultiSelectProps;

interface SelectLooseProps extends SelectBaseProps {
  multi?: boolean;
  embedded?: boolean;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
}

interface CascaProps extends React.ComponentProps<typeof FieldShell> {
  embedded: boolean;
}

const Casca: React.FC<CascaProps> = ({ embedded, focused, error, disabled, size, padding, onClick, style, children }) => embedded ? (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', flex: 1, padding, boxSizing: 'border-box', ...style }}>{children}</div>
) : (
  <FieldShell focused={focused} error={error} disabled={disabled} size={size} padding={padding} onClick={onClick} style={style}>{children}</FieldShell>
);

/** Campo de seleção com lista de opções, busca por digitação e modos de seleção única ou múltipla. */
export const Select: React.FC<SelectProps> = (props) => {
  const {
    options = [],
    onChange,
    multi = false,
    label,
    placeholder = 'Selecione…',
    disabled = false,
    error,
    width,
    ariaLabel,
    size = 'md',
    embedded: embeddedProp = false,
  } = props as SelectLooseProps;
  const embedded = embeddedProp && !multi;
  const escala = ESCALA_DE_CAMPO[size];
  const [valorInterno, setValorInterno] = useState<string | string[] | null>(
    (props as SelectLooseProps).defaultValue ?? null,
  );
  const value = (props as SelectLooseProps).value !== undefined ? (props as SelectLooseProps).value : valorInterno;
  const [open, setOpen] = useState(false);
  const [focado, setFocado] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const camada = useCamada();
  const inputRef = useRef<HTMLInputElement>(null);
  const focadoNoMouseDown = useRef(false);

  const selected: string | string[] | null = multi
    ? (Array.isArray(value) ? value : [])
    : (typeof value === 'string' ? value : null);

  const confirmar = (novo: string | string[]) => {
    if ((props as SelectLooseProps).value === undefined) setValorInterno(novo);
    onChange?.(novo);
  };

  const getLabel = (o: string | SelectOption) => typeof o === 'string' ? o : o.label;

  const filtered = options.filter(o =>
    getLabel(o).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) setHighlighted(0);
  }, [open, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!estaDentro(e.target, camada, rootRef.current, painelRef.current)) setOpen(false);
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
      confirmar(next);
    } else {
      confirmar(lbl);
      setOpen(false);
      setQuery('');
    }
  };

  const removeChip = (lbl: string) => confirmar((selected as string[]).filter(s => s !== lbl));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (e.key === 'Escape') { if (open) e.stopPropagation(); setOpen(false); setQuery(''); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && filtered[highlighted]) { e.preventDefault(); toggle(filtered[highlighted]); }
    if (e.key === 'Backspace' && multi && !query && (selected as string[]).length) {
      confirmar((selected as string[]).slice(0, -1));
    }
  };

  const larguraEmbutida = Math.max(2, ...options.map(o => getLabel(o).length)) + 1;
  const displayValue = !multi && selected && !open ? (selected as string) : '';
  const comChips = multi && (selected as string[]).length > 0;

  return (
    <div ref={rootRef}
      onMouseDownCapture={() => { focadoNoMouseDown.current = document.activeElement === inputRef.current; }}
      style={{ position: 'relative', width: width || (embedded ? 'auto' : '100%'), fontFamily: 'var(--ob-font)', ...(embedded ? { display: 'flex', alignSelf: 'stretch' } : null) }}>
      {label && !embedded && (
        <div style={{ fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)', marginBottom: 'var(--ob-space-6)' }}>{label}</div>
      )}
      <Casca
        embedded={embedded} focused={open || focado} error={!!error} disabled={disabled} size={size}
        padding={comChips ? `${escala.recuoComChips} ${escala.recuo} ${escala.recuoComChips} ${escala.recuoComChips}` : `0 ${escala.recuo}`}
        onClick={() => {
          if (disabled) return;
          const abrir = focadoNoMouseDown.current ? !open : true;
          setOpen(abrir);
          if (abrir) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        style={{ flexWrap: multi ? 'wrap' : 'nowrap', gap: 'var(--ob-space-6)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {multi && (selected as string[]).map(s => (
          <Chip key={s} label={s} size={escala.chip} selected removable
            onToggle={() => {}} onRemove={() => removeChip(s)} />
        ))}
        <input
          ref={inputRef}
          value={open ? query : displayValue}
          placeholder={(!multi || !(selected as string[]).length) ? placeholder : ''}
          disabled={disabled} aria-label={label && !embedded ? undefined : ariaLabel}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => { setFocado(true); if (!disabled) setOpen(true); }}
          onBlur={() => setFocado(false)}
          style={{
            flex: embedded ? 'none' : 1, width: embedded ? `${larguraEmbutida}ch` : undefined, minWidth: multi ? 60 : 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: escala.fonte, color: 'var(--ob-fg-strong)', cursor: disabled ? 'not-allowed' : 'text',
            padding: comChips ? `0 ${escala.recuoComChips}` : 0, alignSelf: comChips ? 'center' : 'stretch',
          }}
        />
        <Ph n="caret-down" size={escala.icone - 2} c="var(--ob-fg-mute)"
          style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--ob-dur-fast) var(--ob-ease)' }} />
      </Casca>

      {open && (
        <Ancorado ref={painelRef} camada={camada} alinhamento="stretch" ancora={() => retanguloDe(inputRef.current?.parentElement)}>
          <FloatingPanel maxHeight={240} padding="var(--ob-space-4)">
            {filtered.length === 0 && (
              <div style={{ padding: 'var(--ob-space-12) var(--ob-space-16)', fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-mute)', textAlign: 'center' }}>
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
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ob-space-10)',
                    padding: RECUO_DA_OPCAO[size], borderRadius: 'var(--ob-r-sm)', cursor: 'pointer',
                    fontSize: escala.fonte, fontWeight: (isSelected && !multi) ? 'var(--ob-w-semibold)' : 'var(--ob-w-regular)',
                    color: (isSelected && !multi) ? 'var(--ob-blue-700)' : 'var(--ob-fg)',
                    background: isHigh ? 'var(--ob-bg-warm)' : (isSelected && !multi ? 'var(--ob-blue-100)' : 'transparent'),
                    transition: 'background var(--ob-dur-fast) var(--ob-ease)',
                  }}>
                  {multi ? (
                    <Checkbox checked={isSelected} onChange={() => {}} label={lbl} size={size} />
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
        </Ancorado>
      )}

      {error && !embedded && (
        <div style={{ fontSize: 'var(--ob-fs-12)', color: 'var(--ob-danger)', marginTop: 'var(--ob-space-6)', display: 'flex', alignItems: 'center', gap: 'var(--ob-space-4)' }}>
          <Ph n="warning-circle" size={13} c="var(--ob-danger)" weight="bold" />
          {error}
        </div>
      )}
    </div>
  );
};
