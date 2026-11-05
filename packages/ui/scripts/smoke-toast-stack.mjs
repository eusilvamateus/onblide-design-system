import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToastStack, toast } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

if (typeof globalThis.window !== 'undefined') fail('o teste roda sem window');
if ('obToast' in globalThis) fail('o pacote não escreve mais window.obToast');

const vazio = renderToStaticMarkup(React.createElement(ToastStack, {}));
if (vazio !== '') fail('ToastStack sem toasts deveria renderizar null (string vazia)', vazio);
if (renderToStaticMarkup(React.createElement(ToastStack, { name: 'painel', position: 'top-center', duration: 0, limit: 1 })) !== '') fail('props novas não mudam o estado vazio');

const ids = new Set([
  toast({ title: 'a' }),
  toast.success('b'),
  toast.info('c', { body: 'corpo' }),
  toast.warning('d', { duration: 0 }),
  toast.danger('e', { action: 'Tentar', onAction() {}, stack: 'painel' }),
]);
if (ids.size !== 5) fail('cada toast recebe um id único', [...ids].join(','));
for (const id of ids) if (typeof id !== 'string' || !id.startsWith('ob-toast-')) fail('id é uma string', id);

toast.dismiss();
toast.dismiss('ob-toast-1');
if (typeof toast !== 'function' || typeof toast.success !== 'function' || typeof toast.dismiss !== 'function') fail('API do toast');
console.log('OK: toast e ToastStack (importam sem window, sem global, ids únicos, dismiss seguro, fila vazia)');
