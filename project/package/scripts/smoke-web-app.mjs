// project/package/scripts/smoke-web-app.mjs
//
// O web app (project/ui_kits/web_app/) consome o bundle de navegador deste pacote.
// Este smoke reproduz em Node o que o index.html faz no navegador, SEM navegador:
// define window.React/window.ReactDOM, executa dist/onblide-ui.browser.js, depois
// cada <script type="text/babel" src> do index.html (JSX transformado pelo esbuild,
// que já vem com o tsup), e então:
//   1) toda tag JSX com inicial maiúscula usada pelo app (inclusive o script inline
//      do index.html) precisa existir como global ou ser declarada no próprio arquivo;
//   2) window.obToast existe (o app chama window.obToast?.(...));
//   3) as cinco telas, a Sidebar e a Topbar renderizam com react-dom/server.
// Efeitos (useEffect) e conteúdo de modais fechados não rodam aqui; a checagem 1
// cobre os globais que só aparecem nesses ramos (ex.: o Logo no modal de conexão).
import fs from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import ReactDOM from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformSync } from 'esbuild';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const APP = new URL('../../ui_kits/web_app/', import.meta.url);
const html = fs.readFileSync(new URL('index.html', APP), 'utf8');

if (!html.includes('<script src="../../package/dist/onblide-ui.browser.js"></script>')) {
  fail('index.html deveria carregar ../../package/dist/onblide-ui.browser.js');
}
const srcs = [...html.matchAll(/<script type="text\/babel" src="([^"]+)"><\/script>/g)].map((m) => m[1]);
if (srcs.join(',') !== 'Chrome.jsx,Screens.jsx,tweaks-panel.jsx') fail('scripts text/babel inesperados no index.html', srcs);
const inline = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!inline) fail('script inline do app não encontrado no index.html');

globalThis.window = globalThis;
globalThis.React = React;
globalThis.ReactDOM = ReactDOM;
vm.runInThisContext(fs.readFileSync(new URL('../dist/onblide-ui.browser.js', import.meta.url), 'utf8'), { filename: 'onblide-ui.browser.js' });

const fontes = [];
for (const src of srcs) {
  const codigo = fs.readFileSync(new URL(src, APP), 'utf8');
  fontes.push([src, codigo]);
  const { code } = transformSync(codigo, { loader: 'jsx', jsx: 'transform' });
  vm.runInThisContext(`(function(){${code}\n})();`, { filename: src });
}
fontes.push(['index.html (inline)', inline[1]]);

const faltando = [];
for (const [nome, codigo] of fontes) {
  const locais = new Set([...codigo.matchAll(/(?:const|let|var|function)\s+([A-Z]\w*)/g)].map((m) => m[1]));
  const usados = new Set([...codigo.matchAll(/<([A-Z]\w*)[\s.>/]/g)].map((m) => m[1]));
  for (const u of usados) if (!locais.has(u) && !(u in globalThis)) faltando.push(`${nome}: <${u}>`);
}
if (faltando.length) fail('componentes usados pelo web app e não definidos', faltando);
if (typeof window.obToast !== 'function') fail('window.obToast deveria ser definido pelo bundle (ToastStack)');

const h = React.createElement;
for (const tela of ['HomeScreen', 'TasksScreen', 'MetricsScreen', 'SettingsScreen', 'IntegrationsScreen']) {
  if (typeof window[tela] !== 'function') fail(`${tela} não foi registrada em window`);
  const out = renderToStaticMarkup(h(window[tela]));
  if (out.length < 1000) fail(`${tela} renderizou quase nada`, out);
}
if (!renderToStaticMarkup(h(window.Sidebar, { active: 'home', onNav() {} })).includes('Início')) fail('Sidebar sem o item Início');
if (!renderToStaticMarkup(h(window.Topbar, { title: 'Tarefas' })).includes('Tarefas')) fail('Topbar sem o título');

console.log('OK: web app carrega só do bundle; 5 telas, Sidebar e Topbar renderizam');
