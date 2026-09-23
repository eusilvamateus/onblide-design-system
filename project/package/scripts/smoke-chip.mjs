import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chip } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Chip, props));

// Botão de remover: precisa de type="button" (sem isso, dentro de um <form>
// ele envia o formulário).
const removivel = render({ label: 'Tag', removable: true });
if (!removivel.includes('<button type="button"')) fail('o botão de remover deveria ter type="button"', removivel);
if (!removivel.includes('aria-label="Remover Tag"')) fail('aria-label do botão de remover', removivel);
const botoes = removivel.match(/<button\b/g) || [];
const botoesTipados = removivel.match(/<button type="button"/g) || [];
if (botoes.length !== botoesTipados.length) fail('todo <button> do Chip deveria ter type="button"', removivel);

// Sem `removable` não há botão nenhum.
if (render({ label: 'Tag' }).includes('<button')) fail('Chip sem removable não deveria renderizar <button>');

// O resto do contrato segue igual.
if (!removivel.includes('role="button"') || !removivel.includes('aria-pressed="false"')) fail('role/aria-pressed do chip', removivel);
if (!render({ label: 'x', selected: true }).includes('aria-pressed="true"')) fail('aria-pressed quando selecionado');
if (!render({ label: 'x', disabled: true }).includes('tabindex="-1"')) fail('chip desabilitado deveria sair da ordem de tab');

console.log('OK: Chip (botão de remover com type="button", role, aria-pressed, desabilitado)');
