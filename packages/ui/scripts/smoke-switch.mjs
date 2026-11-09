import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Switch } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Switch, props));

// Semântica de switch (leitores de tela) e ordem de tab.
const ligado = render({ checked: true, label: 'Notificações' });
const desligado = render({ checked: false, label: 'Notificações' });
if (!ligado.includes('role="switch"') || !ligado.includes('aria-checked="true"')) fail('switch ligado', ligado);
if (!desligado.includes('aria-checked="false"')) fail('switch desligado', desligado);
if (!ligado.includes('aria-label="Notificações"')) fail('nome acessível quando o label é string', ligado);
if (!ligado.includes('tabindex="0"')) fail('deveria entrar na ordem de tab', ligado);
if (desligado.includes('aria-disabled')) fail('habilitado não deveria ter aria-disabled', desligado);
const desabilitado = render({ checked: false, disabled: true });
if (!desabilitado.includes('tabindex="-1"') || !desabilitado.includes('aria-disabled="true"')) fail('desabilitado', desabilitado);
if (render({ checked: false, label: React.createElement('b', null, 'x') }).includes('aria-label=')) fail('label que não é string não vira aria-label');

// Teclado. O Switch não usa hooks, então dá para chamá-lo como função e acionar
// os handlers do elemento retornado, sem DOM.
function elementoSwitch(props) {
  const raiz = Switch(props);
  return React.Children.toArray(raiz.props.children)[0];
}
function acionar(props, evento) {
  const chamadas = [];
  const el = elementoSwitch({ ...props, onChange: (v) => chamadas.push(v) });
  let bloqueado = false;
  if (evento === 'click') el.props.onClick();
  else el.props.onKeyDown({ key: evento, preventDefault: () => { bloqueado = true; } });
  return { chamadas, bloqueado };
}
const espaco = acionar({ checked: false }, ' ');
if (espaco.chamadas.join() !== 'true' || !espaco.bloqueado) fail('Espaço deveria ligar e bloquear o scroll', espaco);
const enter = acionar({ checked: true }, 'Enter');
if (enter.chamadas.join() !== 'false') fail('Enter deveria desligar', enter);
if (acionar({ checked: false }, 'a').chamadas.length) fail('outras teclas não fazem nada');
if (acionar({ checked: false, disabled: true }, ' ').chamadas.length) fail('desabilitado ignora o teclado');
if (acionar({ checked: false }, 'click').chamadas.join() !== 'true') fail('clique continua alternando');
if (acionar({ checked: false, disabled: true }, 'click').chamadas.length) fail('desabilitado ignora o clique');

for (const [size, w, h, fonte] of [['sm', 32, 18, 13], ['md', 40, 22, 14], ['lg', 48, 26, 15]]) {
  const html = render({ checked: true, label: 'Rótulo', size });
  if (!html.includes(`width:${w}px;height:${h}px`) || !html.includes(`font-size:var(--ob-fs-${fonte})`)) fail(`size ${size} deveria ter trilho de ${w}×${h}px e texto de ${fonte}px`, html);
}
if (!render({ checked: false }).includes('width:40px;height:22px')) fail('o padrão é md, com 40×22px');

console.log('OK: Switch (role=switch, aria-checked, tab, Espaço/Enter, clique, desabilitado, tamanhos sm/md/lg)');
