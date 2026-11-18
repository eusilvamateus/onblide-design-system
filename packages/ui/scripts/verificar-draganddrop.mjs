import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const falhas = [];
const esperar = (ok, msg) => { if (!ok) falhas.push(msg); };

const abrir = async (reduzido = false) => {
  const p = await b.newPage({ viewport: { width: 1100, height: 800 }, reducedMotion: reduzido ? 'reduce' : 'no-preference' });
  p.on('pageerror', (e) => falhas.push(`erro na página: ${e.message}`));
  await p.setContent('<html><body style="margin:0;font-family:sans-serif"><div id="r"></div></body></html>');
  await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
  await carregarPacoteNoNavegador(p);
  await p.evaluate(() => {
    const { useState, createElement: h } = React;
    window.__cliques = 0;
    const Cartao = ({ dnd, id, lista }) => h('div', { ...dnd.itemProps(id, lista), 'data-cartao': id },
      h(Card, { padding: 'var(--ob-space-8)', style: dnd.liftStyle(id) },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, height: 40 }, onClick: () => { window.__cliques++; } },
          h(Button, { kind: 'quiet', size: 'sm', iconOnly: true, 'aria-label': `Mover ${id}`, icon: h(Ph, { n: 'dots-six-vertical' }), ...dnd.handleProps(id, lista) }),
          h('span', null, id))));
    const Coluna = ({ dnd, lista, ids }) => h('div', { ...dnd.listProps(lista), 'data-lista': lista, style: { width: 260, display: 'flex', flexDirection: 'column', gap: 8, padding: 8, minHeight: 120, background: dnd.overList === lista ? (dnd.blocked ? '#fdd' : '#eef') : '#f6f6f6' } },
      ids.map((id) => h(Cartao, { key: id, dnd, id, lista })));
    const App = () => {
      const [listas, setListas] = useState({
        vitrine: ['A', 'B', 'C', 'D', 'E'], separar: ['P1', 'P2', 'P3'], embalar: ['P4', 'P5'], enviado: ['P6'],
        regras: Array.from({ length: 12 }, (_, i) => `R${i + 1}`),
      });
      const mover = (m) => setListas((l) => applyDragMove(l, m));
      const vitrine = useDragAndDrop({ lists: { vitrine: listas.vitrine }, onMove: mover, getItemLabel: (id) => `Produto ${id}` });
      const quadro = useDragAndDrop({
        lists: { separar: listas.separar, embalar: listas.embalar, enviado: listas.enviado }, onMove: mover,
        canDrop: (id, de, para) => !(de === 'enviado' && para !== 'enviado'), getListLabel: (l) => l,
      });
      const regras = useDragAndDrop({ lists: { regras: listas.regras }, onMove: mover });
      window.__estado = { listas, quadro: { overList: quadro.overList, blocked: quadro.blocked } };
      return h('div', { style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 24 } },
        h(Coluna, { dnd: vitrine, lista: 'vitrine', ids: listas.vitrine }), vitrine.overlay,
        h('div', { style: { display: 'flex', gap: 12 } }, ['separar', 'embalar', 'enviado'].map((l) => h(Coluna, { key: l, dnd: quadro, lista: l, ids: listas[l] }))),
        quadro.overlay,
        h('div', { 'data-popup': '', style: { width: 300, height: 320, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' } },
          h('div', { style: { height: 40, flex: 'none' } }, 'Regras'),
          h(ScrollArea, { height: 240 }, h(Coluna, { dnd: regras, lista: 'regras', ids: listas.regras })),
          h('div', { style: { height: 40, flex: 'none' } }, 'Rodapé')),
        regras.overlay,
        h('div', { style: { height: 1400 } }));
    };
    ReactDOM.createRoot(document.getElementById('r')).render(h(App));
  });
  await p.waitForTimeout(200);
  return p;
};

const p = await abrir();
const listas = () => p.evaluate(() => window.__estado.listas);
const cartao = (id) => p.locator(`#r [data-cartao="${id}"]`);
const centro = async (id) => { const c = await cartao(id).boundingBox(); return [c.x + c.width / 2, c.y + c.height / 2]; };
const assentar = () => p.waitForFunction(() => !document.querySelector('[data-ob-drag-layer]') && ![...document.querySelectorAll('#r [data-cartao]')].some((e) => e.style.transform || e.style.zIndex)).then(() => p.waitForTimeout(60));
const gravar = () => p.evaluate(() => {
  window.__q = [];
  const passo = () => {
    window.__q.push([...document.querySelectorAll('#r [data-cartao]')].map((e) => { const r = e.getBoundingClientRect(); return [e.dataset.cartao, r.left, r.top, getComputedStyle(e).visibility]; }));
    if (window.__q.length < 90) requestAnimationFrame(passo);
  };
  passo();
});
const ultimoPasso = () => p.evaluate(() => {
  let ultimo = 0;
  for (let i = 1; i < window.__q.length; i++) {
    const antes = new Map(window.__q[i - 1].map(([n, x, y, v]) => [n, [x, y, v]]));
    const passos = window.__q[i].map(([n, x, y, v]) => { const a = antes.get(n); return a && a[2] === 'visible' && v === 'visible' ? Math.hypot(x - a[0], y - a[1]) : 0; });
    const maior = Math.max(...passos);
    if (maior > 0.5) ultimo = maior;
  }
  return ultimo;
});

const [ax, ay] = await centro('A');
const [, cy] = await centro('C');
await p.mouse.move(ax + 60, ay);
await p.mouse.down();
await p.mouse.move(ax + 60, ay + 15, { steps: 3 });
await p.mouse.move(ax + 60, cy - 20, { steps: 8 });
await p.waitForTimeout(250);
const camada = p.locator('[data-ob-drag-layer]');
esperar(await camada.count() === 1 && await camada.evaluate((e) => e.parentElement === document.body), 'carregando, uma cópia do item deveria viajar por cima da página');
esperar(await camada.evaluate((e) => getComputedStyle(e).zIndex === '800'), 'a cópia deveria ficar na camada de arrastar');
esperar(await camada.locator('[style*="--ob-drag-surface"]').evaluate((e) => e.style.transform === 'scale(1.01)' && e.style.boxShadow.includes('--ob-shadow-md')), 'a superfície da cópia deveria subir 1% com a sombra média');
esperar(await camada.evaluate((e) => e.firstElementChild.hasAttribute('inert') && !e.querySelector('[id]')), 'a cópia não deveria ser focável nem repetir ids');
esperar(await cartao('A').evaluate((e) => getComputedStyle(e).visibility === 'hidden'), 'o item original deveria sair do lugar');
esperar(await p.locator('#r [data-lista="vitrine"] [data-ob-drop-slot]').count() === 1, 'a vaga deveria aparecer dentro da lista');
esperar(await cartao('B').evaluate((e) => e.style.transform.includes('translate3d(0')), 'carregando, os vizinhos deveriam abrir espaço');
await gravar();
await p.mouse.up();
await assentar();
esperar((await ultimoPasso()) < 6, `ao assentar nada deveria pular (último passo ${(await ultimoPasso()).toFixed(1)} px)`);
esperar(JSON.stringify((await listas()).vitrine) === '["B","C","A","D","E"]', `soltar entre C e D deveria pôr A em 3º (${(await listas()).vitrine})`);
esperar(await p.evaluate(() => window.__cliques) === 0, 'soltar não deveria disparar o clique do cartão');
await p.locator('#r [data-cartao="B"] span').click();
esperar(await p.evaluate(() => window.__cliques) === 1, 'um clique comum no cartão deveria continuar funcionando');

await p.getByRole('button', { name: 'Mover E' }).focus();
await p.keyboard.press('Space');
await p.waitForTimeout(80);
esperar(await p.getByRole('button', { name: 'Mover E' }).getAttribute('aria-pressed') === 'true', 'no teclado, a alça erguida deveria ficar pressionada');
esperar(await camada.count() === 0, 'no teclado, o próprio item se move, sem cópia');
await p.keyboard.press('ArrowUp');
await p.keyboard.press('ArrowUp');
await p.waitForTimeout(250);
await p.keyboard.press('Space');
await assentar();
esperar(JSON.stringify((await listas()).vitrine) === '["B","C","E","A","D"]', `Espaço, ↑ ↑ e Espaço deveriam pôr E em 3º (${(await listas()).vitrine})`);
esperar(await p.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Mover E', 'depois de soltar, o foco deveria voltar à alça do item');
await p.keyboard.press('Space');
await p.keyboard.press('ArrowDown');
await p.waitForTimeout(150);
await p.keyboard.press('Escape');
await assentar();
esperar(JSON.stringify((await listas()).vitrine) === '["B","C","E","A","D"]', 'Esc no teclado deveria devolver o item');

const [p1x, p1y] = await centro('P1');
const [, p5y] = await centro('P5');
const embalar = await p.locator('#r [data-lista="embalar"]').boundingBox();
await p.mouse.move(p1x + 40, p1y);
await p.mouse.down();
await p.mouse.move(p1x + 50, p1y + 10, { steps: 3 });
await p.mouse.move(embalar.x + embalar.width / 2, p5y - 4, { steps: 10 });
await p.waitForTimeout(200);
esperar((await p.evaluate(() => window.__estado.quadro.overList)) === 'embalar', 'sobre Embalar, a lista de destino deveria ser Embalar');
await p.mouse.up();
await assentar();
esperar(JSON.stringify((await listas()).embalar) === '["P4","P1","P5"]' && JSON.stringify((await listas()).separar) === '["P2","P3"]', `P1 deveria ir para Embalar entre P4 e P5 (${JSON.stringify(await listas())})`);

const [p6x, p6y] = await centro('P6');
const separar = await p.locator('#r [data-lista="separar"]').boundingBox();
await p.mouse.move(p6x + 40, p6y);
await p.mouse.down();
await p.mouse.move(p6x + 30, p6y + 10, { steps: 3 });
await p.mouse.move(separar.x + separar.width / 2, separar.y + 40, { steps: 10 });
await p.waitForTimeout(200);
esperar(await p.evaluate(() => window.__estado.quadro.blocked) === true, 'levar para onde não pode deveria marcar o bloqueio');
esperar(await p.locator('[data-ob-drop-slot]').count() === 0, 'onde não pode, não deveria aparecer vaga');
await p.mouse.up();
await assentar();
esperar(JSON.stringify((await listas()).enviado) === '["P6"]', 'soltar onde não pode deveria devolver o item');

const [p2x, p2y] = await centro('P2');
await p.mouse.move(p2x + 40, p2y);
await p.mouse.down();
await p.mouse.move(p2x + 300, p2y + 30, { steps: 8 });
await p.keyboard.press('Escape');
await p.mouse.up();
await assentar();
esperar(JSON.stringify((await listas()).separar) === '["P2","P3"]', 'Esc no meio do arrasto deveria cancelar');

const yAntes = await p.evaluate(() => window.scrollY);
const [dx, dy] = await centro('D');
await p.mouse.move(dx + 60, dy);
await p.mouse.down();
await p.mouse.move(dx + 60, dy + 15, { steps: 3 });
await p.mouse.move(dx + 900, 790, { steps: 6 });
await p.waitForTimeout(700);
esperar((await p.evaluate(() => window.scrollY)) > yAntes + 50, 'fora de qualquer área, segurar o item perto da borda de baixo deveria rolar a janela');
await p.keyboard.press('Escape');
await p.mouse.up();
await assentar();

await p.evaluate(() => document.querySelector('[data-popup]').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(150);
const area = p.locator('#r [data-popup] .ob-sa-viewport');
const caixaDaArea = await area.boundingBox();
const janelaAntes = await p.evaluate(() => window.scrollY);
const [r1x, r1y] = await centro('R1');
await p.mouse.move(r1x + 60, r1y);
await p.mouse.down();
await p.mouse.move(r1x + 60, r1y + 15, { steps: 3 });
await p.mouse.move(r1x + 60, caixaDaArea.y + caixaDaArea.height - 10, { steps: 8 });
await p.waitForTimeout(1600);
const rolagem = await area.evaluate((e) => ({ topo: e.scrollTop, maximo: e.scrollHeight - e.clientHeight }));
esperar(rolagem.topo > 0 && rolagem.maximo - rolagem.topo < 2, `segurar o item perto da borda do ScrollArea deveria rolar a área até o fim (${rolagem.topo} de ${rolagem.maximo})`);
esperar(Math.abs((await p.evaluate(() => window.scrollY)) - janelaAntes) < 1, 'dentro do ScrollArea, quem rola é a área, não a janela');
const daCopia = await camada.boundingBox();
esperar(daCopia.y + daCopia.height > caixaDaArea.y + caixaDaArea.height, 'perto da borda, a cópia deveria passar da área sem ser cortada');
await p.mouse.move(r1x + 60, caixaDaArea.y + caixaDaArea.height - 40, { steps: 4 });
await p.waitForTimeout(250);
const slot = p.locator('#r [data-lista="regras"] [data-ob-drop-slot]');
esperar(await slot.count() === 1, 'a vaga deveria ficar dentro da lista do ScrollArea');
const caixaDaVaga = await slot.boundingBox();
esperar(caixaDaVaga && caixaDaVaga.y >= caixaDaArea.y - 1 && caixaDaVaga.y + caixaDaVaga.height <= caixaDaArea.y + caixaDaArea.height + 1, 'depois de rolar, a vaga deveria aparecer onde a lista está visível');
await gravar();
await p.mouse.up();
await assentar();
esperar(JSON.stringify((await listas()).regras) === JSON.stringify([...Array.from({ length: 11 }, (_, i) => `R${i + 2}`), 'R1']), `R1 deveria ir para o fim das regras (${(await listas()).regras})`);
esperar((await ultimoPasso()) < 6, `dentro do ScrollArea, ao assentar nada deveria pular (último passo ${(await ultimoPasso()).toFixed(1)} px)`);

await p.getByRole('button', { name: 'Mover R12' }).focus();
const topoAntes = await area.evaluate((e) => e.scrollTop);
await p.keyboard.press('Space');
for (let i = 0; i < 10; i++) await p.keyboard.press('ArrowUp');
await p.waitForTimeout(300);
esperar((await area.evaluate((e) => e.scrollTop)) < topoAntes - 100, 'no teclado, a área deveria rolar para mostrar a vaga');
const vagaTeclado = await slot.boundingBox();
esperar(vagaTeclado && vagaTeclado.y >= caixaDaArea.y - 1, 'no teclado, a vaga deveria ficar visível dentro da área');
await p.keyboard.press('Space');
await assentar();
esperar((await listas()).regras[0] === 'R12', `↑ dez vezes deveria pôr R12 no topo (${(await listas()).regras})`);

const r = await abrir(true);
const caixa = await r.locator('#r [data-cartao="A"]').boundingBox();
const c = await r.locator('#r [data-cartao="C"]').boundingBox();
await r.mouse.move(caixa.x + 60, caixa.y + caixa.height / 2);
await r.mouse.down();
await r.mouse.move(caixa.x + 60, caixa.y + caixa.height / 2 + 15, { steps: 3 });
await r.mouse.move(caixa.x + 60, c.y + c.height / 2 - 20, { steps: 6 });
const inicio = Date.now();
await r.mouse.up();
await r.waitForFunction(() => !document.querySelector('[data-ob-drag-layer]') && ![...document.querySelectorAll('#r [data-cartao]')].some((e) => e.style.zIndex));
esperar(Date.now() - inicio < 250, `com menos movimento, assentar deveria ser imediato (${Date.now() - inicio} ms)`);
esperar(JSON.stringify(await r.evaluate(() => window.__estado.listas.vitrine)) === '["B","C","A","D","E"]', 'com menos movimento, o arrasto deveria funcionar igual');

await b.close();
if (falhas.length) {
  console.error(`FAIL: useDragAndDrop no navegador\n${falhas.join('\n')}`);
  process.exit(1);
}
console.log('OK: useDragAndDrop no navegador (cópia por cima da página, vizinhos, vaga na lista, assentar sem pulo, clique preservado, teclado, Esc, entre listas, não pode, rolagem da janela, ScrollArea: rolagem da área, cópia sem corte, vaga e teclado, menos movimento)');
