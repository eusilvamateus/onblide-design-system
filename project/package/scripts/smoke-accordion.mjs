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

const fechado = render({});
if (contar(fechado, '<button') !== 3) fail('um botão por item', fechado);
if (contar(fechado, 'aria-expanded="false"') !== 3) fail('tudo fechado por padrão', fechado);
if (contar(fechado, 'role="region"') !== 3) fail('um painel por item', fechado);
if (contar(fechado, ' hidden=""') !== 3) fail('painéis fechados ficam ocultos', fechado);
if (!fechado.includes('ph-user') || !fechado.includes('ph-caret-down')) fail('ícones Phosphor', fechado);
if (!/<button[^>]*disabled/.test(fechado)) fail('item desabilitado', fechado);
if (contar(fechado, '<h3') !== 3) fail('cabeçalhos semânticos', fechado);

const aberto = render({ defaultValue: ['b'] });
if (contar(aberto, 'aria-expanded="true"') !== 1) fail('só o item b aberto', aberto);
if (contar(aberto, ' hidden=""') !== 2) fail('os outros painéis ficam ocultos', aberto);
const controlado = render({ value: ['a', 'b'], type: 'multiple' });
if (contar(controlado, 'aria-expanded="true"') !== 2) fail('value controla os itens abertos', controlado);

const ligacao = fechado.match(/id="([^"]+)" class="ob-accordion-cabecalho" aria-expanded="false" aria-controls="([^"]+)"/);
if (!ligacao) fail('cabeçalho com aria-controls', fechado);
if (!fechado.includes(`id="${ligacao[2]}"`) || !fechado.includes(`aria-labelledby="${ligacao[1]}"`)) fail('painel e cabeçalho se referenciam', fechado);
if (!render({ ariaLabel: 'Configurações' }).includes('aria-label="Configurações"')) fail('ariaLabel do grupo');
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(fechado)) fail('nenhuma cor solta', fechado);
console.log('OK: Accordion (cabeçalhos, painéis ocultos, defaultValue/value, desabilitado, aria-controls)');
