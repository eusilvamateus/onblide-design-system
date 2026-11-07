import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 700 } });
await p.setContent('<html><body style="margin:0"><div id="r" style="width:480px;padding:20px"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

const montar = (props) => p.evaluate((props) => {
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Textarea, { label: 'Notas', ...props })));
}, props);
const medir = () => p.evaluate(() => {
  const t = document.querySelector('textarea');
  const caixa = t.parentElement.getBoundingClientRect();
  const r = t.getBoundingClientRect();
  return {
    largura: Math.round(caixa.width), altura: Math.round(r.height), raiz: Math.round(document.querySelector('#r > div').getBoundingClientRect().width),
    campo: t.offsetWidth, canto: { x: r.right - 4, y: r.bottom - 4 }, barra: getComputedStyle(t).scrollbarWidth,
  };
});
const arrastar = async (de, dx, dy) => {
  await p.mouse.move(de.x, de.y);
  await p.mouse.down();
  await p.mouse.move(de.x + dx / 2, de.y + dy / 2);
  await p.mouse.move(de.x + dx, de.y + dy);
  await p.mouse.up();
  await p.waitForTimeout(50);
};

await montar({ rows: 4 });
let m = await medir();
esperar(m.barra === 'thin', `a barra nativa deveria ser fina (${m.barra})`);
esperar(m.largura === 480, `sem largura, o campo ocupa a área toda (${m.largura})`);
await arrastar(m.canto, 120, 80);
let r = await medir();
esperar(Math.abs(r.altura - (m.altura + 80)) <= 1 && r.largura === m.largura, `vertical só muda a altura (${m.largura}x${m.altura} → ${r.largura}x${r.altura})`);
await arrastar(r.canto, 0, -1000);
r = await medir();
esperar(r.altura === 2 * 20 + 2 * 10, `a altura mínima deveria ser a de minRows (${r.altura})`);

await montar({ resize: 'both', width: 300, hint: 'Um texto de apoio bem comprido que não deveria alargar o campo além da caixa' });
m = await medir();
esperar(m.largura === 300 && m.raiz === 300, `both começa na largura pedida (${m.largura}, raiz ${m.raiz})`);
await arrastar(m.canto, 100, 50);
r = await medir();
esperar(Math.abs(r.largura - 400) <= 1 && Math.abs(r.altura - (m.altura + 50)) <= 1, `both muda largura e altura (${m.largura}x${m.altura} → ${r.largura}x${r.altura})`);
esperar(Math.abs(r.raiz - r.largura) <= 1, `rótulo e apoio acompanham a caixa (${r.raiz} x ${r.largura})`);
await arrastar(r.canto, 1000, 0);
r = await medir();
esperar(r.largura === 480, `a largura não passa da área disponível (${r.largura})`);
await arrastar(r.canto, -1000, 0);
r = await medir();
esperar(r.campo === 160, `a largura mínima do texto é 160px (${r.campo})`);

await montar({ resize: 'horizontal' });
m = await medir();
esperar(m.largura === 480, `horizontal sem largura começa ocupando a área (${m.largura})`);
await arrastar(m.canto, -100, 60);
r = await medir();
esperar(Math.abs(r.largura - 380) <= 1 && r.altura === m.altura, `horizontal só muda a largura (${m.largura}x${m.altura} → ${r.largura}x${r.altura})`);

await b.close();
if (falhas.length) { console.error('FAIL: Textarea\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Textarea (barra nativa fina, redimensionamento nativo vertical, horizontal e nos dois eixos, limites de tamanho)');
