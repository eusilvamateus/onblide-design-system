import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert, Button } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, filhos) => renderToStaticMarkup(React.createElement(Alert, props, filhos));

function achar(el, teste, achados = []) {
  if (!React.isValidElement(el)) return achados;
  if (teste(el)) achados.push(el);
  React.Children.forEach(el.props.children, (filho) => achar(filho, teste, achados));
  return achados;
}

const basico = render({ tone: 'danger', title: 'Erro' }, 'Corpo da mensagem');
if (!basico.includes('role="alert"')) fail('role alert', basico);
if (!basico.includes('Erro') || !basico.includes('Corpo da mensagem')) fail('título e corpo', basico);
if (basico.includes('aria-label="Fechar"')) fail('sem dismissible não há botão de fechar', basico);
if (basico.includes('<button')) fail('sem ação nem fechar não há botões', basico);

const dismissivel = render({ title: 'Aviso', dismissible: true, onClose() {} });
if (!dismissivel.includes('aria-label="Fechar"') || !dismissivel.includes('ph-x')) fail('botão de fechar com ícone Phosphor', dismissivel);
if (render({ title: 'Aviso', dismissible: true }).includes('aria-label="Fechar"')) fail('dismissible sem onClose não mostra o botão');

for (const tone of ['info', 'success', 'warning', 'danger']) {
  if (!render({ tone, title: 'x' }).includes('role="alert"')) fail(`tom ${tone}`);
}
if (!render({ tone: 'nenhum', title: 'x' }).includes('role="alert"')) fail('tom desconhecido cai em info');

const cliques = [];
const arvore = Alert({ title: 'T', dismissible: true, onClose: () => cliques.push('fechar'), action: 'Ver', onAction: () => cliques.push('acao') });
const botoes = achar(arvore, (el) => el.type === Button);
if (botoes.length !== 2) fail('fechar e ação são Button do design system', botoes.length);
const fechar = botoes.find((b) => b.props['aria-label'] === 'Fechar');
const acao = botoes.find((b) => b.props['aria-label'] !== 'Fechar');
if (!fechar || fechar.props.iconOnly !== true) fail('fechar é Button iconOnly');
fechar.props.onClick();
acao.props.onClick();
if (cliques.join() !== 'fechar,acao') fail('handlers de fechar e ação', cliques.join());
if (!render({ title: 'T', action: 'Ver' }).includes('Ver →')) fail('texto da ação');
console.log('OK: Alert (role, tons, fechar e ação via Button, handlers)');
