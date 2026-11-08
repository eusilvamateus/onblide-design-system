import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body style="margin:0"><div id="r" style="width:420px;padding:20px"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

const montar = (props) => p.evaluate((props) => {
  const itens = ['a', 'b', 'c'].map((id) => ({
    id, title: `Item ${id}`,
    content: React.createElement('div', null, 'Conteúdo do item com texto suficiente para ter altura. ', React.createElement('button', { id: `acao-${id}` }, 'Ação')),
  }));
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Accordion, { items: itens, ...props })));
}, props);
const alturaDoPainel = (id) => p.evaluate((id) => document.querySelector(`[aria-labelledby$="-c-${id}"]`).getBoundingClientRect().height, id);
const acaoAlcancavel = (id) => p.evaluate((id) => { const el = document.getElementById(`acao-${id}`); el.focus(); return document.activeElement === el; }, id);

await montar({});
esperar(await alturaDoPainel('a') === 0, 'painel fechado deveria ter altura 0');
esperar(!(await acaoAlcancavel('a')), 'conteúdo do painel fechado não deveria receber foco');
await p.click('#r button.ob-accordion-cabecalho');
await p.waitForTimeout(60);
const meio = await alturaDoPainel('a');
await p.waitForTimeout(400);
const fim = await alturaDoPainel('a');
esperar(fim > 40, `painel aberto deveria ter a altura do conteúdo (${fim}px)`);
esperar(meio > 0 && meio < fim, `a altura deveria crescer aos poucos ao abrir (aos 60ms: ${meio}px de ${fim}px)`);
esperar(await acaoAlcancavel('a'), 'conteúdo do painel aberto deveria receber foco');
await p.click('#r button.ob-accordion-cabecalho');
await p.waitForTimeout(60);
const fechando = await alturaDoPainel('a');
esperar(fechando > 0 && fechando < fim, `a altura deveria diminuir aos poucos ao fechar (aos 60ms: ${fechando}px)`);
await p.waitForTimeout(400);
esperar(await alturaDoPainel('a') === 0, 'painel deveria terminar fechado com altura 0');
esperar(!(await acaoAlcancavel('a')), 'conteúdo deveria sair do alcance do foco depois de fechar');

await p.emulateMedia({ reducedMotion: 'reduce' });
await montar({});
await p.click('#r button.ob-accordion-cabecalho');
await p.waitForTimeout(30);
esperar(await alturaDoPainel('a') > 40, 'com movimento reduzido o painel deveria abrir de uma vez');
await p.emulateMedia({ reducedMotion: 'no-preference' });

const cabecalhos = {};
for (const size of ['sm', 'md', 'lg']) {
  await montar({ size });
  cabecalhos[size] = await p.evaluate(() => document.querySelector('.ob-accordion-cabecalho').getBoundingClientRect().height);
}
esperar(cabecalhos.sm < cabecalhos.md && cabecalhos.md < cabecalhos.lg, `cabeçalhos deveriam crescer de sm para lg (${cabecalhos.sm}, ${cabecalhos.md}, ${cabecalhos.lg})`);

await montar({ attached: false });
const espacos = await p.evaluate(() => {
  const itens = [...document.querySelector('[role="group"]').children].map((el) => el.getBoundingClientRect());
  return itens.slice(1).map((r, i) => r.top - itens[i].bottom);
});
esperar(espacos.every((e) => e === 8), `itens soltos deveriam ter 8px entre si (${espacos.join(', ')})`);

await montar({ appearance: 'ghost' });
const ghost = await p.evaluate(() => {
  const c = getComputedStyle(document.querySelector('[role="group"]'));
  return { borda: c.borderTopWidth, fundo: c.backgroundColor };
});
esperar(ghost.borda === '0px' && ghost.fundo === 'rgba(0, 0, 0, 0)', `ghost não deveria ter caixa (${ghost.borda}, ${ghost.fundo})`);

await b.close();
if (falhas.length) { console.error('FAIL: Accordion\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Accordion (abre e fecha animando a altura, conteúdo fechado fora do foco, movimento reduzido, tamanhos, itens soltos e ghost)');
