import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const ESCALAS = [0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const POSICOES = [0, 0.2, 0.4, 0.6, 0.8];
const TOLERANCIA = 1;

const chromium = obterChromium();
const b = await chromium.launch();
const falhas = [];
for (const escala of ESCALAS) {
  const p = await b.newPage({ viewport: { width: 300, height: 200 }, deviceScaleFactor: escala });
  await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
  await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
  await carregarPacoteNoNavegador(p);
  let pior = 0;
  for (const x of POSICOES) for (const y of POSICOES) {
    await p.evaluate(({ x, y }) => {
      const r = document.getElementById('r');
      r.style.cssText = `position:absolute;left:${20 + x}px;top:${20 + y}px`;
      window.__raiz ??= ReactDOM.createRoot(r);
      ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Radio, { value: 'a', checked: true })));
    }, { x, y });
    const png = await p.screenshot({ clip: { x: 10, y: 10, width: 40, height: 40 } });
    const { horizontal, vertical } = await p.evaluate(async (s) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + s; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const azul = (i, l) => d[(l * c.width + i) * 4] < 200;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let l = 0; l < c.height; l++) for (let i = 0; i < c.width; i++) if (azul(i, l)) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, l); y1 = Math.max(y1, l); }
      const pilha = [[Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2)]];
      const visto = new Set();
      let dx0 = 1e9, dy0 = 1e9, dx1 = -1, dy1 = -1;
      while (pilha.length) {
        const [i, l] = pilha.pop();
        const chave = `${i},${l}`;
        if (visto.has(chave) || !azul(i, l)) continue;
        visto.add(chave);
        dx0 = Math.min(dx0, i); dx1 = Math.max(dx1, i); dy0 = Math.min(dy0, l); dy1 = Math.max(dy1, l);
        pilha.push([i + 1, l], [i - 1, l], [i, l + 1], [i, l - 1]);
      }
      return { horizontal: (dx0 - x0) - (x1 - dx1), vertical: (dy0 - y0) - (y1 - dy1) };
    }, png.toString('base64'));
    pior = Math.max(pior, Math.abs(horizontal), Math.abs(vertical));
  }
  const ok = pior <= TOLERANCIA;
  if (!ok) falhas.push(`escala ${escala}: ${pior}px de diferença entre os lados`);
  console.log(`${String(escala).padEnd(4)} pior diferença ${pior}px ${ok ? 'ok' : 'FORA'}`);
}
await b.close();
if (falhas.length) { console.error('FAIL: ponto do Radio fora do centro\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: ponto do Radio centralizado em todas as escalas e posições');
