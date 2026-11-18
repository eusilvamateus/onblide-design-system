import React, { useEffect, useId, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { Popover } from '../../overlays/Popover/Popover';
import { useBreakpoint } from '../../layout/useBreakpoint';
import { ColorPicker, type ColorPickerMode, type ColorSwatch } from '../ColorPicker/ColorPicker';
import { escreverCor, interpretarCor, lerCor } from '../../internal/cor';
import { Amostra } from '../../internal/pecasDeCor';
import { ESCALA_DE_CAMPO, estiloDaAcao, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. */
export type ColorInputSize = TamanhoDeCampo;

export interface ColorInputProps {
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio abaixo do campo; some quando há erro. */
  hint?: React.ReactNode;
  /** Mensagem de erro externa, exibida no lugar do texto de apoio e com a borda vermelha. */
  error?: React.ReactNode;
  /** Cor escolhida em hexadecimal minúsculo (`#rrggbb`, ou `#rrggbbaa` com `alpha`), em modo controlado. `null` é sem cor. */
  value?: string | null;
  /** Cor inicial, em modo não controlado. */
  defaultValue?: string | null;
  /** Chamado a cada mudança, com `null` quando o campo é esvaziado. */
  onChange?: (value: string | null) => void;
  /** Chamado uma vez quando a pessoa termina de escolher, no painel ou no campo. */
  onChangeEnd?: (value: string | null) => void;
  /** Aceita transparência no painel e oito dígitos no campo. */
  alpha?: boolean;
  /** Cores salvas mostradas no painel. */
  swatches?: (string | ColorSwatch)[];
  /** O painel mostra só as cores salvas. */
  swatchesOnly?: boolean;
  /** Formas de escolher a cor no painel, na ordem das abas. */
  modes?: ColorPickerMode[];
  /** Tamanho do campo, que ajusta altura, fonte e a amostra. O painel não muda. */
  size?: ColorInputSize;
  /** Desabilita o campo e o painel. */
  disabled?: boolean;
  /** Texto exibido enquanto o campo está vazio. */
  placeholder?: string;
  /** Nome acessível do campo quando não há `label` em texto. */
  ariaLabel?: string;
}

const AMOSTRA: Record<TamanhoDeCampo, number> = { sm: 16, md: 20, lg: 24 };
const MENSAGEM_DE_RECUSA = 'Cor não reconhecida. Use #RRGGBB, rgb() ou hsl()';

const textoLivre = (t: string) => /^\s*[rh]/i.test(t) || t.includes('(');
const mostrar = (v: string | null | undefined) => (v && lerCor(v) ? v.toUpperCase() : '');

/** Campo de cor que aceita HEX, `rgb()` e `hsl()` digitados ou colados, com amostra e painel do `ColorPicker` em popover. */
export const ColorInput: React.FC<ColorInputProps> = ({
  label, hint, error, value, defaultValue = null, onChange, onChangeEnd, alpha = false, swatches = [], swatchesOnly = false, modes,
  size = 'md', disabled = false, placeholder = 'Sem cor', ariaLabel,
}) => {
  const toque = !useBreakpoint().atLeast('sm');
  const id = useId();
  const [interno, setInterno] = useState<string | null>(defaultValue);
  const valor = value !== undefined ? value : interno;
  const [texto, setTexto] = useState(mostrar(valor));
  const [focado, setFocado] = useState(false);
  const [recusado, setRecusado] = useState(false);
  const escala = ESCALA_DE_CAMPO[size];

  useEffect(() => { if (!focado) setTexto(mostrar(valor)); }, [valor, focado]);

  const mudar = (novo: string | null) => {
    if (value === undefined) setInterno(novo);
    onChange?.(novo);
  };
  const aplicar = (t: string) => {
    const c = interpretarCor(t);
    if (!c) return null;
    const novo = escreverCor({ ...c, a: alpha ? c.a : 1 });
    if (novo !== valor) {
      mudar(novo);
      onChangeEnd?.(novo);
    }
    return novo;
  };
  const digitar = (bruto: string) => {
    setRecusado(false);
    if (textoLivre(bruto)) {
      const novo = aplicar(bruto);
      setTexto(novo ? novo.toUpperCase() : bruto);
      return;
    }
    const t = `#${bruto.replace(/[^0-9a-f]/gi, '').slice(0, alpha ? 8 : 6).toUpperCase()}`;
    if (t === '#') {
      setTexto('');
      if (valor !== null) {
        mudar(null);
        onChangeEnd?.(null);
      }
      return;
    }
    setTexto(t);
    if ((alpha ? [6, 8] : [6]).includes(t.length - 1)) aplicar(t);
  };
  const confirmar = () => {
    if (!texto) return;
    const novo = aplicar(texto);
    if (novo) setTexto(novo.toUpperCase());
    else setRecusado(true);
  };

  const mensagem = error ?? (focado && recusado ? MENSAGEM_DE_RECUSA : undefined);
  const nome = ariaLabel ?? (typeof label === 'string' ? label : 'Cor');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)' }}>
      {label && <label htmlFor={id} style={{ fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{label}</label>}
      <FieldShell focused={focado} error={!!mensagem} disabled={disabled} size={size} padding={`0 ${escala.recuo} 0 ${escala.recuoDaAcao}`}>
        <Popover align="start" width="auto" padding="var(--ob-space-12)" closeButton={false} ariaLabel={`Escolher cor: ${nome}`}
          trigger={(
            <Button kind="quiet" size="sm" iconOnly disabled={disabled} aria-label="Abrir seletor de cor" style={estiloDaAcao(size)}
              icon={<Amostra cor={valor} tamanho={AMOSTRA[size]} forma="square" />} />
          )}>
          {() => (
            <ColorPicker value={valor} onChange={mudar} onChangeEnd={onChangeEnd} alpha={alpha} swatches={swatches} swatchesOnly={swatchesOnly} modes={modes}
              width={toque ? Math.min(window.innerWidth - 56, 360) : undefined} />
          )}
        </Popover>
        <input id={id} type="text" value={texto} placeholder={placeholder} disabled={disabled} spellCheck={false} autoComplete="off"
          aria-label={typeof label === 'string' ? undefined : nome} aria-invalid={!!mensagem || undefined}
          onChange={(e) => digitar(e.target.value)} onFocus={() => setFocado(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') confirmar(); }}
          onBlur={() => {
            if (texto && !recusado) aplicar(texto);
            setRecusado(false);
            setFocado(false);
          }}
          style={{
            flex: 1, minWidth: 0, alignSelf: 'stretch', border: 'none', outline: 'none', background: 'transparent', padding: '0 0 0 var(--ob-space-8)',
            fontFamily: 'var(--ob-font-mono)', fontSize: escala.fonte, color: 'var(--ob-fg-strong)',
          }} />
      </FieldShell>
      {(hint || mensagem) && <span style={{ fontSize: 'var(--ob-fs-11)', color: mensagem ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{mensagem || hint}</span>}
    </div>
  );
};
