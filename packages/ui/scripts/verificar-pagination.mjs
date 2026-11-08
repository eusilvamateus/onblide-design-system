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

await b.close();
if (falhas.length) { console.error('FAIL: Pagination\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Pagination (modo não controlado, reticências saltam 5 páginas, seta mantém o foco, onChange, modo controlado)');
