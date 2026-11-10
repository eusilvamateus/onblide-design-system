import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Toast } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Toast, props));

function achar(el, teste, achados = []) {
  if (!React.isValidElement(el)) return achados;
  if (teste(el)) achados.push(el);
  React.Children.forEach(el.props.children, (filho) => achar(filho, teste, achados));
  return achados;
}

const basico = render({ tone: 'success', title: 'Salvo', body: 'Alterações gravadas' });
if (!basico.includes('role="status"') || !basico.includes('aria-live="polite"')) fail('região de status', basico);
if (!basico.includes('Salvo') || !basico.includes('Alterações gravadas')) fail('título e corpo', basico);
if (basico.includes('<button')) fail('sem ação nem fechar não há botões', basico);
if (!basico.includes('ph-check-circle')) fail('ícone do tom success', basico);
if (render({ title: 'x', icon: false }).includes('<i ')) fail('icon={false} remove o ícone');
if (!render({ title: 'x', onClose() {} }).includes('aria-label="Fechar"')) fail('botão de fechar acessível');
for (const tone of ['info', 'success', 'warning', 'danger']) if (!render({ tone, title: 'x' }).includes('role="status"')) fail(`tom ${tone}`);

const contorno = render({ tone: 'success', title: 'x' });
if (!contorno.includes('background:var(--ob-surface)') || !contorno.includes('border:1px solid var(--ob-border)')) fail('plain é o padrão: superfície e borda neutra', contorno);
const suave = render({ tone: 'success', appearance: 'soft', title: 'x' });
if (!suave.includes('background:var(--ob-green-050)') || suave.includes('background:var(--ob-surface)')) fail('soft preenche o toast com o fundo clarinho do tom', suave);
if (!suave.includes('border:1px solid transparent')) fail('soft não tem borda visível', suave);
const contornado = render({ tone: 'success', appearance: 'outline', title: 'x' });
if (!contornado.includes('background:var(--ob-green-050)') || !contornado.includes('border:1px solid color-mix(in srgb, var(--ob-green) 35%, transparent)')) fail('outline usa o fundo clarinho e a borda na cor do tom, como no Alert', contornado);
if (!render({ tone: 'danger', appearance: 'soft', title: 'x' }).includes('background:var(--ob-red-050)')) fail('soft segue o tom');

const cliques = [];
const arvore = Toast({ title: 'T', onClose: () => cliques.push('fechar'), action: 'Desfazer', onAction: () => cliques.push('acao') });
const botoes = achar(arvore, (el) => el.type === Button);
if (botoes.length !== 2) fail('fechar e ação são Button do design system', botoes.length);
const fechar = botoes.find((b) => b.props['aria-label'] === 'Fechar');
if (!fechar || fechar.props.iconOnly !== true) fail('fechar é Button iconOnly');
fechar.props.onClick();
botoes.find((b) => b !== fechar).props.onClick();
if (cliques.join() !== 'fechar,acao') fail('handlers de fechar e ação', cliques.join());
console.log('OK: Toast (status, tons, ícone, fechar e ação via Button, handlers)');
