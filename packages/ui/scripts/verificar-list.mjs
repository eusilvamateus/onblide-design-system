import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
await p.setContent('<html><body style="margin:0"><div id="r" style="padding:24px;width:420px"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

await p.evaluate(() => {
  const h = React.createElement;
  const menu = h(Menu, { defaultOpen: true, align: 'right', ariaLabel: 'Ações', items: [{ label: 'Renomear' }, { label: 'Remover', tone: 'danger' }], trigger: h('button', { type: 'button' }, 'Ações') });
  ReactDOM.createRoot(document.getElementById('r')).render(h(List, { dividers: true, style: { border: '1px solid var(--ob-border)' } },
    h(ListItem, { key: 'a', title: 'Primeiro' }),
    h(ListItem, { key: 'b', title: 'Último', trailing: menu }),
  ));
});
await p.waitForTimeout(300);

const r = await p.evaluate(() => {
  const lista = document.querySelector('ul').getBoundingClientRect();
  const painel = document.querySelector('[role="menu"]').getBoundingClientRect();
  const alvo = document.elementFromPoint(painel.left + painel.width / 2, painel.bottom - 8);
  return { abaixoDaLista: painel.bottom > lista.bottom, visivel: !!alvo?.closest('[role="menu"]') };
});
esperar(r.abaixoDaLista, 'o painel do menu deveria passar da borda da lista');
esperar(r.visivel, 'a parte do menu fora da lista deveria continuar visível, sem recorte');

const cantos = await p.evaluate(() => [...document.querySelectorAll('li')].map((li) => getComputedStyle(li).borderRadius));
esperar(cantos[0].startsWith('12px 12px 0px 0px') && cantos[1].startsWith('0px 0px 12px 12px'), `primeiro item arredonda o topo e o último a base (${cantos.join(' | ')})`);

await b.close();
if (falhas.length) { console.error('FAIL: List\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: List (com dividers, um Menu aberto num item não é recortado; primeiro e último item acompanham os cantos)');
