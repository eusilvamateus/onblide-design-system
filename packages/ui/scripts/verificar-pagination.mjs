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
await p.focus('[aria-label="Próxima página"]');
await p.keyboard.press('Enter');
await p.keyboard.press('Enter');
esperar(await atual() === '4', `Enter duas vezes na seta deveria avançar duas páginas (atual: ${await atual()})`);
esperar(await p.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Próxima página', 'a seta deveria manter o foco depois de avançar');
esperar(avisos.join() === '2,3,4', `onChange deveria receber cada página escolhida (${avisos.join()})`);

const reticencias = () => p.locator('nav [aria-label^="Ir para uma página"]');
const painel = () => p.locator('[role="dialog"][aria-label="Ir para uma página"]');
const focado = () => p.evaluate(() => document.activeElement?.getAttribute('aria-label'));
await reticencias().last().click();
esperar(await painel().count() === 1, 'clicar na reticência deveria abrir o painel "Ir para uma página"');
esperar(await focado() === 'Página, de 1 a 20', `o campo do painel deveria receber o foco (${await focado()})`);
esperar(await painel().locator('input').getAttribute('placeholder') === '6–19', 'o campo deveria mostrar as páginas escondidas por aquela reticência');
const dicaCabe = () => painel().locator('input').evaluate((el) => {
  const medida = document.createElement('span');
  medida.style.font = getComputedStyle(el).font;
  medida.style.whiteSpace = 'pre';
  medida.textContent = el.placeholder;
  document.body.append(medida);
  const largura = medida.getBoundingClientRect().width;
  medida.remove();
  return largura <= el.getBoundingClientRect().width;
});
esperar(await dicaCabe(), 'o campo deveria mostrar as páginas escondidas inteiras, sem cortar');
await p.keyboard.type('12');
await p.keyboard.press('Enter');
esperar(await atual() === '12', `digitar 12 e Enter deveria ir para a 12 (atual: ${await atual()})`);
esperar(await painel().count() === 0, 'o painel deveria fechar depois de navegar');
await reticencias().first().click();
await p.keyboard.type('3');
await p.keyboard.press('Escape');
esperar(await atual() === '12' && await painel().count() === 0, `Esc deveria fechar sem navegar (atual: ${await atual()})`);
esperar((await focado())?.startsWith('Ir para uma página'), 'depois do Esc o foco deveria voltar à reticência');
await reticencias().first().click();
await p.keyboard.type('7');
await p.mouse.click(5, 300);
esperar(await atual() === '12' && await painel().count() === 0, `clicar fora deveria fechar sem navegar (atual: ${await atual()})`);
await reticencias().last().click();
await p.keyboard.type('99');
await painel().getByRole('button', { name: 'Ir' }).click();
esperar(await atual() === '20', `"Ir" com uma página além do total deveria levar à última (atual: ${await atual()})`);

await montar({ page: 3, total: 20 });
await p.click('[aria-label="Página 4"]');
esperar(await atual() === '3', 'com page, a Pagination não deveria mudar sozinha');
await montar({ page: 17, total: 20 });
const rotulosDasReticencias = await reticencias().evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));
esperar(rotulosDasReticencias.join() === 'Ir para uma página (escondidas: 2 a 15)', `perto do fim só deveria haver a reticência da esquerda (${rotulosDasReticencias.join()})`);

await montar({ page: 500, total: 1000 });
await reticencias().last().click();
esperar(await painel().locator('input').getAttribute('placeholder') === '502–999' && await dicaCabe(), 'com números grandes, o campo deveria crescer para mostrar a faixa inteira');
await p.keyboard.press('Escape');

await montar({ total: 20, showEdges: true });
await p.click('[aria-label="Última página"]');
esperar(await atual() === '20', `"Última página" deveria ir para a 20 (atual: ${await atual()})`);
await p.click('[aria-label="Primeira página"]');
esperar(await atual() === '1', `"Primeira página" deveria ir para a 1 (atual: ${await atual()})`);

const texto = () => p.evaluate(() => document.querySelector('nav').textContent);
await montar({ totalItems: 200, pageSizeOptions: [10, 20, 50], defaultPage: 3 });
esperar((await texto()).includes('21–30 de 200'), `resumo da página 3 com 10 por página (${await texto()})`);
await p.click('[aria-label="Itens por página"]');
await p.getByText('50', { exact: true }).last().dispatchEvent('mousedown');
esperar((await texto()).includes('1–50 de 200') && await atual() === '1', `com 50 por página, o item 21 fica na página 1 (${await texto()})`);
esperar(!(await p.$('[aria-label="Página 5"]')), 'com 50 por página, 200 itens dão 4 páginas');

await montar({ total: 20, variant: 'compact' });
await p.click('[aria-label="Próxima página"]');
esperar((await texto()).includes('Página 2 de 20'), `compact deveria anunciar a página nova (${await texto()})`);
const campo = p.locator('[aria-label="Página atual, de 1 a 20"]');
esperar(await campo.inputValue() === '2', 'compact mostra a página atual no campo');
await campo.click();
await p.waitForTimeout(50);
await p.keyboard.type('15');
await p.keyboard.press('Enter');
esperar(await campo.inputValue() === '15' && avisos.at(-1) === 15, `digitar 15 e Enter no campo da compacta deveria ir para a 15 (${await campo.inputValue()})`);
await campo.click();
await p.waitForTimeout(50);
await p.keyboard.type('9');
await p.keyboard.press('Escape');
esperar(await campo.inputValue() === '15' && avisos.at(-1) === 15, `Esc deveria voltar à página atual sem navegar (${await campo.inputValue()})`);
await campo.click();
await p.waitForTimeout(50);
await p.keyboard.type('4');
await p.mouse.click(5, 300);
esperar(await campo.inputValue() === '15' && avisos.at(-1) === 15, `clicar fora deveria voltar à página atual sem navegar (${await campo.inputValue()})`);

for (const [size, lado] of [['sm', 32], ['md', 40], ['lg', 48]]) {
  await montar({ total: 20, size, showEdges: true, totalItems: 200, pageSizeOptions: [10, 20] });
  const alturas = await p.evaluate(() => ({
    botoes: [...document.querySelectorAll('nav button')].map((el) => el.getBoundingClientRect().height),
    campos: [...document.querySelectorAll('nav input')].map((el) => el.closest('div[style*="1.5px"]').getBoundingClientRect().height),
  }));
  const todas = [...alturas.botoes, ...alturas.campos];
  esperar(todas.every((h) => Math.abs(h - lado) <= 0.5), `size ${size}: botões e seletor deveriam ter ${lado}px (${todas.join(', ')})`);
  await montar({ total: 20, size, variant: 'compact' });
  const alturasDaCompacta = await p.evaluate(() => [...document.querySelectorAll('nav button'), ...[...document.querySelectorAll('nav input')].map((el) => el.closest('div[style*="1.5px"]'))]
    .map((el) => el.getBoundingClientRect().height));
  esperar(alturasDaCompacta.every((h) => Math.abs(h - lado) <= 0.5), `size ${size}: setas e campo da compacta deveriam ter ${lado}px (${alturasDaCompacta.join(', ')})`);
}

await b.close();
if (falhas.length) { console.error('FAIL: Pagination\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Pagination (modo não controlado, seta mantém o foco, onChange, reticências abrem o campo com a faixa inteira, Enter, Esc, clique fora e "Ir", controlado, primeira e última, itens por página, compacta editável, alturas iguais em cada tamanho)');
