// Verifica o site construído (build/) num Chromium de testes: todas as páginas carregam sem erro, nenhuma
// sobreposição abre sozinha, as abas da demo escondem de verdade o painel inativo e o conteúdo das demos e dos
// exemplos tem largura útil e não está vazio, o useBreakpoint acompanha a janela e o CSS do site só usa @media
// mobile-first com valores da escala. Uso: npm run build && npm run verificar
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const raiz = path.resolve('build');
if (!fs.existsSync(raiz)) { console.error('build/ não existe: rode npm run build antes'); process.exit(1); }
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.png': 'image/png' };
const servidor = http.createServer((q, r) => {
  let f = path.join(raiz, decodeURIComponent(q.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  fs.readFile(f, (e, d) => { if (e) { r.statusCode = 404; r.end(); } else { r.setHeader('content-type', tipos[path.extname(f)] || 'application/octet-stream'); r.end(d); } });
}).listen(0);
// VERIFICAR_URL permite rodar contra o site publicado (ex.: https://onblide-design-system.vercel.app).
const base = process.env.VERIFICAR_URL || `http://127.0.0.1:${servidor.address().port}`;

const rotas = [];
const andar = (d, r) => {
  for (const f of fs.readdirSync(d)) {
    const a = path.join(d, f);
    if (fs.statSync(a).isDirectory()) andar(a, `${r}/${f}`);
    else if (/\.mdx?$/.test(f)) rotas.push((`${r}/${f.replace(/\.mdx?$/, '')}`.replace(/\/index$/, '')) || '/');
  }
};
andar(path.resolve('docs'), '');

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const falhas = [];

await p.goto(base + '/componentes/Button');
await p.waitForSelector('.ob-doc__sumario .table-of-contents a');
if (!(await p.locator('.ob-doc__sumario').isVisible())) falhas.push('sumário: não aparece na janela larga');
await p.fill('.navbar__search-input', 'botão');
await p.waitForSelector('.navbar__search .aa-suggestion, [class*="dropdownMenu"] a', { timeout: 8000 }).catch(() => falhas.push('busca: nenhum resultado para "botão"'));
await p.setViewportSize({ width: 800, height: 900 });
await p.reload();
await p.waitForSelector('.ob-doc__sumario-compacto button');
if (await p.locator('.ob-doc__sumario').isVisible()) falhas.push('sumário: a coluna lateral deveria sumir na janela estreita');
await p.setViewportSize({ width: 1280, height: 900 });
for (const rota of rotas) {
  const erros = [];
  const aoErro = (e) => erros.push(e.message.slice(0, 100));
  p.on('pageerror', aoErro);
  const res = await p.goto(base + rota);
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const problemas = [];
    const visivel = (el) => !!el && el.getClientRects().length > 0;
    const temConteudo = (el) => el.innerText.trim() !== '' || [...el.querySelectorAll('*')].some((k) => {
      const b = k.getBoundingClientRect();
      const cs = getComputedStyle(k);
      return b.width > 4 && b.height > 4 && (k.tagName !== 'DIV' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderStyle !== 'none' || cs.backgroundImage !== 'none');
    });
    // Nenhuma sobreposição cobrindo a tela ao carregar.
    const area = innerWidth * innerHeight;
    for (const el of document.body.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
      // Sobreposição fechada fica transparente, sem receber clique, ou fora da tela.
      if (Number(cs.opacity) === 0 || cs.pointerEvents === 'none') continue;
      const b = el.getBoundingClientRect();
      const visivelNaTela = Math.max(0, Math.min(b.right, innerWidth) - Math.max(b.left, 0)) * Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0));
      if (visivelNaTela > area * 0.4 && !el.closest('.ob-topbar, .ob-shell__nav')) problemas.push('sobreposição aberta ao carregar');
    }
    for (const t of document.querySelectorAll('.ob-wrap table')) {
      if (!t.closest('.ob-playground, .ob-demo') && t.innerText.includes('Nenhum resultado encontrado.')) problemas.push('tabela de documentação vazia');
    }
    for (const e of document.querySelectorAll('.ob-playground__error'))if (e.innerText.trim()) problemas.push('erro no exemplo: ' + e.innerText.trim().slice(0, 60));
    const demo = document.querySelector('.ob-demo');
    if (demo) {
      const palco = demo.querySelector('.ob-demo__palco') || demo.querySelector('.ob-demo__resultado > div');
      if (!demo.querySelector('.ob-demo__palco')) problemas.push('demo sem palco de largura útil');
      if (palco.getBoundingClientRect().width < 300) problemas.push(`palco estreito (${Math.round(palco.getBoundingClientRect().width)}px)`);
      if (!temConteudo(palco)) problemas.push('demo vazia');
      // Blocos que ocupam a largura não podem estar espremidos.
      const raiz = palco.querySelector('*');
      if (raiz && getComputedStyle(raiz).display === 'block' && raiz.getBoundingClientRect().width < 200) problemas.push('componente da demo espremido');
    }
    for (const pv of document.querySelectorAll('.ob-playground .ob-playground__preview')) {
      if (pv.closest('.ob-demo') || !visivel(pv)) continue;
      if (!temConteudo(pv)) problemas.push('exemplo vazio');
    }
    return problemas;
  });
  // Abas da demo: o painel inativo precisa sumir de verdade.
  if (await p.locator('.ob-demo').count()) {
    const demo = p.locator('.ob-demo');
    try {
      await demo.locator('.ob-playground__tabs button', { hasText: 'Código' }).click({ timeout: 3000 });
      if (await demo.locator('.ob-demo__resultado').isVisible()) r.push('aba Código ainda mostra o resultado');
      if (!(await demo.locator('.ob-demo__codigo').isVisible())) r.push('aba Código não mostra o código');
      if (!(await demo.getByRole('button', { name: 'Restaurar' }).isVisible())) r.push('demo sem botão Restaurar');
      await demo.locator('.ob-playground__tabs button', { hasText: 'Resultado' }).click({ timeout: 3000 });
      if (await demo.locator('.ob-demo__codigo').isVisible()) r.push('aba Resultado ainda mostra o código');
    } catch {
      r.push('não foi possível clicar nas abas da demo (algo cobre a página)');
    }
  }
  p.off('pageerror', aoErro);
  if (res.status() !== 200) r.push(`status ${res.status()}`);
  if (erros.length) r.push(...erros.map((e) => 'erro de página: ' + e));
  if (r.length) falhas.push(`${rota}: ${[...new Set(r)].join('; ')}`);
}
const faixas = [[500, 'base'], [800, 'sm'], [1100, 'md'], [1300, 'lg'], [1500, 'xl']];
await p.goto(base + '/fundacoes/breakpoints');
for (const [largura, esperada] of faixas) {
  await p.setViewportSize({ width: largura, height: 900 });
  await p.waitForTimeout(300);
  const faixa = await p.locator('[data-faixa-atual]').getAttribute('data-faixa-atual');
  if (faixa !== esperada) falhas.push(`/fundacoes/breakpoints: em ${largura}px useBreakpoint deu ${faixa}, esperado ${esperada}`);
  const rotuloVisivel = await p.locator('.ob-topbar__label').isVisible();
  if (rotuloVisivel !== largura >= 768) falhas.push(`barra superior em ${largura}px: rótulo ${rotuloVisivel ? 'visível' : 'escondido'}`);
}
const escala = new Set([768, 1024, 1280, 1440]);
for (const nome of fs.readdirSync(path.resolve('src/css'))) {
  const texto = fs.readFileSync(path.resolve('src/css', nome), 'utf8');
  for (const m of texto.matchAll(/@media[^{;<]*/g)) {
    if (/max-width|width\s*[<>]/.test(m[0])) falhas.push(`src/css/${nome}: não é mobile-first: ${m[0].trim()}`);
    for (const v of m[0].matchAll(/min-width\s*:\s*(\d+)px/g)) if (!escala.has(Number(v[1]))) falhas.push(`src/css/${nome}: valor fora da escala: ${m[0].trim()}`);
  }
}
await b.close();
servidor.close();
console.log(`${rotas.length} páginas verificadas, ${falhas.length} com problema`);
for (const f of falhas) console.log(' - ' + f);
process.exit(falhas.length ? 1 : 0);
