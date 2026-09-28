import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToggleButton } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const render = (props, children) => renderToStaticMarkup(h(ToggleButton, props, children));

const off = render({}, 'Fixar');
if (!off.includes('aria-pressed="false"')) fail('não pressionado deveria marcar aria-pressed=false', off);

const on = render({ defaultPressed: true }, 'Fixar');
if (!on.includes('aria-pressed="true"')) fail('defaultPressed deveria marcar aria-pressed=true', on);

const controlled = render({ pressed: true }, 'Fixar');
if (!controlled.includes('aria-pressed="true"')) fail('pressed controlado deveria marcar aria-pressed=true', controlled);

const ghost = render({ appearance: 'ghost' }, 'Fixar');
if (ghost.includes('1.5px solid var(--ob-border)')) fail('ghost não deveria ter borda outline', ghost);

const disabled = render({ disabled: true }, 'Fixar');
if (!disabled.includes('disabled=""') && !disabled.includes('disabled')) fail('disabled deveria desabilitar o botão', disabled);
if (!disabled.includes('cursor:not-allowed')) fail('disabled deveria trocar o cursor', disabled);

const iconOnly = render({ icon: 'push-pin', ariaLabel: 'Fixar' });
if (!iconOnly.includes('aria-label="Fixar"')) fail('só ícone deveria usar ariaLabel', iconOnly);
if (!iconOnly.includes('ph-push-pin')) fail('deveria renderizar o ícone Phosphor', iconOnly);

const pressedIcon = render({ pressed: true, icon: 'speaker-slash', pressedIcon: 'speaker-high' }, 'Som');
if (!pressedIcon.includes('ph-speaker-high') || pressedIcon.includes('ph-speaker-slash')) fail('pressedIcon deveria trocar o ícone quando pressionado', pressedIcon);

const fillWhenPressed = render({ pressed: true, icon: 'star', fillWhenPressed: true }, 'Favorito');
if (!fillWhenPressed.includes('ph-fill ph-star')) fail('fillWhenPressed deveria usar o peso fill quando pressionado', fillWhenPressed);

console.log('OK: ToggleButton (aria-pressed, controlado/não controlado, appearance, disabled, ícones)');
