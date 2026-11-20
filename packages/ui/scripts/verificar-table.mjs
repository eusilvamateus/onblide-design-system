import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };

const avisos = [];
await p.exposeFunction('avisar', (tipo, valor) => avisos.push(`${tipo}:${JSON.stringify(valor)}`));
const montar = (props) => p.evaluate((props) => {
  const comAvisos = { ...props };
  for (const evento of props.__eventos ?? []) {
    comAvisos[evento] = evento === 'onSelect' ? (_, keys) => window.avisar(evento, keys)
      : evento === 'onRowClick' ? (row) => window.avisar(evento, row.nome)
      : (valor) => window.avisar(evento, valor);
  }
  if (props.__detalhes) comAvisos.renderExpanded = (r) => `Detalhe de ${r.nome}`;
  delete comAvisos.__eventos;
  delete comAvisos.__detalhes;
  window.__raiz ??= ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window.Table, comAvisos)));
}, props);
const ordem = () => p.evaluate(() => [...document.querySelectorAll('tbody tr')].filter((tr) => tr.cells.length > 1 || !tr.cells[0]?.colSpan || tr.cells[0].colSpan === 1).map((tr) => tr.cells[tr.cells.length - 1].textContent));
const clicarCabecalho = () => p.click('th button');

const colunas = [{ key: 'nome', label: 'Nome', sortable: true }];
const linhas = [{ nome: 'Carla' }, { nome: 'Ana' }, { nome: 'Bruno' }];

await montar({ columns: colunas, rows: linhas });
esperar((await ordem()).join() === 'Carla,Ana,Bruno', `ordem inicial deveria ser a original, veio ${(await ordem()).join()}`);
await clicarCabecalho();
esperar((await ordem()).join() === 'Ana,Bruno,Carla', `1º clique deveria ordenar crescente, veio ${(await ordem()).join()}`);
esperar(await p.getAttribute('th', 'aria-sort') === 'ascending', 'o cabeçalho deveria anunciar a ordem crescente');
await p.focus('th button');
await p.keyboard.press('Enter');
esperar((await ordem()).join() === 'Carla,Bruno,Ana', `Enter no cabeçalho deveria ordenar decrescente, veio ${(await ordem()).join()}`);
await p.keyboard.press('Space');
esperar((await ordem()).join() === 'Carla,Ana,Bruno', `Espaço deveria voltar à ordem original, veio ${(await ordem()).join()}`);
esperar(await p.getAttribute('th', 'aria-sort') === null, 'sem ordenação, sem aria-sort');

avisos.length = 0;
await montar({ columns: colunas, rows: linhas, sort: { key: 'nome', dir: 'asc' }, __eventos: ['onSort'] });
await clicarCabecalho();
esperar(avisos.join() === 'onSort:"nome"', `com onSort deveria avisar a coluna clicada, veio ${avisos.join()}`);
esperar((await ordem()).join() === 'Carla,Ana,Bruno', `com onSort a Table não deveria reordenar sozinha, veio ${(await ordem()).join()}`);

const pessoas = [{ id: 1, nome: 'Carla' }, { id: 2, nome: 'Ana' }, { id: 3, nome: 'Bruno' }];
avisos.length = 0;
await montar({ columns: colunas, rows: pessoas, selectable: true, __eventos: ['onSelect'] });
await p.click('[aria-label="Selecionar linha 2"]');
await montar({ columns: colunas, rows: [pessoas[1], pessoas[2]], selectable: true, __eventos: ['onSelect'] });
const marcada = () => p.evaluate(() => [...document.querySelectorAll('tbody tr')].filter((tr) => tr.querySelector('input[type="checkbox"]:checked')).map((tr) => tr.cells[1].textContent).join());
esperar(await marcada() === 'Ana', `a seleção deveria seguir a Ana quando as linhas mudam (marcada: ${await marcada()})`);
await p.click('[aria-label="Selecionar todas as linhas"]');
esperar(avisos.at(-1) === 'onSelect:[2,3]', `selecionar todas soma as linhas visíveis (${avisos.at(-1)})`);
await montar({ columns: colunas, rows: pessoas, selectable: true, selectedKeys: [] });
esperar(await marcada() === '', 'selectedKeys vazio limpa a seleção por fora');

avisos.length = 0;
await montar({ columns: colunas, rows: pessoas, selectable: true, __eventos: ['onRowClick'] });
await p.click('tbody tr:nth-child(2) td:last-child');
await p.click('[aria-label="Selecionar linha 1"]');
await p.focus('tbody tr:nth-child(3)');
await p.keyboard.press('Enter');
esperar(avisos.join() === 'onRowClick:"Ana",onRowClick:"Bruno"', `clique e Enter abrem a linha; o checkbox não (${avisos.join()})`);

avisos.length = 0;
await montar({ columns: colunas, rows: pessoas, __detalhes: true, __eventos: ['onExpandedChange'] });
const alturaDoDetalhe = () => p.evaluate(() => document.querySelector('[id$="-detalhe-0"]').getBoundingClientRect().height);
esperar(await alturaDoDetalhe() === 0, 'o detalhe começa fechado');
await p.click('[aria-label="Detalhes da linha 1"]');
await p.waitForTimeout(400);
esperar(await alturaDoDetalhe() > 20, `o detalhe deveria abrir (${await alturaDoDetalhe()}px)`);
esperar(await p.getAttribute('[aria-label="Detalhes da linha 1"]', 'aria-expanded') === 'true', 'o botão anuncia a linha aberta');
esperar(avisos.join() === 'onExpandedChange:[1]', `onExpandedChange recebe as chaves abertas (${avisos.join()})`);

const muitas = Array.from({ length: 30 }, (_, i) => ({ id: i, nome: `Pessoa ${i}` }));
await montar({ columns: colunas, rows: muitas, maxHeight: 200 });
const fixo = await p.evaluate(() => {
  const th = document.querySelector('th');
  const vp = th.closest('table').parentElement.closest('[class*="ob-sa-viewport"]') ?? th.closest('table').parentElement;
  vp.scrollTop = 300;
  return { rolou: vp.scrollTop > 0, distancia: Math.round(th.getBoundingClientRect().top - vp.getBoundingClientRect().top), altura: Math.round(vp.getBoundingClientRect().height) };
});
esperar(fixo.rolou && fixo.distancia === 0 && fixo.altura <= 200, `com maxHeight o corpo rola e o cabeçalho fica no topo (${JSON.stringify(fixo)})`);

const alturas = [];
for (const size of ['sm', 'md', 'lg']) {
  await montar({ columns: colunas, rows: pessoas, size, selectable: true });
  alturas.push(await p.evaluate(() => Math.round(document.querySelector('tbody tr').getBoundingClientRect().height)));
}
esperar(alturas[0] < alturas[1] && alturas[1] < alturas[2], `as linhas crescem com o tamanho (${alturas.join(', ')})`);

await p.addStyleTag({ content: 'table{display:block;margin-bottom:16px;border:3px solid red}table thead{background:red}table thead tr{border-bottom:2px solid red}table tr{border-top:1px solid red;background:red}table th,table td{border:1px solid red;background:red}' });
await montar({ columns: colunas, rows: [{ nome: 'Carla' }, { nome: 'Ana' }, { nome: 'Bruno' }, { nome: 'Diego' }] });
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
console.log('OK: Table (ordenação por clique e teclado com aria-sort, onSort, seleção que segue a linha, linha clicável, linha expansível, cabeçalho fixo, tamanhos, divisórias mesmo com CSS global)');
