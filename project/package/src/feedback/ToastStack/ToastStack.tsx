// project/package/src/feedback/ToastStack/ToastStack.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Toast, ToastProps } from '../Toast/Toast';
import { OB_TOAST_POS, OBToastPosition } from '../../internal/obToastPos';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export interface ToastStackProps {
  /** Canto ou centro da tela onde os toasts são ancorados. */
  position?: OBToastPosition;
}

interface QueuedToast extends ToastProps {
  id: number;
  leaving: boolean;
}

/** Monta o container fixo que empilha e anima os toasts disparados via `window.obToast`. */
export const ToastStack: React.FC<ToastStackProps> = ({ position = 'bottom-right' }) => {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);
  const dismiss = useCallback((id: number) => {
    setToasts(ts => ts.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 200);
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastProps>).detail;
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts.slice(-2), { ...detail, id, leaving: false }]);
      setTimeout(() => dismiss(id), 4800);
    };
    window.addEventListener('ob-toast', handler);
    return () => window.removeEventListener('ob-toast', handler);
  }, [dismiss]);
  if (!toasts.length) return null;
  const pos = OB_TOAST_POS[position] || OB_TOAST_POS['bottom-right'];
  const isTop = position.startsWith('top');
  const animIn  = isTop ? 'ob-toast-in-top'  : 'ob-toast-in-bottom';
  const animOut = isTop ? 'ob-toast-out-top' : 'ob-toast-out-bottom';
  const { align, cx, ...anchor } = pos;
  return (
    <div id="ob-toast-stack" data-pos={position} style={{
      position: 'fixed', zIndex: 'var(--ob-z-toast)', ...anchor,
      transform: cx ? 'translateX(-50%)' : undefined,
      display: 'flex', flexDirection: isTop ? 'column-reverse' : 'column',
      gap: 10, alignItems: align, pointerEvents: 'none',
      width: 'min(400px, calc(100vw - 32px))',
    } as React.CSSProperties}>
      {toasts.map(t => (
        <div key={t.id} style={{ width: '100%', pointerEvents: 'all', animation: `${t.leaving ? animOut : animIn} 0.2s cubic-bezier(0.16,1,0.3,1) both` }}>
          <Toast {...t} onClose={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
};

// injeta as keyframes de entrada/saída do toast e o ajuste de layout mobile,
// uma única vez (mesmo padrão de Skeleton/Tooltip/Spinner no Lote A)
injectStyleOnce('ob-toast-kf', [
  '@keyframes ob-toast-in-top{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ob-toast-out-top{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-16px)}}',
  '@keyframes ob-toast-in-bottom{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ob-toast-out-bottom{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}',
].join(''));
injectStyleOnce('ob-toast-pos', [
  '@media(max-width:600px){',
  '#ob-toast-stack{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:calc(100vw - 24px)!important;align-items:stretch!important}',
  '#ob-toast-stack[data-pos^="top"]{top:16px!important;bottom:auto!important;flex-direction:column-reverse!important}',
  '#ob-toast-stack[data-pos^="bottom"]{bottom:16px!important;top:auto!important;flex-direction:column!important}',
  '}',
].join(''));
declare global {
  interface Window {
    obToast?: (detail: ToastProps) => void;
  }
}
// O guard de `typeof window` permite importar o pacote em Node (SSR e os
// smokes), onde `window` não existe; no navegador ele sempre passa.
if (typeof window !== 'undefined') {
  window.obToast = (detail) => window.dispatchEvent(new CustomEvent('ob-toast', { detail }));
}
