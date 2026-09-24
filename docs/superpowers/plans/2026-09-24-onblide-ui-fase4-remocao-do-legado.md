# @onblide/ui Fase 4 — Remoção total do legado e dos resíduos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o web app consumir `@onblide/ui`, apagar o UI kit antigo (`Components.jsx`/`Primitives.jsx`) e todo artefato que o embute, portar o `Logo`, congelar em fixtures o que os smokes liam do legado, eliminar os resíduos internos do pacote (`PhIcon`, keyframes duplicadas, comentários) e liberar a `0.6.0`.

**Architecture:** A mesma das fases anteriores — TypeScript, um componente por arquivo, build `tsup` (ESM/CJS/`.d.ts` + IIFE `dist/onblide-ui.browser.js` que registra os exports em `window`). O web app continua compilando as próprias telas (`Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx`) com o Babel standalone, mas os componentes passam a vir só do bundle. A fidelidade ao legado é congelada ANTES da remoção, por um script de uso único que executa o original em Node (esbuild + `react-dom/server`) fora do repositório. Um smoke novo (`smoke-web-app.mjs`) prova, sem navegador, que o app roda só com o bundle.

**Tech Stack:** TypeScript 5, React 18.3.1, tsup (com `esbuild` 0.27 como dependência transitiva), Changesets, Node 24. Versão atual do pacote: `0.5.1`.

**Spec:** `docs/superpowers/specs/2026-09-24-onblide-ui-fase4-remocao-do-legado-design.md`

## Global Constraints

- **NAVEGADOR PROIBIDO PARA SUBAGENTES — deve constar em CADA prompt de subagente (implementador e revisor) desta fase:** nenhum subagente pode lançar, abrir, fechar ou encerrar Chrome, Edge ou qualquer navegador (nem headless, nem CLI, nem CDP/DevTools, nem `Start-Process`, nem `taskkill`/`Stop-Process` em `msedge`/`chrome`), nem usar as ferramentas `mcp__claude-in-chrome__*`, nem servir páginas para abrir num navegador. Uma verificação headless já encerrou o Edge do usuário e destruiu o trabalho manual dele. Verificação de subagente = comparação de código + `tsc` + `npm run verify` + smokes Node (`react-dom/server`) + `grep`/`cmp`. A conferência visual é a Tarefa 11, **do controlador**.
- **Só as mudanças listadas na spec.** Tarefas de limpeza provam JS emitido idêntico por `cmp`; tarefas com mudança provam vermelho→verde por smoke. Nada de "aproveitar" para trocar os `<i class="ph …">` diretos de `Chip`/`SearchInput`/`DeadlineCalendar`, mexer em `export/Onblide-Slide-Deck.html`, tirar o Babel do web app ou rodar o `/design-sync`.
- Comandos de `npm`/`node` rodam a partir de `project/package/`; comandos `git` a partir da raiz do repositório (`cd "$(git rev-parse --show-toplevel)"`). Shell: Git Bash. `npm run verify` = `typecheck → build → typecheck:dist → smoke`; toda tarefa de subagente termina com ele verde.
- **Fim de linha:** o repositório mistura CRLF e LF no working tree (`core.autocrlf=true`; confira com `git ls-files --eol <arquivo>`). Entre os que esta fase edita, estão em **CRLF**: `src/browser.ts`, `src/primitives/Spinner/Spinner.tsx`, `src/primitives/badgeTones.ts` e `tsup.config.ts`; os demais estão em LF. Os trechos deste plano estão em LF; a ferramenta `Edit` casa e preserva o fim de linha de cada arquivo (testado na Fase 3). Não reescreva arquivos inteiros nem use `sed -i`. Arquivos NOVOS são criados com `Write`.
- **Sem cópias temporárias no repositório.** Scripts de uso único ficam num diretório de `mktemp -d` e são apagados no fim do passo. Nenhum arquivo novo além dos listados em cada tarefa.
- Nenhuma dependência nova e nenhum framework de teste novo (`esbuild` já vem com o `tsup` e já é usado por `tsup.config.ts`).
- Conventional Commits em português, minúsculo, imperativo, sem ponto final, na branch `dev`, **sem** rodapé `Claude-Session:` nem qualquer atribuição de IA. `project/package/package-lock.json` só entra no commit de release (Tarefa 12), sincronizado com `npm install --package-lock-only`. Sem amend de commit já publicado. Subagentes NÃO fazem `git tag` nem `git push`.
- Módulos internos (`injectStyleOnce`, `injectSpinKeyframes`, tabelas de tons/posições) NÃO são reexportados em `src/index.ts`. Todo TIPO usado em prop pública é exportado (`LogoProps`).
- `docs/superpowers/` é registro histórico: não editar os documentos antigos; a varredura final o exclui.

## Review Focus

- **Fixtures geradas do original, não do porte (Tarefa 1).** `brands.json` e `logo.json` têm de sair do script que executa `Primitives.jsx`; o revisor roda o script de novo (numa cópia fora do repositório ou com `git stash`) e confere `cmp` byte a byte. Um fixture gerado a partir do `dist` não prova nada.
- **`Logo` só aparece com o modal aberto.** O SSR das telas não o renderiza; é a checagem estática de tags do `smoke-web-app.mjs` que pega um global ausente. O revisor da Tarefa 6 confere a mutação `<LogoX>` (tem de falhar citando `Screens.jsx: <LogoX>`).
- **`ob-pulse` é usada pelo `Table`** (linhas-esqueleto de `loading`), apesar do comentário antigo do `Spinner`. A Tarefa 4 não pode perdê-la: o conjunto de regras `@keyframes` injetadas antes/depois tem de ser igual (script da Tarefa 4), e a ordem nova do golden é exatamente `ob-skeleton-kf, ob-tip-kf, ob-spin-kf, ob-indet-kf, ob-toast-kf, ob-toast-pos, ob-shake-kf, ob-pulse-kf, ob-modal-kf`.
- **`Icons` com tamanho padrão 20.** `Ph` sozinho tem padrão 18; `Icons` passa `size={p.size ?? 20}`. `Icons.check()` sem props tem de continuar com `font-size:20px` (asserção já existente em `smoke-icons.mjs`).
- **Ordem de carregamento do web app.** O bundle vem depois de React/ReactDOM UMD e antes dos scripts `text/babel`; o `smoke-web-app.mjs` trava a tag exata e a lista `Chrome.jsx,Screens.jsx,tweaks-panel.jsx`.

---

## File Structure

```text
project/package/
  scripts/
    fixtures/brands.json               # NOVO (Tarefa 1) — marcas congeladas do original
    fixtures/logo.json                 # NOVO (Tarefa 1) — Logo congelado do original
    fixtures/injected-styles.json      # golden: ob-prim-kf sai; ob-spin-kf/ob-pulse-kf (Tarefa 4)
    smoke-brands.mjs                   # lê a fixture (Tarefa 1)
    smoke-icons.mjs                    # comentário (Tarefa 1); Icons == Ph (Tarefa 3)
    smoke-pagination.mjs               # legado() → ate040() (Tarefa 1)
    smoke-logo.mjs                     # NOVO (Tarefa 2)
    smoke-web-app.mjs                  # NOVO (Tarefa 6)
    types-check.tsx                    # + Logo, LogoProps (Tarefa 2)
  src/
    index.ts                           # + export Logo (Tarefa 2)
    browser.ts                         # comentário (Tarefa 5)
    internal/keyframes.ts              # NOVO: injectSpinKeyframes() (Tarefa 4)
    primitives/Logo/Logo.tsx           # NOVO (Tarefa 2)
    primitives/Icons/Icons.tsx         # usa Ph (Tarefa 3)
    primitives/Icons/PhIcon.tsx        # APAGADO (Tarefa 3)
    primitives/Spinner/Spinner.tsx     # injectSpinKeyframes (Tarefa 4)
    components/SearchInput/SearchInput.tsx  # injectSpinKeyframes (Tarefa 4)
    components/Table/Table.tsx         # injeta ob-pulse-kf (Tarefa 4)
    components/obTones.ts, components/obToastPos.ts, primitives/badgeTones.ts,
    components/ToastStack/ToastStack.tsx   # comentários (Tarefa 5)
  tsup.config.ts                       # comentários (Tarefa 5)
  README.md                            # Ph/Icons, web app, Logo (Tarefa 9)
  package.json, CHANGELOG.md, package-lock.json   # 0.6.0 (Tarefa 12)
project/ui_kits/web_app/
  index.html                           # carrega o bundle (Tarefa 6)
  Chrome.jsx, Screens.jsx              # cabeçalhos /* global */ (Tarefa 6)
  Components.jsx, Primitives.jsx       # APAGADOS (Tarefa 7)
  README.md                            # (Tarefa 7)
project/ds/components/components-table.html   # keyframe morta (Tarefa 4)
project/export/Onblide-Web-App-Standalone.html # APAGADO (Tarefa 8)
project/_ds_bundle.js                  # APAGADO (Tarefa 8)
project/README.md, project/SKILL.md    # (Tarefas 7, 8, 9)
project/CLAUDE.md                      # (Tarefa 9)
```

---

### Task 1: Congelar em fixtures o que os smokes liam do UI kit antigo

**Files:**
- Create: `project/package/scripts/fixtures/brands.json`
- Create: `project/package/scripts/fixtures/logo.json`
- Modify: `project/package/scripts/smoke-brands.mjs`
- Modify: `project/package/scripts/smoke-icons.mjs`
- Modify: `project/package/scripts/smoke-pagination.mjs`

**Interfaces:**
- Consumes: `project/ui_kits/web_app/Primitives.jsx` e `Components.jsx` (ainda existem; são lidos só pelo script de uso único).
- Produces: `scripts/fixtures/brands.json` = `{ [chave]: { name, hex, cat, desc, mark24, mark40 } }` (7 marcas; `mark24`/`mark40` = `renderToStaticMarkup(b.mark(24|40))` do original); `scripts/fixtures/logo.json` = `{ padrao, size24 }` (`renderToStaticMarkup(<Logo/>)` e `<Logo size={24}/>` do original). A Tarefa 2 compara o `Logo` portado com `logo.json`. Depois desta tarefa nenhum smoke lê arquivo fora de `project/package/`.

- [ ] **Step 1: Baseline verde**

```bash
cd project/package && npm run verify
```

Esperado: exit 0, `20/20 smokes ok`.

- [ ] **Step 2: Escrever o script de congelamento FORA do repositório**

```bash
T=$(mktemp -d)
cat > "$T/congelar-legado.mjs" <<'EOF'
// Script de uso único da Fase 4 (NÃO fica no repositório). Executa o UI kit antigo
// (ui_kits/web_app/Primitives.jsx e Components.jsx) em Node, via esbuild +
// react-dom/server, e:
//   1) grava scripts/fixtures/brands.json e scripts/fixtures/logo.json;
//   2) confere que a tabela de smoke-icons.mjs é a do original;
//   3) confere que a função de referência de smoke-pagination.mjs gera os mesmos
//      rótulos que a Pagination original, em toda a varredura do smoke.
// Uso (Git Bash, a partir de project/package): node <este arquivo> "$(pwd -W)"
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const PKG = process.argv[2];
if (!PKG || !fs.existsSync(path.join(PKG, 'package.json'))) {
  console.error('uso: node congelar-legado.mjs <caminho de project/package>');
  process.exit(2);
}
const require = createRequire(path.join(PKG, 'package.json'));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const esbuild = require('esbuild');
const fail = (msg, extra) => { console.error('FAIL:', msg, extra ?? ''); process.exit(1); };

globalThis.window = globalThis;
globalThis.React = React;
for (const arquivo of ['Primitives.jsx', 'Components.jsx']) {
  const fonte = fs.readFileSync(path.join(PKG, '..', 'ui_kits', 'web_app', arquivo), 'utf8');
  const { code } = esbuild.transformSync(fonte, { loader: 'jsx', jsx: 'transform' });
  vm.runInThisContext(`(function(){${code}\n})();`, { filename: arquivo });
}
const { Brands, Logo, Icons, Pagination } = globalThis;
const h = React.createElement;

// 1) Fixtures.
const brands = {};
for (const [chave, b] of Object.entries(Brands)) {
  brands[chave] = {
    name: b.name, hex: b.hex, cat: b.cat, desc: b.desc,
    mark24: renderToStaticMarkup(b.mark(24)),
    mark40: renderToStaticMarkup(b.mark(40)),
  };
}
const logo = {
  padrao: renderToStaticMarkup(h(Logo)),
  size24: renderToStaticMarkup(h(Logo, { size: 24 })),
};
const dir = path.join(PKG, 'scripts', 'fixtures');
const grava = (nome, dados) => fs.writeFileSync(path.join(dir, nome), JSON.stringify(dados, null, 2) + '\n');
grava('brands.json', brands);
grava('logo.json', logo);
console.log(`brands.json: ${Object.keys(brands).length} marcas; logo.json: padrão e size=24`);

// 2) Tabela de Icons do smoke == glifos do original.
const smokeIcons = fs.readFileSync(path.join(PKG, 'scripts', 'smoke-icons.mjs'), 'utf8').replace(/\r\n/g, '\n');
const tabela = Function(`return (${smokeIcons.match(/const esperado = (\{[\s\S]*?\});/)[1]})`)();
const original = {};
for (const chave of Object.keys(Icons)) {
  original[chave] = renderToStaticMarkup(Icons[chave]()).match(/class="ph ph-([a-z0-9-]+)"/)[1];
}
const ordena = (o) => JSON.stringify(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
if (ordena(tabela) !== ordena(original)) fail('a tabela de smoke-icons.mjs difere dos glifos do original', { tabela, original });
console.log(`smoke-icons.mjs: ${Object.keys(tabela).length} glifos iguais aos do original`);

// 3) Função de referência de smoke-pagination.mjs == Pagination original.
const smokePag = fs.readFileSync(path.join(PKG, 'scripts', 'smoke-pagination.mjs'), 'utf8').replace(/\r\n/g, '\n');
const fonteRef = smokePag.match(/function (?:legado|ate040)\(\{[\s\S]*?\n\}\n/)[0];
const referencia = Function(`${fonteRef}; return ${fonteRef.match(/function (\w+)/)[1]};`)();
const rotulos = (html) => [...html.matchAll(/>([^<]+)<\/(?:button|span)>/g)].map((m) => m[1]);
let casos = 0;
for (const total of [1, 2, 3, 5, 7, 10, 20, 50]) {
  for (const siblings of [0, 1, 2]) {
    for (let page = 1; page <= total; page++) {
      const html = renderToStaticMarkup(h(Pagination, { page, total, siblings, onChange() {} }));
      const esperado = referencia({ page, total, siblings }).join('|');
      if (rotulos(html).join('|') !== esperado) fail(`Pagination original diverge da referência: page=${page} total=${total} siblings=${siblings}`, { html, esperado });
      casos++;
    }
  }
}
console.log(`smoke-pagination.mjs: referência igual à Pagination original em ${casos} casos`);
EOF
echo "$T"
```

Guarde o valor de `$T` impresso (os Steps 3, 4 e 7 o usam; se o shell for outro processo, redefina `T=<valor>`).

- [ ] **Step 3: Rodar o congelamento (duas vezes) e conferir determinismo**

```bash
cd project/package
node "$T/congelar-legado.mjs" "$(pwd -W)"
cp scripts/fixtures/brands.json "$T/brands.1.json" && cp scripts/fixtures/logo.json "$T/logo.1.json"
node "$T/congelar-legado.mjs" "$(pwd -W)"
cmp scripts/fixtures/brands.json "$T/brands.1.json" && cmp scripts/fixtures/logo.json "$T/logo.1.json" && echo DETERMINISTICO
```

Esperado (nas duas execuções):
```
brands.json: 7 marcas; logo.json: padrão e size=24
smoke-icons.mjs: 28 glifos iguais aos do original
smoke-pagination.mjs: referência igual à Pagination original em 294 casos
```
e depois `DETERMINISTICO`. `logo.json` começa com `"padrao": "<svg height=\"28\" viewBox=\"0 0 2048 313.44\" role=\"img\" aria-label=\"Onblide\" style=\"display:block;width:auto\">`.

- [ ] **Step 4: Religar `smoke-brands.mjs` à fixture**

Duas edições com a ferramenta `Edit`. Em `project/package/scripts/smoke-brands.mjs`, substitua:

```js
// Dados lidos do ORIGINAL (Primitives.jsx), nao do porte.
const src = fs.readFileSync(new URL('../../ui_kits/web_app/Primitives.jsx', import.meta.url), 'utf8');
const bloco = src.slice(src.indexOf('const Brands = {'), src.indexOf('const BrandTile'));
const re = /^  (\w+): \{\s*\n\s*name: '([^']*)', hex: '([^']*)', cat: '([^']*)',\s*\n\s*desc: '([^']*)',/gm;
const esperado = {};
let m;
while ((m = re.exec(bloco))) esperado[m[1]] = { name: m[2], hex: m[3], cat: m[4], desc: m[5] };
if (Object.keys(esperado).length !== 7) fail('parse do original nao achou 7 marcas', Object.keys(esperado));

if (Object.keys(Brands).sort().join(',') !== Object.keys(esperado).sort().join(',')) {
  fail('conjunto de marcas difere do legado', Object.keys(Brands));
}
```

por:

```js
// Dados e marcas congelados em scripts/fixtures/brands.json (gerado na Fase 4,
// antes da remoção do UI kit antigo, renderizando o original em Node).
const esperado = JSON.parse(fs.readFileSync(new URL('./fixtures/brands.json', import.meta.url), 'utf8'));
if (Object.keys(esperado).length !== 7) fail('a fixture deveria ter 7 marcas', Object.keys(esperado));

if (Object.keys(Brands).sort().join(',') !== Object.keys(esperado).sort().join(',')) {
  fail('conjunto de marcas difere da fixture', Object.keys(Brands));
}
```

e substitua:

```js
  if (b.name !== d.name || b.hex !== d.hex || b.cat !== d.cat || b.desc !== d.desc) fail(`dados de ${chave} divergem`, b);
  for (const s of [24, 40]) {
    const svg = renderToStaticMarkup(b.mark(s));
    if (!svg.startsWith(`<svg width="${s}" height="${s}" viewBox="0 0 24 24">`)) fail(`mark(${s}) de ${chave} com cabecalho inesperado`, svg);
  }
```

por:

```js
  if (b.name !== d.name || b.hex !== d.hex || b.cat !== d.cat || b.desc !== d.desc) fail(`dados de ${chave} divergem`, b);
  if (renderToStaticMarkup(b.mark(24)) !== d.mark24) fail(`mark(24) de ${chave} diverge da fixture`);
  if (renderToStaticMarkup(b.mark(40)) !== d.mark40) fail(`mark(40) de ${chave} diverge da fixture`);
```

(O restante do arquivo — `BrandTile` e o `console.log` final — não muda. O `import fs from 'node:fs';` continua sendo usado.)

- [ ] **Step 5: Limpar as referências ao legado em `smoke-icons.mjs` e `smoke-pagination.mjs`**

Em `project/package/scripts/smoke-icons.mjs`, substitua:

```js
// Tabela independente (copiada do legado, Primitives.jsx:33-60): chave da API -> glifo Phosphor.
```

por:

```js
// Tabela independente (conferida contra o UI kit antigo na Fase 4, antes da remoção): chave da API -> glifo Phosphor.
```

e substitua `fail('conjunto de chaves de Icons difere do legado'` por `fail('conjunto de chaves de Icons difere da tabela'`.

Em `project/package/scripts/smoke-pagination.mjs`, substitua:

```js
// Algoritmo do ORIGINAL (Components.jsx) em Node puro. O legado fazia
// `[...new Set(pages)]`, que também colapsava os DOIS '…' em um só.
function legado({ page = 1, total = 10, siblings = 1 }) {
```

por:

```js
// Algoritmo de antes da Fase 3 (até a 0.4.0), congelado aqui como referência.
// Ele fazia `[...new Set(pages)]`, que também colapsava os DOIS '…' em um só.
function ate040({ page = 1, total = 10, siblings = 1 }) {
```

substitua `// Única mudança de comportamento da Fase 3: corrigido == legado, exceto que o` por `// Única mudança de comportamento da Fase 3: corrigido == ate040, exceto que o`, substitua `const antigo = legado({ page, total, siblings });` por `const antigo = ate040({ page, total, siblings });` e substitua ``fail(`corrigido diverge do legado além`` por ``fail(`corrigido diverge da 0.4.0 além``.

- [ ] **Step 6: Nenhum smoke lê mais o legado; verificação**

```bash
grep -rn "ui_kits\|Primitives\.jsx\|Components\.jsx\|legado" scripts
npm run verify
```

Esperado: o `grep` não imprime nada (exit 1); `verify` exit 0 com `20/20 smokes ok`.

- [ ] **Step 7: Rodar o congelamento de novo contra os smokes editados e limpar o temporário**

```bash
node "$T/congelar-legado.mjs" "$(pwd -W)"
cmp scripts/fixtures/brands.json "$T/brands.1.json" && cmp scripts/fixtures/logo.json "$T/logo.1.json" && echo INALTERADO
git status --short scripts/fixtures
rm -rf "$T"
```

Esperado: as três linhas OK do Step 3 (agora a referência encontrada é `ate040`); `INALTERADO`; `git status` lista só `?? scripts/fixtures/brands.json` e `?? scripts/fixtures/logo.json`.

- [ ] **Step 8: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add project/package/scripts/fixtures/brands.json project/package/scripts/fixtures/logo.json project/package/scripts/smoke-brands.mjs project/package/scripts/smoke-icons.mjs project/package/scripts/smoke-pagination.mjs
git commit -m "test: congela em fixtures as marcas e o logo do ui kit antigo"
```

---

### Task 2: Portar o `Logo`

**Files:**
- Create: `project/package/src/primitives/Logo/Logo.tsx`
- Create: `project/package/scripts/smoke-logo.mjs`
- Modify: `project/package/src/index.ts`
- Modify: `project/package/scripts/types-check.tsx`

**Interfaces:**
- Consumes: `scripts/fixtures/logo.json` (Tarefa 1); `project/ui_kits/web_app/Primitives.jsx` linhas 11–23 (fonte da cópia mecânica).
- Produces: `export interface LogoProps { size?: number }` e `export const Logo: React.FC<LogoProps>` (padrão `size = 28`), reexportados por `src/index.ts` e, portanto, `window.Logo` no bundle IIFE. A Tarefa 6 depende de `window.Logo`.

- [ ] **Step 1: Escrever o smoke (vermelho)**

Crie `project/package/scripts/smoke-logo.mjs`:

```js
// project/package/scripts/smoke-logo.mjs
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Logo } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

// Marcação congelada em scripts/fixtures/logo.json (gerada na Fase 4 renderizando
// o Logo original em Node, antes da remoção do UI kit antigo).
const esperado = JSON.parse(fs.readFileSync(new URL('./fixtures/logo.json', import.meta.url), 'utf8'));

if (typeof Logo !== 'function') fail('Logo não é exportado por dist/index.js');
const padrao = renderToStaticMarkup(React.createElement(Logo));
if (padrao !== esperado.padrao) fail('Logo sem props diverge da fixture', padrao.slice(0, 200));
const s24 = renderToStaticMarkup(React.createElement(Logo, { size: 24 }));
if (s24 !== esperado.size24) fail('Logo size=24 diverge da fixture', s24.slice(0, 200));

// Propriedades de que o app e o tema dependem (explícitas, além da comparação literal).
if (!padrao.startsWith('<svg height="28" viewBox="0 0 2048 313.44" role="img" aria-label="Onblide" style="display:block;width:auto">')) fail('cabeçalho do svg inesperado', padrao.slice(0, 160));
for (const token of ['var(--ob-orange)', 'var(--ob-fg-strong)', 'var(--ob-blue)']) {
  if (!padrao.includes(`fill="${token}"`)) fail(`preenchimento ${token} ausente`);
}
if ((padrao.match(/<path /g) || []).length !== 7 || (padrao.match(/<rect /g) || []).length !== 1) fail('o lockup deveria ter 7 paths e 1 rect');

console.log('OK: Logo (padrão 28px e size=24) idêntico à fixture');
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
import { Table, Select, Slider, Icons, BrandTile, Link, Modal, Pagination } from '@onblide/ui';
```

por:

```tsx
import { Table, Select, Slider, Icons, BrandTile, Link, Modal, Pagination, Logo } from '@onblide/ui';
```

Substitua (as DUAS ocorrências — use `replace_all`):

```tsx
  Brand, BrandKey, BrandTileProps,
```

por:

```tsx
  Brand, BrandKey, BrandTileProps, LogoProps,
```

Substitua:

```tsx
      {/* Icons / BrandTile / Link / Pagination / Modal */}
```

por:

```tsx
      {/* Icons / BrandTile / Logo / Link / Pagination / Modal */}
```

Substitua:

```tsx
      <BrandTile brand="github" size={32} />
```

por:

```tsx
      <BrandTile brand="github" size={32} />
      <Logo />
      <Logo size={24} />
```

Substitua:

```tsx
      {/* @ts-expect-error marca inexistente */}
```

por:

```tsx
      {/* @ts-expect-error size do Logo é número */}
      <Logo size="24" />
      {/* @ts-expect-error marca inexistente */}
```

- [ ] **Step 2: Confirmar o vermelho**

```bash
cd project/package
npm run build >/dev/null && node scripts/smoke-logo.mjs; npm run typecheck:dist
```

Esperado: `FAIL: Logo não é exportado por dist/index.js` (exit 1) e o `typecheck:dist` falha com `TS2305` / `has no exported member 'Logo'` (e `'LogoProps'`). Registre as mensagens no relatório.

- [ ] **Step 3: Cópia mecânica do `Logo` (script de uso único fora do repositório)**

```bash
T=$(mktemp -d)
cat > "$T/gerar-logo.mjs" <<'EOF'
// Uso único (NÃO fica no repositório): copia o corpo do Logo de Primitives.jsx.
import fs from 'node:fs';
import path from 'node:path';

const PKG = process.argv[2];
const legado = fs.readFileSync(path.join(PKG, '..', 'ui_kits', 'web_app', 'Primitives.jsx'), 'utf8').replace(/\r\n/g, '\n');
const ini = legado.indexOf('const Logo = ({ size = 28 }) => (\n');
const fim = legado.indexOf('\n);\n', ini);
if (ini < 0 || fim < 0) throw new Error('bloco do Logo não encontrado em Primitives.jsx');
const corpo = legado.slice(legado.indexOf('\n', ini) + 1, fim + 1);
if (!corpo.startsWith('  <svg height={size}') || !corpo.trimEnd().endsWith('</svg>')) throw new Error('corpo inesperado');

const arquivo = `import React from 'react';

export interface LogoProps {
  /** Altura renderizada em px; a largura acompanha a proporção da arte. */
  size?: number;
}

// Marca Onblide — lockup horizontal (símbolo + wordmark), com a arte inline
// para não depender de arquivo externo. Os preenchimentos seguem o tema ativo
// pelos tokens --ob-*; as variantes em arquivo ficam em project/assets/.
export const Logo: React.FC<LogoProps> = ({ size = 28 }) => (
${corpo});
`;
const destino = path.join(PKG, 'src', 'primitives', 'Logo', 'Logo.tsx');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, arquivo);
console.log(`gravado ${destino} (${arquivo.split('\n').length} linhas)`);
EOF
node "$T/gerar-logo.mjs" "$(pwd -W)" && rm -rf "$T"
head -13 src/primitives/Logo/Logo.tsx; tail -2 src/primitives/Logo/Logo.tsx
```

Esperado: `gravado …Logo.tsx (24 linhas)`; o arquivo começa com `import React from 'react';`, tem a `interface LogoProps`, o comentário, `export const Logo: React.FC<LogoProps> = ({ size = 28 }) => (`, as linhas `<svg height={size} viewBox="0 0 2048 313.44" role="img" aria-label="Onblide"` / `style={{ display: 'block', width: 'auto' }}>`, sete `<path …/>` e um `<rect …/>` idênticos às linhas 14–21 de `Primitives.jsx`, e termina com `  </svg>` / `);`. Confira: `diff <(sed -n 12,22p ../ui_kits/web_app/Primitives.jsx) <(sed -n 12,22p src/primitives/Logo/Logo.tsx)` sem saída.

- [ ] **Step 4: Exportar**

Em `project/package/src/index.ts`, substitua:

```ts
export * from './components/Modal/Modal';
```

por:

```ts
export * from './components/Modal/Modal';
export * from './primitives/Logo/Logo';
```

- [ ] **Step 5: Verde**

```bash
npm run verify
node -e "import('./dist/index.js').then(m => console.log(Object.keys(m).length, typeof m.Logo))"
```

Esperado: exit 0, `21/21 smokes ok` (inclui `OK: Logo (padrão 28px e size=24) idêntico à fixture`); `40 function`. O golden do CSS injetado não muda (o `Logo` não injeta estilo).

- [ ] **Step 6: Mutação do teste de tipos (e reverter)**

Em `scripts/types-check.tsx`, troque temporariamente `<Logo size="24" />` por `<Logo size={24} />`; `npm run typecheck:dist` deve falhar com `TS2578: Unused '@ts-expect-error' directive`. Desfaça a troca e confirme `npm run typecheck:dist` exit 0.

- [ ] **Step 7: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add project/package/src/primitives/Logo/Logo.tsx project/package/src/index.ts project/package/scripts/smoke-logo.mjs project/package/scripts/types-check.tsx
git commit -m "feat(logo): adiciona o componente Logo ao pacote"
```

---

### Task 3: `Icons` construído sobre `Ph` (remove `PhIcon`)

**Files:**
- Modify: `project/package/src/primitives/Icons/Icons.tsx`
- Delete: `project/package/src/primitives/Icons/PhIcon.tsx`
- Modify: `project/package/scripts/smoke-icons.mjs`

**Interfaces:**
- Consumes: `Ph` de `src/components/Ph/Ph.tsx` (`{ n: string; size?: number /* padrão 18 */; c?: string; style?: React.CSSProperties }`).
- Produces: `Icons` com a mesma API (`Record<IconName, IconComponent>`, `IconProps { size?, style? }`, tamanho padrão 20). Mudança de marcação documentada na spec: o `<i>` passa a ser exatamente o do `Ph` (`aria-hidden` antes de `style`; `color:currentColor` inline).

- [ ] **Step 1: Asserção nova no smoke (vermelho)**

Em `project/package/scripts/smoke-icons.mjs`, substitua:

```js
import { Icons } from '../dist/index.js';
```

por:

```js
import { Icons, Ph } from '../dist/index.js';
```

e substitua:

```js
console.log('OK: 28 ícones
```

por:

```js
// Icons é construído sobre Ph: cada entrada renderiza exatamente o <Ph> do glifo,
// com o tamanho padrão 20 do registro (o padrão do Ph sozinho é 18).
for (const [chave, glifo] of Object.entries(esperado)) {
  const viaPh = renderToStaticMarkup(React.createElement(Ph, { n: glifo, size: 20 }));
  if (renderToStaticMarkup(Icons[chave]()) !== viaPh) fail(`Icons.${chave} deveria renderizar como <Ph n="${glifo}" size={20}/>`, renderToStaticMarkup(Icons[chave]()));
}

console.log('OK: 28 ícones
```

```bash
cd project/package && npm run build >/dev/null && node scripts/smoke-icons.mjs
```

Esperado: `FAIL: Icons.search deveria renderizar como <Ph n="magnifying-glass" size={20}/>` com a marcação antiga (`style=… aria-hidden="true"`). Registre.

- [ ] **Step 2: Implementar**

Em `project/package/src/primitives/Icons/Icons.tsx`, substitua:

```tsx
import { PhIcon } from './PhIcon';
```

por:

```tsx
import { Ph } from '../../components/Ph/Ph';
```

Depois, com `replace_all`, substitua `<PhIcon name=` por `<Ph n=` e substitua `size={p.size} style={p.style}/>` por `size={p.size ?? 20} style={p.style}/>` (28 linhas cada). Apague o arquivo:

```bash
git rm -q src/primitives/Icons/PhIcon.tsx
grep -c 'Ph n=' src/primitives/Icons/Icons.tsx; grep -rn "PhIcon" src scripts
```

Esperado: `28`; o segundo `grep` sem saída.

- [ ] **Step 3: Verde e diferença de marcação medida**

```bash
npm run verify
node -e "import('./dist/index.js').then(async m=>{const R=await import('react-dom/server');console.log(R.renderToStaticMarkup(m.Icons.check()))})"
```

Esperado: exit 0, `21/21 smokes ok`; a linha impressa é exatamente
`<i class="ph ph-check" aria-hidden="true" style="font-size:20px;color:currentColor;line-height:1;display:inline-flex;align-items:center;justify-content:center"></i>`.

- [ ] **Step 4: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add project/package/src/primitives/Icons/Icons.tsx project/package/scripts/smoke-icons.mjs
git commit -m "refactor(icons): constrói o registro Icons sobre o Ph"
```

(A remoção de `PhIcon.tsx` já está no índice pelo `git rm` do Step 2.)

---

### Task 4: Consolidar as keyframes `ob-spin` e `ob-pulse`

**Files:**
- Create: `project/package/src/internal/keyframes.ts`
- Modify: `project/package/src/primitives/Spinner/Spinner.tsx`
- Modify: `project/package/src/components/SearchInput/SearchInput.tsx`
- Modify: `project/package/src/components/Table/Table.tsx`
- Modify: `project/package/scripts/fixtures/injected-styles.json` (via `--update`)
- Modify: `project/ds/components/components-table.html`

**Interfaces:**
- Produces: `export function injectSpinKeyframes(): void` em `src/internal/keyframes.ts` (interno, não reexportado) — injeta `@keyframes ob-spin{to{transform:rotate(360deg)}}` sob o id `ob-spin-kf`. O `Table` injeta `@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}` sob `ob-pulse-kf`. O id `ob-prim-kf` deixa de existir.

- [ ] **Step 1: Guardar o golden de antes**

```bash
cd project/package
T=$(mktemp -d) && cp scripts/fixtures/injected-styles.json "$T/golden-antes.json" && echo "$T"
```

- [ ] **Step 2: Criar `src/internal/keyframes.ts`**

```ts
// Keyframes usadas por mais de um componente. Cada uma é injetada uma única vez
// (por id) pelo primeiro módulo que a pede. Módulo interno: NÃO é reexportado
// em src/index.ts.
import { injectStyleOnce } from './injectStyleOnce';

/** `ob-spin`: rotação contínua (Spinner e o ícone de carregamento do SearchInput). */
export function injectSpinKeyframes(): void {
  injectStyleOnce('ob-spin-kf', '@keyframes ob-spin{to{transform:rotate(360deg)}}');
}
```

- [ ] **Step 3: Usar nos três componentes**

Em `project/package/src/primitives/Spinner/Spinner.tsx`, substitua:

```tsx
import { injectStyleOnce } from '../../internal/injectStyleOnce';
```

por:

```tsx
import { injectSpinKeyframes } from '../../internal/keyframes';
```

e substitua:

```tsx
// injeta as keyframes ob-spin (usada aqui) e ob-pulse (não usada por
// Spinner nem ProgressCircle, mas presente no bloco original — mantida
// para paridade exata com Primitives.jsx:847-852)
injectStyleOnce(
  'ob-prim-kf',
  '@keyframes ob-spin{to{transform:rotate(360deg)}}@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
);
```

por:

```tsx
injectSpinKeyframes();
```

Em `project/package/src/components/SearchInput/SearchInput.tsx`, substitua:

```tsx
import { injectStyleOnce } from '../../internal/injectStyleOnce';
```

por:

```tsx
import { injectSpinKeyframes } from '../../internal/keyframes';
```

e substitua:

```tsx
// injeta a keyframe do spinner de loading uma única vez. Mesmo conteúdo que
// Spinner.tsx injeta sob outro id ('ob-prim-kf') — duplicação já existente
// no original (SearchInput.jsx e Primitives.jsx guardam com ids
// diferentes), preservada verbatim; não consolidar com Spinner.tsx.
injectStyleOnce('ob-spin-kf', '@keyframes ob-spin{to{transform:rotate(360deg)}}');
```

por:

```tsx
injectSpinKeyframes();
```

Em `project/package/src/components/Table/Table.tsx`, substitua:

```tsx
import React, { useState } from 'react';
```

por:

```tsx
import React, { useState } from 'react';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

// `ob-pulse`: pulsação das linhas-esqueleto do estado `loading`.
injectStyleOnce('ob-pulse-kf', '@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}');
```

- [ ] **Step 4: Vermelho do golden (esperado e só nestes pontos)**

```bash
npm run typecheck && npm run build >/dev/null && node scripts/smoke-injected-styles.mjs
```

Esperado: exit 1 com exatamente duas falhas:
```
FAIL: ordem/id diferente na posição 2: golden ob-prim-kf, atual ob-spin-kf
FAIL: ordem/id diferente na posição 7: golden ob-spin-kf, atual ob-pulse-kf
```
Qualquer outra falha (id duplicado, CSS diferente em outro id) é defeito: pare e investigue.

- [ ] **Step 5: Atualizar o golden de propósito e provar que as regras são as mesmas**

```bash
node scripts/smoke-injected-styles.mjs --update
node -e "
const fs=require('fs');
const re=/@keyframes [\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g;
const ler=(f)=>{const g=JSON.parse(fs.readFileSync(f,'utf8'));const kf=new Set();for(const {css} of g)for(const k of css.match(re)||[])kf.add(k);
  return {kf:[...kf].sort().join('\n'),resto:g.map(e=>e.css.replace(re,'').trim()).filter(Boolean).join('|'),ids:g.map(e=>e.id).join(',')};};
const a=ler(process.argv[1]),b=ler('scripts/fixtures/injected-styles.json');
console.log('keyframes iguais:',a.kf===b.kf,'| demais regras iguais:',a.resto===b.resto);console.log('antes: ',a.ids);console.log('depois:',b.ids);
" "$(cygpath -w "$T/golden-antes.json")"
rm -rf "$T"
```

Esperado:
```
golden atualizado: 9 estilos
keyframes iguais: true | demais regras iguais: true
antes:  ob-skeleton-kf,ob-tip-kf,ob-prim-kf,ob-indet-kf,ob-toast-kf,ob-toast-pos,ob-shake-kf,ob-spin-kf,ob-modal-kf
depois: ob-skeleton-kf,ob-tip-kf,ob-spin-kf,ob-indet-kf,ob-toast-kf,ob-toast-pos,ob-shake-kf,ob-pulse-kf,ob-modal-kf
```

- [ ] **Step 6: Remover a keyframe morta da página do `Table`**

Em `project/ds/components/components-table.html`, apague a linha (o `<style>` injetado pelo bundle entra depois no `<head>` e já vencia esta definição):

```css
  @keyframes ob-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
```

```bash
grep -rn "ob-prim-kf\|ob-pulse {" src ../ds/components; grep -c "ob-pulse" ../ds/components/components-table.html
```

Esperado: primeiro `grep` sem saída; contagem `0`.

- [ ] **Step 7: Verificação**

```bash
npm run verify
```

Esperado: exit 0, `21/21 smokes ok`.

- [ ] **Step 8: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add project/package/src/internal/keyframes.ts project/package/src/primitives/Spinner/Spinner.tsx project/package/src/components/SearchInput/SearchInput.tsx project/package/src/components/Table/Table.tsx project/package/scripts/fixtures/injected-styles.json project/ds/components/components-table.html
git commit -m "refactor: consolida as keyframes ob-spin e ob-pulse"
```

---

### Task 5: Comentários do pacote que citam o UI kit antigo (JS emitido idêntico)

**Files:**
- Modify: `project/package/src/browser.ts`
- Modify: `project/package/src/components/obTones.ts`
- Modify: `project/package/src/components/obToastPos.ts`
- Modify: `project/package/src/primitives/badgeTones.ts`
- Modify: `project/package/src/components/ToastStack/ToastStack.tsx`
- Modify: `project/package/tsup.config.ts`

**Interfaces:**
- Produces: nenhuma mudança de API nem de JS emitido (provado por `cmp`).

- [ ] **Step 1: Guardar o build de antes**

```bash
cd project/package && npm run build >/dev/null
T=$(mktemp -d) && cp dist/index.js dist/index.cjs dist/onblide-ui.browser.js "$T/" && echo "$T"
```

- [ ] **Step 2: Editar os comentários**

Em `project/package/src/browser.ts`, substitua:

```ts
// Built as a standalone IIFE (see tsup.config.ts). Re-exporting everything
// from `index` and assigning it onto `window` reproduces exactly what
// `Object.assign(window, { Checkbox, Modal, ... })` does today in
// Components.jsx/Primitives.jsx — so ds/components/*.html pages that
// reference `Checkbox`, `Button`, etc. as bare globals keep working once
// their <script type="text/babel" src="..."> tag is swapped for this file.
```

por:

```ts
// Bundle IIFE de navegador (ver tsup.config.ts). Reexporta tudo de `index` e
// atribui a `window`, para que as páginas de preview (ds/components/*.html) e o
// web app (ui_kits/web_app/) usem `Button`, `Modal`, `Icons`, `Logo`... como
// globais nos seus scripts text/babel.
```

Em `project/package/src/components/obTones.ts`, substitua:

```ts
// Tabela de tons compartilhada por Alert, Toast e ProgressBar (o original em
// Components.jsx define isso uma vez, solto no meio do arquivo, e os três
// componentes leem dali — este arquivo é essa mesma tabela isolada, não uma
// abstração nova). `icon` é o nome de um ícone Phosphor (string), consumido
// via <Ph n={t.icon} .../> — não uma referência ao objeto `Icons`.
```

por:

```ts
// Tabela de tons compartilhada por Alert, Toast e ProgressBar. `icon` é o nome
// de um ícone Phosphor (string), consumido via <Ph n={t.icon} .../> — não uma
// referência ao objeto `Icons`.
```

Em `project/package/src/components/obToastPos.ts`, substitua:

```ts
// Tabela de âncoras de posição usada só por ToastStack (o original define
// isso solto em Components.jsx, logo antes de ToastStack — este arquivo é
// essa mesma tabela isolada).
```

por:

```ts
// Tabela de âncoras de posição usada só por ToastStack.
```

Em `project/package/src/primitives/badgeTones.ts`, substitua:

```ts
// Tabela de tons compartilhada por StatusDot e Badge (o original em
// Primitives.jsx define isso uma vez, solto no meio do arquivo, e os dois
// componentes leem dali — este arquivo é essa mesma tabela isolada, não uma
// abstração nova).
```

por:

```ts
// Tabela de tons compartilhada por StatusDot e Badge.
```

Em `project/package/src/components/ToastStack/ToastStack.tsx`, substitua:

```tsx
// Guard de `typeof window !== 'undefined'` NÃO existe no original (que só
// roda em navegador via Babel) — é necessário aqui porque este módulo agora
// também é importado sob Node (o smoke script desta tarefa), onde `window`
// não existe. Sem impacto de comportamento no navegador (window sempre
// existe lá); ver Global Constraints.
```

por:

```tsx
// O guard de `typeof window` permite importar o pacote em Node (SSR e os
// smokes), onde `window` não existe; no navegador ele sempre passa.
```

Em `project/package/tsup.config.ts`, substitua:

```ts
// globals (loaded via <script src=unpkg react...> on the preview pages) instead
```

por:

```ts
// globals (loaded via <script src=unpkg react...> on the preview pages and the
// web app) instead
```

e substitua:

```ts
    // Browser-global compatibility bundle for the existing ds/components/*.html
    // preview pages.
```

por:

```ts
    // Browser-global bundle for the ds/components/*.html preview pages and the
    // web app (ui_kits/web_app/).
```

- [ ] **Step 3: JS emitido idêntico e varredura**

```bash
npm run build >/dev/null
cmp dist/index.js "$T/index.js" && cmp dist/index.cjs "$T/index.cjs" && cmp dist/onblide-ui.browser.js "$T/onblide-ui.browser.js" && echo IDENTICO
rm -rf "$T"
grep -rn -E "Components\.jsx|Primitives\.jsx|SearchInput\.jsx|via Babel|no original|o original" src tsup.config.ts
```

Esperado: `IDENTICO`; o `grep` sem saída. (Continuam de propósito: "forma frouxa (idêntica à `SelectProps`/`SliderProps` original)" em `Select.tsx`/`Slider.tsx` e o cabeçalho de `tokens.css`, que não falam do legado — o padrão acima não os pega.)

- [ ] **Step 4: Verificação e commit**

```bash
npm run verify
cd "$(git rev-parse --show-toplevel)"
git add project/package/src/browser.ts project/package/src/components/obTones.ts project/package/src/components/obToastPos.ts project/package/src/primitives/badgeTones.ts project/package/src/components/ToastStack/ToastStack.tsx project/package/tsup.config.ts
git commit -m "refactor(package): remove comentários que citam o ui kit antigo"
```

Esperado: `verify` exit 0, `21/21 smokes ok`.

---

### Task 6: O web app carrega os componentes do `@onblide/ui`

**Files:**
- Create: `project/package/scripts/smoke-web-app.mjs`
- Modify: `project/ui_kits/web_app/index.html`
- Modify: `project/ui_kits/web_app/Chrome.jsx:1`
- Modify: `project/ui_kits/web_app/Screens.jsx:3`

**Interfaces:**
- Consumes: `window.Logo` (Tarefa 2), `window.obToast` e todos os globais do bundle IIFE.
- Produces: `index.html` carrega `<script src="../../package/dist/onblide-ui.browser.js"></script>` logo depois do Babel standalone e não carrega mais `Primitives.jsx`/`Components.jsx` (os arquivos ainda existem até a Tarefa 7). Smoke `smoke-web-app.mjs` que a Tarefa 7 usa para provar que apagar o legado não quebra o app.

- [ ] **Step 1: Escrever o smoke**

Crie `project/package/scripts/smoke-web-app.mjs`:

```js
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
```

- [ ] **Step 2: Vermelho**

```bash
cd project/package && npm run build >/dev/null && node scripts/smoke-web-app.mjs
```

Esperado: `FAIL: index.html deveria carregar ../../package/dist/onblide-ui.browser.js` (exit 1).

- [ ] **Step 3: Trocar o carregamento no `index.html`**

Em `project/ui_kits/web_app/index.html`, substitua:

```html
crossorigin="anonymous"></script>

  <script type="text/babel" src="Primitives.jsx"></script>
  <script type="text/babel" src="Components.jsx"></script>
```

por:

```html
crossorigin="anonymous"></script>
  <script src="../../package/dist/onblide-ui.browser.js"></script>

```

(O bloco resultante: React UMD, ReactDOM UMD, Babel, bundle, linha em branco, `Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx`, script inline.)

- [ ] **Step 4: Cabeçalhos `/* global */` refletindo o uso real**

Em `project/ui_kits/web_app/Chrome.jsx`, substitua:

```js
/* global React, Logo, Icons, Avatar, Dropdown, Tooltip, SideNav, SearchInput */
```

por:

```js
/* global React, Dropdown, SideNav, SearchInput */
```

Em `project/ui_kits/web_app/Screens.jsx`, substitua:

```js
   Alert, ProgressBar, CodeInput, Tabs, Table */
```

por:

```js
   Alert, ProgressBar, CodeInput, Tabs, Table, Logo */
```

- [ ] **Step 5: Verde + mutação**

```bash
node scripts/smoke-web-app.mjs
```

Esperado: `OK: web app carrega só do bundle; 5 telas, Sidebar e Topbar renderizam`.

Mutação (e reverter): em `Screens.jsx` troque temporariamente `<Logo size={24}/>` por `<LogoX size={24}/>`; `node scripts/smoke-web-app.mjs` deve falhar com `componentes usados pelo web app e não definidos [ 'Screens.jsx: <LogoX>' ]`. Desfaça e confirme `git diff project/ui_kits/web_app/Screens.jsx` mostrando só a linha do cabeçalho.

- [ ] **Step 6: Verificação e commit**

```bash
npm run verify
cd "$(git rev-parse --show-toplevel)"
git add project/package/scripts/smoke-web-app.mjs project/ui_kits/web_app/index.html project/ui_kits/web_app/Chrome.jsx project/ui_kits/web_app/Screens.jsx
git commit -m "feat(web-app): carrega os componentes do @onblide/ui"
```

Esperado: `verify` exit 0, `22/22 smokes ok`.

---

### Task 7: Apagar o UI kit antigo e as referências vivas a ele

**Files:**
- Delete: `project/ui_kits/web_app/Components.jsx`
- Delete: `project/ui_kits/web_app/Primitives.jsx`
- Modify: `project/ui_kits/web_app/README.md`
- Modify: `project/README.md:132,146`
- Modify: `project/SKILL.md:9`

**Interfaces:**
- Consumes: web app já migrado (Tarefa 6); smokes já sem leitura do legado (Tarefa 1).
- Produces: nenhum arquivo versionado cita `Components.jsx`/`Primitives.jsx`, exceto `project/_ds_bundle.js` (Tarefa 8) e `docs/superpowers/` (histórico).

- [ ] **Step 1: Apagar**

```bash
cd "$(git rev-parse --show-toplevel)"
git rm -q project/ui_kits/web_app/Components.jsx project/ui_kits/web_app/Primitives.jsx
```

- [ ] **Step 2: README do web app**

Em `project/ui_kits/web_app/README.md`, substitua:

```markdown
- `index.html` — entry point; sidebar nav switches between screens
- `Primitives.jsx` — `Logo`, `Icons`, `Button`, `Input`, `Badge`, `StatusDot`, `Card`, `Avatar`
- `Chrome.jsx` — `Sidebar`, `Topbar`
- `Screens.jsx` — `HomeScreen`, `TasksScreen`, `MetricsScreen`, `SettingsScreen`
```

por:

```markdown
- `index.html` — ponto de entrada; carrega React/ReactDOM (UMD), o Babel standalone e o bundle
  `../../package/dist/onblide-ui.browser.js` do `@onblide/ui`, que registra os componentes
  (`Button`, `Card`, `Icons`, `Logo`, `Modal`, ...) como globais. O `dist/` é gerado: rode
  `cd project/package && npm install && npm run build` antes de abrir, senão a página fica em branco.
- `Chrome.jsx` — `Sidebar`, `Topbar`
- `Screens.jsx` — `HomeScreen`, `TasksScreen`, `MetricsScreen`, `SettingsScreen`, `IntegrationsScreen`
- `tweaks-panel.jsx` — painel de ajustes do modo de edição (tema, modo de cor, densidade)
```

e substitua:

```markdown
4. **Ajustes (Settings)** — tabbed settings; profile editor + preference toggles
```

por:

```markdown
4. **Ajustes (Settings)** — tabbed settings; profile editor + preference toggles
5. **Integrações (Integrations)** — conexões com serviços externos (marcas, modal de consentimento)
```

- [ ] **Step 3: `project/README.md` e `project/SKILL.md`**

Em `project/README.md`, substitua:

```markdown
centralized behind the `Icons` registry in `ui_kits/web_app/Primitives.jsx` so weight, size, or source can change in one place.
```

por:

```markdown
centralized behind the `Icons` registry of `@onblide/ui` (`package/src/primitives/Icons/Icons.tsx`, built on `Ph`) so weight, size, or source can change in one place.
```

e substitua:

```markdown
The `Logo` component in `ui_kits/web_app/Primitives.jsx` inlines
```

por:

```markdown
The `Logo` component of `@onblide/ui` (`package/src/primitives/Logo/Logo.tsx`) inlines
```

Em `project/SKILL.md`, substitua:

```markdown
is a click-through reference — copy its primitives (`Primitives.jsx`, `Chrome.jsx`) when prototyping app-style interfaces;
```

por:

```markdown
is a click-through reference built on `@onblide/ui` (`package/`) — reuse the package's components (load `package/dist/onblide-ui.browser.js` after `npm run build`, as the app does) and copy `Chrome.jsx` when prototyping app-style interfaces;
```

- [ ] **Step 4: Verificação (apagar o legado não quebra nada)**

```bash
cd project/package && npm run verify && cd "$(git rev-parse --show-toplevel)"
git grep -nI -E "Components\.jsx|Primitives\.jsx" -- . ':!docs/superpowers' | cut -c1-80
```

Esperado: `verify` exit 0 com `22/22 smokes ok`; o `git grep` lista SÓ linhas de `project/_ds_bundle.js` (removido na Tarefa 8).

- [ ] **Step 5: Commit**

```bash
git add project/ui_kits/web_app/README.md project/README.md project/SKILL.md
git commit -m "refactor(web-app): remove o ui kit antigo em jsx"
```

(Os `git rm` do Step 1 já estão no índice e entram neste commit.)

---

### Task 8: Apagar os snapshots compilados que embutem o UI kit antigo

**Files:**
- Delete: `project/export/Onblide-Web-App-Standalone.html`
- Delete: `project/_ds_bundle.js`
- Modify: `project/README.md:24`

**Interfaces:**
- Consumes: a decisão e a evidência da spec (seção "`project/export/*.html` e `project/_ds_bundle.js`"): o standalone embute `Primitives.jsx`/`Components.jsx` (gzip+base64) e o `_ds_bundle.js` os compila; nenhum dos dois é carregado por nada no repositório; ambos são gerados pelo Claude Design.
- Produces: `export/` só com `Onblide-Slide-Deck.html`; `_ds_manifest.json` e `_adherence.oxlintrc.json` intocados.

- [ ] **Step 1: Confirmar que nada os carrega**

```bash
cd "$(git rev-parse --show-toplevel)"
git grep -nI -E "_ds_bundle|Web-App-Standalone" -- . ':!docs/superpowers' ':!project/_ds_bundle.js'
```

Esperado: sem saída (exit 1).

- [ ] **Step 2: Apagar e ajustar o índice do README**

```bash
git rm -q project/export/Onblide-Web-App-Standalone.html project/_ds_bundle.js
```

Em `project/README.md`, substitua:

```markdown
| `export/` | Standalone, self-contained HTML exports of the web app and slide deck |
```

por:

```markdown
| `export/` | Export HTML autocontido do slide deck (`Onblide-Slide-Deck.html`) |
```

- [ ] **Step 3: Varredura**

```bash
git grep -nI -E "Components\.jsx|Primitives\.jsx|PhIcon|ob-prim-kf|_ds_bundle|Web-App-Standalone" -- . ':!docs/superpowers'
ls project/export
cd project/package && npm run verify
```

Esperado: `git grep` sem saída; `ls` mostra só `Onblide-Slide-Deck.html`; `verify` exit 0, `22/22 smokes ok`.

- [ ] **Step 4: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add project/README.md
git commit -m "chore: remove snapshots compilados que embutiam o ui kit antigo"
```

---

### Task 9: Documentação viva

**Files:**
- Modify: `project/README.md` (índice)
- Modify: `project/SKILL.md:21`
- Modify: `project/CLAUDE.md`
- Modify: `project/package/README.md`

**Interfaces:**
- Consumes: estado final das Tarefas 1–8 (40 exports de runtime; 22 smokes; web app depende do build).

- [ ] **Step 1: Índice do `project/README.md`**

Substitua:

```markdown
| `ui_kits/web_app/` | Click-through dashboard (Início · Tarefas · Métricas · Integrações · Ajustes) with light/dark theme — components live natively in real screens |
```

por:

```markdown
| `package/` | `@onblide/ui` — biblioteca React/TypeScript com todos os componentes, `Icons`, `Brands` e `Logo`; `npm run build` gera `dist/onblide-ui.browser.js`, carregado pelas páginas de `ds/components/` e pelo web app |
| `ui_kits/web_app/` | Click-through dashboard (Início · Tarefas · Métricas · Integrações · Ajustes) with light/dark theme — as telas usam os componentes do `@onblide/ui` (rode o build do pacote antes de abrir) |
```

- [ ] **Step 2: `project/SKILL.md`**

Substitua:

```markdown
`OB_TONES` (info/success/warning/danger)
```

por:

```markdown
tons semânticos `OBTone` (info/success/warning/danger)
```

e substitua:

```markdown
- **Iconography:** Phosphor only
```

por:

```markdown
- **Código:** `@onblide/ui` em `package/` — 40 exports de runtime (componentes, `Icons`, `Brands`, `Logo`, `Ph`), fonte única dos componentes das páginas de preview e do web app; valide com `npm run verify`.
- **Iconography:** Phosphor only
```

- [ ] **Step 3: `project/CLAUDE.md`**

Substitua:

```markdown
5. Centralize icons behind a single icon component/registry (e.g. the `Icons` object in the web-app
   UI kit) so the whole system can change weight, size, or source in one place.
```

por:

```markdown
5. Centralize icons behind a single icon component/registry (e.g. the `Icons` registry of
   `@onblide/ui`, built on `Ph`) so the whole system can change weight, size, or source in one place.
```

Substitua:

```markdown
Para achar a lista atualizada a qualquer momento: `grep -rl onblide-ui.browser.js ds/components/`.
```

por:

```markdown
Para achar a lista atualizada a qualquer momento: `grep -rl onblide-ui.browser.js ds/components/`.

O web app (`ui_kits/web_app/index.html`) também carrega esse bundle, logo depois do Babel
standalone: `Chrome.jsx`, `Screens.jsx` e `tweaks-panel.jsx` usam os componentes do pacote
(`Button`, `Card`, `Icons`, `Logo`, ...) como globais. O pacote é a única fonte dos componentes;
não existe mais um UI kit paralelo em JSX.
```

Substitua:

```markdown
Sem o `dist/` gerado, qualquer uma dessas páginas abre em branco, sem explicação no HTML.
```

por:

```markdown
Sem o `dist/` gerado, qualquer uma dessas páginas — e o web app — abre em branco, sem explicação no HTML.
```

Substitua:

```markdown
  `node scripts/smoke-injected-styles.mjs --update`.
```

por:

```markdown
  `node scripts/smoke-injected-styles.mjs --update`.
- `scripts/smoke-web-app.mjs` executa em Node o bundle e os scripts do web app (JSX transformado pelo
  `esbuild` que vem com o `tsup`) e falha se o app usar um componente que o pacote não exporta.
  `scripts/fixtures/brands.json` e `logo.json` congelam a marcação das marcas e do `Logo`.
```

Substitua:

```markdown
  destruiu o trabalho manual dele. A conferência visual das páginas de preview é do usuário.
```

por:

```markdown
  destruiu o trabalho manual dele. A conferência visual das páginas de preview e do web app é do usuário.
```

- [ ] **Step 4: `project/package/README.md`**

Substitua `### Como bundle de navegador (páginas de preview)` por `### Como bundle de navegador (páginas de preview e web app)`.

Substitua:

```markdown
Os dois existem e nenhum foi removido:
```

por:

```markdown
Os dois existem, e `Icons` é construído sobre `Ph`:
```

Substitua:

```markdown
padrão 20; a cor vem de `style`. Use para
```

por:

```markdown
padrão 20; a cor vem de `style`; a marcação é a mesma de `<Ph n="…" size={20} />`. Use para
```

Substitua:

```markdown
## Efeitos colaterais no import
```

por:

```markdown
## Marca

`<Logo />` renderiza o lockup horizontal da marca (SVG inline, cores pelos tokens `--ob-*`, então
acompanha o tema claro/escuro). `size` é a altura em px (padrão 28). As demais variantes (empilhada,
símbolo, em arquivo) ficam em `project/assets/`.

## Efeitos colaterais no import
```

- [ ] **Step 5: Conferência e commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git grep -nI -E "Components\.jsx|Primitives\.jsx|object in the web-app|nenhum foi removido|\`OB_TONES\` \(info" -- project/README.md project/SKILL.md project/CLAUDE.md project/package/README.md
git add project/README.md project/SKILL.md project/CLAUDE.md project/package/README.md
git commit -m "docs: atualiza readme, skill e claude.md para o web app sobre o @onblide/ui"
```

Esperado: `git grep` sem saída.

---

### Task 10: Verificação final (sem commit)

**Files:** nenhum (se algo falhar, corrigir na tarefa dona e voltar aqui).

**Interfaces:**
- Consumes: tudo das Tarefas 1–9.

- [ ] **Step 1: Reinstalação limpa e verificação completa**

```bash
cd project/package
rm -rf node_modules dist && npm ci
npm run verify
git status --short
```

Esperado: exit 0 nos quatro passos e `22/22 smokes ok`; `git status` limpo (`npm ci` não altera o `package-lock.json`).

- [ ] **Step 2: Superfície e varreduras**

```bash
node -e "import('./dist/index.js').then(m => console.log(Object.keys(m).length, 'Logo' in m, 'PhIcon' in m, 'OB_TONES' in m))"
tail -c 5000 dist/index.d.ts | grep -oE "\bLogoProps\b|\bLogo\b" | sort -u
cd "$(git rev-parse --show-toplevel)"
git grep -nI -E "Components\.jsx|Primitives\.jsx|PhIcon|ob-prim-kf|_ds_bundle|Web-App-Standalone" -- . ':!docs/superpowers'
git grep -nI -i "legado" -- project/package project/ui_kits
git grep -l onblide-ui.browser.js -- project/ds/components | wc -l
git grep -l onblide-ui.browser.js -- project/ui_kits
ls project/ui_kits/web_app project/export
```

Esperado: `40 true false false`; `Logo` e `LogoProps`; os dois `git grep` de varredura sem saída; `27`; `project/ui_kits/web_app/index.html`; `web_app` com `Chrome.jsx index.html README.md Screens.jsx tweaks-panel.jsx`; `export` só com `Onblide-Slide-Deck.html`.

- [ ] **Step 3: Histórico**

```bash
git log --oneline -9
```

Esperado: os 9 commits das Tarefas 1–9, nenhum com linha `Claude-Session:`, nenhum tocando `package-lock.json` (`git log -9 --stat -- project/package/package-lock.json` vazio).

---

### Task 11: Conferência visual — **do controlador**

**Esta tarefa NÃO é despachada para subagente.** É feita pelo controlador (quem executa o plano), por instrução explícita do usuário para esta fase, com a extensão do Chrome (`mcp__claude-in-chrome__*`) numa **aba nova** da sessão do usuário. Nunca fechar, encerrar ou reiniciar o navegador, nunca `taskkill`/`Stop-Process`, nunca headless; fechar só a aba que abriu. Se a extensão não estiver conectada, parar e pedir ao usuário que faça a conferência pelo roteiro abaixo.

**Files:** nenhum.

- [ ] **Step 1: Servir `project/` por HTTP local**

Com `dist/` gerado (Tarefa 10), iniciar em segundo plano, a partir de `project/`: `python -m http.server 8765` (os scripts `text/babel` com `src` não carregam por `file://`). Encerrar esse servidor (só ele) no fim.

- [ ] **Step 2: Web app — `http://localhost:8765/ui_kits/web_app/index.html`**

- Console sem erros (ler as mensagens do console): nada de `X is not defined`, 404 do bundle ou erro de Babel.
- **Início:** saudação, 4 cartões de métrica, lista de tarefas; marcar uma tarefa como concluída mostra um toast "Concluída" (vem de `window.obToast` do bundle).
- **Sidebar:** recolher/expandir; navegar por Início, Tarefas, Métricas, Integrações, Ajustes; "Documentos"/"Agenda"/"Ajuda" mostram "Em construção".
- **Topbar:** digitar "api" na busca mostra sugestões; o sino abre o dropdown de notificações; o botão "Novo" tem ícone de `+`.
- **Tarefas:** kanban com cartões, tags e avatares; abrir "nova tarefa" (modal), criar uma (toast "Tarefa criada"); filtro de datas (Datepicker); confirmação de exclusão (modal).
- **Métricas:** linhas-esqueleto pulsando durante o carregamento (`ob-pulse`, agora injetada pelo `Table` sob `ob-pulse-kf`); tabela ordenável; paginação — com página no meio aparecem as **duas** reticências (`1 … 5 6 7 … N`), mudança esperada da Fase 3.
- **Integrações:** cartões de marca (`BrandTile`) com as cores certas; clicar em conectar uma marca desconectada abre o modal com **marca → ícone de link → `Logo` da Onblide** (o `Logo` agora vem do pacote; conferir que o lockup aparece inteiro, laranja/azul/tinta); autorizar mostra toast; desconectar mostra toast de aviso.
- **Ajustes:** abas (`Tabs`); alerta de e-mail não verificado — "Reenviar link" fecha e mostra toast; `RadioGroup` de frequência; `Toggle`s alternam com clique e, com Tab + Espaço, mostram o anel de foco (mudança esperada da Fase 3); fluxo de 2FA com `CodeInput` até o toast "2FA ativado".
- Tema: a página abre no tema escuro (`TWEAK_DEFAULTS`); `Logo`, ícones e toasts legíveis.

- [ ] **Step 3: Páginas de preview afetadas por esta fase**

- `ds/components/components-table.html`: estado `loading` com as linhas pulsando (a keyframe da página foi removida; a injetada vale).
- `ds/components/components-spinner.html` e `ds/components/components-search-input.html` (estado carregando): o giro continua (`ob-spin` sob `ob-spin-kf`).
- `ds/components/components-link.html`, `components-pagination.html`, `components-modal.html`: ícones do registro `Icons` (setas, link externo, fechar) com o mesmo tamanho e cor de antes.
- Varredura rápida das 27 páginas de `ds/components/` que carregam o bundle (lista: `git grep -l onblide-ui.browser.js -- project/ds/components`): abrir cada uma e ler o console — nenhum erro.

- [ ] **Step 4: Registrar o resultado**

Relatar ao usuário o que foi conferido e qualquer divergência. Divergência = defeito: corrigir numa tarefa nova (subagente, sem navegador) antes da Tarefa 12. Fechar a aba aberta e encerrar o servidor do Step 1.

---

### Task 12: Release — 0.6.0

**Files:**
- Create: `project/package/.changeset/fase4-remocao-do-legado.md` (consumido pelo `changeset version`)
- Modify: `project/package/package.json` (versão, via `changeset version`)
- Modify: `project/package/CHANGELOG.md`
- Modify: `project/package/package-lock.json` (versão, via `npm install --package-lock-only`)

**Interfaces:**
- Consumes: pacote completo e conferido (Tarefas 1–11). Versão atual `0.5.1`.

- [ ] **Step 1: Changeset escrito à mão**

`npx changeset add` é interativo e não funciona aqui. Crie `project/package/.changeset/fase4-remocao-do-legado.md`:

```markdown
---
"@onblide/ui": minor
---

Fase 4 (remoção do UI kit antigo). Novo: `Logo` (lockup horizontal da marca em SVG inline, cores pelos tokens `--ob-*`; `size` é a altura em px, padrão 28) e o tipo `LogoProps`. O web app (`project/ui_kits/web_app/`) passa a usar só este pacote, pelo bundle de navegador. Mudanças internas sem efeito visual: `Icons` é construído sobre `Ph` — o `<i>` de cada ícone ganha `color: currentColor` inline (a mesma cor herdada de antes) e `aria-hidden` passa a vir antes de `style`; as keyframes compartilhadas foram consolidadas — o `<style id="ob-prim-kf">` deu lugar a `ob-spin-kf` (injetado uma vez, usado por `Spinner` e `SearchInput`) e `ob-pulse-kf` (injetado pelo `Table`), com as mesmas regras `@keyframes`. Infra: os smokes de marcas e do `Logo` leem fixtures congeladas em `scripts/fixtures/`; novo `scripts/smoke-web-app.mjs` confere, sem navegador, que o web app roda só com o bundle.
```

- [ ] **Step 2: Bump e lockfile sincronizado**

```bash
cd project/package
npx changeset version
npm install --package-lock-only
git diff --stat
```

Esperado: `package.json` e `package-lock.json` de `0.5.1` para `0.6.0` (o diff do lockfile é só o campo `version`, nas duas ocorrências da raiz); `CHANGELOG.md` com `## 0.6.0` / `### Minor Changes` e o texto acima; o arquivo de changeset apagado.

- [ ] **Step 3: Verificação**

```bash
npm run verify
```

Esperado: exit 0, `22/22 smokes ok`.

- [ ] **Step 4: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add project/package/package.json project/package/package-lock.json project/package/CHANGELOG.md project/package/.changeset
git commit -m "chore(package): libera @onblide/ui 0.6.0"
```

Tag (`v0.6.0` ou o padrão das anteriores) e `git push` são do controlador, depois desta tarefa.

---

## After this plan

O repositório fica sem o UI kit antigo: o web app e as 27 páginas de preview usam só `@onblide/ui`. Pendências fora das tarefas: tag/push da `0.6.0` (controlador), merge `dev`→`main` e o `/design-sync` (decisões do usuário; o `/design-sync` recria o `_ds_bundle.js` a partir das fontes vivas), e, se o usuário quiser, regerar pelo Claude Design um standalone do web app migrado. Candidatos a próxima rodada (spec, "Fora do escopo"): `<i class="ph …">` direto em `Chip`/`SearchInput`/`DeadlineCalendar`, compilar as telas do web app sem Babel no navegador.
