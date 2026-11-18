import React, { useEffect, useRef, useState } from 'react';
import { FieldShell } from '../forms/FieldShell/FieldShell';
import { NumberField } from '../forms/NumberField/NumberField';
import { Tooltip } from '../overlays/Tooltip/Tooltip';
import { Ph } from '../iconography/Ph/Ph';
import type { TamanhoDeCampo } from './tamanhoDeCampo';
import {
  COLUNAS_DA_GRADE, CORES_DA_GRADE, LINHAS_DA_GRADE, escreverCor, hslParaRgb, hsvParaRgb, interpretarCor, lerCor, limitar, nomeDaCor,
  opacaDe, rgbParaHsl, rgbParaHsv, textoEscuroSobre, type Hsva, type Rgba,
} from './cor';

export const XADREZ = 'repeating-conic-gradient(var(--ob-line) 0% 25%, var(--ob-surface) 0% 50%) 0 0 / 8px 8px';
export const ARCO_IRIS = 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';
const ANEL_DO_FOCO = '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)';
const BORDA_DA_TRILHA = 'inset 0 0 0 1px var(--ob-scrim-light)';
const TINTA_ESCURA = '#1f1f1f';
const CONTORNO = 'inset 0 0 0 1px color-mix(in srgb, var(--ob-fg-strong) 12%, transparent)';

const Contorno = () => (
  <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: CONTORNO, pointerEvents: 'none', zIndex: 2 }} />
);

export const Amostra: React.FC<{ cor: string | null | undefined; tamanho: number; forma?: 'circle' | 'square' }> = ({ cor, tamanho, forma = 'circle' }) => {
  const valida = !!lerCor(cor);
  return (
    <span aria-hidden="true" style={{
      position: 'relative', flex: 'none', display: 'inline-block', width: tamanho, height: tamanho, overflow: 'hidden', boxSizing: 'border-box',
      borderRadius: forma === 'circle' ? 'var(--ob-r-circle)' : 'var(--ob-r-xs)', background: valida ? XADREZ : 'transparent',
      border: valida ? 'none' : '1.5px dashed var(--ob-fg-mute)',
    }}>
      {valida && <span style={{ position: 'absolute', inset: 0, background: cor ?? undefined, borderRadius: 'inherit' }} />}
      {valida && <Contorno />}
    </span>
  );
};

const useFocoDeTeclado = () => {
  const [foco, setFoco] = useState(false);
  return { foco, marcar: () => setFoco(true), soltar: () => setFoco(false) };
};

const useArrasto = (aoMover: (x: number, y: number) => void, aoSoltar: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const ler = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    aoMover(limitar((e.clientX - r.left) / r.width, 0, 1), limitar((e.clientY - r.top) / r.height, 0, 1));
  };
  const parar = () => {
    if (!arrastando) return;
    setArrastando(false);
    aoSoltar();
  };
  return {
    ref,
    arrastando,
    eventos: {
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        ref.current!.focus({ preventScroll: true });
        ref.current!.setPointerCapture?.(e.pointerId);
        setArrastando(true);
        ler(e);
      },
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => { if (arrastando) ler(e); },
      onPointerUp: parar,
      onPointerCancel: parar,
    },
  };
};

const pegador = (x: string, y: string, cor: string, arrastando: boolean, tamanho: number): React.CSSProperties => ({
  position: 'absolute', left: x, top: y, width: tamanho, height: tamanho, borderRadius: 'var(--ob-r-circle)', boxSizing: 'border-box',
  background: cor, border: '2px solid var(--ob-fg-on-color)', pointerEvents: 'none',
  boxShadow: '0 0 0 1px var(--ob-scrim), var(--ob-shadow-xs)',
  transform: `translate(-50%, -50%)${arrastando ? ' scale(1.15)' : ''}`, transition: 'transform var(--ob-dur-fast) var(--ob-ease)',
});

const PASSOS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };

interface PecaProps {
  hsva: Hsva;
  toque: boolean;
  aoMudar: (hsva: Hsva) => void;
  aoTerminar: () => void;
}

export const Area: React.FC<PecaProps> = ({ hsva, toque, aoMudar, aoTerminar }) => {
  const { ref, arrastando, eventos } = useArrasto((x, y) => aoMudar({ ...hsva, s: x * 100, v: (1 - y) * 100 }), aoTerminar);
  const { foco, marcar, soltar } = useFocoDeTeclado();
  const teclar = (e: React.KeyboardEvent) => {
    marcar();
    const d = PASSOS[e.key];
    if (!d) return;
    e.preventDefault();
    const p = e.shiftKey ? 10 : 1;
    aoMudar({ ...hsva, s: limitar(hsva.s + d[0] * p, 0, 100), v: limitar(hsva.v + d[1] * p, 0, 100) });
    aoTerminar();
  };
  const opaca = escreverCor(hsvParaRgb(hsva));
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label="Saturação e brilho"
      aria-valuetext={`${nomeDaCor(opaca)}: saturação ${Math.round(hsva.s)}%, brilho ${Math.round(hsva.v)}%`}
      {...eventos} onPointerDown={(e) => { soltar(); eventos.onPointerDown(e); }} onKeyDown={teclar} onBlur={soltar}
      style={{
        position: 'relative', height: '100%', borderRadius: 'var(--ob-r-sm)', cursor: 'crosshair', touchAction: 'none', outline: 'none',
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsva.h} 100% 50%))`,
        boxShadow: foco ? ANEL_DO_FOCO : BORDA_DA_TRILHA,
      }}>
      <span style={pegador(`${hsva.s}%`, `${100 - hsva.v}%`, opaca, arrastando, toque ? 24 : 16)} />
    </div>
  );
};

interface FaixaProps {
  rotulo: string;
  valor: number;
  maximo: number;
  texto: (valor: number) => string;
  fundo: string;
  corDoPegador: string;
  toque: boolean;
  aoMudar: (valor: number) => void;
  aoTerminar: () => void;
}

export const Faixa: React.FC<FaixaProps> = ({ rotulo, valor, maximo, texto, fundo, corDoPegador, toque, aoMudar, aoTerminar }) => {
  const { ref, arrastando, eventos } = useArrasto((x) => aoMudar(x * maximo), aoTerminar);
  const { foco, marcar, soltar } = useFocoDeTeclado();
  const teclar = (e: React.KeyboardEvent) => {
    marcar();
    const d = PASSOS[e.key];
    if (!d) return;
    e.preventDefault();
    const p = (e.shiftKey ? 10 : 1) * (maximo === 1 ? 0.01 : 1);
    aoMudar(limitar(valor + (d[0] || d[1]) * p, 0, maximo));
    aoTerminar();
  };
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label={rotulo} aria-valuemin={0} aria-valuemax={maximo} aria-valuenow={Math.round(valor * 100) / 100}
      aria-valuetext={texto(valor)} {...eventos} onPointerDown={(e) => { soltar(); eventos.onPointerDown(e); }} onKeyDown={teclar} onBlur={soltar}
      style={{ position: 'relative', height: toque ? 32 : 20, cursor: 'pointer', touchAction: 'none', outline: 'none' }}>
      <span aria-hidden="true" style={{
        position: 'absolute', left: 0, right: 0, top: '50%', height: toque ? 14 : 12, transform: 'translateY(-50%)', borderRadius: 'var(--ob-r-pill)',
        background: fundo, boxShadow: foco ? ANEL_DO_FOCO : BORDA_DA_TRILHA,
      }} />
      <span style={pegador(`${(valor / maximo) * 100}%`, '50%', corDoPegador, arrastando, toque ? 24 : 16)} />
    </div>
  );
};

interface GradeProps {
  valor: string | null;
  aoEscolher: (cor: string) => void;
  aoTerminar: () => void;
}

export const Grade: React.FC<GradeProps> = ({ valor, aoEscolher, aoTerminar }) => {
  const ref = useRef<HTMLDivElement>(null);
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const arrastando = useRef(false);
  const atual = valor ? opacaDe(valor) : null;
  const marcado = atual ? CORES_DA_GRADE.indexOf(atual) : -1;
  const [sob, setSob] = useState(-1);
  const [foco, setFoco] = useState(-1);
  const celulaEm = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const coluna = Math.floor(limitar((e.clientX - r.left) / r.width, 0, 0.9999) * COLUNAS_DA_GRADE);
    const linha = Math.floor(limitar((e.clientY - r.top) / r.height, 0, 0.9999) * LINHAS_DA_GRADE);
    return linha * COLUNAS_DA_GRADE + coluna;
  };
  const teclar = (e: React.KeyboardEvent, i: number) => {
    const s = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLUNAS_DA_GRADE, ArrowDown: COLUNAS_DA_GRADE } as Record<string, number>)[e.key];
    if (!s) return;
    e.preventDefault();
    botoes.current[limitar(i + s, 0, CORES_DA_GRADE.length - 1)]?.focus();
  };
  return (
    <div ref={ref} role="listbox" aria-label="Grade de cores"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        ref.current!.setPointerCapture?.(e.pointerId);
        arrastando.current = true;
        aoEscolher(CORES_DA_GRADE[celulaEm(e)]);
      }}
      onPointerMove={(e) => {
        if (arrastando.current) {
          const cor = CORES_DA_GRADE[celulaEm(e)];
          if (cor !== atual) aoEscolher(cor);
          return;
        }
        if (e.pointerType === 'mouse') setSob(celulaEm(e));
      }}
      onPointerUp={() => {
        if (!arrastando.current) return;
        arrastando.current = false;
        aoTerminar();
      }}
      onPointerCancel={() => { arrastando.current = false; }}
      onPointerLeave={() => setSob(-1)}
      style={{
        position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${COLUNAS_DA_GRADE}, 1fr)`, gridAutoRows: '1fr', height: '100%',
        borderRadius: 'var(--ob-r-sm)', overflow: 'hidden', touchAction: 'none',
      }}>
      {CORES_DA_GRADE.map((cor, i) => {
        const escolhido = i === marcado;
        const anel = escolhido ? 'inset 0 0 0 2px var(--ob-fg-on-color), inset 0 0 0 3px var(--ob-scrim)'
          : foco === i ? 'inset 0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)'
          : sob === i ? 'inset 0 0 0 2px color-mix(in srgb, var(--ob-fg-on-color) 85%, transparent)' : 'none';
        return (
          <button key={cor} ref={(el) => { botoes.current[i] = el; }} type="button" role="option" aria-selected={escolhido}
            aria-label={`${nomeDaCor(cor)}, ${cor.toUpperCase()}`} tabIndex={i === Math.max(marcado, 0) ? 0 : -1}
            onClick={(e) => { if (e.detail === 0) { aoEscolher(cor); aoTerminar(); } }} onKeyDown={(e) => teclar(e, i)}
            onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setFoco(i); }} onBlur={() => setFoco(-1)}
            style={{
              border: 'none', padding: 0, margin: 0, background: cor, cursor: 'pointer', outline: 'none', boxShadow: anel,
              position: 'relative', zIndex: escolhido || foco === i ? 1 : 0,
            }} />
        );
      })}
      <Contorno />
    </div>
  );
};

interface EspectroProps extends PecaProps {
  saturacao: number;
}

export const Espectro: React.FC<EspectroProps> = ({ hsva, saturacao, toque, aoMudar, aoTerminar }) => {
  const luz = rgbParaHsl(hsvParaRgb(hsva)).l;
  const aplicar = (h: number, l: number) => aoMudar({ ...rgbParaHsv(hslParaRgb({ h, s: saturacao, l })), h, a: hsva.a });
  const { ref, arrastando, eventos } = useArrasto((x, y) => aplicar(Math.min(x * 360, 359.9), (1 - y) * 100), aoTerminar);
  const { foco, marcar, soltar } = useFocoDeTeclado();
  const teclar = (e: React.KeyboardEvent) => {
    marcar();
    const d = PASSOS[e.key];
    if (!d) return;
    e.preventDefault();
    const p = e.shiftKey ? 10 : 1;
    aplicar((hsva.h + d[0] * p + 360) % 360, limitar(luz + d[1] * p, 0, 100));
    aoTerminar();
  };
  const opaca = escreverCor(hsvParaRgb(hsva));
  const cinza = `rgb(128 128 128 / ${1 - saturacao / 100})`;
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label="Espectro de cores"
      aria-valuetext={`${nomeDaCor(opaca)}: matiz ${Math.round(hsva.h)}°, luz ${Math.round(luz)}%`}
      {...eventos} onPointerDown={(e) => { soltar(); eventos.onPointerDown(e); }} onKeyDown={teclar} onBlur={soltar}
      style={{
        position: 'relative', height: '100%', borderRadius: 'var(--ob-r-sm)', cursor: 'crosshair', touchAction: 'none', outline: 'none',
        background: `linear-gradient(to bottom, #fff 0%, rgb(255 255 255 / 0) 50%, rgb(0 0 0 / 0) 50%, #000 100%), linear-gradient(${cinza}, ${cinza}), ${ARCO_IRIS}`,
        boxShadow: foco ? ANEL_DO_FOCO : BORDA_DA_TRILHA,
      }}>
      <span style={pegador(`${(hsva.h / 360) * 100}%`, `${100 - luz}%`, opaca, arrastando, toque ? 24 : 16)} />
    </div>
  );
};

const CANAIS_RGB = [['Vermelho', 'r'], ['Verde', 'g'], ['Azul', 'b']] as const;

export const Barras: React.FC<PecaProps> = ({ hsva, toque, aoMudar, aoTerminar }) => {
  const rgb = hsvParaRgb(hsva);
  const opaca = escreverCor(rgb);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--ob-space-16)' }}>
      {CANAIS_RGB.map(([nome, k]) => (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ob-fs-12)' }}>
            <span style={{ fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-soft)' }}>{nome}</span>
            <span style={{ fontFamily: 'var(--ob-font-mono)', color: 'var(--ob-fg-strong)' }}>{Math.round(rgb[k])}</span>
          </div>
          <Faixa rotulo={nome} valor={rgb[k]} maximo={255} texto={(v) => String(Math.round(v))} corDoPegador={opaca} toque={toque}
            fundo={`linear-gradient(to right, ${escreverCor({ ...rgb, [k]: 0 })}, ${escreverCor({ ...rgb, [k]: 255 })})`}
            aoMudar={(v) => {
              const hsv = rgbParaHsv({ ...rgb, [k]: Math.round(v) });
              aoMudar({ ...hsv, h: hsv.s === 0 ? hsva.h : hsv.h, a: hsva.a });
            }}
            aoTerminar={aoTerminar} />
        </div>
      ))}
    </div>
  );
};

export type FormatoDeCor = 'hex' | 'rgb' | 'hsl';

interface CanaisProps {
  hsva: Hsva;
  formato: FormatoDeCor;
  comAlfa: boolean;
  tamanho: TamanhoDeCampo;
  aoMudar: (hsva: Hsva) => void;
}

export const Canais: React.FC<CanaisProps> = ({ hsva, formato, comAlfa, tamanho, aoMudar }) => {
  const rgb = hsvParaRgb(hsva);
  const hsl = rgbParaHsl(rgb);
  const hex = escreverCor(rgb).slice(1).toUpperCase();
  const [texto, setTexto] = useState(hex);
  useEffect(() => { setTexto(hex); }, [hex]);
  const deRgb = (novo: Rgba | { r: number; g: number; b: number }, a = hsva.a) => {
    const hsv = rgbParaHsv(novo);
    aoMudar({ ...hsv, h: hsv.s === 0 ? hsva.h : hsv.h, a });
  };
  const campo = (rotulo: string, valor: number, maximo: number, aoTrocar: (n: number) => void, sufixo?: string) => (
    <div key={rotulo} style={{ flex: 1, minWidth: 0 }}>
      <NumberField size={tamanho} controls="none" align="center" clamp min={0} max={maximo} value={valor} ariaLabel={rotulo} width="100%"
        onChange={(n) => { if (n != null) aoTrocar(n); }} suffix={sufixo} />
    </div>
  );
  const alfa = comAlfa && campo('Alfa', Math.round(hsva.a * 100), 100, (n) => aoMudar({ ...hsva, a: n / 100 }), '%');
  let campos: React.ReactNode[];
  if (formato === 'rgb') {
    campos = [
      campo('Red', Math.round(rgb.r), 255, (n) => deRgb({ ...rgb, r: n })),
      campo('Green', Math.round(rgb.g), 255, (n) => deRgb({ ...rgb, g: n })),
      campo('Blue', Math.round(rgb.b), 255, (n) => deRgb({ ...rgb, b: n })),
    ];
  } else if (formato === 'hsl') {
    campos = [
      campo('Hue', Math.round(hsl.h), 360, (n) => aoMudar({ ...rgbParaHsv(hslParaRgb({ ...hsl, h: n })), h: n, a: hsva.a })),
      campo('Saturação', Math.round(hsl.s), 100, (n) => aoMudar({ ...rgbParaHsv(hslParaRgb({ ...hsl, s: n })), h: hsva.h, a: hsva.a }), '%'),
      campo('Luz', Math.round(hsl.l), 100, (n) => aoMudar({ ...rgbParaHsv(hslParaRgb({ ...hsl, l: n })), h: hsva.h, a: hsva.a }), '%'),
    ];
  } else {
    const confirmar = () => {
      const c = interpretarCor(texto);
      if (c) deRgb(c, comAlfa && texto.length === 8 ? c.a : hsva.a);
      else setTexto(hex);
    };
    campos = [
      <div key="hex" style={{ flex: 2.4, minWidth: 0 }}>
        <FieldShell size={tamanho} padding="0 var(--ob-space-10)" style={{ width: '100%' }}>
          <span aria-hidden="true" style={{ fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-mute)' }}>#</span>
          <input value={texto} aria-label="Hexadecimal" spellCheck={false} maxLength={8}
            onChange={(e) => {
              const s = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase();
              setTexto(s);
              const c = s.length === 6 ? lerCor(s) : null;
              if (c) deRgb(c);
            }}
            onPaste={(e) => {
              const c = interpretarCor(e.clipboardData.getData('text'));
              if (!c) return;
              e.preventDefault();
              deRgb(c, comAlfa && c.a < 1 ? c.a : hsva.a);
            }}
            onBlur={confirmar} onKeyDown={(e) => { if (e.key === 'Enter') confirmar(); }}
            style={{
              width: '100%', minWidth: 0, border: 'none', outline: 'none', background: 'transparent', padding: '0 0 0 var(--ob-space-2)',
              fontFamily: 'var(--ob-font-mono)', fontSize: 'var(--ob-fs-13)', color: 'var(--ob-fg-strong)',
            }} />
        </FieldShell>
      </div>,
    ];
  }
  return <>{campos}{alfa}</>;
};

interface ComparacaoProps {
  antes: string | null;
  agora: string | null;
  tamanho: number;
  aoVoltar: () => void;
}

export const Comparacao: React.FC<ComparacaoProps> = ({ antes, agora, tamanho, aoVoltar }) => {
  const anterior = lerCor(antes);
  if (!antes || !anterior || !agora || escreverCor(anterior) === agora) return <Amostra cor={agora} tamanho={tamanho} />;
  return (
    <span style={{ position: 'relative', flex: 'none', display: 'flex', width: tamanho, height: tamanho, borderRadius: 'var(--ob-r-circle)', overflow: 'hidden', background: XADREZ }}>
      <Tooltip label="Voltar para a cor anterior">
        <button type="button" aria-label={`Voltar para ${nomeDaCor(antes)}, ${antes.toUpperCase()}`} onClick={aoVoltar}
          style={{ display: 'block', width: tamanho / 2, height: tamanho, border: 'none', padding: 0, background: antes, cursor: 'pointer', outline: 'none' }} />
      </Tooltip>
      <span aria-hidden="true" style={{ width: tamanho / 2, height: tamanho, background: agora }} />
      <Contorno />
    </span>
  );
};

interface AmostraDeCor {
  color: string;
  label: string;
}

interface AmostrasProps {
  amostras: (string | AmostraDeCor)[];
  valor: string | null;
  toque: boolean;
  aoEscolher: (cor: string) => void;
}

export const Amostras: React.FC<AmostrasProps> = ({ amostras, valor, toque, aoEscolher }) => {
  const atual = lerCor(valor);
  const lado = toque ? 32 : 24;
  return (
    <div role="listbox" aria-label="Cores salvas" style={{ display: 'grid', gridTemplateColumns: `repeat(8, ${lado}px)`, justifyContent: 'space-between', rowGap: 'var(--ob-space-8)' }}>
      {amostras.map((s) => {
        const { color, label } = typeof s === 'string' ? { color: s, label: `${nomeDaCor(s)}, ${s.toUpperCase()}` } : s;
        const c = lerCor(color);
        if (!c) return null;
        const marcado = !!atual && escreverCor(atual) === escreverCor(c);
        return (
          <Tooltip key={color} label={label}>
            <button type="button" role="option" aria-selected={marcado} aria-label={label} onClick={() => aoEscolher(escreverCor(c))}
              style={{
                position: 'relative', width: lado, height: lado, padding: 0, border: 'none', borderRadius: 'var(--ob-r-circle)', background: 'transparent', cursor: 'pointer',
                display: 'grid', placeItems: 'center', outline: 'none',
                boxShadow: marcado ? '0 0 0 2px var(--ob-surface), 0 0 0 4px var(--ob-blue)' : 'none',
                transition: 'box-shadow var(--ob-dur-fast) var(--ob-ease), transform var(--ob-dur-fast) var(--ob-ease)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              onFocus={(e) => { if (!marcado && e.currentTarget.matches(':focus-visible')) e.currentTarget.style.boxShadow = ANEL_DO_FOCO; }}
              onBlur={(e) => { if (!marcado) e.currentTarget.style.boxShadow = 'none'; }}>
              <Amostra cor={color} tamanho={lado} />
              {marcado && (
                <span style={{ position: 'absolute', display: 'flex', zIndex: 2 }}>
                  <Ph n="check" weight="bold" size={toque ? 16 : 12} c={textoEscuroSobre(escreverCor(c)) ? TINTA_ESCURA : 'var(--ob-fg-on-color)'} />
                </span>
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};
