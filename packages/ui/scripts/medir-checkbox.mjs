// Mede a centralização do glifo do Checkbox num Chromium de testes (Playwright do docs-site),
// em telas 1x e 2x e com a caixa em posições fracionadas da página. Falha se o glifo sobrar mais de um lado
// do que do outro (tolerância de meio pixel CSS). Uso: npm run build && node scripts/medir-checkbox.mjs
import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const falhas = [];
for (const dpr of [1, 2]) {
  const p = await b.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: dpr });
  await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
  await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
  await carregarPacoteNoNavegador(p);
  for (const deslocamento of [0, 0.17, 0.5, 0.83]) {
    for (const estado of ['check', 'minus']) {
      await p.evaluate(({ deslocamento, estado }) => {
        const r = document.getElementById('r');
        r.style.cssText = `position:absolute;left:${20 + deslocamento}px;top:${20 + deslocamento}px`;
        window.__raiz ??= ReactDOM.createRoot(r);
        ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Checkbox, { checked: true, indeterminate: estado === 'minus', label: 'Rótulo' })));
      }, { deslocamento, estado });
      // Recorte fixo em coordenadas inteiras em volta da caixa (o recorte do próprio elemento seria arredondado).
      const png = await p.screenshot({ clip: { x: 10, y: 10, width: 40, height: 40 } });
      const m = await p.evaluate(async (s) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + s; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data;
        // Limites da caixa pelos pixels azuis; o glifo é o claro dentro deles. Compara o centro de massa do glifo
        // com o centro da caixa.
        let gx = 0, gy = 0, gp = 0;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) { const k = (y * c.width + i) * 4; if (d[k + 2] > 150 && d[k] < 120) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
        for (let y = y0; y <= y1; y++) for (let i = x0; i <= x1; i++) {
          const k = (y * c.width + i) * 4; const R = d[k];
          if (R > 120 && d[k + 2] > 200) { const w = (R - 120) / 135; gx += i * w; gy += y * w; gp += w; }
        }
        return { dx: gx / gp - (x0 + x1) / 2, dy: gy / gp - (y0 + y1) / 2, escala: c.width / 40 };
      }, png.toString('base64'));
      const dx = m.dx / m.escala, dy = m.dy / m.escala;
      const ok = Math.abs(dx) <= 0.5 && Math.abs(dy) <= 0.5;
      if (!ok) falhas.push(`${dpr}x deslocamento ${deslocamento} ${estado}: dx ${dx.toFixed(2)} dy ${dy.toFixed(2)}`);
      console.log(`${dpr}x +${deslocamento}px ${estado.padEnd(5)} dx ${dx.toFixed(2)}px dy ${dy.toFixed(2)}px ${ok ? 'ok' : 'FORA'}`);
    }
  }
  await p.close();
}
await b.close();
if (falhas.length) { console.error('FAIL: glifo do Checkbox fora do centro\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: glifo do Checkbox centralizado (1x e 2x, posições fracionadas)');
