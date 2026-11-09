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
if (!removivel.includes('role="button"') || removivel.includes('aria-pressed')) fail('chip sem selected nem onToggle é botão de ação, sem aria-pressed', removivel);
if (!render({ label: 'x', selected: false }).includes('aria-pressed="false"')) fail('chip com selected=false é alternância, aria-pressed=false');
if (!render({ label: 'x', onToggle: () => {} }).includes('aria-pressed="false"')) fail('chip com onToggle é alternância, aria-pressed=false');
if (!render({ label: 'x', selected: true }).includes('aria-pressed="true"')) fail('aria-pressed quando selecionado');
const comOnFocus = render({ label: 'x', onFocus: () => {}, onBlur: () => {} });
if (comOnFocus.includes('box-shadow')) fail('chip sem foco não deveria ter anel', comOnFocus);
const verde = render({ label: 'x', tone: 'success' });
if (!verde.includes('background:var(--ob-green-100)') || verde.includes('background:var(--ob-surface)')) fail('tone success deveria colorir o chip em repouso', verde);
const verdeLigado = render({ label: 'x', tone: 'success', selected: true });
if (verdeLigado.includes('background:var(--ob-blue)') || !verdeLigado.includes('color:var(--ob-fg-on-color)')) fail('tone success selecionado deveria preencher com o tom, não com o azul', verdeLigado);
if (!render({ label: 'x', selected: true }).includes('background:var(--ob-blue)')) fail('neutral selecionado continua azul');
if (!render({ label: 'x', disabled: true }).includes('tabindex="-1"')) fail('chip desabilitado deveria sair da ordem de tab');
const composto = render({ label: 'Período', className: 'periodo', 'aria-expanded': false, style: { maxWidth: 240 } });
if (!composto.includes('class="periodo"')) fail('chip deveria encaminhar className', composto);
if (!composto.includes('aria-expanded="false"')) fail('chip deveria encaminhar atributos aria', composto);
if (!composto.includes('max-width:240px')) fail('chip deveria mesclar estilos recebidos', composto);

const lg = render({ label: 'Tag', size: 'lg', removable: true, icon: 'check' });
if (!lg.includes('font-size:var(--ob-fs-15)') || !lg.includes('padding:var(--ob-space-10) var(--ob-space-10) var(--ob-space-10) var(--ob-space-20)')) fail('lg usa fonte 15 e o padding próprio', lg);
if (!lg.includes('width:22px;height:22px')) fail('lg aumenta o botão de remover', lg);
if (!lg.includes('font-size:18px;width:18px;height:18px')) fail('lg aumenta o ícone', lg);
if (!lg.includes('gap:var(--ob-space-8)')) fail('lg usa gap 8', lg);
if (!render({ label: 'Tag', size: 'lg' }).includes('padding:var(--ob-space-10) var(--ob-space-20)')) fail('lg sem remover usa padding simétrico');
if (!render({ label: 'Tag', size: 'md' }).includes('padding:var(--ob-space-8) var(--ob-space-16)')) fail('md mantém o padding');
if (!render({ label: 'Tag', size: 'sm' }).includes('padding:var(--ob-space-6) var(--ob-space-10)')) fail('sm mantém o padding');
if (!render({ label: 'Tag' }).includes('font-size:var(--ob-fs-13)')) fail('o padrão continua md');

const contorno = render({ label: 'Tag', tone: 'primary' });
if (!contorno.includes('border-color:color-mix(in srgb, var(--ob-blue) 35%, transparent)')) fail('outline é o padrão e tem borda', contorno);
const suave = render({ label: 'Tag', tone: 'primary', appearance: 'soft' });
if (!suave.includes('border-color:transparent') || !suave.includes('background:var(--ob-blue-050)')) fail('soft tem fundo clarinho sem borda', suave);
const suaveNeutro = render({ label: 'Tag', appearance: 'soft' });
if (!suaveNeutro.includes('background:var(--ob-surface-2)') || !suaveNeutro.includes('border-color:transparent')) fail('soft neutro usa fundo cinza clarinho sem borda', suaveNeutro);
const suaveLigado = render({ label: 'Tag', tone: 'primary', appearance: 'soft', selected: true });
if (!suaveLigado.includes('background:var(--ob-blue)') || !suaveLigado.includes('color:var(--ob-fg-on-color)')) fail('selecionado fica cheio em qualquer appearance', suaveLigado);

console.log('OK: Chip (remoção, estado, atributos nativos, composição e appearance outline/soft)');
