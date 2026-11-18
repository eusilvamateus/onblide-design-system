import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const falhas = [];
const esperar = (ok, msg) => { if (!ok) falhas.push(msg); };

const abrir = async (reduzido = false) => {
  const p = await b.newPage({ viewport: { width: 900, height: 700 }, reducedMotion: reduzido ? 'reduce' : 'no-preference' });
  p.on('pageerror', (e) => falhas.push(`erro na página: ${e.message}`));
  await p.setContent('<html><body style="margin:0;font-family:sans-serif"><div id="r" style="width:360px;padding:24px"></div></body></html>');
  await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
  await carregarPacoteNoNavegador(p);
  await p.evaluate(() => {
    const itens = [
      { id: 'docs', label: 'Documentos', icon: 'folder', children: [{ id: 'contrato', label: 'Contrato.pdf', icon: 'file' }, { id: 'nota', label: 'Nota.pdf', icon: 'file' }] },
      { id: 'fotos', label: 'Fotos', icon: 'folder', children: [] },
      { id: 'avisos', label: 'Avisos.txt', icon: 'file' },
      { id: 'briefing', label: 'Briefing.txt', icon: 'file' },
    ];
    window.__ordem = () => {
      const r = [];
      const andar = (ns, nivel) => ns.forEach((n) => { r.push(`${'-'.repeat(nivel)}${n.id}`); if (n.children) andar(n.children, nivel + 1); });
      andar(window.__itens ?? itens, 0);
      return r.join(' ');
    };
    ReactDOM.createRoot(document.getElementById('r')).render(React.createElement(TreeView, {
      defaultItems: itens, defaultExpanded: ['docs'], draggable: true, onItemsChange: (v) => { window.__itens = v; },
    }));
  });
  await p.waitForTimeout(150);
  return p;
};

const p = await abrir();
const linha = (id) => p.locator(`[data-id="${id}"]`);
const alca = (id) => linha(id).locator('.ob-tv-handle');
const parado = () => p.waitForFunction(() => !document.querySelector('[data-ob-tv-drag]') && ![...document.querySelectorAll('[data-id]')].some((e) => e.style.zIndex || e.style.visibility === 'hidden' || getComputedStyle(e).transform !== 'none')).then(() => p.waitForTimeout(60));
const pegar = async (id) => {
  const c = await alca(id).boundingBox();
  await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await p.mouse.down();
  await p.mouse.move(c.x + c.width / 2 + 6, c.y + c.height / 2 + 6, { steps: 2 });
};
const levarPara = async (id, fracaoY) => {
  const c = await linha(id).boundingBox();
  await p.mouse.move(c.x + 120, c.y + c.height * fracaoY, { steps: 8 });
  await p.waitForTimeout(150);
};

await pegar('briefing');
await levarPara('avisos', 0.2);
esperar(await p.locator('[data-ob-tv-drag]').count() === 1, 'carregando, a linha deveria flutuar por cima da página');
esperar(await linha('briefing').evaluate((e) => e.style.visibility === 'hidden'), 'carregando, o lugar de origem deveria ficar vazio');
esperar(await p.locator('[data-ob-tv-drag] > *').evaluate((e) => e.style.transform === 'scale(1.01)' && e.style.boxShadow.includes('--ob-shadow-md')), 'a linha carregada deveria subir 1% com a sombra média');
esperar(await p.locator('[data-ob-tv-drag]').evaluate((e) => getComputedStyle(e).zIndex === '800'), 'a linha carregada deveria ficar na camada de arrastar');
esperar(await p.locator('[data-ob-tv-drag]').innerText() === 'Briefing.txt', 'a linha que flutua deveria ser igual à original');
esperar(await p.locator('[data-ob-tv-drag] [data-id], [data-ob-tv-drag] [tabindex], [data-ob-tv-drag] [role]').count() === 0, 'a cópia não deveria ser focável nem aparecer para o leitor de tela');
await p.evaluate(() => {
  window.__q = [];
  const passo = () => {
    window.__q.push([...document.querySelectorAll('[data-id]')].map((e) => { const r = e.getBoundingClientRect(); return [e.dataset.id, r.left, r.top, e.style.visibility]; }));
    if (window.__q.length < 80) requestAnimationFrame(passo);
  };
  passo();
});
await p.mouse.up();
await parado();
const assentou = await p.evaluate(() => {
  let ultimo = 0;
  let mexeu = 0;
  for (let i = 1; i < window.__q.length; i++) {
    const antes = new Map(window.__q[i - 1].map(([n, x, y]) => [n, [x, y]]));
    const passos = window.__q[i].filter(([n, , , vis]) => n === 'briefing' && vis !== 'hidden').map(([n, x, y]) => { const a = antes.get(n); return a ? Math.hypot(x - a[0], y - a[1]) : 0; });
    const maior = Math.max(0, ...passos);
    if (maior > 0.5) { ultimo = maior; mexeu++; }
  }
  return { ultimo, mexeu };
});
esperar(assentou.mexeu >= 3, `ao soltar, a linha deveria viajar até o lugar novo (${assentou.mexeu} quadros)`);
esperar(assentou.ultimo < 6, `ao assentar a linha não deveria pular (último passo ${assentou.ultimo.toFixed(1)} px)`);
esperar(await p.evaluate(() => window.__ordem()) === 'docs -contrato -nota fotos briefing avisos', `Briefing deveria ir para antes de Avisos (${await p.evaluate(() => window.__ordem())})`);

await pegar('avisos');
await levarPara('fotos', 0.5);
esperar(await linha('fotos').evaluate((e) => e.style.boxShadow.includes('--ob-blue')), 'sobre o meio de uma pasta, ela deveria se destacar como destino');
await p.mouse.up();
await parado();
esperar(await p.evaluate(() => window.__ordem()) === 'docs -contrato -nota fotos -avisos briefing', `Avisos deveria entrar em Fotos (${await p.evaluate(() => window.__ordem())})`);

await pegar('docs');
await levarPara('nota', 0.8);
esperar(await p.locator('[data-ob-tv-drag] > *').evaluate((e) => e.style.boxShadow.includes('--ob-danger')), 'levar uma pasta para dentro dela mesma deveria mostrar que não pode');
esperar(await p.evaluate(() => document.body.style.cursor) === 'not-allowed', 'onde não pode, o cursor deveria mudar');
await p.mouse.up();
await parado();
esperar(await p.evaluate(() => window.__ordem()) === 'docs -contrato -nota fotos -avisos briefing', 'soltar onde não pode deveria devolver a pasta');

await pegar('briefing');
await levarPara('docs', 0.1);
await p.keyboard.press('Escape');
await p.mouse.up();
await parado();
esperar(await p.evaluate(() => window.__ordem()) === 'docs -contrato -nota fotos -avisos briefing', 'Esc deveria cancelar');

await linha('contrato').focus();
await p.keyboard.press('Alt+Shift+ArrowDown');
await p.waitForTimeout(40);
esperar(await linha('contrato').evaluate((e) => getComputedStyle(e).transform !== 'none'), 'mover pelo teclado deveria fazer a linha viajar');
await parado();
esperar(await p.evaluate(() => window.__ordem()) === 'docs -nota -contrato fotos -avisos briefing', `Alt+Shift+↓ deveria descer o Contrato (${await p.evaluate(() => window.__ordem())})`);
esperar(await p.evaluate(() => document.activeElement?.dataset.id) === 'contrato', 'o foco deveria continuar na linha movida');
esperar(await p.evaluate(() => getComputedStyle(document.querySelector('[data-id="contrato"]')).zIndex) !== '800', 'depois de assentar, a linha deveria voltar à camada normal');

const r = await abrir(true);
const c = await r.locator('[data-id="briefing"] .ob-tv-handle').boundingBox();
await r.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
await r.mouse.down();
await r.mouse.move(c.x + 10, c.y + 10, { steps: 2 });
const alvo = await r.locator('[data-id="avisos"]').boundingBox();
await r.mouse.move(alvo.x + 120, alvo.y + alvo.height * 0.2, { steps: 6 });
const inicio = Date.now();
await r.mouse.up();
await r.waitForFunction(() => ![...document.querySelectorAll('[data-id]')].some((e) => e.style.zIndex || getComputedStyle(e).transform !== 'none'));
esperar(Date.now() - inicio < 250, `com menos movimento, assentar deveria ser imediato (${Date.now() - inicio} ms)`);

await b.close();
if (falhas.length) {
  console.error(`FAIL: arrastar do TreeView\n${falhas.join('\n')}`);
  process.exit(1);
}
console.log('OK: arrastar do TreeView (linha flutua igual à original, origem vazia, sobe 1% com sombra média, assenta sem pulo, antes/dentro, não pode, Esc, teclado com viagem, menos movimento)');
