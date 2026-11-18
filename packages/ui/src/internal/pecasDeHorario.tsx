import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ButtonGroup } from '../actions/ButtonGroup/ButtonGroup';
import { ToggleButton } from '../actions/ToggleButton/ToggleButton';
import { useBreakpoint } from '../layout/useBreakpoint';
import {
  agora, dois, doze, escreverHorario, lerHorario, para24, periodoDe, regrasDe,
  type CicloDeHora, type Horario, type LimitesDeHorario, type Periodo,
} from './horario';

export type ParteDoHorario = 'hora' | 'minuto' | 'segundo' | 'periodo' | 'ajuste';
export type FormaDoSeletor = 'columns' | 'clock';

const useMedicao = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const ANEL_DO_FOCO = '0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)';

const estiloDoSegmento = (foco: boolean, vazio: boolean, fonte: string, disabled: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 var(--ob-space-2)',
  borderRadius: 'var(--ob-r-2xs)', outline: 'none', fontSize: fonte, lineHeight: 'var(--ob-lh-relaxed)', cursor: disabled ? 'not-allowed' : 'text',
  background: foco ? 'var(--ob-blue-100)' : 'transparent', color: vazio ? 'var(--ob-fg-mute)' : 'var(--ob-fg-strong)',
  fontWeight: 'var(--ob-w-medium)', transition: 'background var(--ob-dur-fast) var(--ob-ease)', userSelect: 'none', whiteSpace: 'nowrap',
});

interface SegmentoProps {
  valor: number | null;
  minimo?: number;
  maximo: number;
  passo?: number;
  rotulo: string;
  disabled: boolean;
  invalido: boolean;
  fonte: string;
  aoMudar: (n: number | null) => void;
  aoAvancar?: () => void;
  aoVoltar?: () => void;
  refSegmento: React.RefObject<HTMLSpanElement>;
}

const Segmento: React.FC<SegmentoProps> = ({ valor, minimo = 0, maximo, passo = 1, rotulo, disabled, invalido, fonte, aoMudar, aoAvancar, aoVoltar, refSegmento }) => {
  const [rascunho, setRascunho] = useState<number | null>(null);
  const [foco, setFoco] = useState(false);
  const total = maximo - minimo + 1;
  const ciclar = (sentido: number) => {
    if (valor == null) return sentido > 0 ? minimo : maximo - ((maximo - minimo) % passo);
    const base = Math.round((valor - minimo) / passo) * passo;
    return ((((base + sentido * passo) % total) + total) % total) + minimo;
  };
  const teclar = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const d = Number(e.key);
      if (rascunho != null) {
        const n = rascunho * 10 + d;
        setRascunho(null);
        if (n >= minimo && n <= maximo) {
          aoMudar(n);
          aoAvancar?.();
          return;
        }
      }
      if (d * 10 > maximo) {
        if (d >= minimo) {
          aoMudar(d);
          aoAvancar?.();
        }
        return;
      }
      setRascunho(d);
      if (d >= minimo) aoMudar(d);
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      setRascunho(null);
      aoMudar(ciclar(e.key === 'ArrowUp' ? 1 : -1));
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setRascunho(null);
      if (valor == null) aoVoltar?.();
      else aoMudar(null);
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ':') {
      e.preventDefault();
      aoAvancar?.();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      aoVoltar?.();
    }
  };
  const mostrado = rascunho != null ? dois(rascunho) : valor == null ? '--' : dois(valor);
  return (
    <span ref={refSegmento} role="spinbutton" tabIndex={disabled ? -1 : 0} aria-label={rotulo} aria-disabled={disabled || undefined}
      aria-invalid={invalido || undefined} aria-valuenow={valor ?? undefined} aria-valuemin={minimo} aria-valuemax={maximo}
      aria-valuetext={valor == null ? 'vazio' : dois(valor)}
      onKeyDown={teclar} onFocus={() => setFoco(true)} onBlur={() => { setFoco(false); setRascunho(null); }}
      style={estiloDoSegmento(foco, valor == null && rascunho == null, fonte, disabled)}>
      {mostrado}
    </span>
  );
};

interface SegmentoDoPeriodoProps {
  valor: Periodo | null;
  rotulo: string;
  disabled: boolean;
  invalido: boolean;
  fonte: string;
  aoMudar: (p: Periodo) => void;
  aoAvancar?: () => void;
  aoVoltar?: () => void;
  refSegmento: React.RefObject<HTMLSpanElement>;
}

const SegmentoDoPeriodo: React.FC<SegmentoDoPeriodoProps> = ({ valor, rotulo, disabled, invalido, fonte, aoMudar, aoVoltar, aoAvancar, refSegmento }) => {
  const [foco, setFoco] = useState(false);
  const teclar = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const k = e.key.toLowerCase();
    if (k === 'a' || k === 'p') {
      e.preventDefault();
      aoMudar(k === 'a' ? 'AM' : 'PM');
      aoAvancar?.();
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      aoMudar(valor === 'AM' ? 'PM' : 'AM');
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft') {
      e.preventDefault();
      aoVoltar?.();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      aoAvancar?.();
    }
  };
  return (
    <span ref={refSegmento} role="spinbutton" tabIndex={disabled ? -1 : 0} aria-label={rotulo} aria-disabled={disabled || undefined}
      aria-invalid={invalido || undefined} aria-valuetext={valor ?? 'vazio'}
      onKeyDown={teclar} onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
      style={{ ...estiloDoSegmento(foco, valor == null, fonte, disabled), marginLeft: 'var(--ob-space-4)' }}>
      {valor ?? '--'}
    </span>
  );
};

interface Partes { h: number | null; m: number | null; s: number | null; p: Periodo | null }
const VAZIO: Partes = { h: null, m: null, s: null, p: null };
const partesDe = (texto: string | null): Partes => {
  const t = lerHorario(texto);
  return t ? { ...t, p: periodoDe(t.h) } : VAZIO;
};

interface CampoDeHorarioProps {
  valor: string | null;
  aoMudar: (valor: string | null) => void;
  ciclo: CicloDeHora;
  comSegundos: boolean;
  passo: number;
  disabled: boolean;
  invalido: boolean;
  fonte: string;
  rotulo: string;
  refPrimeiro?: React.MutableRefObject<HTMLSpanElement | null>;
  aoSairPelaDireita?: () => void;
}

export const CampoDeHorario: React.FC<CampoDeHorarioProps> = ({
  valor, aoMudar, ciclo, comSegundos, passo, disabled, invalido, fonte, rotulo, refPrimeiro, aoSairPelaDireita,
}) => {
  const [pt, setPt] = useState<Partes>(() => partesDe(valor));
  useEffect(() => { setPt(partesDe(valor)); }, [valor]);
  const refs = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];
  useEffect(() => { if (refPrimeiro) refPrimeiro.current = refs[0].current; });
  const ordem = [0, 1, comSegundos ? 2 : null, ciclo === 12 ? 3 : null].filter((i): i is number => i != null);
  const ir = (i: number, sentido: number) => {
    const j = ordem.indexOf(i) + sentido;
    if (j >= ordem.length) aoSairPelaDireita?.();
    else if (j >= 0) refs[ordem[j]].current?.focus();
  };
  const atualizar = (novo: Partial<Partes>) => {
    const p = { ...pt, ...novo };
    setPt(p);
    if (p.h != null && p.m != null && (!comSegundos || p.s != null)) aoMudar(escreverHorario({ h: p.h, m: p.m, s: p.s ?? 0 }, comSegundos));
    else if (p.h == null && p.m == null && p.s == null) aoMudar(null);
  };
  const nome = (parte: string) => `${rotulo}, ${parte}`;
  const separador = <span aria-hidden="true" style={{ color: pt.h == null && pt.m == null ? 'var(--ob-fg-mute)' : 'var(--ob-fg-soft)', fontSize: fonte }}>:</span>;
  const comum = { disabled, invalido, fonte };
  return (
    <span role="group" aria-label={rotulo} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Segmento refSegmento={refs[0]} rotulo={nome('horas')} {...comum}
        valor={pt.h == null ? null : ciclo === 12 ? doze(pt.h) : pt.h} minimo={ciclo === 12 ? 1 : 0} maximo={ciclo === 12 ? 12 : 23}
        aoMudar={(n) => {
          if (n == null) {
            atualizar({ h: null });
            return;
          }
          const periodo = pt.p ?? 'AM';
          atualizar({ h: ciclo === 12 ? para24(n, periodo) : n, p: ciclo === 12 ? periodo : periodoDe(n), m: pt.m ?? 0, s: pt.s ?? 0 });
        }}
        aoAvancar={() => ir(0, 1)} />
      {separador}
      <Segmento refSegmento={refs[1]} rotulo={nome('minutos')} valor={pt.m} maximo={59} passo={passo} {...comum}
        aoMudar={(n) => atualizar({ m: n })} aoVoltar={() => ir(1, -1)} aoAvancar={() => ir(1, 1)} />
      {comSegundos && (
        <>
          {separador}
          <Segmento refSegmento={refs[2]} rotulo={nome('segundos')} valor={pt.s} maximo={59} {...comum}
            aoMudar={(n) => atualizar({ s: n })} aoVoltar={() => ir(2, -1)} aoAvancar={() => ir(2, 1)} />
        </>
      )}
      {ciclo === 12 && (
        <SegmentoDoPeriodo refSegmento={refs[3]} rotulo={nome('AM ou PM')} valor={pt.h == null ? null : pt.p} {...comum}
          aoMudar={(p) => atualizar(pt.h == null ? { p } : { p, h: para24(doze(pt.h), p) })}
          aoVoltar={() => ir(3, -1)} aoAvancar={() => ir(3, 1)} />
      )}
    </span>
  );
};

interface ItemDaColuna { valor: number; rotulo: string }

interface ColunaProps {
  titulo: string;
  itens: ItemDaColuna[];
  selecionado: number | null;
  atual: number | null;
  desabilitado: (valor: number) => boolean;
  aoEscolher: (valor: number) => void;
  toque: boolean;
}

const Coluna: React.FC<ColunaProps> = ({ titulo, itens, selecionado, atual, desabilitado, aoEscolher, toque }) => {
  const viewport = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);
  const [sobMouse, setSobMouse] = useState<number | null>(null);
  const item = toque ? 40 : 32;
  const altura = item * (toque ? 7 : 8);
  const indice = itens.findIndex((i) => i.valor === (selecionado ?? atual));
  useMedicao(() => {
    const el = viewport.current;
    if (!el || indice < 0) return;
    const reduzido = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo?.({ top: indice * item, behavior: primeira.current || reduzido ? 'auto' : 'smooth' });
    primeira.current = false;
  }, [indice, item]);
  const mover = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const sentido = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (!sentido) return;
    e.preventDefault();
    let j = i + sentido;
    while (j >= 0 && j < itens.length && desabilitado(itens[j].valor)) j += sentido;
    if (j >= 0 && j < itens.length) (e.currentTarget.parentElement?.children[j + 1] as HTMLElement | undefined)?.focus();
  };
  const sobra = (altura - item) / 2;
  const desbotado = 'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)', width: toque ? 72 : 64 }}>
      <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--ob-fs-11)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-mute)' }}>{titulo}</div>
      <div ref={viewport} style={{ height: altura, overflowY: 'auto', scrollbarWidth: 'none', overscrollBehavior: 'contain', maskImage: desbotado, WebkitMaskImage: desbotado }}>
        <div role="listbox" aria-label={titulo} onMouseLeave={() => setSobMouse(null)} style={{ display: 'flex', flexDirection: 'column', padding: '0 var(--ob-space-4)' }}>
          <div aria-hidden="true" style={{ height: sobra, flex: 'none' }} />
          {itens.map((it, i) => {
            const marcado = it.valor === selecionado;
            const fora = desabilitado(it.valor);
            return (
              <button key={it.valor} type="button" role="option" aria-selected={marcado} disabled={fora}
                tabIndex={marcado || (selecionado == null && i === Math.max(0, indice)) ? 0 : -1}
                onClick={() => aoEscolher(it.valor)} onKeyDown={(e) => mover(e, i)} onMouseEnter={() => setSobMouse(fora ? null : it.valor)}
                style={{
                  flex: 'none', height: item, border: 'none', padding: 0, borderRadius: 'var(--ob-r-sm)',
                  background: marcado ? 'var(--ob-blue)' : sobMouse === it.valor ? 'var(--ob-blue-050)' : 'transparent',
                  color: marcado ? 'var(--ob-fg-on-color)' : 'var(--ob-fg)',
                  boxShadow: it.valor === atual && !marcado ? 'inset 0 0 0 1px var(--ob-blue)' : 'none',
                  opacity: fora ? 'var(--ob-opacity-disabled)' : 1,
                  fontFamily: 'inherit', fontSize: toque ? 'var(--ob-fs-15)' : 'var(--ob-fs-13)', fontWeight: marcado ? 'var(--ob-w-bold)' : 'var(--ob-w-medium)',
                  cursor: fora ? 'not-allowed' : 'pointer', transition: 'background var(--ob-dur-fast) var(--ob-ease), color var(--ob-dur-fast) var(--ob-ease)',
                }}>
                {it.rotulo}
              </button>
            );
          })}
          <div aria-hidden="true" style={{ height: sobra, flex: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export interface SeletorProps {
  valor: string | null;
  passo: number;
  ciclo: CicloDeHora;
  comSegundos: boolean;
  limites: LimitesDeHorario;
  aoEscolher: (valor: string, parte: ParteDoHorario) => void;
}

const SeletorDePeriodo: React.FC<{ valor: Periodo | null; livre: (p: Periodo) => boolean; vertical?: boolean; aoMudar: (p: Periodo) => void }> = ({ valor, livre, vertical, aoMudar }) => (
  <ButtonGroup selection="single" value={valor} fullWidth={!vertical} orientation={vertical ? 'vertical' : 'horizontal'} size="sm" ariaLabel="AM ou PM"
    onChange={(p) => { if (p && p !== valor) aoMudar(p as Periodo); }}>
    <ToggleButton value="AM" appearance="ghost" tone="neutral" disabled={!livre('AM')}>AM</ToggleButton>
    <ToggleButton value="PM" appearance="ghost" tone="neutral" disabled={!livre('PM')}>PM</ToggleButton>
  </ButtonGroup>
);

const ColunasDeHorario: React.FC<SeletorProps> = ({ valor, passo, ciclo, comSegundos, limites, aoEscolher }) => {
  const toque = !useBreakpoint().atLeast('sm');
  const t = lerHorario(valor);
  const hoje = agora(passo);
  const base = t ?? { ...hoje, s: 0 };
  const periodo = periodoDe(base.h);
  const { minutos, segundos, fora, minutoLivre, horaLivre, periodoLivre, ajustar } = regrasDe(limites, passo, comSegundos);
  const horas = (ciclo === 12 ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : Array.from({ length: 24 }, (_, h) => h)).map((h) => ({ valor: h, rotulo: dois(h) }));
  const h24 = (h: number) => (ciclo === 12 ? para24(h, periodo) : h);
  const visivel = (h: number) => (ciclo === 12 ? doze(h) : h);
  const escolher = (novo: Horario, parte: ParteDoHorario) => aoEscolher(escreverHorario(novo, comSegundos), parte);
  const colunas = (
    <div style={{ display: 'flex', gap: 'var(--ob-space-2)', justifyContent: 'center' }}>
      <Coluna titulo="Hora" itens={horas} selecionado={t ? visivel(t.h) : null} atual={visivel(hoje.h)} toque={toque}
        desabilitado={(h) => !horaLivre(h24(h))} aoEscolher={(h) => escolher(ajustar(h24(h), base.m, base.s), 'hora')} />
      <Coluna titulo="Min" itens={minutos.map((m) => ({ valor: m, rotulo: dois(m) }))} selecionado={t && minutos.includes(t.m) ? t.m : null}
        atual={t ? null : hoje.m} toque={toque}
        desabilitado={(m) => !minutoLivre(base.h, m)} aoEscolher={(m) => escolher(ajustar(base.h, m, base.s), 'minuto')} />
      {comSegundos && (
        <Coluna titulo="Seg" itens={segundos.map((s) => ({ valor: s, rotulo: dois(s) }))} selecionado={t ? t.s : null} atual={t ? null : hoje.s} toque={toque}
          desabilitado={(s) => fora(base.h, base.m, s)} aoEscolher={(s) => escolher({ h: base.h, m: base.m, s }, 'segundo')} />
      )}
    </div>
  );
  if (ciclo !== 12) return colunas;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-8)' }}>
      <SeletorDePeriodo valor={t ? periodo : null} livre={periodoLivre} aoMudar={(p) => escolher(ajustar(para24(doze(base.h), p), base.m, base.s), 'periodo')} />
      {colunas}
    </div>
  );
};

interface Geometria { lado: number; centro: number; fora: number; dentro: number; tracos: number; bolha: number }

const geometriaDo = (toque: boolean): Geometria => {
  const lado = toque ? 288 : 232;
  const k = lado / 232;
  return { lado, centro: lado / 2, fora: 90 * k, dentro: 58 * k, tracos: 108 * k, bolha: toque ? 40 : 32 };
};

const VOLTA = 2 * Math.PI;

interface Posicao { valor: number; indice: number; total: number; raio: 'fora' | 'dentro'; rotulo: string | null }

const ponto = (g: Geometria, indice: number, raio: number, total: number) => {
  const a = (indice / total) * VOLTA;
  return { x: g.centro + raio * Math.sin(a), y: g.centro - raio * Math.cos(a) };
};

const maisPerto = (g: Geometria, posicoes: Posicao[], dx: number, dy: number) => {
  const angulo = (Math.atan2(dx, -dy) + VOLTA) % VOLTA;
  const aneis = new Set(posicoes.map((p) => p.raio));
  const anel = aneis.size > 1 && Math.hypot(dx, dy) < (g.fora + g.dentro) / 2 ? 'dentro' : 'fora';
  let melhor: Posicao | null = null;
  let menor = Infinity;
  for (const p of posicoes) {
    if (p.raio !== anel) continue;
    const d = Math.abs((p.indice / p.total) * VOLTA - angulo);
    const giro = Math.min(d, VOLTA - d);
    if (giro < menor) {
      menor = giro;
      melhor = p;
    }
  }
  return melhor;
};

const bolhaEm = (g: Geometria, x: number, y: number): React.CSSProperties => ({
  position: 'absolute', left: x - g.bolha / 2, top: y - g.bolha / 2, width: g.bolha, height: g.bolha, borderRadius: 'var(--ob-r-circle)',
});

interface MostradorProps {
  g: Geometria;
  rotulo: string;
  posicoes: Posicao[];
  selecionado: number | null;
  atual: number | null;
  livre: (valor: number) => boolean;
  aoMover: (valor: number) => void;
  aoSoltar: (valor: number) => void;
  aoAjustar: (valor: number) => void;
}

const Mostrador: React.FC<MostradorProps> = ({ g, rotulo, posicoes, selecionado, atual, livre, aoMover, aoSoltar, aoAjustar }) => {
  const ref = useRef<HTMLDivElement>(null);
  const arrasto = useRef<number | null>(null);
  const giro = useRef<number | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [sob, setSob] = useState<number | null>(null);
  const [focoDeTeclado, setFocoDeTeclado] = useState(false);
  const raioDe = (p: Posicao) => (p.raio === 'dentro' ? g.dentro : g.fora);
  const sel = posicoes.find((p) => p.valor === selecionado);
  let angulo: number | null = null;
  if (sel) {
    angulo = (sel.indice / sel.total) * 360;
    if (giro.current != null) angulo = giro.current + ((((angulo - giro.current) % 360) + 540) % 360) - 180;
  }
  useEffect(() => { if (angulo != null) giro.current = angulo; });

  const perto = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const p = maisPerto(g, posicoes, e.clientX - r.left - g.centro, e.clientY - r.top - g.centro);
    return p && livre(p.valor) ? p : null;
  };
  const apertar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    ref.current!.focus({ preventScroll: true });
    ref.current!.setPointerCapture?.(e.pointerId);
    setArrastando(true);
    setSob(null);
    const p = perto(e);
    arrasto.current = p ? p.valor : selecionado;
    if (p) aoMover(p.valor);
  };
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = perto(e);
    if (!arrastando) {
      setSob(p ? p.valor : null);
      return;
    }
    if (p && p.valor !== arrasto.current) {
      arrasto.current = p.valor;
      aoMover(p.valor);
    }
  };
  const soltar = () => {
    if (!arrastando) return;
    setArrastando(false);
    if (arrasto.current != null) aoSoltar(arrasto.current);
  };
  const ordem = posicoes.filter((p) => livre(p.valor)).map((p) => p.valor).sort((a, b) => a - b);
  const teclar = (e: React.KeyboardEvent) => {
    setFocoDeTeclado(true);
    if (!ordem.length) return;
    const i = selecionado == null ? -1 : ordem.indexOf(selecionado);
    const passo = ({ ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    if (passo) {
      e.preventDefault();
      const j = i < 0 ? (passo > 0 ? 0 : ordem.length - 1) : (i + passo + ordem.length) % ordem.length;
      aoAjustar(ordem[j]);
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      aoAjustar(e.key === 'Home' ? ordem[0] : ordem[ordem.length - 1]);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      aoSoltar(selecionado ?? ordem[0]);
    }
  };
  const grande = g.bolha > 32;
  const numeros = (acima: boolean) => posicoes.filter((p) => p.rotulo && (p.valor === selecionado) === acima).map((p) => {
    const { x, y } = ponto(g, p.indice, raioDe(p), p.total);
    const marcado = p.valor === selecionado;
    const dentro = p.raio === 'dentro';
    return (
      <span key={p.valor} aria-hidden="true" style={{
        ...bolhaEm(g, x, y), display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        fontSize: dentro ? (grande ? 'var(--ob-fs-13)' : 'var(--ob-fs-12)') : grande ? 'var(--ob-fs-16)' : 'var(--ob-fs-14)',
        fontWeight: marcado ? 'var(--ob-w-bold)' : 'var(--ob-w-medium)',
        color: marcado ? 'var(--ob-fg-on-color)' : dentro ? 'var(--ob-fg-soft)' : 'var(--ob-fg-strong)',
        opacity: livre(p.valor) ? 1 : 'var(--ob-opacity-disabled)',
        boxShadow: p.valor === atual && !marcado ? 'inset 0 0 0 1px var(--ob-blue)' : 'none',
        transition: 'color var(--ob-dur-fast) var(--ob-ease)',
      }}>
        {p.rotulo}
      </span>
    );
  });
  const fantasma = sob != null && sob !== selecionado ? posicoes.find((p) => p.valor === sob) : undefined;
  const suave = 'var(--ob-dur-base) var(--ob-ease)';
  const raioSel = sel ? raioDe(sel) : 0;
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label={rotulo} aria-valuenow={selecionado ?? undefined}
      aria-valuetext={sel ? sel.rotulo ?? dois(sel.valor) : 'vazio'}
      onPointerDown={apertar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={() => setArrastando(false)} onPointerLeave={() => setSob(null)}
      onKeyDown={teclar} onBlur={() => setFocoDeTeclado(false)}
      style={{
        position: 'relative', flex: 'none', width: g.lado, height: g.lado, margin: '0 auto', borderRadius: 'var(--ob-r-circle)',
        background: 'var(--ob-line-soft)', touchAction: 'none', userSelect: 'none', cursor: 'pointer', outline: 'none',
        boxShadow: focoDeTeclado ? ANEL_DO_FOCO : 'none',
      }}>
      {posicoes.filter((p) => !p.rotulo).map((p) => {
        const { x, y } = ponto(g, p.indice, g.tracos, p.total);
        return <span key={`t${p.valor}`} aria-hidden="true" style={{ position: 'absolute', left: x - 1, top: y - 1, width: 2, height: 2, borderRadius: 'var(--ob-r-circle)', background: 'var(--ob-fg-mute)', opacity: livre(p.valor) ? 1 : 'var(--ob-opacity-disabled)' }} />;
      })}
      {fantasma && (() => {
        const { x, y } = ponto(g, fantasma.indice, raioDe(fantasma), fantasma.total);
        return <span aria-hidden="true" style={{ ...bolhaEm(g, x, y), background: 'var(--ob-blue-100)' }} />;
      })()}
      {numeros(false)}
      {sel && (
        <div aria-hidden="true" style={{
          position: 'absolute', left: g.centro - 1, top: g.centro - raioSel, width: 2, height: raioSel, background: 'var(--ob-blue)',
          transformOrigin: '50% 100%', transform: `rotate(${angulo}deg)`,
          transition: arrastando ? 'none' : `transform ${suave}, height ${suave}, top ${suave}`,
        }}>
          <span style={{ ...bolhaEm(g, 1, 0), background: 'var(--ob-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!sel.rotulo && <span style={{ width: 4, height: 4, borderRadius: 'var(--ob-r-circle)', background: 'var(--ob-fg-on-color)' }} />}
          </span>
        </div>
      )}
      <span aria-hidden="true" style={{ position: 'absolute', left: g.centro - 3, top: g.centro - 3, width: 6, height: 6, borderRadius: 'var(--ob-r-circle)', background: sel ? 'var(--ob-blue)' : 'var(--ob-fg-mute)' }} />
      {numeros(true)}
    </div>
  );
};

const Digito: React.FC<{ ativo: boolean; vazio: boolean; rotulo: string; largura: number; aoClicar: () => void; children: React.ReactNode }> = ({ ativo, vazio, rotulo, largura, aoClicar, children }) => {
  const [sob, setSob] = useState(false);
  return (
    <button type="button" aria-label={rotulo} aria-pressed={ativo} onClick={aoClicar} onMouseEnter={() => setSob(true)} onMouseLeave={() => setSob(false)}
      style={{
        width: largura, height: 48, border: 'none', padding: 0, borderRadius: 'var(--ob-r-sm)', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 'var(--ob-fs-28)', fontWeight: 'var(--ob-w-semibold)', lineHeight: 'var(--ob-lh-none)',
        background: ativo ? 'var(--ob-blue-050)' : sob ? 'var(--ob-line-soft)' : 'transparent',
        color: ativo ? 'var(--ob-blue)' : vazio ? 'var(--ob-fg-mute)' : 'var(--ob-fg-soft)',
        transition: 'background var(--ob-dur-fast) var(--ob-ease), color var(--ob-dur-fast) var(--ob-ease)',
      }}>
      {children}
    </button>
  );
};

type Vista = 'hora' | 'minuto' | 'segundo';

const RelogioDeHorario: React.FC<SeletorProps> = ({ valor, passo, ciclo, comSegundos, limites, aoEscolher }) => {
  const g = geometriaDo(!useBreakpoint().atLeast('sm'));
  const t = lerHorario(valor);
  const [vista, setVista] = useState<Vista>('hora');
  const [rascunho, setRascunho] = useState<Horario | null>(null);
  const hoje = agora(passo);
  const { minutos, segundos, fora, minutoLivre, horaLivre, periodoLivre, ajustar } = regrasDe(limites, passo, comSegundos);
  const mostrado = rascunho ?? t;
  const base = mostrado ?? { ...hoje, s: 0 };
  const periodo = periodoDe(base.h);
  const montar = (v: number): Horario => (vista === 'hora' ? ajustar(v, base.m, base.s) : vista === 'minuto' ? ajustar(base.h, v, base.s) : { h: base.h, m: base.m, s: v });
  const confirmar = (novo: Horario, parte: ParteDoHorario) => {
    setRascunho(null);
    aoEscolher(escreverHorario(novo, comSegundos), parte);
  };
  const horas = ciclo === 12 ? Array.from({ length: 12 }, (_, i) => i + (periodo === 'PM' ? 12 : 0)) : Array.from({ length: 24 }, (_, h) => h);
  const vistas: Record<Vista, { rotulo: string; posicoes: Posicao[]; selecionado: number | null; atual: number | null; livre: (v: number) => boolean }> = {
    hora: {
      rotulo: 'Hora',
      posicoes: horas.map((h) => ({
        valor: h, indice: h % 12, total: 12, raio: ciclo === 24 && (h === 0 || h > 12) ? 'dentro' : 'fora',
        rotulo: ciclo === 12 ? String(doze(h)) : h === 0 ? '00' : String(h),
      })),
      selecionado: mostrado?.h ?? null,
      atual: t ? null : hoje.h,
      livre: horaLivre,
    },
    minuto: {
      rotulo: 'Minutos',
      posicoes: minutos.map((m) => ({ valor: m, indice: m, total: 60, raio: 'fora', rotulo: m % 5 === 0 ? dois(m) : null })),
      selecionado: mostrado && minutos.includes(mostrado.m) ? mostrado.m : null,
      atual: null,
      livre: (m) => minutoLivre(base.h, m),
    },
    segundo: {
      rotulo: 'Segundos',
      posicoes: segundos.map((s) => ({ valor: s, indice: s, total: 60, raio: 'fora', rotulo: s % 5 === 0 ? dois(s) : null })),
      selecionado: mostrado ? mostrado.s : null,
      atual: null,
      livre: (s) => !fora(base.h, base.m, s),
    },
  };
  const atual = vistas[vista];
  const proxima: Record<Vista, Vista> = { hora: 'minuto', minuto: comSegundos ? 'segundo' : 'minuto', segundo: 'segundo' };
  const largura = comSegundos ? 52 : 64;
  const separador = <span aria-hidden="true" style={{ fontSize: 'var(--ob-fs-28)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-mute)' }}>:</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)', width: g.lado }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ob-space-2)' }}>
        <Digito rotulo="Escolher a hora" ativo={vista === 'hora'} vazio={!mostrado} largura={largura} aoClicar={() => setVista('hora')}>
          {mostrado ? dois(ciclo === 12 ? doze(mostrado.h) : mostrado.h) : '--'}
        </Digito>
        {separador}
        <Digito rotulo="Escolher os minutos" ativo={vista === 'minuto'} vazio={!mostrado} largura={largura} aoClicar={() => setVista('minuto')}>
          {mostrado ? dois(mostrado.m) : '--'}
        </Digito>
        {comSegundos && (
          <>
            {separador}
            <Digito rotulo="Escolher os segundos" ativo={vista === 'segundo'} vazio={!mostrado} largura={largura} aoClicar={() => setVista('segundo')}>
              {mostrado ? dois(mostrado.s) : '--'}
            </Digito>
          </>
        )}
        {ciclo === 12 && (
          <span style={{ marginLeft: 'var(--ob-space-8)' }}>
            <SeletorDePeriodo vertical valor={mostrado ? periodo : null} livre={periodoLivre}
              aoMudar={(p) => confirmar(ajustar(para24(doze(base.h), p), base.m, base.s), 'periodo')} />
          </span>
        )}
      </div>
      <Mostrador g={g} rotulo={atual.rotulo} posicoes={atual.posicoes} selecionado={atual.selecionado} atual={atual.atual} livre={atual.livre}
        aoMover={(v) => setRascunho(montar(v))}
        aoAjustar={(v) => confirmar(montar(v), 'ajuste')}
        aoSoltar={(v) => {
          confirmar(montar(v), vista);
          setVista(proxima[vista]);
        }} />
    </div>
  );
};

export const SeletorDeHorario: React.FC<SeletorProps & { forma: FormaDoSeletor }> = ({ forma, ...props }) => (
  forma === 'clock' ? <RelogioDeHorario {...props} /> : <ColunasDeHorario {...props} />
);
