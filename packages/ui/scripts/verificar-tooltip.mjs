import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
await p.setContent('<html><body style="margin:0"><style>kbd { color: rgb(255, 0, 0); background: rgb(255, 255, 0); border: 3px solid rgb(255, 0, 0); box-shadow: 0 0 0 4px rgb(255, 0, 0); padding: 9px; }</style><div id="r"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

await p.evaluate(() => {
  const e = React.createElement;
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(e('div', null,
    e('div', { style: { height: 2000 } }),
    e(window.Tooltip, { label: 'Buscar', shortcut: '/', placement: 'right', delay: 0 }, e('button', { id: 'gatilho' }, 'Buscar')),
    e('div', { style: { height: 1000 } }),
    e('p', { id: 'contexto', style: { color: 'rgb(0, 128, 0)' } }, e(window.Kbd, null, 'Ctrl'), ' ', e(window.Kbd, { appearance: 'ghost' }, 'Esc')),
  )));
  document.getElementById('gatilho').dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }));
});
await p.waitForTimeout(200);

const balao = () => p.evaluate(() => {
  const t = document.querySelector('[role="tooltip"]');
  if (!t) return null;
  const r = t.getBoundingClientRect();
  const g = document.getElementById('gatilho').getBoundingClientRect();
  return { visivel: getComputedStyle(t).visibility === 'visible', distancia: Math.round(r.left - g.right), alinhado: Math.abs((r.top + r.height / 2) - (g.top + g.height / 2)) < 2 };
});

const fora = await balao();
esperar(fora && !fora.visivel, `com o gatilho fora da tela, o balão não deveria aparecer (${JSON.stringify(fora)})`);

await p.evaluate(() => document.getElementById('gatilho').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(150);
const dentro = await balao();
esperar(dentro && dentro.visivel && dentro.distancia === 8 && dentro.alinhado, `com o gatilho na tela, o balão deveria aparecer colado a ele (${JSON.stringify(dentro)})`);

await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(150);
const deNovoFora = await balao();
esperar(deNovoFora && !deNovoFora.visivel, 'ao rolar o gatilho para fora da tela, o balão deveria sumir de novo');

const teclas = await p.evaluate(() => {
  const ler = (k) => { const s = getComputedStyle(k); return { cor: s.color, sombra: s.boxShadow, fundo: s.backgroundColor, borda: s.borderTopWidth, padding: s.paddingTop }; };
  const [contorno, fantasma] = document.querySelectorAll('#contexto kbd');
  const noBalao = document.querySelector('[role="tooltip"] kbd');
  return { contorno: ler(contorno), fantasma: ler(fantasma), noBalao: noBalao && ler(noBalao), corDoBalao: getComputedStyle(document.querySelector('[role="tooltip"]')).color };
});
esperar(teclas.contorno.cor === 'rgb(0, 128, 0)', `Kbd outline deveria herdar a cor do texto ao redor, veio ${teclas.contorno.cor}`);
esperar(teclas.contorno.sombra === 'none', `Kbd outline não deveria herdar sombra da página, veio ${teclas.contorno.sombra}`);
esperar(teclas.fantasma.cor === 'rgb(0, 128, 0)' && teclas.fantasma.borda === '0px' && teclas.fantasma.padding === '0px' && teclas.fantasma.sombra === 'none', `Kbd ghost deveria ser só o texto, veio ${JSON.stringify(teclas.fantasma)}`);
esperar(teclas.noBalao && teclas.noBalao.cor === teclas.corDoBalao, `Kbd no tooltip deveria usar a cor do texto do balão (${teclas.corDoBalao}), veio ${teclas.noBalao && teclas.noBalao.cor}`);

await b.close();
if (falhas.length) { console.error('FAIL: Tooltip/Kbd\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Tooltip some com o gatilho fora da tela e Kbd resiste a estilos globais de kbd');
