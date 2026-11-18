import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, applyDragMove, useDragAndDrop } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const igual = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); };

const listas = { a: ['1', '2', '3'], b: ['4'] };
igual(applyDragMove(listas, { id: '1', from: 'a', to: 'a', index: 2 }), { a: ['2', '3', '1'], b: ['4'] }, 'reordena na mesma lista');
igual(applyDragMove(listas, { id: '3', from: 'a', to: 'a', index: 0 }), { a: ['3', '1', '2'], b: ['4'] }, 'sobe para o topo');
igual(applyDragMove(listas, { id: '2', from: 'a', to: 'b', index: 0 }), { a: ['1', '3'], b: ['2', '4'] }, 'muda de lista no começo');
igual(applyDragMove(listas, { id: '2', from: 'a', to: 'b', index: 9 }), { a: ['1', '3'], b: ['4', '2'] }, 'índice além do fim vai para o fim');
igual(applyDragMove({ a: ['1'], b: [] }, { id: '1', from: 'a', to: 'b', index: 0 }), { a: [], b: ['1'] }, 'entra numa lista vazia');
igual(listas, { a: ['1', '2', '3'], b: ['4'] }, 'não altera as listas originais');

function Lista() {
  const dnd = useDragAndDrop({ lists: { vitrine: ['x', 'y'] }, onMove: () => undefined, getItemLabel: (id) => `Item ${id}` });
  return React.createElement('div', null,
    React.createElement('ul', dnd.listProps('vitrine'),
      ['x', 'y'].map((id) => React.createElement('li', { key: id, ...dnd.itemProps(id, 'vitrine') },
        React.createElement('div', { style: dnd.liftStyle(id) },
          React.createElement(Button, { kind: 'quiet', size: 'sm', iconOnly: true, 'aria-label': `Mover ${id}`, ...dnd.handleProps(id, 'vitrine') }), id)))),
    dnd.overlay);
}
const html = renderToStaticMarkup(React.createElement(Lista));
if ((html.match(/data-ob-drag-handle=""/g) ?? []).length !== 2) fail('cada alça é marcada', html);
if (!html.includes('aria-roledescription="alça de arrastar"')) fail('a alça diz o que é para o leitor de tela', html);
if ((html.match(/cursor:grab/g) ?? []).length < 2 || !html.includes('touch-action:pan-y') || !html.includes('touch-action:none')) fail('o item rola no toque e a alça arrasta', html);
if (!html.includes('aria-live="polite"')) fail('os avisos ficam numa região viva desde o começo', html);
if (html.includes('data-ob-drop-slot') || html.includes('var(--ob-z-drag)') || html.includes('aria-pressed="true"')) fail('parado, nada fica erguido', html);
if (!html.includes('transform:scale(1)')) fail('a superfície parada fica no tamanho normal', html);

console.log('OK: useDragAndDrop (applyDragMove, props de lista, item e alça, região de avisos, nada erguido no servidor)');
