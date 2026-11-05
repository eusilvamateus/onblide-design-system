// Verifica o clique de ordenação do Table num Chromium de testes (Playwright do docs-site):
// sem onSort, clicar no cabeçalho reordena de verdade e cicla crescente → decrescente → sem ordenação; com
// onSort, a Table não reordena sozinha, só avisa a coluna clicada. Uso: npm run build && node scripts/verificar-table.mjs
import { carregarPacoteNoNavegador, obterChromium } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
await carregarPacoteNoNavegador(p);

const colunas = [{ key: 'nome', label: 'Nome', sortable: true }];
const linhas = [{ nome: 'Carla' }, { nome: 'Ana' }, { nome: 'Bruno' }];

const ordem = async () => p.evaluate(() => [...document.querySelectorAll('tbody tr td')].map((td) => td.textContent));
const clicarCabecalho = () => p.evaluate(() => document.querySelector('th').click());

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

// Sem onSort: clique reordena de fato e cicla crescente → decrescente → sem ordenação (volta à ordem original).
await p.evaluate(({ colunas, linhas }) => {
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Table, { columns: colunas, rows: linhas })));
}, { colunas, linhas });

esperar((await ordem()).join() === 'Carla,Ana,Bruno', `ordem inicial deveria ser a original, veio ${(await ordem()).join()}`);
await clicarCabecalho();
esperar((await ordem()).join() === 'Ana,Bruno,Carla', `1º clique deveria ordenar crescente, veio ${(await ordem()).join()}`);
await clicarCabecalho();
esperar((await ordem()).join() === 'Carla,Bruno,Ana', `2º clique deveria ordenar decrescente, veio ${(await ordem()).join()}`);
await clicarCabecalho();
esperar((await ordem()).join() === 'Carla,Ana,Bruno', `3º clique deveria voltar à ordem original, veio ${(await ordem()).join()}`);

// Com onSort: quem usa decide — a Table não reordena sozinha, só chama onSort com a chave clicada.
const chamadas = [];
await p.exposeFunction('avisarClique', (key) => chamadas.push(key));
await p.evaluate(({ colunas, linhas }) => {
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Table, {
    columns: colunas, rows: linhas, sort: { key: 'nome', dir: 'asc' }, onSort: (key) => window.avisarClique(key),
  })));
}, { colunas, linhas });
await clicarCabecalho();
esperar(chamadas.join() === 'nome', `com onSort deveria avisar a coluna clicada, veio ${chamadas.join()}`);
esperar((await ordem()).join() === 'Carla,Ana,Bruno', `com onSort a Table não deveria reordenar sozinha, veio ${(await ordem()).join()}`);

await b.close();
if (falhas.length) { console.error('FAIL: ordenação do Table\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: ordenação do Table (clique reordena e cicla asc/desc/sem ordenação; com onSort só avisa)');
