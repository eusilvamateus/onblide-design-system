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
const TEXTO = Array.from({ length: 30 }, (_, i) => `Linha ${i + 1} do texto de teste.`).join('\n');

const montar = (props) => p.evaluate((props) => {
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Textarea, { label: 'Notas', ...props })));
}, props);
const medir = () => p.evaluate(() => {
  const t = document.querySelector('textarea');
  const raiz = t.closest('label') ? t.parentElement : document.querySelector('#r > div');
  const alca = document.querySelector('[data-alca]');
  const polegar = document.querySelector('.ob-sa-polegar');
  return {
    barraNativa: t.offsetWidth - t.clientWidth,
    altura: Math.round(t.getBoundingClientRect().height),
    largura: Math.round(document.querySelector('#r > div').getBoundingClientRect().width),
    rolagem: Math.round(t.scrollTop),
    alca: alca && (() => { const r = alca.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })(),
    polegar: polegar && (() => { const r = polegar.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, fundo: polegar.parentElement.getBoundingClientRect().bottom, alcaTopo: alca ? alca.getBoundingClientRect().top : null }; })(),
  };
});
const arrastar = async (de, dx, dy) => {
  await p.mouse.move(de.x, de.y);
  await p.mouse.down();
  await p.mouse.move(de.x + dx / 2, de.y + dy / 2);
  await p.mouse.move(de.x + dx, de.y + dy);
  await p.mouse.up();
  await p.waitForTimeout(100);
};

await montar({ defaultValue: TEXTO, rows: 4 });
await p.hover('textarea');
await p.waitForTimeout(150);
let m = await medir();
esperar(m.barraNativa === 0, `a barra nativa deveria estar escondida (ocupa ${m.barraNativa}px)`);
esperar(!!m.polegar, 'com texto longo, a barra do design system deveria aparecer');
if (m.polegar) {
  esperar(m.polegar.fundo <= m.polegar.alcaTopo + 1, 'a barra não deveria passar por cima da alça');
  await arrastar(m.polegar, 0, 40);
  const depois = await medir();
  esperar(depois.rolagem > m.rolagem + 40, `arrastar a barra deveria rolar o texto (${m.rolagem} → ${depois.rolagem})`);
}

m = await medir();
await arrastar(m.alca, 120, 80);
let r = await medir();
esperar(Math.abs(r.altura - (m.altura + 80)) <= 1, `alça vertical deveria aumentar a altura em 80px (${m.altura} → ${r.altura})`);
esperar(r.largura === m.largura, 'alça vertical não deveria mudar a largura');
await arrastar(r.alca, 0, -1000);
const minimo = await medir();
esperar(minimo.altura === 2 * 20 + 2 * 10, `a altura mínima deveria ser a de minRows (${minimo.altura})`);

await montar({ resize: 'both', width: 300 });
m = await medir();
await arrastar(m.alca, 100, 50);
r = await medir();
esperar(Math.abs(r.largura - 400) <= 1 && Math.abs(r.altura - (m.altura + 50)) <= 1, `both deveria mudar largura e altura (${m.largura}x${m.altura} → ${r.largura}x${r.altura})`);
await arrastar(r.alca, 1000, 0);
r = await medir();
esperar(r.largura === 480, `a largura não deveria passar da área disponível (${r.largura})`);
await arrastar(r.alca, -1000, 0);
r = await medir();
esperar(r.largura === 160, `a largura mínima deveria ser 160px (${r.largura})`);

await montar({ resize: 'horizontal', width: 300 });
m = await medir();
await arrastar(m.alca, 60, 60);
r = await medir();
esperar(r.largura === 360 && r.altura === m.altura, `horizontal só deveria mudar a largura (${m.largura}x${m.altura} → ${r.largura}x${r.altura})`);

await b.close();
if (falhas.length) { console.error('FAIL: Textarea\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Textarea (barra do design system no lugar da nativa, alça vertical, horizontal e nos dois eixos, limites de tamanho)');
