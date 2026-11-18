import React, { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';

/** Uma mudança de lugar: o item `id` saiu da lista `from` e entrou na lista `to` na posição `index` (contada sem ele). */
export interface DragMove {
  id: string;
  from: string;
  to: string;
  index: number;
}

/** Fase do item arrastado: `lifted` enquanto segue o ponteiro ou o teclado, `settling` enquanto viaja até a vaga. */
export type DragPhase = 'lifted' | 'settling';

export interface UseDragAndDropOptions {
  /** As listas e a ordem dos ids em cada uma, na ordem em que aparecem na tela: `{ separar: ['a', 'b'], embalar: [] }`. */
  lists: Record<string, string[]>;
  /** Chamado uma vez, ao assentar, quando o item muda de lugar. Use `applyDragMove` para aplicar a mudança às listas. */
  onMove: (move: DragMove) => void;
  /** Diz se o item pode ir da lista `from` para a lista `to`. Quando não pode, a lista avisa e o item volta ao soltar. */
  canDrop?: (id: string, from: string, to: string) => boolean;
  /** Nome do item lido pelo leitor de tela ("Pedido #1042"). */
  getItemLabel?: (id: string) => string;
  /** Nome da lista lido pelo leitor de tela ("Embalar"). */
  getListLabel?: (listId: string) => string;
}

export interface UseDragAndDropResult {
  /** Id do item que está sendo arrastado, ou `null`. */
  draggingId: string | null;
  /** Fase do item arrastado, ou `null`. */
  phase: DragPhase | null;
  /** Lista sob o item arrastado, ou `null`. */
  overList: string | null;
  /** `true` quando a lista sob o item não aceita o item (`canDrop`). */
  blocked: boolean;
  /** Props do elemento que contém os itens de uma lista, em coluna. */
  listProps: (listId: string) => { ref: (el: HTMLElement | null) => void };
  /** Props do elemento de cada item. Com o mouse, o item inteiro arrasta; no toque, só a alça. */
  itemProps: (id: string, listId: string) => {
    ref: (el: HTMLElement | null) => void;
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
  /** Props do `Button` só com ícone que serve de alça: arrasto no toque e Espaço, setas e Esc no teclado. Fica `pressed` enquanto o item é movido pelo teclado. */
  handleProps: (id: string, listId: string) => {
    'data-ob-drag-handle': '';
    onKeyDown: (e: React.KeyboardEvent) => void;
    'aria-roledescription': string;
    pressed: boolean;
    style: React.CSSProperties;
  };
  /** Estilo da superfície visível do item (o `Card`), que sobe e ganha sombra enquanto é arrastado. */
  liftStyle: (id: string) => React.CSSProperties;
  /** Avisos para o leitor de tela e a vaga onde o item vai cair; renderize uma vez, perto das listas. */
  overlay: React.ReactNode;
}

/** Aplica um `DragMove` às listas e devolve as listas novas, sem alterar as originais. */
export const applyDragMove = (lists: Record<string, string[]>, { id, from, to, index }: DragMove): Record<string, string[]> => {
  const origem = lists[from].filter((x) => x !== id);
  const destino = from === to ? origem.slice() : lists[to].filter((x) => x !== id);
  destino.splice(Math.max(0, Math.min(index, destino.length)), 0, id);
  return { ...lists, [from]: origem, [to]: destino };
};

const LIMIAR = 5;
const BORDA = 72;
const ESCONDIDO: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
const VIZINHOS = 'transform var(--ob-dur-fast) var(--ob-ease-out)';
const VIAGEM = 'transform var(--ob-dur-base) var(--ob-ease-out)';

interface Item { id: string; x: number; y: number; w: number; h: number }
interface Lista { ids: string[]; itens: Item[]; caixa: { x: number; y: number; w: number; h: number }; topo: number; esquerda: number; vao: number }
interface Sessao {
  id: string;
  origem: string;
  indiceOrigem: number;
  foto: Record<string, Lista>;
  rect: Item;
  ox: number;
  oy: number;
  px: number;
  py: number;
  cx: number;
  cy: number;
  alvo: string | null;
  indice: number;
  bloqueado: boolean;
  teclado: boolean;
  saindo: boolean;
  quadro: number;
  desfazer: () => void;
}
interface Vaga { x: number; y: number; w: number; h: number }

const duracaoDe = (el: HTMLElement) => Math.max(0, ...getComputedStyle(el).transitionDuration.split(',').map((s) => parseFloat(s) * 1000));

/**
 * Arrastar e soltar entre listas verticais no padrão do design system: o próprio item sobe, segue o ponteiro enquanto
 * os vizinhos abrem espaço e assenta na vaga ao soltar, com os tokens de movimento. Funciona com mouse, toque (pela
 * alça) e teclado, avisa o leitor de tela e rola a janela quando o item chega perto da borda.
 */
export function useDragAndDrop({ lists, onMove, canDrop, getItemLabel = (id) => id, getListLabel = (id) => id }: UseDragAndDropOptions): UseDragAndDropResult {
  const listas = useRef(lists);
  listas.current = lists;
  const opcoes = useRef({ onMove, canDrop, getItemLabel, getListLabel });
  opcoes.current = { onMove, canDrop, getItemLabel, getListLabel };
  const conteineres = useRef(new Map<string, HTMLElement>());
  const elementos = useRef(new Map<string, HTMLElement>());
  const sessao = useRef<Sessao | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [phase, setPhase] = useState<DragPhase | null>(null);
  const [overList, setOverList] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [aviso, setAviso] = useState('');

  const fotografar = () => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const foto: Record<string, Lista> = {};
    for (const [lid, ids] of Object.entries(listas.current)) {
      const cont = conteineres.current.get(lid);
      if (!cont) continue;
      const rc = cont.getBoundingClientRect();
      const cs = getComputedStyle(cont);
      foto[lid] = {
        ids,
        itens: ids.flatMap((id) => {
          const el = elementos.current.get(id);
          if (!el) return [];
          const r = el.getBoundingClientRect();
          return [{ id, x: r.left + sx, y: r.top + sy, w: r.width, h: r.height }];
        }),
        caixa: { x: rc.left + sx, y: rc.top + sy, w: rc.width, h: rc.height },
        topo: rc.top + sy + parseFloat(cs.paddingTop),
        esquerda: rc.left + sx + parseFloat(cs.paddingLeft),
        vao: parseFloat(cs.rowGap) || 0,
      };
    }
    return foto;
  };

  const passo = (s: Sessao, lid: string) => s.rect.h + (s.foto[lid]?.vao ?? 0);
  const topoVirtual = (s: Sessao, lid: string, it: Item) => it.y + (lid === s.origem && s.foto[lid].ids.indexOf(it.id) > s.indiceOrigem ? -passo(s, s.origem) : 0);
  const semOArrastado = (s: Sessao, lid: string) => s.foto[lid].itens.filter((i) => i.id !== s.id);

  const vagaDe = (s: Sessao) => {
    const lid = s.alvo!;
    const L = s.foto[lid];
    const sem = semOArrastado(s, lid);
    if (s.indice < sem.length) return { x: sem[s.indice].x, y: topoVirtual(s, lid, sem[s.indice]) };
    if (sem.length) {
      const u = sem[sem.length - 1];
      return { x: u.x, y: topoVirtual(s, lid, u) + u.h + L.vao };
    }
    return { x: L.esquerda, y: L.topo };
  };

  const aplicarVizinhos = (s: Sessao, abrir: boolean) => {
    for (const [lid, L] of Object.entries(s.foto)) {
      let k = 0;
      for (const it of L.itens) {
        if (it.id === s.id) continue;
        let d = 0;
        if (abrir && lid === s.origem && L.ids.indexOf(it.id) > s.indiceOrigem) d -= passo(s, s.origem);
        if (abrir && s.alvo === lid && !s.bloqueado && k >= s.indice) d += passo(s, lid);
        const el = elementos.current.get(it.id);
        if (el) {
          el.style.transition = VIZINHOS;
          el.style.transform = d ? `translate3d(0, ${d}px, 0)` : '';
        }
        k++;
      }
    }
  };

  const posicionar = (s: Sessao, x: number, y: number, suave: boolean) => {
    const el = elementos.current.get(s.id);
    if (!el) return;
    el.style.transition = suave ? VIAGEM : 'none';
    el.style.transform = `translate3d(${x - s.rect.x}px, ${y - s.rect.y}px, 0)`;
  };

  const atualizarAlvo = (s: Sessao, lid: string | null, indice: number) => {
    const { canDrop: pode, getListLabel } = opcoes.current;
    const bloq = !!lid && lid !== s.origem && !!pode && !pode(s.id, s.origem, lid);
    if (s.alvo === lid && s.indice === indice && s.bloqueado === bloq) return;
    s.alvo = lid;
    s.indice = indice;
    s.bloqueado = bloq;
    aplicarVizinhos(s, true);
    setOverList(lid);
    setBlocked(bloq);
    setVaga(lid && !bloq ? { ...vagaDe(s), w: s.rect.w, h: s.rect.h } : null);
    if (lid && !bloq) setAviso(`${getListLabel(lid)}, posição ${indice + 1} de ${semOArrastado(s, lid).length + 1}`);
    else if (lid) setAviso(`Não é possível soltar em ${getListLabel(lid)}`);
  };

  const procurarAlvo = (s: Sessao) => {
    const centroY = s.py - s.oy + s.rect.h / 2;
    for (const [lid, L] of Object.entries(s.foto)) {
      const c = L.caixa;
      if (s.px < c.x || s.px > c.x + c.w || s.py < c.y - 8 || s.py > c.y + c.h + 8) continue;
      const sem = semOArrastado(s, lid);
      let indice = sem.findIndex((it) => centroY < topoVirtual(s, lid, it) + it.h / 2);
      if (indice < 0) indice = sem.length;
      atualizarAlvo(s, lid, indice);
      return;
    }
    atualizarAlvo(s, null, 0);
  };

  const encerrar = (cancelar: boolean) => {
    const s = sessao.current;
    if (!s || s.saindo) return;
    s.saindo = true;
    s.desfazer();
    cancelAnimationFrame(s.quadro);
    const { onMove: mover, getItemLabel, getListLabel } = opcoes.current;
    const valido = !cancelar && !!s.alvo && !s.bloqueado;
    const mudou = valido && !(s.alvo === s.origem && s.indice === s.indiceOrigem);
    const destino = valido ? vagaDe(s) : { x: s.rect.x, y: s.rect.y };
    if (!valido) aplicarVizinhos(s, false);
    setVaga(null);
    setPhase('settling');
    posicionar(s, destino.x, destino.y, true);
    setAviso(valido ? `${getItemLabel(s.id)} solto em ${getListLabel(s.alvo!)}, posição ${s.indice + 1}` : `${getItemLabel(s.id)} voltou para o lugar`);
    const el = elementos.current.get(s.id);
    window.setTimeout(() => {
      flushSync(() => {
        if (mudou) mover({ id: s.id, from: s.origem, to: s.alvo!, index: s.indice });
        setDraggingId(null);
        setPhase(null);
        setOverList(null);
        setBlocked(false);
      });
      for (const e of elementos.current.values()) {
        e.style.transition = 'none';
        e.style.transform = '';
      }
      sessao.current = null;
      if (s.teclado) requestAnimationFrame(() => elementos.current.get(s.id)?.querySelector<HTMLElement>('[data-ob-drag-handle]')?.focus());
    }, (el ? duracaoDe(el) : 0) + 30);
  };

  const comecar = (id: string, lid: string, inicio: { px: number; py: number; cx: number; cy: number; teclado: boolean }) => {
    const foto = fotografar();
    const rect = foto[lid]?.itens.find((i) => i.id === id);
    if (!rect) return null;
    const s: Sessao = {
      id, origem: lid, indiceOrigem: foto[lid].ids.indexOf(id), foto, rect,
      ox: inicio.px - rect.x, oy: inicio.py - rect.y, px: inicio.px, py: inicio.py, cx: inicio.cx, cy: inicio.cy,
      alvo: null, indice: -1, bloqueado: false, teclado: inicio.teclado, saindo: false, quadro: 0, desfazer: () => undefined,
    };
    sessao.current = s;
    flushSync(() => {
      setDraggingId(id);
      setPhase('lifted');
    });
    atualizarAlvo(s, lid, s.indiceOrigem);
    const nome = opcoes.current.getItemLabel(id);
    setAviso(`${nome} erguido, posição ${s.indiceOrigem + 1} de ${foto[lid].ids.length}.${inicio.teclado ? ' Setas movem, Espaço solta, Esc cancela.' : ''}`);
    return s;
  };

  const rolarSozinho = (s: Sessao) => {
    const altura = window.innerHeight;
    const d = s.cy < BORDA ? -Math.ceil((BORDA - s.cy) / 6) : s.cy > altura - BORDA ? Math.ceil((s.cy - altura + BORDA) / 6) : 0;
    if (d) window.scrollBy(0, d);
    s.quadro = requestAnimationFrame(() => rolarSozinho(s));
  };

  const aoApertar = (id: string, lid: string) => (e: React.PointerEvent) => {
    if (e.button !== 0 || sessao.current) return;
    const alvo = e.target as HTMLElement;
    const pelaAlca = !!alvo.closest('[data-ob-drag-handle]');
    if (e.pointerType !== 'mouse' && !pelaAlca) return;
    if (!pelaAlca && alvo.closest('button, a, input, select, textarea, [contenteditable="true"], [data-ob-no-drag]')) return;
    const inicio = { cx: e.clientX, cy: e.clientY, px: e.clientX + window.scrollX, py: e.clientY + window.scrollY, teclado: false };
    let s: Sessao | null = null;
    const atualizar = () => {
      if (!s) return;
      s.px = s.cx + window.scrollX;
      s.py = s.cy + window.scrollY;
      posicionar(s, s.px - s.ox, s.py - s.oy, false);
      procurarAlvo(s);
    };
    const rolar = () => atualizar();
    const esc = (k: KeyboardEvent) => {
      if (k.key !== 'Escape') return;
      k.preventDefault();
      k.stopPropagation();
      encerrar(true);
    };
    const mover = (ev: PointerEvent) => {
      if (!s) {
        if (Math.hypot(ev.clientX - inicio.cx, ev.clientY - inicio.cy) < LIMIAR) return;
        s = comecar(id, lid, inicio);
        if (!s) {
          limpar();
          return;
        }
        s.desfazer = () => {
          limpar();
          window.removeEventListener('scroll', rolar, true);
          window.removeEventListener('keydown', esc, true);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };
        window.addEventListener('scroll', rolar, true);
        window.addEventListener('keydown', esc, true);
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        rolarSozinho(s);
      }
      s.cx = ev.clientX;
      s.cy = ev.clientY;
      atualizar();
    };
    const limpar = () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', cancelar);
    };
    const soltar = () => {
      if (!s) {
        limpar();
        return;
      }
      const engolir = (c: MouseEvent) => {
        c.stopPropagation();
        c.preventDefault();
      };
      window.addEventListener('click', engolir, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', engolir, true), 0);
      encerrar(false);
    };
    const cancelar = () => {
      if (s) encerrar(true);
      else limpar();
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', cancelar);
  };

  const aoTeclar = (id: string, lid: string) => (e: React.KeyboardEvent) => {
    const s = sessao.current;
    if (!s) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      const el = elementos.current.get(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      comecar(id, lid, { cx: r.left, cy: r.top, px: r.left + window.scrollX, py: r.top + window.scrollY, teclado: true });
      return;
    }
    if (!s.teclado || s.id !== id || s.saindo) return;
    const ordem = Object.keys(listas.current).filter((l) => s.foto[l]);
    let lAlvo = s.alvo ?? s.origem;
    let { indice } = s;
    if (e.key === 'ArrowUp') indice = Math.max(0, indice - 1);
    else if (e.key === 'ArrowDown') indice = Math.min(semOArrastado(s, lAlvo).length, indice + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const j = ordem.indexOf(lAlvo) + (e.key === 'ArrowRight' ? 1 : -1);
      if (j < 0 || j >= ordem.length) return;
      lAlvo = ordem[j];
      indice = Math.min(indice, semOArrastado(s, lAlvo).length);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      encerrar(false);
      return;
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      encerrar(true);
      return;
    } else return;
    e.preventDefault();
    atualizarAlvo(s, lAlvo, indice);
    if (!s.bloqueado) {
      const v = vagaDe(s);
      posicionar(s, v.x, v.y, true);
    }
  };

  useEffect(() => () => {
    const s = sessao.current;
    if (!s) return;
    s.desfazer();
    cancelAnimationFrame(s.quadro);
  }, []);

  const listProps = (listId: string) => ({
    ref: (el: HTMLElement | null) => {
      if (el) conteineres.current.set(listId, el);
      else conteineres.current.delete(listId);
    },
  });

  const itemProps = (id: string, listId: string) => ({
    ref: (el: HTMLElement | null) => {
      if (el) elementos.current.set(id, el);
      else elementos.current.delete(id);
    },
    onPointerDown: aoApertar(id, listId),
    style: {
      position: 'relative', touchAction: 'pan-y', cursor: draggingId === id ? 'grabbing' : 'grab',
      zIndex: draggingId === id ? 'var(--ob-z-drag)' : undefined,
    } as React.CSSProperties,
  });

  const handleProps = (id: string, listId: string) => ({
    'data-ob-drag-handle': '' as const,
    onKeyDown: aoTeclar(id, listId),
    'aria-roledescription': 'alça de arrastar',
    pressed: draggingId === id && !!sessao.current?.teclado,
    style: { touchAction: 'none', cursor: draggingId === id ? 'grabbing' : 'grab' } as React.CSSProperties,
  });

  const liftStyle = (id: string): React.CSSProperties => {
    const erguido = draggingId === id && phase === 'lifted';
    return {
      transform: erguido ? 'scale(1.01)' : 'scale(1)',
      boxShadow: erguido ? 'var(--ob-shadow-md)' : undefined,
      transition: `transform var(--ob-dur-${phase === 'settling' ? 'base' : 'fast'}) var(--ob-ease-out), box-shadow var(--ob-dur-${phase === 'settling' ? 'base' : 'fast'}) var(--ob-ease-out)`,
    };
  };

  const overlay = (
    <>
      <span aria-live="polite" style={ESCONDIDO}>{aviso}</span>
      {vaga && typeof document !== 'undefined' && createPortal(
        <div aria-hidden="true" data-ob-drop-slot="" style={{
          position: 'absolute', left: vaga.x, top: vaga.y, width: vaga.w, height: vaga.h, boxSizing: 'border-box', pointerEvents: 'none',
          borderRadius: 'var(--ob-r-surface)', border: '1.5px dashed color-mix(in srgb, var(--ob-blue) 45%, transparent)',
          background: 'color-mix(in srgb, var(--ob-blue) 5%, transparent)',
          transition: 'top var(--ob-dur-fast) var(--ob-ease-out), left var(--ob-dur-fast) var(--ob-ease-out)',
        }} />,
        document.body,
      )}
    </>
  );

  return { draggingId, phase, overList, blocked, listProps, itemProps, handleProps, liftStyle, overlay };
}
