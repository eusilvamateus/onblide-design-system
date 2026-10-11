import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge, Tabs } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const abas = [
  { id: 'a', label: 'Geral', icon: 'house', badge: 3 },
  { id: 'b', label: 'Equipe' },
  { id: 'c', label: 'Faturas', disabled: true },
];
const render = (props) => renderToStaticMarkup(React.createElement(Tabs, { tabs: abas, ...props }));

function achar(el, teste, achados = []) {
  if (!React.isValidElement(el)) return achados;
  if (teste(el)) achados.push(el);
  React.Children.forEach(el.props.children, (filho) => achar(filho, teste, achados));
  return achados;
}

const linha = render({ active: 'a' });
for (const rotulo of ['Geral', 'Equipe', 'Faturas']) if (!linha.includes(rotulo)) fail(`rótulo ${rotulo}`, linha);
if ((linha.match(/<button/g) ?? []).length !== 3) fail('um botão por aba', linha);
if (!linha.includes('ph-house')) fail('ícone Phosphor da aba', linha);
if (!/<button[^>]*disabled/.test(linha)) fail('aba desabilitada', linha);
if (!linha.includes('bottom:-1px')) fail('variante line sublinha a aba ativa', linha);
if (render({ active: 'a', variant: 'pill' }).includes('bottom:-1px')) fail('pill não tem sublinhado');

const aba = Tabs({ tabs: abas, active: 'a', onChange() {} });
const badges = achar(aba, (el) => el.type === Badge);
if (badges.length !== 1) fail('o contador da aba é o Badge do design system', badges.length);
if (badges[0].props.variant !== 'solid' || badges[0].props.tone !== 'blue') fail('contador da aba ativa em destaque', JSON.stringify(badges[0].props));
const inativa = achar(Tabs({ tabs: abas, active: 'b' }), (el) => el.type === Badge)[0];
if (inativa.props.variant !== 'subtle' || inativa.props.tone !== 'grey') fail('contador da aba inativa discreto', JSON.stringify(inativa.props));

const trocas = [];
const clicaveis = achar(Tabs({ tabs: abas, active: 'a', onChange: (id) => trocas.push(id) }), (el) => el.type === 'button');
clicaveis[1].props.onClick();
if (trocas.join() !== 'b') fail('clicar em uma aba chama onChange com o id', trocas.join());
if (render({ active: 'a', size: 'sm' }) === render({ active: 'a', size: 'md' })) fail('size altera o espaçamento');
console.log('OK: Tabs (abas, ícone, disabled, line/pill, contador via Badge, onChange)');
