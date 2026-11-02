import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../dist/index.js';

const igual = (a, b, msg) => { if (a !== b) fail(msg, `esperado ${b}, veio ${a}`); };
const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// (0) variante primária renderiza o rótulo e o fundo da marca
const p = renderToStaticMarkup(h(Button, { kind: 'primary' }, 'Continuar'));
if (!p.includes('Continuar') || !p.includes('background:var(--ob-blue)')) fail('markup primário inesperado', p);

// (a) padrão: type="button", sem disabled, cursor de clique
const a = renderToStaticMarkup(h(Button, {}, 'Salvar'));
if (!a.includes('type="button"')) fail('type="button" esperado por padrão', a);
if (a.includes('disabled')) fail('não deveria estar desabilitado', a);
if (!a.includes('cursor:pointer')) fail('cursor pointer esperado', a);

// (b) desabilitado: atributo nativo, opacidade e cursor
const b = renderToStaticMarkup(h(Button, { disabled: true }, 'Enviar'));
if (!b.includes('disabled=""')) fail('atributo disabled ausente', b);
if (!b.includes('opacity:0.5')) fail('opacidade reduzida esperada', b);
if (!b.includes('cursor:not-allowed')) fail('cursor not-allowed esperado', b);

// (c) props nativas repassadas e type sobrescrevível
const c = renderToStaticMarkup(h(Button, { type: 'submit', 'aria-label': 'AL-X', name: 'nm' }, 'Ok'));
if (!c.includes('type="submit"')) fail('type não repassado', c);
if (!c.includes('aria-label="AL-X"')) fail('aria-label não repassado', c);
if (!c.includes('name="nm"')) fail('name não repassado', c);

const soIcone = renderToStaticMarkup(h(Button, { iconOnly: true, kind: 'secondary', size: 'sm', 'aria-label': 'Recolher', icon: h('i', null, 'x') }, 'Texto ignorado'));
const altura = (props) => renderToStaticMarkup(h(Button, props, 'Rótulo'));
for (const [size, px] of [['sm', 32], ['md', 40], ['lg', 48]]) {
  const comTexto = altura({ size });
  const quadrado = renderToStaticMarkup(h(Button, { size, iconOnly: true, 'aria-label': 'x', icon: h('i') }));
  if (!comTexto.includes('min-height:' + px + 'px')) fail('botão com texto ' + size + ' deveria ter altura mínima de ' + px + 'px', comTexto);
  if (!quadrado.includes('height:' + px + 'px') || !quadrado.includes('width:' + px + 'px')) fail('botão só com ícone ' + size + ' deveria ser um quadrado de ' + px + 'px', quadrado);
}
if (!soIcone.includes('width:32px') || !soIcone.includes('height:32px') || !soIcone.includes('padding:0')) fail('iconOnly sm deveria ser um quadrado de 32px sem padding', soIcone);
if (soIcone.includes('Texto ignorado')) fail('iconOnly não deveria renderizar o texto', soIcone);
if (!soIcone.includes('aria-label="Recolher"')) fail('iconOnly deveria repassar o aria-label', soIcone);

const neutro = renderToStaticMarkup(h(Button, { kind: 'neutral', iconOnly: true, pressed: true, count: 3, 'aria-label': 'Avisos', icon: h('i', null, 'x') }));
if (!neutro.includes('aria-pressed="true"')) fail('pressed deveria marcar aria-pressed', neutro);
if (!neutro.includes('background:var(--ob-surface-2)')) fail('neutral pressionado deveria destacar o fundo', neutro);
if (!neutro.includes('>3<')) fail('count deveria renderizar o contador em badge', neutro);
const neutroSolto = renderToStaticMarkup(h(Button, { kind: 'neutral' }, 'Ação'));
if (!neutroSolto.includes('background:transparent') || !neutroSolto.includes('color:var(--ob-fg)')) fail('neutral em repouso deveria ser transparente com a cor de texto padrão', neutroSolto);

const silencioso = renderToStaticMarkup(h(Button, { kind: 'quiet', tone: 'danger', iconOnly: true, 'aria-label': 'Excluir', icon: h('i', null, 'x') }));
if (!silencioso.includes('background:transparent') || !silencioso.includes('color:var(--ob-fg-soft)')) fail('quiet em repouso deveria ser neutro, sem fundo', silencioso);
if (/border:[^;"]*solid/.test(silencioso)) fail('quiet não deveria ter borda', silencioso);
const semFundo = renderToStaticMarkup(h(Button, { kind: 'quiet', tone: 'primary', fill: false, pressed: true }, 'Ação'));
if (!semFundo.includes('color:var(--ob-blue)') || semFundo.includes('background:var(--ob-blue-050)') || !semFundo.includes('background:transparent')) fail('quiet com fill=false pressionado muda só a cor, sem fundo', semFundo);
const fillIgnorado = renderToStaticMarkup(h(Button, { kind: 'primary', fill: false }, 'Salvar'));
if (!fillIgnorado.includes('background:var(--ob-blue)')) fail('fill só vale no estilo quiet', fillIgnorado);
const silenciosoLigado = renderToStaticMarkup(h(Button, { kind: 'quiet', tone: 'danger', pressed: true }, 'Excluir'));
if (!silenciosoLigado.includes('color:var(--ob-danger)') || !silenciosoLigado.includes('background:var(--ob-danger-bg)')) fail('quiet pressionado assume a cor e o fundo do tom', silenciosoLigado);
for (const [tom, fg, bg] of [['success', 'var(--ob-green-700)', 'var(--ob-green-100)'], ['warning', 'var(--ob-orange-700)', 'var(--ob-orange-100)'], ['primary', 'var(--ob-blue)', 'var(--ob-blue-050)']]) {
  const html = renderToStaticMarkup(h(Button, { kind: 'quiet', tone: tom, pressed: true }, 'Ação'));
  if (!html.includes('color:' + fg) || !html.includes('background:' + bg)) fail('tom ' + tom + ' usa os tokens esperados', html);
}
const tomIgnorado = renderToStaticMarkup(h(Button, { kind: 'primary', tone: 'danger' }, 'Salvar'));
if (!tomIgnorado.includes('background:var(--ob-blue)')) fail('tone só vale no estilo quiet', tomIgnorado);
const comRotulo = renderToStaticMarkup(h(Button, { kind: 'primary', count: 5 }, 'Salvar'));
if (!comRotulo.includes('>5<')) fail('count em botão com rótulo deveria renderizar o contador', comRotulo);
if (/position:absolute/.test(comRotulo)) fail('count em botão com rótulo deveria ficar em linha, não no canto', comRotulo);
if (!/position:absolute/.test(neutro)) fail('count em botão só com ícone continua no canto', neutro);

const fundoDoContador = (props) => {
  const html = renderToStaticMarkup(h(Button, { count: 5, ...props }, 'Salvar'));
  const m = html.match(/<span[^>]*background:([^;]+);[^>]*>5<\/span>/);
  return m ? m[1] : null;
};
igual(fundoDoContador({ kind: 'primary' }), 'var(--ob-danger)', 'o contador padrão é vermelho');
igual(fundoDoContador({ kind: 'secondary' }), 'var(--ob-danger)', 'o contador é vermelho em superfícies claras');
igual(fundoDoContador({ kind: 'danger' }), 'var(--ob-blue)', 'o contador do botão danger é azul');
igual(fundoDoContador({ kind: 'primary', countTone: 'green' }), 'var(--ob-green)', 'countTone muda o tom');
igual(fundoDoContador({ kind: 'danger', countTone: 'red' }), 'var(--ob-danger)', 'countTone vence o padrão do kind');
igual(fundoDoContador({ kind: 'secondary', countTone: 'grey' }), 'var(--ob-fg-mute)', 'countTone aceita grey');

console.log('OK: Button (type padrão, disabled, props nativas, iconOnly, neutral, quiet com tom, pressed, count)');
