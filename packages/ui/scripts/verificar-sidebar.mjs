import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
await p.setContent('<html><body style="margin:0"><div id="r" style="height:700px;display:flex"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];
const esperar = (cond, msg) => { if (!cond) falhas.push(msg); };
const avisos = [];
await p.exposeFunction('avisar', (tipo, valor) => avisos.push(`${tipo}:${valor}`));

const montar = (componente, props) => p.evaluate(({ componente, props }) => {
  const comAvisos = { ...props };
  for (const evento of props.__eventos ?? []) comAvisos[evento] = (v) => window.avisar(evento, v);
  delete comAvisos.__eventos;
  window.__raiz ??= ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window[componente], comAvisos)));
}, { componente, props });

const clicarCom = (seletor, teclas) => p.evaluate(({ seletor, teclas }) => {
  let bloqueado = null;
  const registrar = (e) => { bloqueado = e.defaultPrevented; e.preventDefault(); };
  window.addEventListener('click', registrar);
  document.querySelector(seletor).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...teclas }));
  window.removeEventListener('click', registrar);
  return bloqueado;
}, { seletor, teclas });

const groups = [
  { items: [
    { id: 'inicio', label: 'Início', icon: 'house', href: '/inicio' },
    { id: 'projetos', label: 'Projetos', icon: 'kanban', href: '/projetos', badge: 4 },
  ] },
  { label: 'Análise', items: [
    { id: 'relatorios', label: 'Relatórios', icon: 'chart-line', children: [{ id: 'vendas', label: 'Vendas', href: '/vendas' }] },
  ] },
];

await montar('Sidebar', { groups, active: 'inicio', collapsible: true, __eventos: ['onNav', 'onCollapsedChange'] });
esperar(await clicarCom('a[href="/projetos"]', {}) === true, 'o clique simples num link com onNav não navega pelo navegador');
esperar(avisos.at(-1) === 'onNav:projetos', `o clique simples chama onNav (${avisos.at(-1)})`);
avisos.length = 0;
esperar(await clicarCom('a[href="/projetos"]', { ctrlKey: true }) === false && avisos.length === 0, 'Ctrl+clique segue para o navegador, sem onNav');
esperar(await clicarCom('a[href="/projetos"]', { metaKey: true }) === false && avisos.length === 0, 'Cmd+clique segue para o navegador, sem onNav');

const largura = () => p.evaluate(() => Math.round(document.getElementById('r').firstElementChild.getBoundingClientRect().width));
esperar(await largura() === 240, `aberta tem 240px (${await largura()})`);

await p.evaluate(() => { window.__raiz.unmount(); window.__raiz = null; });
await montar('Sidebar', { groups, active: 'vendas', header: 'Marca', footer: 'Conta' });
const medidas = await p.evaluate(() => {
  const caixa = (el) => el.getBoundingClientRect();
  const texto = (el) => { const n = [...el.querySelectorAll('*'), el].flatMap((e) => [...e.childNodes]).find((c) => c.nodeType === 3 && c.textContent.trim()); const r = document.createRange(); r.selectNodeContents(n); return r.getBoundingClientRect(); };
  const raiz = document.getElementById('r').firstElementChild;
  const inicio = document.querySelector('a[href="/inicio"]');
  const projetos = document.querySelector('a[href="/projetos"]');
  const pai = document.querySelector('[aria-expanded]');
  const filho = document.querySelector('a[href="/vendas"]');
  const titulo = document.querySelector('nav p');
  const rodape = [...raiz.children].at(-1);
  return {
    marca: Math.round(texto(raiz.firstElementChild).left),
    titulo: Math.round(texto(titulo).left),
    icone: Math.round(caixa(inicio.querySelector('i')).left),
    textoDoPai: Math.round(texto(pai).left),
    textoDoFilho: Math.round(texto(filho).left),
    alturaDoItem: Math.round(caixa(inicio).height),
    alturaDoSubitem: Math.round(caixa(filho).height),
    entreItens: Math.round(caixa(projetos).top - caixa(inicio).bottom),
    entreGrupos: Math.round(caixa(titulo).top - caixa(projetos).bottom),
    tituloAoItem: Math.round(caixa(pai).top - caixa(titulo).bottom),
    abaixoDoCabecalho: Math.round(caixa(document.querySelector('nav')).top - caixa(raiz.firstElementChild).bottom),
    acimaDoRodape: Math.round(caixa(rodape).top - caixa(rodape.previousElementSibling).bottom),
  };
});
esperar(medidas.marca === medidas.icone && medidas.titulo === medidas.icone, `marca, título de grupo e ícones começam na mesma linha vertical (${JSON.stringify(medidas)})`);
esperar(medidas.textoDoFilho === medidas.textoDoPai, `o texto do subitem se alinha com o texto do item pai (${medidas.textoDoFilho} × ${medidas.textoDoPai})`);
esperar(medidas.alturaDoItem === 40 && medidas.alturaDoSubitem === 32, `itens de 40px e subitens de 32px (${medidas.alturaDoItem}, ${medidas.alturaDoSubitem})`);
esperar(medidas.entreItens === 4 && medidas.entreGrupos === 16 && medidas.tituloAoItem === 4 && medidas.abaixoDoCabecalho === 16, `ritmo de 4px entre itens, 16px entre grupos, 4px do título ao item e 16px abaixo do cabeçalho (${JSON.stringify(medidas)})`);
esperar(medidas.acimaDoRodape === 12, `12px acima da linha do rodapé (${medidas.acimaDoRodape})`);
await p.evaluate(() => { window.__raiz.unmount(); window.__raiz = null; });
await montar('Sidebar', { groups, active: 'inicio', collapsible: true, __eventos: ['onNav', 'onCollapsedChange'] });
const opacidade = (seletor) => p.evaluate((s) => getComputedStyle(document.querySelector(s)).opacity, seletor);
const borda = await p.evaluate(() => {
  const raiz = document.getElementById('r').firstElementChild.getBoundingClientRect();
  const botao = document.querySelector('[aria-label="Recolher barra lateral"]').getBoundingClientRect();
  const linha = document.querySelector('.ob-sidebar-borda').parentElement.getBoundingClientRect();
  return { dx: Math.abs(botao.left + botao.width / 2 - raiz.right), dy: Math.abs(botao.top + botao.height / 2 - (linha.top + linha.height / 2)) };
});
esperar(borda.dx <= 1.5 && borda.dy <= 1, `o botão de recolher fica centrado na borda direita, na altura do cabeçalho (${JSON.stringify(borda)})`);
await p.mouse.move(1100, 700);
await p.waitForTimeout(300);
esperar(await opacidade('.ob-sidebar-borda') === '0', 'em repouso, o botão da borda fica oculto');
await p.hover('a[href="/inicio"]');
await p.waitForTimeout(300);
esperar(await opacidade('.ob-sidebar-borda') === '1', 'com o mouse sobre a barra, o botão da borda aparece');
await p.click('[aria-label="Recolher barra lateral"]');
esperar(await largura() === 72, `o botão recolhe para 72px (${await largura()})`);
esperar(avisos.includes('onCollapsedChange:true'), `onCollapsedChange recebe true (${avisos.join()})`);

await p.hover('a[href="/inicio"]');
await p.waitForTimeout(700);
esperar(await p.evaluate(() => [...document.querySelectorAll('[role="tooltip"]')].some((t) => t.textContent.includes('Início'))), 'recolhida, o item mostra o rótulo no Tooltip');

avisos.length = 0;
await p.click('[aria-label="Relatórios"]');
await p.waitForTimeout(200);
const menu = await p.evaluate(() => [...document.querySelectorAll('[role="menu"]')].map((m) => m.textContent).join('|'));
esperar(menu.includes('Vendas'), `recolhida, o grupo abre os subitens num menu (${menu})`);
await p.click('[role="menuitem"]:has-text("Vendas")');
esperar(avisos.includes('onNav:vendas'), `escolher no menu chama onNav (${avisos.join()})`);

await p.keyboard.press('Tab');
await montar('Sidebar', { groups, active: 'inicio' });
await p.focus('a[href="/projetos"]');
await p.keyboard.press('Shift+Tab');
await p.keyboard.press('Tab');
const foco = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
esperar(foco === 'solid', `o item com foco do teclado tem anel de foco (${foco})`);

await p.evaluate(() => { window.__raiz.unmount(); window.__raiz = null; });
avisos.length = 0;
await montar('Sidebar', { groups, defaultCollapsed: true, collapsible: true, toggleShortcut: 'b', header: 'AB', __eventos: ['onCollapsedChange'] });
await p.mouse.move(1100, 700);
await p.waitForTimeout(300);
esperar(await opacidade('.ob-sidebar-abrir__marca') === '1' && await opacidade('.ob-sidebar-abrir__icone') === '0', 'recolhida e em repouso, o cabeçalho mostra a marca');
await p.hover('.ob-sidebar-abrir');
await p.waitForTimeout(700);
esperar(await opacidade('.ob-sidebar-abrir__marca') === '0' && await opacidade('.ob-sidebar-abrir__icone') === '1', 'recolhida e com o mouse em cima, a marca vira o ícone de expandir');
const dica = await p.evaluate(() => [...document.querySelectorAll('[role="tooltip"]')].map((t) => t.textContent).join('|'));
esperar(dica.includes('Expandir barra lateral') && dica.includes('Ctrl B'), `o Tooltip mostra o rótulo e o atalho (${dica})`);
await p.mouse.move(1100, 700);
await p.keyboard.press('Control+b');
esperar(await largura() === 240 && avisos.includes('onCollapsedChange:false'), `Ctrl+B expande (${await largura()}, ${avisos.join()})`);
await p.keyboard.press('Control+b');
esperar(await largura() === 72, `Ctrl+B de novo recolhe (${await largura()})`);
await p.evaluate(() => { window.__raiz.unmount(); window.__raiz = null; });

await p.setViewportSize({ width: 600, height: 800 });
avisos.length = 0;
await montar('Sidebar', { groups, active: 'inicio', mobileOpen: false, __eventos: ['onMobileOpenChange'] });
esperar(await p.evaluate(() => !document.querySelector('#r nav') && [...document.querySelectorAll('nav')].every((n) => getComputedStyle(n).visibility === 'hidden')), 'no celular e fechada, a barra sai da página e o painel fechado fica oculto');
await montar('Sidebar', { groups, active: 'inicio', mobileOpen: true, __eventos: ['onMobileOpenChange', 'onNav'] });
await p.waitForTimeout(300);
esperar(await p.evaluate(() => !!document.querySelector('body > :not(#r) nav a[href="/projetos"]')), 'no celular e aberta, a navegação aparece num Drawer');
await p.click('body > :not(#r) nav a[href="/projetos"]');
esperar(avisos.includes('onNav:projetos') && avisos.includes('onMobileOpenChange:false'), `escolher um item no celular navega e fecha o painel (${avisos.join()})`);
await montar('Sidebar', { groups, active: 'inicio' });
esperar(await p.evaluate(() => !!document.querySelector('nav') && [...document.querySelectorAll('body > :not(#r) nav')].length === 0), 'sem onMobileOpenChange, a barra continua na página em telas estreitas');

await p.setViewportSize({ width: 1200, height: 800 });
avisos.length = 0;
await montar('Navbar', { items: [{ id: 'equipe', label: 'Equipe', href: '/equipe' }, { id: 'ajuda', label: 'Ajuda' }], active: 'equipe', __eventos: ['onNav'] });
esperar(await clicarCom('a[href="/equipe"]', {}) === true && avisos.at(-1) === 'onNav:equipe', 'Navbar: o clique simples chama onNav');
avisos.length = 0;
esperar(await clicarCom('a[href="/equipe"]', { ctrlKey: true }) === false && avisos.length === 0, 'Navbar: Ctrl+clique segue para o navegador');
await p.click('button:has-text("Ajuda")');
esperar(avisos.at(-1) === 'onNav:ajuda', `Navbar: item sem href chama onNav (${avisos.at(-1)})`);

await p.addStyleTag({ content: '.markdown a{color:rgb(255,0,0)}.markdown a:hover{color:rgb(255,0,0)}' });
await p.evaluate(() => document.getElementById('r').classList.add('markdown'));
await montar('Sidebar', { groups, active: 'inicio' });
const corDoItem = await p.evaluate(() => getComputedStyle(document.querySelector('a[href="/projetos"]')).color);
esperar(corDoItem !== 'rgb(255, 0, 0)', 'Sidebar: o CSS de links do site não pinta os itens (' + corDoItem + ')');
await montar('Navbar', { items: [{ id: 'equipe', label: 'Equipe', href: '/equipe' }] });
const corDoLink = await p.evaluate(() => getComputedStyle(document.querySelector('a[href="/equipe"]')).color);
esperar(corDoLink !== 'rgb(255, 0, 0)', 'Navbar: o CSS de links do site não pinta os links (' + corDoLink + ')');

await b.close();
if (falhas.length) { console.error('FAIL: Sidebar\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: Sidebar e Navbar (clique simples chama onNav e Ctrl/Cmd+clique segue para o navegador, recolher, Tooltip e menu de subitens recolhida, botão na borda que aparece no hover, marca que vira o botão de expandir, atalho Ctrl+B, foco do teclado, Drawer no celular, imunes ao CSS de links do site)');
