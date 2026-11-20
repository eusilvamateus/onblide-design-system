import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Checkbox } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

// Por baixo da caixa desenhada há um input nativo, que o formulário, o teclado e o leitor de tela reconhecem.
const a = renderToStaticMarkup(h(Checkbox, { checked: true, label: 'Aceito os termos', name: 'termos', value: 'aceito', required: true }));
if (!a.includes('type="checkbox"')) fail('input nativo ausente', a);
if (a.includes('role="checkbox"')) fail('não deveria haver role="checkbox" manual', a);
if (!/<input[^>]*checked=""/.test(a)) fail('input deveria estar marcado', a);
if (!a.includes('name="termos"') || !a.includes('value="aceito"') || !a.includes('required=""')) fail('name, value e required deveriam ir para o input', a);
const rotulo = a.match(/aria-labelledby="([^"]+)"/)?.[1];
if (!rotulo || !new RegExp(`id="${rotulo}"[^>]*>Aceito os termos<`).test(a)) fail('o nome acessível deveria vir só do label', a);

const b = renderToStaticMarkup(h(Checkbox, { checked: false, indeterminate: true, label: 'Todos' }));
if (!b.includes('data-estado="mixed"') || !b.includes('M228,128')) fail('indeterminado deveria desenhar o traço', b);

const c = renderToStaticMarkup(h(Checkbox, { checked: false, disabled: true, label: 'Bloqueado' }));
if (!/<input[^>]*disabled=""/.test(c) || !c.includes('data-disabled="true"')) fail('desabilitado deveria bloquear o input', c);

const d = renderToStaticMarkup(h(Checkbox, { checked: false, label: 'Termos', description: 'Obrigatório.', error: 'Marque para continuar.' }));
const apoio = d.match(/aria-describedby="([^"]+)"/)?.[1];
if (!apoio || !d.includes(`id="${apoio}" style="font-size:var(--ob-fs-12);color:var(--ob-danger)`) || !d.includes('>Marque para continuar.<')) fail('o erro deveria substituir a descrição e ficar ligado ao input', d);
if (d.includes('Obrigatório.') || !d.includes('aria-invalid="true"') || !d.includes('data-erro="true"')) fail('com erro, a descrição some e o input fica inválido', d);

const e = renderToStaticMarkup(h(Checkbox, { checked: false, ariaLabel: 'Selecionar linha 1' }));
if (!e.includes('aria-label="Selecionar linha 1"') || e.includes('aria-labelledby')) fail('sem label visível, o nome vem de ariaLabel', e);

for (const [size, px] of [['sm', 16], ['md', 18], ['lg', 20]]) {
  const html = renderToStaticMarkup(h(Checkbox, { checked: true, label: 'Rótulo', size }));
  if (!html.includes(`width="${px}" height="${px}"`) || !html.includes(`line-height:${px}px`)) fail(`size ${size} deveria ter caixa e linha de ${px}px`, html);
}
if (!e.includes('width="18"')) fail('o padrão é md, com 18px', e);

console.log('OK: Checkbox (input nativo, formulário, nome e descrição acessíveis, indeterminado, erro, desabilitado, tamanhos sm/md/lg)');
