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
  for (const estado of ['check', 'minus']) {
    let pior = 0;
    for (const x of POSICOES) for (const y of POSICOES) {
      await p.evaluate(({ x, y, estado }) => {
        const r = document.getElementById('r');
        r.style.cssText = `position:absolute;left:${20 + x}px;top:${20 + y}px`;
        window.__raiz ??= ReactDOM.createRoot(r);
        ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Checkbox, { checked: true, indeterminate: estado === 'minus', ariaLabel: 'Caixa' })));
      }, { x, y, estado });
      const png = await p.screenshot({ clip: { x: 10, y: 10, width: 40, height: 40 } });
      const { horizontal, vertical } = await p.evaluate(async (s) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + s; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); const d = ctx.getImageData(0, 0, c.width, c.height).data;
        const verm = (i, l) => d[(l * c.width + i) * 4];
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, gx0 = 1e9, gy0 = 1e9, gx1 = -1, gy1 = -1;
        for (let l = 0; l < c.height; l++) for (let i = 0; i < c.width; i++) if (verm(i, l) < 200) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, l); y1 = Math.max(y1, l); }
        for (let l = y0 + 1; l < y1; l++) for (let i = x0 + 1; i < x1; i++) if (verm(i, l) > 170) { gx0 = Math.min(gx0, i); gx1 = Math.max(gx1, i); gy0 = Math.min(gy0, l); gy1 = Math.max(gy1, l); }
        return { horizontal: (gx0 - x0) - (x1 - gx1), vertical: (gy0 - y0) - (y1 - gy1) };
      }, png.toString('base64'));
      pior = Math.max(pior, Math.abs(horizontal), Math.abs(vertical));
    }
    const ok = pior <= TOLERANCIA;
    if (!ok) falhas.push(`escala ${escala}, ${estado}: ${pior}px de diferença entre os lados`);
    console.log(`${String(escala).padEnd(4)} ${estado.padEnd(5)} pior diferença ${pior}px ${ok ? 'ok' : 'FORA'}`);
  }
  await p.close();
}
await b.close();
if (falhas.length) { console.error('FAIL: glifo do Checkbox fora do centro\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: glifo do Checkbox centralizado em todas as escalas e posições');
