import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Toast } from '../Toast/Toast';
import type { ToastOptions } from './toast';
import { OB_TOAST_POS, OBToastPosition } from '../../internal/obToastPos';
import { registrarPilha } from '../../internal/toastEvents';
import type { ToastEntregue } from '../../internal/toastEvents';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export interface ToastStackProps {
  /** Nome da fila, para ter mais de um `ToastStack` na tela: `toast(..., { stack: nome })` entrega só a ela. Sem nome, a fila recebe os toasts sem `stack`. */
  name?: string;
  /** Canto ou centro da tela onde os toasts são ancorados. */
  position?: OBToastPosition;
  /** Tempo em ms até cada toast sumir sozinho; `0` os mantém até serem fechados. Um toast pode definir a própria `duration`. */
  duration?: number;
  /** Quantos toasts aparecem ao mesmo tempo; ao exceder, o mais antigo sai. */
  limit?: number;
}

interface ItemDaFila {
  id: string;
  opcoes: ToastOptions;
  saindo: boolean;
}

const DURACAO_DA_SAIDA = 200;

/**
 * Monta o container fixo que empilha e anima os toasts disparados por `toast()`. Pausa a contagem enquanto o mouse
 * está sobre a fila e recomeça ao sair.
 */
export const ToastStack: React.FC<ToastStackProps> = ({ name, position = 'bottom-right', duration = 5000, limit = 3 }) => {
  const [itens, setItens] = useState<ItemDaFila[]>([]);
  const prazos = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const duracaoPadrao = useRef(duration);
  duracaoPadrao.current = duration;
  const limite = useRef(limit);
  limite.current = limit;
  const fila = useRef<ItemDaFila[]>([]);
  fila.current = itens;

  const cancelar = useCallback((id: string) => {
    const prazo = prazos.current.get(id);
    if (prazo) clearTimeout(prazo);
    prazos.current.delete(id);
  }, []);

  const dispensar = useCallback((id: string) => {
    cancelar(id);
    setItens((fila) => fila.map((item) => (item.id === id ? { ...item, saindo: true } : item)));
    setTimeout(() => setItens((fila) => fila.filter((item) => item.id !== id)), DURACAO_DA_SAIDA);
  }, [cancelar]);

  const armar = useCallback((id: string, opcoes: ToastOptions) => {
    const ms = opcoes.duration ?? duracaoPadrao.current;
    cancelar(id);
    if (ms > 0) prazos.current.set(id, setTimeout(() => dispensar(id), ms));
  }, [cancelar, dispensar]);

  useEffect(() => {
    const cancelarRegistro = registrarPilha({
      nome: name,
      receber: ({ id, ...opcoes }: ToastEntregue) => {
        setItens((atual) => [...atual, { id, opcoes, saindo: false }].slice(-Math.max(1, limite.current)));
        armar(id, opcoes);
      },
      dispensar: (id) => {
        if (id) dispensar(id);
        else fila.current.forEach((item) => dispensar(item.id));
      },
    });
    const pendentes = prazos.current;
    return () => {
      cancelarRegistro();
      pendentes.forEach((prazo) => clearTimeout(prazo));
      pendentes.clear();
    };
  }, [name, armar, dispensar]);

  if (!itens.length) return null;
  const pos = OB_TOAST_POS[position] || OB_TOAST_POS['bottom-right'];
  const noTopo = position.startsWith('top');
  const entrada = noTopo ? 'ob-toast-in-top' : 'ob-toast-in-bottom';
  const saida = noTopo ? 'ob-toast-out-top' : 'ob-toast-out-bottom';
  const { align, cx, ...ancora } = pos;
  return (
    <div className="ob-toast-stack" data-pos={position} role="region" aria-label="Notificações"
      onMouseEnter={() => itens.forEach((item) => cancelar(item.id))}
      onMouseLeave={() => itens.forEach((item) => { if (!item.saindo) armar(item.id, item.opcoes); })}
      style={{
        position: 'fixed', zIndex: 'var(--ob-z-toast)', ...ancora,
        transform: cx ? 'translateX(-50%)' : undefined,
        display: 'flex', flexDirection: noTopo ? 'column-reverse' : 'column',
        gap: 10, alignItems: align, pointerEvents: 'none',
        width: 'min(400px, calc(100vw - 32px))',
      } as React.CSSProperties}>
      {itens.map(({ id, opcoes, saindo }) => (
        <div key={id} style={{ width: '100%', pointerEvents: 'all', animation: `${saindo ? saida : entrada} ${DURACAO_DA_SAIDA}ms cubic-bezier(0.16,1,0.3,1) both` }}>
          <Toast tone={opcoes.tone} title={opcoes.title} body={opcoes.body} action={opcoes.action} onAction={opcoes.onAction} icon={opcoes.icon} onClose={() => dispensar(id)} />
        </div>
      ))}
    </div>
  );
};

injectStyleOnce('ob-toast-kf', [
  '@keyframes ob-toast-in-top{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ob-toast-out-top{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-16px)}}',
  '@keyframes ob-toast-in-bottom{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ob-toast-out-bottom{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}',
].join(''));
injectStyleOnce('ob-toast-pos', [
  '@media(max-width:600px){',
  '.ob-toast-stack{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:calc(100vw - 24px)!important;align-items:stretch!important}',
  '.ob-toast-stack[data-pos^="top"]{top:16px!important;bottom:auto!important;flex-direction:column-reverse!important}',
  '.ob-toast-stack[data-pos^="bottom"]{bottom:16px!important;top:auto!important;flex-direction:column!important}',
  '}',
].join(''));
