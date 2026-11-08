import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body style="margin:0"><div id="r" style="padding:20px"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

const avisos = [];
await p.exposeFunction('avisar', (n) => avisos.push(n));
const montar = (props) => p.evaluate((props) => {
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Pagination, { ...props, onChange: (n) => window.avisar(n) })));
}, props);
const atual = () => p.evaluate(() => document.querySelector('[aria-current="page"]')?.textContent);

await montar({ total: 20 });
await p.click('[aria-label="Página 2"]');
esperar(await atual() === '2', `sem page, clicar numa página deveria selecioná-la (atual: ${await atual()})`);
await p.click('[aria-label="Avançar 5 páginas"]');
esperar(await atual() === '7', `a reticência da direita deveria avançar 5 páginas (atual: ${await atual()})`);
await p.click('[aria-label="Voltar 5 páginas"]');
esperar(await atual() === '2', `a reticência da esquerda deveria voltar 5 páginas (atual: ${await atual()})`);
await p.focus('[aria-label="Próxima página"]');
await p.keyboard.press('Enter');
await p.keyboard.press('Enter');
esperar(await atual() === '4', `Enter duas vezes na seta deveria avançar duas páginas (atual: ${await atual()})`);
esperar(await p.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Próxima página', 'a seta deveria manter o foco depois de avançar');
esperar(avisos.join() === '2,7,2,3,4', `onChange deveria receber cada página escolhida (${avisos.join()})`);

await montar({ page: 3, total: 20 });
await p.click('[aria-label="Página 4"]');
esperar(await atual() === '3', 'com page, a Pagination não deveria mudar sozinha');
await montar({ page: 17, total: 20 });
const saltoFinal = await p.$('[aria-label="Avançar 5 páginas"]');
esperar(!saltoFinal, 'perto do fim não deveria haver reticência escondendo uma página só');

await montar({ total: 20, showEdges: true });
await p.click('[aria-label="Última página"]');
esperar(await atual() === '20', `"Última página" deveria ir para a 20 (atual: ${await atual()})`);
await p.click('[aria-label="Primeira página"]');
esperar(await atual() === '1', `"Primeira página" deveria ir para a 1 (atual: ${await atual()})`);

await montar({ total: 20, showJumper: true });
await p.fill('[aria-label="Ir para a página"]', '12');
await p.keyboard.press('Enter');
esperar(await atual() === '12', `digitar 12 e Enter no "Ir para" deveria ir para a 12 (atual: ${await atual()})`);
await p.fill('[aria-label="Ir para a página"]', '99');
await p.keyboard.press('Enter');
esperar(await atual() === '20', `uma página além do total deveria levar à última (atual: ${await atual()})`);

const texto = () => p.evaluate(() => document.querySelector('nav').textContent);
await montar({ totalItems: 200, pageSizeOptions: [10, 20, 50], defaultPage: 3 });
esperar((await texto()).includes('21–30 de 200'), `resumo da página 3 com 10 por página (${await texto()})`);
await p.click('[aria-label="Itens por página"]');
await p.locator('text=50 por página').last().dispatchEvent('mousedown');
esperar((await texto()).includes('1–50 de 200') && await atual() === '1', `com 50 por página, o item 21 fica na página 1 (${await texto()})`);
esperar(!(await p.$('[aria-label="Página 5"]')), 'com 50 por página, 200 itens dão 4 páginas');

await montar({ total: 20, variant: 'compact' });
await p.click('[aria-label="Próxima página"]');
esperar((await texto()).includes('Página 2 de 20'), `compact deveria mostrar a página nova (${await texto()})`);

for (const [size, lado] of [['sm', 32], ['md', 40], ['lg', 48]]) {
  await montar({ total: 20, size, showEdges: true, showJumper: true, totalItems: 200, pageSizeOptions: [10, 20] });
  const alturas = await p.evaluate(() => ({
    botoes: [...document.querySelectorAll('nav button')].map((el) => el.getBoundingClientRect().height),
    campos: [...document.querySelectorAll('nav input')].map((el) => el.closest('div[style*="1.5px"]').getBoundingClientRect().height),
  }));
  const todas = [...alturas.botoes, ...alturas.campos];
  esperar(todas.every((h) => Math.abs(h - lado) <= 0.5), `size ${size}: botões, seletor e campo deveriam ter ${lado}px (${todas.join(', ')})`);
}

await b.close();
if (falhas.length) { console.error('FAIL: Pagination\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Pagination (modo não controlado, reticências saltam 5 páginas, seta mantém o foco, onChange, controlado, primeira e última, "Ir para", itens por página, compacta, alturas iguais em cada tamanho)');
