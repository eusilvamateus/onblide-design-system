import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../actions/Button/Button';
import { Select } from '../Select/Select';
import { Tabs } from '../../navigation/Tabs/Tabs';
import { Tooltip } from '../../overlays/Tooltip/Tooltip';
import { Ph } from '../../iconography/Ph/Ph';
import { Divider } from '../../data-display/Divider/Divider';
import { useBreakpoint } from '../../layout/useBreakpoint';
import {
  escreverCor, hslParaRgb, hsvParaRgb, hsvaDe, hsvaParaTexto, lerCor, rgbParaHsl, rgbParaHsv, saturacaoDe, type Hsva,
} from '../../internal/cor';
import {
  ARCO_IRIS, XADREZ, Amostras, Area, Barras, Canais, Comparacao, Espectro, Faixa, Grade, type FormatoDeCor,
} from '../../internal/pecasDeCor';

/** Cor salva com nome próprio. */
export interface ColorSwatch {
  /** Cor em hexadecimal (`#rrggbb` ou `#rrggbbaa`). */
  color: string;
  /** Nome lido pelo leitor de tela e mostrado na dica. */
  label: string;
}

/** Forma de escolher a cor: `area` (quadrado de saturação e brilho com a barra de matiz), `grid` (grade de cores prontas), `spectrum` (todas as matizes de uma vez, com a barra de saturação) ou `sliders` (barras de vermelho, verde e azul). */
export type ColorPickerMode = 'area' | 'grid' | 'spectrum' | 'sliders';

/** Formato dos campos numéricos do painel. */
export type ColorFormat = FormatoDeCor;

export interface ColorPickerProps {
  /** Cor escolhida em hexadecimal minúsculo (`#rrggbb`, ou `#rrggbbaa` com `alpha`), em modo controlado. `null` é sem cor. */
  value?: string | null;
  /** Cor inicial, em modo não controlado. */
  defaultValue?: string | null;
  /** Chamado a cada mudança, inclusive durante o arrasto. */
  onChange?: (value: string) => void;
  /** Chamado uma vez quando a pessoa termina de escolher: ao soltar o arrasto, ao clicar numa amostra, a cada tecla e ao confirmar um campo. Use para salvar ou validar sem repetir o trabalho a cada movimento. */
  onChangeEnd?: (value: string | null) => void;
  /** Mostra a barra e o campo de transparência; o valor passa a ter oito dígitos quando a cor não é opaca. */
  alpha?: boolean;
  /** Cores salvas mostradas abaixo dos campos, como hexadecimal ou com um nome (`{ color, label }`). Sem nome, o leitor de tela anuncia o nome aproximado da cor. */
  swatches?: (string | ColorSwatch)[];
  /** Mostra só as cores salvas, sem área, barras nem campos. */
  swatchesOnly?: boolean;
  /** Formato em que os campos numéricos aparecem ao abrir; a pessoa troca no próprio painel. O valor emitido é sempre hexadecimal. */
  format?: ColorFormat;
  /** Formas de escolher a cor, na ordem das abas. Com uma só, as abas não aparecem. Cabem até três na largura padrão. */
  modes?: ColorPickerMode[];
  /** Largura do painel, em pixels. Padrão 272 (248 com `swatchesOnly`). */
  width?: number;
}

const ROTULOS: Record<ColorPickerMode, string> = { area: 'Livre', grid: 'Grade', spectrum: 'Espectro', sliders: 'Barras' };
const FORMATOS: FormatoDeCor[] = ['hex', 'rgb', 'hsl'];

interface EyeDropperConstrutor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

/** Painel para escolher uma cor: área livre, grade, espectro ou barras, campos em HEX, RGB ou HSL, transparência, conta-gotas e cores salvas. */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  value, defaultValue = null, onChange, onChangeEnd, alpha = false, swatches = [], swatchesOnly = false,
  format = 'hex', modes = ['area'], width,
}) => {
  const toque = !useBreakpoint().atLeast('sm');
  const largura = width ?? (swatchesOnly ? 248 : 272);
  const [interno, setInterno] = useState<string | null>(defaultValue);
  const valor = value !== undefined ? value : interno;
  const [hsva, setHsva] = useState<Hsva>(() => hsvaDe(valor));
  const [saturacao, setSaturacao] = useState(() => saturacaoDe(valor));
  const [formato, setFormato] = useState<FormatoDeCor>(format);
  const [antes] = useState(valor);
  const formas = modes.length ? modes : (['area'] as ColorPickerMode[]);
  const [modo, setModo] = useState<ColorPickerMode>(formas[0]);
  const [contaGotas, setContaGotas] = useState<EyeDropperConstrutor | null>(null);
  const ultimo = useRef(valor);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const construtor = (window as unknown as { EyeDropper?: EyeDropperConstrutor }).EyeDropper;
    if (construtor) setContaGotas(() => construtor);
  }, []);

  useEffect(() => {
    if (valor === ultimo.current) return;
    ultimo.current = valor;
    setHsva((h) => hsvaDe(valor, h));
    setSaturacao((s) => saturacaoDe(valor, s));
  }, [valor]);

  const emitir = (texto: string) => {
    ultimo.current = texto;
    setSaturacao((s) => saturacaoDe(texto, s));
    if (value === undefined) setInterno(texto);
    onChange?.(texto);
  };
  const terminar = () => onChangeEnd?.(ultimo.current);
  const mudar = (novo: Hsva) => {
    const n = { ...novo, a: alpha ? novo.a : 1 };
    setHsva(n);
    emitir(hsvaParaTexto(n));
  };
  const escolher = (texto: string) => {
    setHsva((h) => hsvaDe(texto, h));
    emitir(texto);
  };
  const escolherETerminar = (texto: string) => {
    escolher(texto);
    terminar();
  };

  if (swatchesOnly) {
    return (
      <div style={{ width: largura }}>
        <Amostras amostras={swatches} valor={valor} toque={toque} aoEscolher={escolherETerminar} />
      </div>
    );
  }

  const rgb = hsvParaRgb(hsva);
  const opaca = escreverCor(rgb);
  const luz = rgbParaHsl(rgb).l;
  const campos = toque ? 'md' : 'sm';
  const altura = formas.length > 1 ? Math.round((largura / 12) * 10) : toque ? 200 : 152;
  const faixasDo = (m: ColorPickerMode) => (m === 'area' || m === 'spectrum' ? 1 : 0) + (alpha ? 1 : 0);
  const reservadas = Math.max(...formas.map(faixasDo));
  const altoDaFaixa = toque ? 32 : 20;
  const vao = toque ? 4 : 6;
  const pegar = () => {
    if (!contaGotas) return;
    new contaGotas().open().then((r) => {
      const c = lerCor(r.sRGBHex);
      if (c) escolherETerminar(escreverCor({ ...c, a: alpha ? hsva.a : 1 }));
    }).catch(() => undefined);
  };

  return (
    <div ref={raiz} tabIndex={-1} style={{ width: largura, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)', outline: 'none' }}>
      {formas.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tabs variant="pill" size={toque ? 'md' : 'sm'} active={modo} onChange={(id) => setModo(id as ColorPickerMode)}
            tabs={formas.map((m) => ({ id: m, label: ROTULOS[m] }))} />
        </div>
      )}
      <div style={{ height: altura }}>
        {modo === 'grid' ? (
          <Grade valor={valor} aoEscolher={(cor) => escolher(escreverCor({ ...lerCor(cor)!, a: alpha ? hsva.a : 1 }))} aoTerminar={terminar} />
        ) : modo === 'spectrum' ? (
          <Espectro hsva={hsva} saturacao={saturacao} toque={toque} aoMudar={mudar} aoTerminar={terminar} />
        ) : modo === 'sliders' ? (
          <Barras hsva={hsva} toque={toque} aoMudar={mudar} aoTerminar={terminar} />
        ) : (
          <Area hsva={hsva} toque={toque} aoMudar={mudar} aoTerminar={terminar} />
        )}
      </div>
      {reservadas > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `var(--ob-space-${vao})`, minHeight: reservadas * altoDaFaixa + (reservadas - 1) * vao }}>
          {modo === 'area' && (
            <Faixa rotulo="Matiz" valor={hsva.h} maximo={360} texto={(v) => `${Math.round(v)}°`} corDoPegador={`hsl(${hsva.h} 100% 50%)`} toque={toque}
              fundo={ARCO_IRIS} aoMudar={(h) => mudar({ ...hsva, h: Math.min(h, 359.9) })} aoTerminar={terminar} />
          )}
          {modo === 'spectrum' && (
            <Faixa rotulo="Saturação" valor={saturacao} maximo={100} texto={(v) => `${Math.round(v)}%`} corDoPegador={opaca} toque={toque}
              fundo={`linear-gradient(to right, hsl(${hsva.h} 0% 50%), hsl(${hsva.h} 100% 50%))`}
              aoMudar={(s) => {
                setSaturacao(s);
                mudar({ ...rgbParaHsv(hslParaRgb({ h: hsva.h, s, l: luz })), h: hsva.h, a: hsva.a });
              }}
              aoTerminar={terminar} />
          )}
          {alpha && (
            <Faixa rotulo="Transparência" valor={hsva.a} maximo={1} texto={(v) => `${Math.round(v * 100)}%`} corDoPegador={hsvaParaTexto(hsva)} toque={toque}
              fundo={`linear-gradient(to right, transparent, ${opaca}), ${XADREZ}`} aoMudar={(a) => mudar({ ...hsva, a: Math.round(a * 100) / 100 })}
              aoTerminar={terminar} />
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-8)' }}>
        <Comparacao antes={antes} agora={valor && lerCor(valor) ? hsvaParaTexto(hsva) : null} tamanho={toque ? 36 : 28}
          aoVoltar={() => {
            if (!antes) return;
            escolherETerminar(antes);
            raiz.current?.focus({ preventScroll: true });
          }} />
        <div style={{ flex: 'none' }}>
          <Select size={campos} width={toque ? 96 : 84} options={FORMATOS.map((f) => f.toUpperCase())} value={formato.toUpperCase()}
            onChange={(f) => setFormato(String(f).toLowerCase() as FormatoDeCor)} ariaLabel="Formato da cor" />
        </div>
        <span style={{ flex: 1 }} />
        {contaGotas && (
          <Tooltip label="Pegar cor da tela">
            <Button kind="quiet" size="sm" iconOnly aria-label="Pegar cor da tela" icon={<Ph n="eyedropper" size={18} />} onClick={pegar} />
          </Tooltip>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-4)' }}>
        <Canais hsva={hsva} formato={formato} comAlfa={alpha} tamanho={campos} aoMudar={(n) => { mudar(n); terminar(); }} />
      </div>
      {swatches.length > 0 && (
        <>
          <Divider decorative />
          <Amostras amostras={swatches} valor={valor} toque={toque} aoEscolher={escolherETerminar} />
        </>
      )}
    </div>
  );
};
