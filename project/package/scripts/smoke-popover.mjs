import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Popover, Button, Chip, Tooltip } from '../dist/index.js';

// O painel do Popover sai por um portal (ReactDOM.createPortal em document.body) para não ser cortado por
// overflow de um ancestral — por isso, igual ao Drawer, o conteúdo aberto não aparece num SSR puro em Node
// (sem document). Aqui testamos o que dá para verificar sem DOM: o gatilho fechado, nos dois modos de
// interação. O painel aberto (título, fechar, conteúdo) é conferido visualmente via Chromium nas demos do site.
const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const trigger = () => h(Button, {}, 'Abrir');

const closed = renderToStaticMarkup(h(Popover, { trigger: trigger() }, 'Conteúdo'));
if (closed.includes('role="dialog"')) fail('fechado não deveria renderizar o painel', closed);
if (!closed.includes('aria-haspopup="dialog"') || !closed.includes('aria-expanded="false"')) fail('gatilho deveria ter aria-haspopup/expanded no modo clique', closed);

const open = renderToStaticMarkup(h(Popover, { trigger: trigger(), defaultOpen: true, title: 'Título' }, 'Conteúdo'));
if (!open.includes('aria-expanded="true"')) fail('defaultOpen deveria marcar o gatilho como expandido, mesmo sem document para o portal', open);

const hover = renderToStaticMarkup(h(Popover, { trigger: trigger(), interaction: 'hover' }));
if (hover.includes('aria-haspopup') || hover.includes('aria-describedby')) fail('interaction hover fechado não deveria marcar aria-haspopup nem aria-describedby', hover);

const chip = renderToStaticMarkup(h(Tooltip, { label: 'Período' },
  h(Popover, { trigger: h(Chip, { label: 'Agosto - Outubro' }) }, 'Calendário')));
if (!chip.includes('aria-haspopup="dialog"') || !chip.includes('aria-expanded="false"')) fail('Chip deveria aceitar os atributos do Popover', chip);

console.log('OK: Popover (gatilho fechado/aberto nos dois modos de interação; painel aberto verificado via Chromium)');
