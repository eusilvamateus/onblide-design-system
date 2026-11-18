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
  /** Estilo da superfície visível do item (o `Card`), que sobe e ganha sombra enquanto é arrastado e marca essa superfície na cópia que viaja com o ponteiro. */
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
const BORDA_DA_JANELA = 72;
const BORDA_DA_AREA = 48;
const ESCONDIDO: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
const VIZINHOS = 'transform var(--ob-dur-fast) var(--ob-ease-out)';
const VIAGEM = 'transform var(--ob-dur-base) var(--ob-ease-out)';
const SUPERFICIE = '[style*="--ob-drag-surface"]';

interface Item { id: string; x: number; y: number; w: number; h: number }
interface Lista {
  ids: string[];
  itens: Item[];
  caixa: { x: number; y: number; w: number; h: number };
  topo: number;
  esquerda: number;
  vao: number;
  area: HTMLElement | null;
  areaX0: number;
  areaY0: number;
}
interface Sessao {
  id: string;
  origem: string;
  indiceOrigem: number;
  foto: Record<string, Lista>;
  rect: Item;
  ox: number;
  oy: number;
  cx: number;
  cy: number;
  alvo: string | null;
  indice: number;
  bloqueado: boolean;
  teclado: boolean;
  saindo: boolean;
  quadro: number;
  camada: HTMLDivElement | null;
  posicoes: Map<HTMLElement, string>;
  desfazer: () => void;
}
interface Vaga { lista: string; left: number; top: number; w: number; h: number }

const duracaoDe = (el: HTMLElement) => Math.max(0, ...getComputedStyle(el).transitionDuration.split(',').map((s) => parseFloat(s) * 1000));

const areaQueRola = (el: HTMLElement): HTMLElement | null => {
  for (let n: HTMLElement | null = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    const { overflowY } = getComputedStyle(n);
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && n.scrollHeight > n.clientHeight) return n;
  }
  return null;
};

const criarCopia = (el: HTMLElement, rect: DOMRect) => {
  const cs = getComputedStyle(el);
  const camada = document.createElement('div');
  Object.assign(camada.style, {
    position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0',
    zIndex: 'var(--ob-z-drag)', pointerEvents: 'none', fontFamily: cs.fontFamily, fontSize: cs.fontSize, lineHeight: cs.lineHeight, color: cs.color,
  });
  camada.setAttribute('aria-hidden', 'true');
  camada.setAttribute('data-ob-drag-layer', '');
  const tema = el.closest('[data-theme]')?.getAttribute('data-theme');
  if (tema) camada.setAttribute('data-theme', tema);
  const copia = el.cloneNode(true) as HTMLElement;
  copia.removeAttribute('id');
  copia.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  copia.setAttribute('inert', '');
  Object.assign(copia.style, { transform: 'none', transition: 'none', margin: '0', width: '100%', height: '100%', boxSizing: 'border-box', visibility: 'visible', zIndex: 'auto' });
  camada.appendChild(copia);
  document.body.appendChild(camada);
  const superficie = (copia.matches(SUPERFICIE) ? copia : copia.querySelector<HTMLElement>(SUPERFICIE)) ?? copia;
  superficie.style.transition = 'transform var(--ob-dur-fast) var(--ob-ease-out), box-shadow var(--ob-dur-fast) var(--ob-ease-out)';
  superficie.style.transform = 'scale(1)';
  requestAnimationFrame(() => {
    superficie.style.transform = 'scale(1.01)';
    superficie.style.boxShadow = 'var(--ob-shadow-md)';
  });
  return camada;
};

/**
 * Arrastar e soltar entre listas verticais no padrão do design system: o item sobe, segue o ponteiro enquanto os
 * vizinhos abrem espaço e assenta na vaga ao soltar, com os tokens de movimento. Funciona com mouse, toque (pela alça)
 * e teclado, avisa o leitor de tela e rola a área que contém a lista (um `ScrollArea`, por exemplo) ou a janela quando
 * o item chega perto da borda. Durante o arrasto com ponteiro, uma cópia idêntica do item viaja por cima da página,
 * para não ser cortada pela borda da área que rola.
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
  const [escondido, setEscondido] = useState<string | null>(null);
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
      const area = areaQueRola(cont);
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
        area,
        areaX0: area?.scrollLeft ?? 0,
        areaY0: area?.scrollTop ?? 0,
      };
    }
    return foto;
  };

  const rolado = (L: Lista) => ({ x: L.area ? L.area.scrollLeft - L.areaX0 : 0, y: L.area ? L.area.scrollTop - L.areaY0 : 0 });
  const ponteiroEm = (s: Sessao, L: Lista) => {
    const d = rolado(L);
    return { x: s.cx + window.scrollX + d.x, y: s.cy + window.scrollY + d.y };
  };
  const visivelEm = (L: Lista, cx: number, cy: number) => {
    if (!L.area) return true;
    const r = L.area.getBoundingClientRect();
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
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

  const levarAoAlcance = (s: Sessao) => {
    if (!s.alvo || s.bloqueado) return;
    const L = s.foto[s.alvo];
    const v = vagaDe(s);
    const topo = v.y - window.scrollY - rolado(L).y;
    const base = topo + s.rect.h;
    if (L.area) {
      const r = L.area.getBoundingClientRect();
      if (topo < r.top) L.area.scrollTop -= r.top - topo + 8;
      else if (base > r.bottom) L.area.scrollTop += base - r.bottom + 8;
    } else if (topo < 0) window.scrollBy(0, topo - 8);
    else if (base > window.innerHeight) window.scrollBy(0, base - window.innerHeight + 8);
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
    if (lid && !bloq) {
      const L = s.foto[lid];
      const cont = conteineres.current.get(lid);
      const v = vagaDe(s);
      setVaga({ lista: lid, left: v.x - L.caixa.x - (cont?.clientLeft ?? 0), top: v.y - L.caixa.y - (cont?.clientTop ?? 0), w: s.rect.w, h: s.rect.h });
      setAviso(`${getListLabel(lid)}, posição ${indice + 1} de ${semOArrastado(s, lid).length + 1}`);
    } else {
      setVaga(null);
      if (lid) setAviso(`Não é possível soltar em ${getListLabel(lid)}`);
    }
  };

  const procurarAlvo = (s: Sessao) => {
    for (const [lid, L] of Object.entries(s.foto)) {
      if (!visivelEm(L, s.cx, s.cy)) continue;
      const p = ponteiroEm(s, L);
      const c = L.caixa;
      if (p.x < c.x || p.x > c.x + c.w || p.y < c.y - 8 || p.y > c.y + c.h + 8) continue;
      const centroY = p.y - s.oy + s.rect.h / 2;
      const sem = semOArrastado(s, lid);
      let indice = sem.findIndex((it) => centroY < topoVirtual(s, lid, it) + it.h / 2);
      if (indice < 0) indice = sem.length;
      atualizarAlvo(s, lid, indice);
      return;
    }
    atualizarAlvo(s, null, 0);
  };

  const posicionarNaVaga = (s: Sessao) => {
    const el = elementos.current.get(s.id);
    if (!el || !s.alvo || s.bloqueado) return;
    const v = vagaDe(s);
    const dAlvo = rolado(s.foto[s.alvo]);
    const dOrigem = rolado(s.foto[s.origem]);
    el.style.transition = VIAGEM;
    el.style.transform = `translate3d(${v.x - s.rect.x - dAlvo.x + dOrigem.x}px, ${v.y - s.rect.y - dAlvo.y + dOrigem.y}px, 0)`;
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
    const antes = (s.camada ?? elementos.current.get(s.id))?.getBoundingClientRect();
    if (!valido) aplicarVizinhos(s, false);
    flushSync(() => {
      if (mudou) mover({ id: s.id, from: s.origem, to: s.alvo!, index: s.indice });
      setEscondido(null);
      setVaga(null);
      setOverList(null);
      setBlocked(false);
    });
    s.camada?.remove();
    s.posicoes.forEach((valor, cont) => { cont.style.position = valor; });
    if (valido) {
      for (const [id, e] of elementos.current) {
        if (id === s.id) continue;
        e.style.transition = 'none';
        e.style.transform = '';
      }
    }
    const el = elementos.current.get(s.id);
    if (el && antes) {
      el.style.transition = 'none';
      el.style.transform = '';
      const depois = el.getBoundingClientRect();
      el.style.transform = `translate3d(${antes.left - depois.left}px, ${antes.top - depois.top}px, 0)`;
      void el.offsetWidth;
      el.style.transition = VIAGEM;
      el.style.transform = '';
    }
    setPhase('settling');
    setAviso(valido ? `${getItemLabel(s.id)} solto em ${getListLabel(s.alvo!)}, posição ${s.indice + 1}` : `${getItemLabel(s.id)} voltou para o lugar`);
    window.setTimeout(() => {
      flushSync(() => {
        setDraggingId(null);
        setPhase(null);
      });
      for (const e of elementos.current.values()) {
        e.style.transition = '';
        e.style.transform = '';
      }
      sessao.current = null;
      if (s.teclado) requestAnimationFrame(() => elementos.current.get(s.id)?.querySelector<HTMLElement>('[data-ob-drag-handle]')?.focus());
    }, (el ? duracaoDe(el) : 0) + 30);
  };

  const comecar = (id: string, lid: string, inicio: { cx: number; cy: number; teclado: boolean }) => {
    const el = elementos.current.get(id);
    const foto = fotografar();
    const rect = foto[lid]?.itens.find((i) => i.id === id);
    if (!el || !rect) return null;
    const naTela = el.getBoundingClientRect();
    const posicoes = new Map<HTMLElement, string>();
    for (const cont of conteineres.current.values()) {
      if (getComputedStyle(cont).position !== 'static') continue;
      posicoes.set(cont, cont.style.position);
      cont.style.position = 'relative';
    }
    const s: Sessao = {
      id, origem: lid, indiceOrigem: foto[lid].ids.indexOf(id), foto, rect,
      ox: inicio.cx - naTela.left, oy: inicio.cy - naTela.top, cx: inicio.cx, cy: inicio.cy,
      alvo: null, indice: -1, bloqueado: false, teclado: inicio.teclado, saindo: false, quadro: 0,
      camada: inicio.teclado ? null : criarCopia(el, naTela), posicoes, desfazer: () => undefined,
    };
    sessao.current = s;
    flushSync(() => {
      setDraggingId(id);
      setPhase('lifted');
      if (!inicio.teclado) setEscondido(id);
    });
    atualizarAlvo(s, lid, s.indiceOrigem);
    const nome = opcoes.current.getItemLabel(id);
    setAviso(`${nome} erguido, posição ${s.indiceOrigem + 1} de ${foto[lid].ids.length}.${inicio.teclado ? ' Setas movem, Espaço solta, Esc cancela.' : ''}`);
    return s;
  };

  const velocidade = (dentro: number) => Math.min(24, Math.ceil(dentro / 4));

  const rolarSozinho = (s: Sessao) => {
    const L = s.foto[s.alvo ?? s.origem];
    let rolou = false;
    if (L?.area) {
      const r = L.area.getBoundingClientRect();
      if (s.cx >= r.left && s.cx <= r.right) {
        if (s.cy < r.top + BORDA_DA_AREA && L.area.scrollTop > 0) {
          L.area.scrollTop -= velocidade(r.top + BORDA_DA_AREA - s.cy);
          rolou = true;
        } else if (s.cy > r.bottom - BORDA_DA_AREA && L.area.scrollTop < L.area.scrollHeight - L.area.clientHeight) {
          L.area.scrollTop += velocidade(s.cy - r.bottom + BORDA_DA_AREA);
          rolou = true;
        }
      }
    }
    if (!rolou) {
      const altura = window.innerHeight;
      if (s.cy < BORDA_DA_JANELA) window.scrollBy(0, -velocidade(BORDA_DA_JANELA - s.cy));
      else if (s.cy > altura - BORDA_DA_JANELA) window.scrollBy(0, velocidade(s.cy - altura + BORDA_DA_JANELA));
    }
    s.quadro = requestAnimationFrame(() => rolarSozinho(s));
  };

  const aoApertar = (id: string, lid: string) => (e: React.PointerEvent) => {
    if (e.button !== 0 || sessao.current) return;
    const alvo = e.target as HTMLElement;
    const pelaAlca = !!alvo.closest('[data-ob-drag-handle]');
    if (e.pointerType !== 'mouse' && !pelaAlca) return;
    if (!pelaAlca && alvo.closest('button, a, input, select, textarea, [contenteditable="true"], [data-ob-no-drag]')) return;
    const inicio = { cx: e.clientX, cy: e.clientY, teclado: false };
    let s: Sessao | null = null;
    const atualizar = () => {
      if (!s) return;
      if (s.camada) {
        s.camada.style.left = `${s.cx - s.ox}px`;
        s.camada.style.top = `${s.cy - s.oy}px`;
      }
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
      comecar(id, lid, { cx: r.left, cy: r.top, teclado: true });
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
    levarAoAlcance(s);
    posicionarNaVaga(s);
  };

  useEffect(() => () => {
    const s = sessao.current;
    if (!s) return;
    s.desfazer();
    cancelAnimationFrame(s.quadro);
    s.camada?.remove();
    s.posicoes.forEach((valor, cont) => { cont.style.position = valor; });
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
      visibility: escondido === id ? 'hidden' : undefined,
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
    const tempo = `var(--ob-dur-${phase === 'settling' ? 'base' : 'fast'}) var(--ob-ease-out)`;
    return {
      '--ob-drag-surface': '1',
      transform: erguido ? 'scale(1.01)' : 'scale(1)',
      boxShadow: erguido ? 'var(--ob-shadow-md)' : undefined,
      transition: `transform ${tempo}, box-shadow ${tempo}`,
    } as React.CSSProperties;
  };

  const destinoDaVaga = vaga ? conteineres.current.get(vaga.lista) : undefined;
  const overlay = (
    <>
      <span aria-live="polite" style={ESCONDIDO}>{aviso}</span>
      {vaga && destinoDaVaga && createPortal(
        <div aria-hidden="true" data-ob-drop-slot="" style={{
          position: 'absolute', left: vaga.left, top: vaga.top, width: vaga.w, height: vaga.h, boxSizing: 'border-box', pointerEvents: 'none',
          borderRadius: 'var(--ob-r-surface)', border: '1.5px dashed color-mix(in srgb, var(--ob-blue) 45%, transparent)',
          background: 'color-mix(in srgb, var(--ob-blue) 5%, transparent)',
          transition: 'top var(--ob-dur-fast) var(--ob-ease-out), left var(--ob-dur-fast) var(--ob-ease-out)',
        }} />,
        destinoDaVaga,
        vaga.lista,
      )}
    </>
  );

  return { draggingId, phase, overList, blocked, listProps, itemProps, handleProps, liftStyle, overlay };
}
