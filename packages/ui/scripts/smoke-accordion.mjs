import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Accordion } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const itens = [
  { id: 'a', title: 'Conta', content: 'Dados da conta', icon: 'user' },
  { id: 'b', title: 'Cobrança', content: 'Faturas e cartões' },
  { id: 'c', title: 'Segurança', content: 'Senha e acessos', disabled: true },
];
const render = (props) => renderToStaticMarkup(React.createElement(Accordion, { items: itens, ...props }));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;
const quantas = (html, texto) => html.split(texto).length - 1;

const fechado = render({});
if (contar(fechado, '<button') !== 3) fail('um botão por item', fechado);
if (contar(fechado, 'aria-expanded="false"') !== 3) fail('tudo fechado por padrão', fechado);
if (contar(fechado, 'role="region"') !== 3) fail('um painel por item', fechado);
if (contar(fechado, 'visibility:hidden') !== 3 || contar(fechado, 'grid-template-rows:0fr') !== 3) fail('painéis fechados ficam ocultos e recolhidos', fechado);
if (!fechado.includes('ph-user') || !fechado.includes('ph-caret-down')) fail('ícones Phosphor', fechado);
if (!/<button[^>]*disabled/.test(fechado)) fail('item desabilitado', fechado);
if (contar(fechado, '<h3') !== 3) fail('cabeçalhos semânticos', fechado);
const nivel = render({ headingLevel: 2 });
if (contar(nivel, '<h2') !== 3 || nivel.includes('<h3')) fail('headingLevel define o nível do título', nivel);
const grupo = (html) => html.match(/<div role="group"[^>]*style="([^"]*)"/)[1];
if (!grupo(fechado).includes('border:1px solid var(--ob-border)') || !grupo(fechado).includes('gap:0')) fail('attached padrão: uma caixa só, sem espaço', grupo(fechado));
const solto = render({ attached: false });
if (grupo(solto).includes('border:') || !grupo(solto).includes('gap:var(--ob-space-8)') || quantas(solto, 'border:1px solid var(--ob-border);border-radius:var(--ob-r-surface)') !== 3) fail('attached={false}: cada item com a própria borda e espaço entre eles', solto);
const ghost = render({ appearance: 'ghost' });
if (ghost.includes('border:1px solid') || ghost.includes('background:var(--ob-surface)') || quantas(ghost, 'border-top:1px solid var(--ob-border)') !== 2) fail('ghost: sem caixa nem fundo, só as divisórias', ghost);
const ghostSolto = render({ attached: false, appearance: 'ghost' });
if (ghostSolto.includes('1px solid') || ghostSolto.includes('background:var(--ob-surface)')) fail('ghost solto: sem bordas nem fundo', ghostSolto);
for (const [size, fonte] of [['sm', 13], ['md', 14], ['lg', 15]]) if (!render({ size }).includes('font-size:' + fonte + 'px')) fail('size ' + size + ' usa texto de ' + fonte + 'px');

const aberto = render({ defaultValue: ['b'] });
if (contar(aberto, 'aria-expanded="true"') !== 1) fail('só o item b aberto', aberto);
if (contar(aberto, 'visibility:hidden') !== 2 || contar(aberto, 'grid-template-rows:1fr') !== 1) fail('só o painel aberto fica visível e expandido', aberto);
if (!aberto.includes('transition:grid-template-rows var(--ob-dur-base) var(--ob-ease), visibility var(--ob-dur-base) var(--ob-ease)')) fail('painel anima a altura com os tokens de movimento', aberto);
const controlado = render({ value: ['a', 'b'], type: 'multiple' });
if (contar(controlado, 'aria-expanded="true"') !== 2) fail('value controla os itens abertos', controlado);

const ligacao = fechado.match(/id="([^"]+)" class="ob-accordion-cabecalho" aria-expanded="false" aria-controls="([^"]+)"/);
if (!ligacao) fail('cabeçalho com aria-controls', fechado);
if (!fechado.includes(`id="${ligacao[2]}"`) || !fechado.includes(`aria-labelledby="${ligacao[1]}"`)) fail('painel e cabeçalho se referenciam', fechado);
if (!render({ ariaLabel: 'Configurações' }).includes('aria-label="Configurações"')) fail('ariaLabel do grupo');
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(fechado)) fail('nenhuma cor solta', fechado);
console.log('OK: Accordion (cabeçalhos, painéis ocultos e animados, defaultValue/value, desabilitado, aria-controls, headingLevel, attached, appearance, tamanhos)');
