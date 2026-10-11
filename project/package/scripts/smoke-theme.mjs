import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const entrada = pathToFileURL(join(raiz, 'dist', 'index.js')).href;

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const igual = (a, b, msg) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
};

let contador = 0;
async function carregar() {
  const { window: janela, document: documento } = globalThis;
  delete globalThis.window;
  delete globalThis.document;
  try {
    return await import(`${entrada}?t=${++contador}`);
  } finally {
    if (janela !== undefined) globalThis.window = janela;
    if (documento !== undefined) globalThis.document = documento;
  }
}

function ambiente({ salvo, escuro = false, armazenamentoQuebrado = false, semMatchMedia = false } = {}) {
  const valores = new Map();
  if (salvo !== undefined) valores.set('ob-theme', salvo);
  const janela = { storage: [], midia: [] };
  const consulta = {
    matches: escuro,
    addEventListener: (_, f) => janela.midia.push(f),
  };
  const localStorage = armazenamentoQuebrado
    ? {
        getItem() {
          throw new Error('indisponível');
        },
        setItem() {
          throw new Error('indisponível');
        },
      }
    : {
        getItem: (k) => (valores.has(k) ? valores.get(k) : null),
        setItem: (k, v) => valores.set(k, v),
      };
  const atributos = {};
  globalThis.window = {
    localStorage,
    matchMedia: semMatchMedia ? undefined : () => consulta,
    addEventListener: (tipo, f) => {
      if (tipo === 'storage') janela.storage.push(f);
    },
  };
  globalThis.document = { documentElement: { setAttribute: (k, v) => (atributos[k] = v) } };
  return {
    valores,
    atributos,
    consulta,
    ouvintesStorage: janela.storage,
    ouvintesMidia: janela.midia,
    mudarSistema(escuroAgora) {
      consulta.matches = escuroAgora;
      janela.midia.forEach((f) => f());
    },
    eventoStorage(evento) {
      janela.storage.forEach((f) => f(evento));
    },
  };
}
const limparAmbiente = () => {
  delete globalThis.window;
  delete globalThis.document;
};

limparAmbiente();
{
  const { themeManager, useTheme } = await carregar();
  igual(themeManager.get(), { preference: 'system', resolved: 'light' }, 'estado inicial sem ambiente');
  themeManager.init();
  themeManager.set('dark');
  igual(themeManager.get(), { preference: 'system', resolved: 'light' }, 'sem ambiente, set não altera o estado do servidor');
  const C = () => {
    const t = useTheme();
    return React.createElement('i', null, `${t.preference}:${t.resolved}`);
  };
  const html = renderToStaticMarkup(React.createElement(C));
  if (!html.includes('system:light')) fail('useTheme no servidor deveria usar o snapshot do servidor', html);
}

{
  const env = ambiente({ salvo: 'dark' });
  const { themeManager } = await carregar();
  themeManager.init();
  themeManager.init();
  themeManager.init();
  igual(env.ouvintesStorage.length, 1, 'init repetido não duplica listener de storage');
  igual(env.ouvintesMidia.length, 1, 'init repetido não duplica listener de mídia');
  igual(themeManager.get(), { preference: 'dark', resolved: 'dark' }, 'init lê a preferência salva');
  igual(env.atributos['data-theme'], 'dark', 'init aplica data-theme');
  const a = themeManager.get();
  themeManager.init();
  if (themeManager.get() !== a) fail('get deveria manter a identidade enquanto nada muda');
}

{
  const env = ambiente({ escuro: true });
  const { themeManager } = await carregar();
  const avisos = [];
  const cancelar = themeManager.subscribe((s) => avisos.push(s));
  themeManager.init();
  igual(themeManager.get(), { preference: 'system', resolved: 'dark' }, 'sistema escuro resolve para dark');
  igual(env.atributos['data-theme'], 'dark', 'atributo segue o sistema');
  env.mudarSistema(false);
  igual(themeManager.get(), { preference: 'system', resolved: 'light' }, 'mudança do sistema reaplica');
  igual(avisos.length, 2, 'inscrito avisado a cada mudança de estado');
  themeManager.set('dark');
  igual(env.valores.get('ob-theme'), 'dark', 'set grava no storage');
  igual(env.atributos['data-theme'], 'dark', 'set aplica o atributo');
  igual(avisos.at(-1), { preference: 'dark', resolved: 'dark' }, 'set notifica na própria aba');
  const antes = avisos.length;
  env.mudarSistema(true);
  env.mudarSistema(false);
  igual(avisos.length, antes, 'preferência fixa ignora o sistema');
  themeManager.set('dark');
  igual(avisos.length, antes, 'set com o mesmo valor não notifica');
  themeManager.set('invalido');
  igual(themeManager.get().preference, 'dark', 'valor inválido é ignorado');
  cancelar();
  themeManager.set('light');
  igual(avisos.length, antes, 'cancelar a inscrição para os avisos');
  igual(env.atributos['data-theme'], 'light', 'set light aplica light');
}

{
  const env = ambiente();
  const { themeManager } = await carregar();
  themeManager.init();
  env.eventoStorage({ key: 'ob-theme', newValue: 'dark' });
  igual(themeManager.get(), { preference: 'dark', resolved: 'dark' }, 'storage de outra aba atualiza');
  env.eventoStorage({ key: 'outra-chave', newValue: 'light' });
  igual(themeManager.get().preference, 'dark', 'storage de outra chave é ignorado');
  env.eventoStorage({ key: 'ob-theme', newValue: 'lixo' });
  igual(themeManager.get().preference, 'system', 'valor inválido de outra aba vira system');
  env.eventoStorage({ key: 'ob-theme', newValue: 'light' });
  env.eventoStorage({ key: null, newValue: null });
  igual(themeManager.get().preference, 'system', 'clear() volta para system');
}

{
  ambiente({ salvo: 'lixo' });
  const { themeManager } = await carregar();
  themeManager.init();
  igual(themeManager.get().preference, 'system', 'valor salvo inválido equivale a system');
}

{
  const env = ambiente({ armazenamentoQuebrado: true, escuro: true });
  const { themeManager } = await carregar();
  themeManager.init();
  igual(themeManager.get(), { preference: 'system', resolved: 'dark' }, 'storage quebrado ainda resolve o sistema');
  themeManager.set('light');
  igual(themeManager.get(), { preference: 'light', resolved: 'light' }, 'storage quebrado funciona em memória');
  igual(env.atributos['data-theme'], 'light', 'storage quebrado ainda aplica o atributo');
}

{
  const env = ambiente({ semMatchMedia: true });
  const { themeManager } = await carregar();
  themeManager.init();
  igual(themeManager.get().resolved, 'light', 'sem matchMedia, system resolve light');
  igual(env.ouvintesMidia.length, 0, 'sem matchMedia, não há listener de mídia');
}

{
  const env = ambiente();
  const { themeManager } = await carregar();
  themeManager.set('dark');
  igual(env.atributos['data-theme'], 'dark', 'set antes de init inicializa e aplica');
  igual(env.ouvintesStorage.length, 1, 'set antes de init registra o listener uma vez');
}

const { themeInitScript } = await carregar();
const executarScript = () => new Function(themeInitScript)();
for (const [salvo, escuro, esperado] of [
  [undefined, false, 'light'],
  [undefined, true, 'dark'],
  ['system', true, 'dark'],
  ['light', true, 'light'],
  ['dark', false, 'dark'],
  ['lixo', true, 'dark'],
]) {
  const env = ambiente({ salvo, escuro });
  executarScript();
  const { themeManager } = await carregar();
  themeManager.init();
  igual(env.atributos['data-theme'], esperado, `script e manager chegam ao mesmo tema (${salvo}, escuro=${escuro})`);
}
{
  const env = ambiente({ armazenamentoQuebrado: true, escuro: true });
  executarScript();
  igual(env.atributos['data-theme'], 'dark', 'script com storage quebrado segue o sistema');
  ambiente({ semMatchMedia: true });
  executarScript();
}
limparAmbiente();
executarScript();

igual(readFileSync(join(raiz, 'dist', 'theme-init.js'), 'utf8'), `${themeInitScript}\n`, 'dist/theme-init.js é o themeInitScript');

const css = readFileSync(join(raiz, 'src', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
function blocoEm(inicio, nome) {
  if (inicio < 0) fail(`seletor ausente em tokens.css: ${nome}`);
  const abre = css.indexOf('{', inicio);
  let profundidade = 0;
  for (let i = abre; i < css.length; i++) {
    if (css[i] === '{') profundidade++;
    if (css[i] === '}' && --profundidade === 0) return css.slice(abre + 1, i);
  }
  return fail(`bloco sem fechamento: ${nome}`);
}
const bloco = (seletor) => blocoEm(css.indexOf(seletor), seletor);
const tokensDe = (corpo) => new Set([...corpo.matchAll(/^\s*(--ob-[\w-]+)\s*:/gm)].map((m) => m[1]));
const claro = tokensDe(bloco(':root,\n[data-theme="light"]'));
const escuro = tokensDe(bloco('[data-theme="dark"]'));
const compartilhado = tokensDe(blocoEm(css.lastIndexOf(':root {'), ':root compartilhado'));
if (claro.size === 0 || escuro.size === 0) fail('blocos de tema vazios');
const soNoEscuro = [...escuro].filter((t) => !claro.has(t));
if (soNoEscuro.length) fail('token redefinido no escuro sem existir no claro', soNoEscuro.join(', '));
const nosDois = [...compartilhado].filter((t) => escuro.has(t) || claro.has(t));
if (nosDois.length) fail('token independente de tema aparece também nos blocos de tema', nosDois.join(', '));

console.log(`smoke-theme ok (${claro.size} tokens claros, ${escuro.size} escuros, ${compartilhado.size} compartilhados)`);
