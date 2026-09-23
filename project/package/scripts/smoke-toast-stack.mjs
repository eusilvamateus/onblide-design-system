// project/package/scripts/smoke-toast-stack.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToastStack } from '../dist/index.js';

// Importar o módulo sob Node não pode lançar (confirma o guard de `window`
// no efeito colateral module-level de window.obToast).
const empty = renderToStaticMarkup(React.createElement(ToastStack, {}));

if (empty !== '') {
  console.error('FAIL: ToastStack sem toasts deveria renderizar null (string vazia), recebeu:', empty);
  process.exit(1);
}
console.log('OK: ToastStack importa sem lançar e renderiza vazio sem toasts na fila');
