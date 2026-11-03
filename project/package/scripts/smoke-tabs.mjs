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
if (badges[0].props.appearance !== 'solid' || badges[0].props.tone !== 'primary') fail('contador da aba ativa em destaque', JSON.stringify(badges[0].props));
const inativa = achar(Tabs({ tabs: abas, active: 'b' }), (el) => el.type === Badge)[0];
if (inativa.props.appearance !== 'soft' || inativa.props.tone !== 'neutral') fail('contador da aba inativa discreto', JSON.stringify(inativa.props));

const trocas = [];
const clicaveis = achar(Tabs({ tabs: abas, active: 'a', onChange: (id) => trocas.push(id) }), (el) => el.type === 'button');
clicaveis[1].props.onClick();
if (trocas.join() !== 'b') fail('clicar em uma aba chama onChange com o id', trocas.join());
if (render({ active: 'a', size: 'sm' }) === render({ active: 'a', size: 'md' })) fail('size altera o espaçamento');
const coloridas = [
  { id: 'a', label: 'Todas' },
  { id: 'b', label: 'Campanhas', tone: 'primary', badge: 4 },
  { id: 'c', label: 'Cupons', tone: 'warning' },
];
const pilula = (active, appearance, dot) => renderToStaticMarkup(React.createElement(Tabs, { tabs: coloridas, active, variant: 'pill', appearance, dot }));
const botaoDe = (html, rotulo) => (html.match(new RegExp('<button[^>]*>(?:(?!</button>).)*' + rotulo + '.*?</button>', 's')) ?? [''])[0];

const semTom = renderToStaticMarkup(React.createElement(Tabs, { tabs: coloridas, active: 'a', variant: 'pill' }));
if (!botaoDe(semTom, 'Todas').includes('background:var(--ob-surface)') || !botaoDe(semTom, 'Todas').includes('box-shadow:var(--ob-shadow-xs)')) fail('aba sem tom mantém o visual padrão', botaoDe(semTom, 'Todas'));

const comTomSemAppearance = pilula('b');
const abaSemAppearance = botaoDe(comTomSemAppearance, 'Campanhas');
if (!abaSemAppearance.includes('background:var(--ob-surface)') || !abaSemAppearance.includes('color:var(--ob-blue)') || !abaSemAppearance.includes('box-shadow:var(--ob-shadow-xs)')) fail('sem appearance a aba ativa mantém fundo e sombra e pinta só o texto com o tom', abaSemAppearance);
if (comTomSemAppearance.includes('width:7px;height:7px')) fail('sem dot não há ponto', comTomSemAppearance);
if (!botaoDe(pilula('b'), 'Cupons').includes('color:var(--ob-fg-mute)')) fail('aba colorida inativa continua neutra', botaoDe(pilula('b'), 'Cupons'));

const soft = botaoDe(pilula('b', 'soft'), 'Campanhas');
if (!soft.includes('background:var(--ob-blue-050)') || !soft.includes('color:var(--ob-blue)') || soft.includes('box-shadow:var(--ob-shadow-xs)')) fail('soft pinta fundo e texto do tom, sem sombra', soft);
const softLaranja = botaoDe(pilula('c', 'soft'), 'Cupons');
if (!softLaranja.includes('background:var(--ob-orange-100)') || !softLaranja.includes('color:var(--ob-orange-700)')) fail('soft usa os tokens do tom warning', softLaranja);

const solida = botaoDe(pilula('b', 'solid'), 'Campanhas');
if (!solida.includes('background:var(--ob-blue)') || !solida.includes('color:var(--ob-surface)') || solida.includes('box-shadow:var(--ob-shadow-xs)')) fail('solid preenche a aba ativa com o tom', solida);

const ponto = pilula('a', undefined, true);
if ((ponto.match(/width:7px;height:7px/g) ?? []).length !== 2) fail('dot mostra um ponto em cada aba colorida, ativa ou não', ponto);
if ((pilula('b', 'solid', true).match(/width:7px;height:7px/g) ?? []).length !== 2) fail('dot combina com appearance', pilula('b', 'solid', true));
const linhaComPonto = renderToStaticMarkup(React.createElement(Tabs, { tabs: coloridas, active: 'a', variant: 'line', dot: true }));
if ((linhaComPonto.match(/width:7px;height:7px/g) ?? []).length !== 2) fail('dot também vale na variante line', linhaComPonto);

const linhaColorida = renderToStaticMarkup(React.createElement(Tabs, { tabs: coloridas, active: 'c', variant: 'line', appearance: 'solid' }));
const linhaSemAppearance = renderToStaticMarkup(React.createElement(Tabs, { tabs: coloridas, active: 'c', variant: 'line' }));
if (linhaSemAppearance !== linhaColorida) fail('na variante line a appearance é ignorada', linhaSemAppearance);
const abaLinha = botaoDe(linhaColorida, 'Cupons');
if (!abaLinha.includes('color:var(--ob-orange-700)') || !abaLinha.includes('background:var(--ob-orange-700)')) fail('line pinta o texto e o traço com o tom, ignorando appearance', abaLinha);
if (abaLinha.includes('box-shadow:var(--ob-shadow-xs)')) fail('line não tem sombra');

const contadores = achar(Tabs({ tabs: coloridas, active: 'b', variant: 'pill', appearance: 'soft' }), (el) => el.type === Badge);
if (contadores[0].props.tone !== 'primary') fail('contador da aba ativa segue o tom da aba', JSON.stringify(contadores[0].props));
const contadorSolido = achar(Tabs({ tabs: coloridas, active: 'b', variant: 'pill', appearance: 'solid' }), (el) => el.type === Badge)[0];
if (contadorSolido.props.appearance !== undefined || contadorSolido.props.tone !== 'neutral') fail('na aba preenchida o contador fica discreto', JSON.stringify(contadorSolido.props));

console.log('OK: Tabs (abas, ícone, disabled, line/pill, contador via Badge, onChange, tom sozinho, appearance soft/solid, dot e linha)');
