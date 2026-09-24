import { useEffect } from 'react';
import { ToastStack } from '@onblide/ui';

const Disparo = () => {
  useEffect(() => {
    const t = setTimeout(() => {
      const emit = (detail: object) => window.dispatchEvent(new CustomEvent('ob-toast', { detail }));
      emit({ tone: 'success', title: 'Projeto criado', body: 'Aurora foi adicionado ao seu workspace.' });
      emit({ tone: 'warning', title: 'Prazo se aproximando', body: 'A entrega vence amanhã.' });
    }, 100);
    return () => clearTimeout(t);
  }, []);
  return null;
};

export const FilaDeAvisos = () => (
  <div style={{ position: 'relative', minHeight: 320 }}>
    <ToastStack position="bottom-right" />
    <Disparo />
  </div>
);
