// Verifica o clique de ordenação do Table num Chromium de testes (Playwright do docs-site):
// sem onSort, clicar no cabeçalho reordena de verdade e cicla crescente → decrescente → sem ordenação; com
// onSort, a Table não reordena sozinha, só avisa a coluna clicada. Uso: npm run build && node scripts/verificar-table.mjs
import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
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

await p.addStyleTag({ content: 'table{display:block;margin-bottom:16px;border:3px solid red}table thead{background:red}table thead tr{border-bottom:2px solid red}table tr{border-top:1px solid red;background:red}table th,table td{border:1px solid red;background:red}' });
await p.evaluate(({ colunas }) => {
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Table, {
    columns: colunas, rows: [{ nome: 'Carla' }, { nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Diego' }],
  })));
}, { colunas });
const bordas = () => p.evaluate(() => {
  const medir = (c) => [c.borderTopWidth, c.borderLeftWidth, c.borderRightWidth, c.borderBottomWidth].join('/');
  return {
    tabela: getComputedStyle(document.querySelector('table')).borderTopWidth,
    linhas: [...document.querySelectorAll('tr')].map((tr) => `${getComputedStyle(tr).borderTopWidth}/${getComputedStyle(tr).borderBottomWidth}`),
    cabecalho: medir(getComputedStyle(document.querySelector('th'))),
    celulas: [...document.querySelectorAll('tbody tr')].map((tr) => medir(getComputedStyle(tr.cells[0]))),
    fundosVazados: [...document.querySelectorAll('thead, tr, td')].filter((el) => getComputedStyle(el).backgroundColor === 'rgb(255, 0, 0)').length,
  };
});
for (const momento of ['na ordem original', 'em ordem crescente', 'em ordem decrescente']) {
  if (momento !== 'na ordem original') await clicarCabecalho();
  const m = await bordas();
  const esperado = m.celulas.map((_, i, t) => (i === t.length - 1 ? '0px/0px/0px/0px' : '0px/0px/0px/1px'));
  esperar(m.tabela === '0px', `${momento}: a borda global da <table> não deveria vazar (${m.tabela})`);
  esperar(m.linhas.every((l) => l === '0px/0px'), `${momento}: as linhas não deveriam ter borda própria (${m.linhas.join(', ')})`);
  esperar(m.cabecalho === '0px/0px/0px/1px', `${momento}: o cabeçalho deveria ter só a divisória de 1px embaixo (${m.cabecalho})`);
  esperar(m.celulas.join() === esperado.join(), `${momento}: só a última linha exibida fica sem divisória (${m.celulas.join(', ')})`);
  esperar(m.fundosVazados === 0, `${momento}: o fundo global de tabela não deveria vazar (${m.fundosVazados} elementos)`);
}

await b.close();
if (falhas.length) { console.error('FAIL: Table\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: ordenação do Table (clique reordena e cicla asc/desc/sem ordenação; com onSort só avisa) e divisórias certas em qualquer ordem, mesmo com CSS global de tabela');
