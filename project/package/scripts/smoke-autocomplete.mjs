import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Autocomplete } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const options = ['Ana Souza', 'Bruno Lima', 'Carla Dias'];

const closed = renderToStaticMarkup(h(Autocomplete, { options, label: 'Responsável' }));
if (!closed.includes('role="combobox"') || closed.includes('role="listbox"')) fail('fechado deveria ser combobox sem a lista aberta', closed);
if (!closed.includes('Responsável')) fail('deveria mostrar o label', closed);

const open = renderToStaticMarkup(h(Autocomplete, { options, open: true }));
if (!open.includes('role="listbox"') || !open.includes('Ana Souza')) fail('open=true deveria mostrar as opções', open);

const multiple = renderToStaticMarkup(h(Autocomplete, { options, multiple: true, value: ['Ana Souza'] }));
if (!multiple.includes('Ana Souza')) fail('multiple com value deveria mostrar o Chip selecionado', multiple);

const grouped = renderToStaticMarkup(h(Autocomplete, {
  options: [{ label: 'Ana', group: 'Design' }, { label: 'Bruno', group: 'Dev' }], groupBy: 'group', open: true,
}));
if (!grouped.includes('role="group"') || !grouped.includes('Design') || !grouped.includes('Dev')) fail('groupBy deveria agrupar as opções', grouped);

const creatable = renderToStaticMarkup(h(Autocomplete, { mode: 'creatable', open: true, defaultInputValue: 'Novo item' }));
if (!creatable.includes('Criar')) fail('modo creatable com texto novo deveria oferecer "Criar"', creatable);

const loading = renderToStaticMarkup(h(Autocomplete, { options, open: true, loadOptions: async () => [], loading: true }));
if (!loading.includes('Buscando')) fail('loading deveria mostrar o estado de busca', loading);

const error = renderToStaticMarkup(h(Autocomplete, { options, error: 'Selecione um responsável' }));
if (!error.includes('aria-invalid="true"') || !error.includes('Selecione um responsável')) fail('error deveria marcar aria-invalid e mostrar a mensagem', error);

console.log('OK: Autocomplete (fechado/aberto, multiple, groupBy, creatable, loading, error)');
