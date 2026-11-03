import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ButtonGroup, Button, ToggleButton, Tooltip, Menu } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// Ações simples: sem selection, é só um group visual.
const actions = renderToStaticMarkup(
  h(ButtonGroup, { kind: 'secondary', ariaLabel: 'Ações' },
    h(Button, {}, 'Editar'), h(Button, {}, 'Mover'), h(Button, {}, 'Excluir')),
);
if (!actions.includes('role="group"') || !actions.includes('aria-label="Ações"')) fail('grupo attached deveria ter role=group', actions);
if ((actions.match(/Editar|Mover|Excluir/g) || []).length !== 3) fail('deveria renderizar os três botões', actions);

// selection="single": vira radiogroup, itens viram role=radio com aria-checked e roving tabindex.
const single = renderToStaticMarkup(
  h(ButtonGroup, { selection: 'single', defaultValue: 'semana', ariaLabel: 'Período' },
    h(ToggleButton, { value: 'dia' }, 'Dia'), h(ToggleButton, { value: 'semana' }, 'Semana'), h(ToggleButton, { value: 'mes' }, 'Mês')),
);
if (!single.includes('role="radiogroup"')) fail('selection=single deveria ter role=radiogroup', single);
if (!single.includes('role="radio"')) fail('itens deveriam virar role=radio', single);
if (!single.includes('aria-checked="true"')) fail('item com defaultValue deveria marcar aria-checked=true', single);
if (!single.includes('tabindex="0"') || !single.includes('tabindex="-1"')) fail('deveria aplicar roving tabindex (um 0, os demais -1)', single);

// selection="multiple": cada item liga/desliga independente, sem radiogroup.
const multi = renderToStaticMarkup(
  h(ButtonGroup, { selection: 'multiple', defaultValue: ['b'], ariaLabel: 'Formatação' },
    h(ToggleButton, { value: 'b', ariaLabel: 'Negrito' }), h(ToggleButton, { value: 'i', ariaLabel: 'Itálico' })),
);
if (multi.includes('role="radiogroup"')) fail('selection=multiple não deveria virar radiogroup', multi);
if (!multi.includes('aria-pressed="true"') || !multi.includes('aria-pressed="false"')) fail('multiple deveria manter cada item com seu próprio aria-pressed', multi);

// Desabilitado: grupo inteiro e item isolado.
const disabledGroup = renderToStaticMarkup(h(ButtonGroup, {}, h(Button, {}, 'A'), h(Button, {}, 'B')));
const disabledOne = renderToStaticMarkup(h(ButtonGroup, {}, h(Button, {}, 'A'), h(Button, { disabled: true }, 'B')));
if (disabledOne.match(/disabled/g)?.length >= (disabledGroup.match(/disabled/g)?.length ?? 0) + 2) fail('só o botão marcado deveria desabilitar', disabledOne);

// Composição com Tooltip (só ícone) e Menu (split button) não deve quebrar o render nem perder o rótulo/gatilho.
const withTooltip = renderToStaticMarkup(
  h(ButtonGroup, { ariaLabel: 'Histórico' },
    h(Tooltip, { label: 'Desfazer' }, h(Button, { icon: h('span'), 'aria-label': 'Desfazer' }))),
);
if (!withTooltip.includes('aria-label="Desfazer"')) fail('Tooltip + Button deveria preservar o aria-label do botão real', withTooltip);

const splitButton = renderToStaticMarkup(
  h(ButtonGroup, { kind: 'primary', ariaLabel: 'Publicar' },
    h(Button, {}, 'Publicar'),
    h(Menu, { align: 'right', items: [{ label: 'Rascunho' }], trigger: h(Button, { 'aria-label': 'Mais opções' }) })),
);
if (!splitButton.includes('Publicar') || !splitButton.includes('aria-label="Mais opções"')) fail('split button (Menu) deveria renderizar o botão principal e o gatilho', splitButton);

const toggleDoGrupo = renderToStaticMarkup(
  h(ButtonGroup, { selection: 'single', defaultValue: 'a', tone: 'success', ariaLabel: 'Tom' },
    h(ToggleButton, { value: 'a' }, 'A'), h(ToggleButton, { value: 'b' }, 'B')),
);
const toggleAzul = renderToStaticMarkup(
  h(ButtonGroup, { selection: 'single', defaultValue: 'a', ariaLabel: 'Tom' },
    h(ToggleButton, { value: 'a' }, 'A'), h(ToggleButton, { value: 'b' }, 'B')),
);
if (toggleDoGrupo === toggleAzul) fail('tone do grupo deveria mudar a cor do ToggleButton pressionado', toggleDoGrupo);
const toggleProprio = renderToStaticMarkup(
  h(ButtonGroup, { selection: 'single', defaultValue: 'a', tone: 'success', ariaLabel: 'Tom' },
    h(ToggleButton, { value: 'a', tone: 'primary' }, 'A'), h(ToggleButton, { value: 'b' }, 'B')),
);
if (toggleProprio !== toggleAzul) fail('tone do próprio filho deveria prevalecer sobre o do grupo', toggleProprio);
const toggleNeutro = renderToStaticMarkup(
  h(ButtonGroup, { selection: 'single', defaultValue: 'a', tone: 'neutral', ariaLabel: 'Tom' },
    h(ToggleButton, { value: 'a' }, 'A'), h(ToggleButton, { value: 'b' }, 'B')),
);
if (toggleNeutro !== toggleAzul) fail('tone neutral do grupo não deveria alterar o ToggleButton', toggleNeutro);
const quietSemTom = renderToStaticMarkup(h(ButtonGroup, { kind: 'quiet', ariaLabel: 'Ações' }, h(Button, { pressed: true }, 'A')));
const quietComTom = renderToStaticMarkup(h(ButtonGroup, { kind: 'quiet', tone: 'danger', ariaLabel: 'Ações' }, h(Button, { pressed: true }, 'A')));
if (quietSemTom === quietComTom) fail('tone do grupo deveria chegar ao Button quiet pressionado', quietComTom);

console.log('OK: ButtonGroup (group/radiogroup, roving tabindex, multiple independente, disabled, Tooltip e Menu compostos)');
