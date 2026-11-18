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

const contador = (props, filho) => renderToStaticMarkup(React.createElement(Badge, { size: 'sm', dot: false, ...props }, filho));
const vezes = (html, trecho) => html.split(trecho).length - 1;

const linha = render({ active: 'a' });
for (const rotulo of ['Geral', 'Equipe', 'Faturas']) if (!linha.includes(rotulo)) fail(`rótulo ${rotulo}`, linha);
if ((linha.match(/<button/g) ?? []).length !== 3) fail('um botão por aba', linha);
if (!linha.includes('ph-house')) fail('ícone Phosphor da aba', linha);
if (vezes(linha, 'role="tablist"') !== 1) fail('as abas formam uma lista de abas', linha);
if (vezes(linha, 'role="tab"') !== 3) fail('cada aba tem o papel de aba', linha);
if (vezes(linha, 'aria-selected="true"') !== 1 || vezes(linha, 'aria-selected="false"') !== 2) fail('só a aba ativa é anunciada como selecionada', linha);
if (vezes(linha, 'tabindex="0"') !== 1 || vezes(linha, 'tabindex="-1"') !== 2) fail('só a aba ativa entra na ordem do Tab', linha);
if (!/aria-selected="true"[^>]*tabindex="0"/.test(linha)) fail('a aba que recebe o foco é a ativa', linha);
if (vezes(linha, 'type="button"') !== 3) fail('as abas não enviam formulário', linha);
if (!render({ active: 'c' }).match(/tabindex="0"[^>]*>(?:(?!<\/button>).)*Geral/s)) fail('com a aba ativa desabilitada, a primeira habilitada recebe o foco', render({ active: 'c' }));
if (linha.includes('aria-label=')) fail('sem ariaLabel a lista não ganha nome', linha);
if (!render({ active: 'a', ariaLabel: 'Seções da conta' }).includes('role="tablist" aria-label="Seções da conta"')) fail('ariaLabel nomeia a lista de abas');
const comPainel = renderToStaticMarkup(React.createElement(Tabs, { tabs: [{ id: 'a', label: 'Geral', panelId: 'painel-geral' }, { id: 'b', label: 'Equipe' }], active: 'a' }));
if (!comPainel.includes('aria-controls="painel-geral"') || vezes(comPainel, 'aria-controls') !== 1) fail('panelId liga a aba ao painel', comPainel);
if (!/<button[^>]*disabled/.test(linha)) fail('aba desabilitada', linha);
if (!linha.includes('bottom:-1px')) fail('variante line sublinha a aba ativa', linha);
if (render({ active: 'a', variant: 'pill' }).includes('bottom:-1px')) fail('pill não tem sublinhado');

if (vezes(linha, contador({ tone: 'primary', appearance: 'solid' }, 3)) !== 1) fail('o contador da aba ativa é o Badge do design system, em destaque', linha);
const inativa = render({ active: 'b' });
if (vezes(inativa, contador({ tone: 'neutral', appearance: 'soft' }, 3)) !== 1) fail('contador da aba inativa discreto', inativa);
if (!linha.includes('data-ativa=""') || vezes(linha, 'data-ativa') !== 1) fail('só a aba ativa é marcada para o indicador medir', linha);
if (linha.includes('data-indicador')) fail('sem medição (servidor) não há indicador: a aba ativa pinta o próprio destaque', linha);
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

if (vezes(pilula('b', 'soft'), contador({ tone: 'primary', appearance: 'solid' }, 4)) !== 1) fail('contador da aba ativa segue o tom da aba', pilula('b', 'soft'));
if (vezes(pilula('b', 'solid'), contador({ tone: 'neutral' }, 4)) !== 1) fail('na aba preenchida o contador fica discreto', pilula('b', 'solid'));

console.log('OK: Tabs (papéis de abas, aba selecionada, foco só na ativa, ariaLabel, panelId, abas, ícone, disabled, line/pill, contador via Badge, marcação para o indicador, tom sozinho, appearance soft/solid, dot e linha)');
