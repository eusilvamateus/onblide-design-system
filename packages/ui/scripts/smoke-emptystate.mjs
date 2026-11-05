import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, EmptyState } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(EmptyState, props));

const minimo = render({ title: 'Nada por aqui' });
if (!minimo.includes('Nada por aqui')) fail('título', minimo);
if (minimo.includes('<i ')) fail('sem icon não há ícone', minimo);
if (minimo.includes('<button')) fail('sem action não há botão', minimo);

const completo = render({
  icon: 'folder-open', title: 'Nenhum projeto', description: 'Crie o primeiro para começar.',
  action: React.createElement(Button, null, 'Novo projeto'),
});
if (!completo.includes('ph-folder-open')) fail('ícone Phosphor', completo);
if (!completo.includes('Crie o primeiro para começar.')) fail('descrição', completo);
if (!completo.includes('Novo projeto') || !completo.includes('<button')) fail('ação', completo);
if (!completo.includes('text-align:center')) fail('conteúdo centralizado', completo);
if (render({ title: 'x', size: 'sm' }) === render({ title: 'x', size: 'md' })) fail('size altera o espaçamento');
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(completo)) fail('nenhuma cor solta', completo);
console.log('OK: EmptyState (título, ícone, descrição, ação, tamanhos)');
