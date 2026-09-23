# @onblide/ui Fase 2 — Lote C (Icons, Brands, Link, Pagination, Modal + limpezas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar o que sobra dos primitivos e componentes legados (`Icons`, `Brands`, `BrandTile`, `Link`, `Pagination`, `Modal`), migrar as 3 últimas páginas de preview que ainda carregam os scripts antigos, aplicar as limpezas adiadas dos Lotes A e B (helper `injectStyleOnce`, tipos de `Table`/`Select`, script `smoke`) e liberar a versão `0.4.0`.

**Architecture:** A mesma dos lotes anteriores — TypeScript real, um componente por arquivo, build via `tsup` (biblioteca + bundle de compatibilidade pro navegador), **`tsup.config.ts` não muda**. Novidades: um diretório interno `src/internal/` (não reexportado) com `injectStyleOnce`, um golden do CSS injetado que protege o refactor, e um arquivo de verificação de tipos (`scripts/types-check.tsx`) compilado dentro de `npm run typecheck`.

**Tech Stack:** O mesmo já em `project/package/` — TypeScript 5, React 18.3.1, tsup, Changesets. Versão atual do pacote: `0.3.1`.

**Spec:** `docs/superpowers/specs/2026-09-23-onblide-ui-fase2-lote-c-design.md`

## Global Constraints

- **NAVEGADOR PROIBIDO — vale para o implementador, o revisor e qualquer subagente, e deve constar em TODO prompt de subagente deste lote:** nenhum agente pode lançar, abrir, fechar ou encerrar Chrome, Edge ou qualquer navegador (nem headless, nem CLI, nem CDP/DevTools, nem `Start-Process`, nem `taskkill`/`Stop-Process` em `msedge`/`chrome`), nem usar as ferramentas `mcp__claude-in-chrome__*`, nem servir páginas com `python -m http.server` para abrir em navegador. Uma verificação headless do Lote B encerrou o navegador do usuário e destruiu o trabalho manual dele (memória `feedback_nao_mexer_no_navegador.md`). Todo passo de "verificação visual no navegador" de planos anteriores foi removido deste plano. Verificação = comparação linha a linha com o original + `tsc --noEmit` + `npm run build` + scripts de smoke em Node (`react-dom/server`).
- Todo componente é um porte estrutural verbatim — zero mudança de comportamento ou visual. Exceções pontuais, sem impacto funcional, documentadas na tarefa que as introduz: (a) `Icons` tipado como `Record<IconName, IconComponent>`; (b) `Pagination` tipa `pages` como `(number | '…')[]` e as props de `Arrow` (que continua sendo um componente interno redefinido a cada render, como no original); (c) `Modal` chama `injectStyleOnce` em vez do bloco inline (mesmo guard, mesmo momento — depende da Tarefa 2); (d) `Link` tipa `variants` como `Record<LinkVariant, React.CSSProperties>`.
- TypeScript estrito (`tsconfig.json` já tem `"strict": true`).
- Nenhum framework de teste novo — verificação por tarefa é `tsc --noEmit`, `tsup build` e um script de smoke em Node.
- Conventional Commits, em português, na branch `dev`, sem rodapé `Claude-Session:` nem qualquer outra atribuição de IA. `project/package/package-lock.json` (ruído local conhecido, fica modificado na árvore) NUNCA entra em commit. Não há amend de commit já publicado (todo o Lote B já está no remoto).
- Módulos internos (`PhIcon`, `injectStyleOnce`, `MODAL_WIDTHS`) NÃO são reexportados em `src/index.ts`. Todo TIPO usado em prop pública precisa estar exportado por `src/index.ts` (lição de `BadgeTone` / `OBTone` / `OBToastPosition`): neste lote todos os tipos públicos moram no mesmo arquivo do componente e saem via `export *`.
- Grupo de destino: `src/primitives/` para o que vem de `Primitives.jsx` (`Icons`, `Brands`, `BrandTile`), `src/components/` para o que vem de `Components.jsx` (`Link`, `Pagination`, `Modal`), `src/internal/` para infraestrutura interna.
- Fora de escopo (não tocar): `Logo`, tipagem single/range do `Slider`, `Chrome.jsx`/`Screens.jsx`/`tweaks-panel.jsx`, `tsup.config.ts`, `src/browser.ts`, remover `Components.jsx`/`Primitives.jsx`, rodar o `/design-sync`.
- Nas 3 páginas migradas: quando todos os componentes usados já estiverem portados, as DUAS tags de script Babel antigas saem por completo; adiciona-se o `<link>` do Phosphor (as três páginas não o carregam, e `Icons.*` ficaria invisível); stubs `window.Icons`/similares só são removidos se a demo não os usar (confirmar por grep — hoje nenhuma das três tem stub).
- Tag e push NÃO fazem parte das tarefas dos subagentes: o controlador faz depois da Tarefa 11.

## Review Focus

- **Tabela de nomes do `Icons` (28 entradas).** Um nome de glifo Phosphor errado renderiza um ícone vazio, sem erro nenhum. O `smoke-icons.mjs` (Tarefa 3) tem uma tabela independente das 28 entradas, e o revisor deve refazer o diff mecânico contra `Primitives.jsx:33-60` (comando na Tarefa 3) — não aceitar o relatório do implementador.
- **Refactor `injectStyleOnce` (Tarefa 2).** O golden da Tarefa 1 tem que continuar idêntico byte a byte, sem ser modificado no diff da Tarefa 2. Conferir: mesmos 8 ids, mesmo momento (nível de módulo), `ToastStack` com dois blocos, a duplicação intencional `ob-spin-kf` (SearchInput) vs `ob-prim-kf` (Spinner) preservada sob ids distintos, e o helper ausente de `dist/index.d.ts`. O revisor roda `node scripts/smoke-injected-styles.mjs` e uma mutação de 1 caractere no golden (restaurando depois) para provar que o smoke pega regressão.
- **`Modal` (Tarefa 7).** Não é portal (nada de `ReactDOM.createPortal`). O `useEffect` de Escape (deps `[open, onClose]`) vem ANTES do `if (!open) return null` — a ordem de hooks tem que ser preservada. Clique no backdrop chama `onClose`, o painel interrompe a propagação. As keyframes `ob-fade`/`ob-pop` (id `ob-modal-kf`) entram no golden byte a byte idênticas a `Components.jsx:287`. Só `open:false → ''`, `open:true` e as larguras são automatizáveis; Escape, backdrop e hover do botão de fechar só a comparação de código cobre.
- **`Pagination` (Tarefa 6) tem um defeito herdado que deve ser PRESERVADO.** `pages = [...new Set(pages)]` também colapsa os dois `'…'` em um só: com reticências dos dois lados (`page=6,total=20`) só a da esquerda aparece (`1 … 5 6 7 20`). Isso já foi confirmado rodando o algoritmo do legado em Node puro. O revisor não deve pedir para "consertar": é decisão para a fase de endurecimento. Também preservar `Arrow` redefinido a cada render.
- **Tipos de `Table`/`Select` (Tarefa 8).** O `types-check.tsx` precisa ficar vermelho contra o código antigo e verde contra o novo (o implementador registra os dois resultados). O corpo do `Select` só muda na desestruturação; `Table` só muda o constraint e os dois acessos `row[col.key]`. `<Select multi={variavelBoolean}/>` deixa de compilar — custo aceito e documentado na spec (sem consumidor TS hoje).

---

## File Structure

```text
project/package/
  package.json                     # scripts: typecheck (2 passos), smoke, verify
  tsconfig.types.json              # NOVO — só compila scripts/types-check.tsx
  scripts/
    types-check.tsx                # NOVO — verificação de tipos (@ts-expect-error)
    run-smokes.mjs                 # NOVO — roda todos os smoke-*.mjs
    smoke-injected-styles.mjs      # NOVO — compara CSS injetado com o golden
    smoke-icons.mjs  smoke-brands.mjs  smoke-link.mjs
    smoke-pagination.mjs  smoke-modal.mjs          # NOVOS
    lib/injected-styles.mjs        # NOVO — coletor com `document` falso
    fixtures/injected-styles.json  # NOVO — golden (8 → 9 estilos)
  src/
    internal/injectStyleOnce.ts    # NOVO — helper interno (não exportado)
    primitives/
      Icons/PhIcon.tsx             # NOVO — interno (não exportado)
      Icons/Icons.tsx              # NOVO — Icons, IconProps, IconName, IconComponent
      Brands/Brands.tsx            # NOVO — Brands, Brand, BrandKey
      BrandTile/BrandTile.tsx      # NOVO — BrandTile, BrandTileProps
    components/
      Link/Link.tsx                # NOVO
      Pagination/Pagination.tsx    # NOVO
      Modal/Modal.tsx              # NOVO
      (Table, Select, CodeInput, ProgressBar, SearchInput, Skeleton,
       Tooltip, ToastStack, Spinner: editados nas Tarefas 2 e 8)
project/ds/components/
  components-link.html  components-pagination.html  components-modal.html   # migradas
project/CLAUDE.md                  # contagem de páginas 24 → 27 (Tarefa 10)
```

---

### Task 1: Golden do CSS injetado (guarda de regressão do refactor)

**Files:**
- Create: `project/package/scripts/lib/injected-styles.mjs`
- Create: `project/package/scripts/smoke-injected-styles.mjs`
- Create: `project/package/scripts/fixtures/injected-styles.json` (gerado pelo próprio smoke, `--update`)

**Interfaces:**
- Produces: `collectInjectedStyles(distIndexUrl: URL): Promise<Record<string, string>>` (id do `<style>` → CSS), e o smoke `smoke-injected-styles.mjs` que compara essa coleta com o golden (`--update` regrava o golden). A Tarefa 2 depende de este golden estar capturado ANTES do refactor; a Tarefa 7 acrescenta uma chave a ele.

Esta tarefa só captura o comportamento ATUAL. Nenhum código de `src/` muda.

- [ ] **Step 1: Confirmar que `dist/` reflete o código atual**

A partir de `project/package/`: `npm run build`
Esperado: sucesso.

- [ ] **Step 2: Escrever o coletor**

```js
// project/package/scripts/lib/injected-styles.mjs
//
// Coleta todos os <style> que os módulos da biblioteca injetam ao serem
// importados, usando um `document` falso mínimo. Precisa rodar num processo
// Node limpo: o import de dist/index.js é cacheado por processo.
export async function collectInjectedStyles(distIndexUrl) {
  const injected = new Map();
  globalThis.document = {
    getElementById: (id) => (injected.has(id) ? { id } : null),
    createElement: () => ({ id: '', textContent: '' }),
    head: { appendChild: (el) => { injected.set(el.id, el.textContent); } },
  };
  try {
    await import(distIndexUrl.href);
  } finally {
    delete globalThis.document;
  }
  return Object.fromEntries([...injected.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
```

- [ ] **Step 3: Escrever o smoke**

```js
// project/package/scripts/smoke-injected-styles.mjs
//
// Guarda de regressão do CSS injetado pelos componentes (keyframes etc.):
// compara os <style> coletados de dist/index.js com o golden versionado em
// scripts/fixtures/injected-styles.json. Qualquer mudança no CSS ou nos ids
// de guarda precisa atualizar o golden de propósito:
//   node scripts/smoke-injected-styles.mjs --update
import { readFileSync, writeFileSync } from 'node:fs';
import { collectInjectedStyles } from './lib/injected-styles.mjs';

const goldenUrl = new URL('./fixtures/injected-styles.json', import.meta.url);
const atual = await collectInjectedStyles(new URL('../dist/index.js', import.meta.url));

if (process.argv.includes('--update')) {
  writeFileSync(goldenUrl, JSON.stringify(atual, null, 2) + '\n');
  console.log(`golden atualizado: ${Object.keys(atual).length} estilos`);
  process.exit(0);
}

const golden = JSON.parse(readFileSync(goldenUrl, 'utf8'));
let diffs = 0;
for (const id of [...new Set([...Object.keys(golden), ...Object.keys(atual)])].sort()) {
  if (golden[id] === undefined) {
    console.error(`FAIL: estilo novo não registrado no golden: ${id}`);
    diffs++;
  } else if (atual[id] === undefined) {
    console.error(`FAIL: estilo sumiu: ${id}`);
    diffs++;
  } else if (golden[id] !== atual[id]) {
    console.error(`FAIL: CSS diferente para ${id}\n  golden: ${golden[id]}\n  atual:  ${atual[id]}`);
    diffs++;
  }
}
if (diffs) process.exit(1);
console.log(`OK: ${Object.keys(atual).length} estilos injetados idênticos ao golden`);
```

- [ ] **Step 4: Gerar o golden a partir do código ATUAL**

Rodar (a partir de `project/package/`, com `dist/` do Step 1):

```bash
mkdir -p scripts/fixtures
node scripts/smoke-injected-styles.mjs --update
```

Esperado: `golden atualizado: 8 estilos`.

- [ ] **Step 5: Conferir o conteúdo do golden**

`scripts/fixtures/injected-styles.json` deve ter EXATAMENTE estas 8 chaves (ordem alfabética), cada uma igual ao CSS do bloco de origem em `src/`:

| id | origem atual |
|---|---|
| `ob-indet-kf` | `src/components/ProgressBar/ProgressBar.tsx` (bloco `injeta a keyframe do modo indeterminado`) |
| `ob-prim-kf` | `src/primitives/Spinner/Spinner.tsx` (ob-spin + ob-pulse) |
| `ob-shake-kf` | `src/components/CodeInput/CodeInput.tsx` |
| `ob-skeleton-kf` | `src/components/Skeleton/Skeleton.tsx` |
| `ob-spin-kf` | `src/components/SearchInput/SearchInput.tsx` |
| `ob-tip-kf` | `src/components/Tooltip/Tooltip.tsx` |
| `ob-toast-kf` | `src/components/ToastStack/ToastStack.tsx` (4 keyframes juntas, sem separador) |
| `ob-toast-pos` | `src/components/ToastStack/ToastStack.tsx` (media query mobile, sem separador) |

Rodar `node scripts/smoke-injected-styles.mjs`.
Esperado: `OK: 8 estilos injetados idênticos ao golden`.

- [ ] **Step 6: Commit**

```bash
git add project/package/scripts/lib/injected-styles.mjs project/package/scripts/smoke-injected-styles.mjs project/package/scripts/fixtures/injected-styles.json
git commit -m "test: adiciona golden do css injetado pelos componentes"
```

---

### Task 2: `injectStyleOnce` — trocar os 8 blocos repetidos de injeção de `<style>`

**Files:**
- Create: `project/package/src/internal/injectStyleOnce.ts`
- Modify: `project/package/src/components/CodeInput/CodeInput.tsx`
- Modify: `project/package/src/components/ProgressBar/ProgressBar.tsx`
- Modify: `project/package/src/components/SearchInput/SearchInput.tsx`
- Modify: `project/package/src/components/Skeleton/Skeleton.tsx`
- Modify: `project/package/src/components/Tooltip/Tooltip.tsx`
- Modify: `project/package/src/components/ToastStack/ToastStack.tsx`
- Modify: `project/package/src/primitives/Spinner/Spinner.tsx`

**Interfaces:**
- Produces: `injectStyleOnce(id: string, css: string): void` em `src/internal/injectStyleOnce.ts` — NÃO exportado por `index.ts`. A Tarefa 7 (`Modal`) o consome.
- Consumes: o golden da Tarefa 1, que NÃO pode ser modificado por esta tarefa.

Refactor puro: mesmo guard (`typeof document`, `getElementById`), mesmo momento (nível de módulo), mesmos ids, mesmas strings CSS, byte a byte.

- [ ] **Step 1: Escrever o helper**

```ts
// project/package/src/internal/injectStyleOnce.ts
//
// Injeta um <style id=...> uma única vez no <head>. É exatamente o bloco que
// antes se repetia em cada componente com keyframes:
//   if (typeof document !== 'undefined' && !document.getElementById(id)) { ... }
// Módulo interno: NÃO é reexportado em src/index.ts.
export function injectStyleOnce(id: string, css: string): void {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const st = document.createElement('style');
  st.id = id;
  st.textContent = css;
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Em cada um dos 7 arquivos, adicionar o import e trocar o(s) bloco(s)**

Em TODOS os 7 arquivos, logo após a última linha `import ...` (todas são de uma linha só nesses arquivos), adicionar:

```ts
import { injectStyleOnce } from '../../internal/injectStyleOnce';
```

(o caminho relativo é `../../internal/injectStyleOnce` nos sete, porque todos estão a dois níveis de `src/`). Comentários que já existem acima de cada bloco ficam como estão. Depois trocar cada bloco pelo equivalente abaixo — o texto "de" tem que ocorrer exatamente uma vez no arquivo.

**`CodeInput.tsx`** — de:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-shake-kf')) {
  const st = document.createElement('style'); st.id = 'ob-shake-kf';
  st.textContent = '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}';
  document.head.appendChild(st);
}
```

para:

```ts
injectStyleOnce(
  'ob-shake-kf',
  '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}',
);
```

**`ProgressBar.tsx`** — de:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-indet-kf')) {
  const st = document.createElement('style'); st.id = 'ob-indet-kf';
  st.textContent = '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}';
  document.head.appendChild(st);
}
```

para:

```ts
injectStyleOnce(
  'ob-indet-kf',
  '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}',
);
```

**`SearchInput.tsx`** — de:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-spin-kf')) {
  const st = document.createElement('style'); st.id = 'ob-spin-kf';
  st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}
```

para:

```ts
injectStyleOnce('ob-spin-kf', '@keyframes ob-spin{to{transform:rotate(360deg)}}');
```

**`Skeleton.tsx`** — de:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-skeleton-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-skeleton-kf';
  st.textContent = '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
  document.head.appendChild(st);
}
```

para:

```ts
injectStyleOnce(
  'ob-skeleton-kf',
  '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }',
);
```

**`Tooltip.tsx`** — de:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-tip-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-tip-kf';
  st.textContent = '@keyframes ob-tip { from { opacity: 0; } }';
  document.head.appendChild(st);
}
```

para:

```ts
injectStyleOnce('ob-tip-kf', '@keyframes ob-tip { from { opacity: 0; } }');
```

**`Spinner.tsx`** — de:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-prim-kf')) {
  const st = document.createElement('style'); st.id = 'ob-prim-kf';
  st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(st);
}
```

para:

```ts
injectStyleOnce(
  'ob-prim-kf',
  '@keyframes ob-spin{to{transform:rotate(360deg)}}@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
);
```

**`ToastStack.tsx`** — os DOIS blocos consecutivos, trocados de uma vez. De:

```ts
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-kf')) {
  const st = document.createElement('style'); st.id = 'ob-toast-kf';
  st.textContent = [
    '@keyframes ob-toast-in-top{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes ob-toast-out-top{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-16px)}}',
    '@keyframes ob-toast-in-bottom{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes ob-toast-out-bottom{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}',
  ].join('');
  document.head.appendChild(st);
}
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-pos')) {
  const sp = document.createElement('style'); sp.id = 'ob-toast-pos';
  sp.textContent = [
    '@media(max-width:600px){',
    '#ob-toast-stack{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:calc(100vw - 24px)!important;align-items:stretch!important}',
    '#ob-toast-stack[data-pos^="top"]{top:16px!important;bottom:auto!important;flex-direction:column-reverse!important}',
    '#ob-toast-stack[data-pos^="bottom"]{bottom:16px!important;top:auto!important;flex-direction:column!important}',
    '}',
  ].join('');
  document.head.appendChild(sp);
}
```

para:

```ts
injectStyleOnce('ob-toast-kf', [
  '@keyframes ob-toast-in-top{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ob-toast-out-top{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-16px)}}',
  '@keyframes ob-toast-in-bottom{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ob-toast-out-bottom{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}',
].join(''));
injectStyleOnce('ob-toast-pos', [
  '@media(max-width:600px){',
  '#ob-toast-stack{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:calc(100vw - 24px)!important;align-items:stretch!important}',
  '#ob-toast-stack[data-pos^="top"]{top:16px!important;bottom:auto!important;flex-direction:column-reverse!important}',
  '#ob-toast-stack[data-pos^="bottom"]{bottom:16px!important;top:auto!important;flex-direction:column!important}',
  '}',
].join(''));
```

Depois desta troca não pode sobrar nenhum `document.getElementById('ob-` em `src/` fora de `src/internal/injectStyleOnce.ts`:

```bash
grep -rn "getElementById" project/package/src
```

Esperado: só `src/internal/injectStyleOnce.ts`.

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam.

- [ ] **Step 4: O golden tem que continuar IDÊNTICO**

Rodar: `node scripts/smoke-injected-styles.mjs`
Esperado: `OK: 8 estilos injetados idênticos ao golden`. Se falhar, a troca mudou um id, uma string CSS ou o momento de execução: corrigir o código (NUNCA regravar o golden nesta tarefa).

- [ ] **Step 5: Todos os smokes anteriores continuam passando**

```bash
for s in scripts/smoke-*.mjs; do node "$s" > /dev/null || { echo "FALHOU: $s"; exit 1; }; done && echo "todos ok"
```

Esperado: `todos ok`.

- [ ] **Step 6: Conferir o que mudou e o que não pode ter mudado**

```bash
git status --porcelain
```

Esperado: exatamente os 7 arquivos modificados + `src/internal/injectStyleOnce.ts` novo (além do `package-lock.json`, que fica de fora). `scripts/fixtures/injected-styles.json` NÃO aparece. E `grep -c injectStyleOnce dist/index.d.ts` retorna `0` (o helper não vaza para a superfície pública).

- [ ] **Step 7: Commit**

```bash
git add project/package/src/internal/injectStyleOnce.ts project/package/src/components/CodeInput/CodeInput.tsx project/package/src/components/ProgressBar/ProgressBar.tsx project/package/src/components/SearchInput/SearchInput.tsx project/package/src/components/Skeleton/Skeleton.tsx project/package/src/components/Tooltip/Tooltip.tsx project/package/src/components/ToastStack/ToastStack.tsx project/package/src/primitives/Spinner/Spinner.tsx
git commit -m "refactor: extrai injectStyleOnce dos blocos de injeção de css"
```

---

### Task 3: Portar `Icons` (+ `PhIcon` interno)

**Files:**
- Create: `project/package/src/primitives/Icons/PhIcon.tsx`
- Create: `project/package/src/primitives/Icons/Icons.tsx`
- Create: `project/package/scripts/smoke-icons.mjs`
- Modify: `project/package/src/index.ts`
- Source: `project/ui_kits/web_app/Primitives.jsx:28-30` (`PhIcon`), `32-61` (`Icons`, 28 entradas)

**Interfaces:**
- Produces: `Icons: Record<IconName, IconComponent>`, `IconProps = { size?: number; style?: React.CSSProperties }`, `IconName` (união das 28 chaves), `IconComponent = (p?: IconProps) => React.ReactElement`. Uso legado preservado: `<Icons.check size={12}/>` e `Icons.check({ size: 12 })`. `PhIcon` é interno (NÃO exportado — o legado não o põe em `window`).
- As Tarefas 5, 6 e 7 consomem `Icons` (`arrowSquareOut`, `caretL`/`caretR`, `x`).

- [ ] **Step 1: Escrever `PhIcon.tsx`**

```tsx
// project/package/src/primitives/Icons/PhIcon.tsx
import React from 'react';

export interface PhIconProps {
  /** Nome do glifo Phosphor sem o prefixo, ex.: "house" renderiza ph-house. */
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

// Helper interno de `Icons` — no original (Primitives.jsx:28-30) não é
// exportado para `window`, então também não é reexportado em src/index.ts.
export const PhIcon: React.FC<PhIconProps> = ({ name, size = 20, style = {} }) => (
  <i className={`ph ph-${name}`} style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true"/>
);
```

- [ ] **Step 2: Escrever `Icons.tsx`**

```tsx
// project/package/src/primitives/Icons/Icons.tsx
import React from 'react';
import { PhIcon } from './PhIcon';

export interface IconProps {
  size?: number;
  style?: React.CSSProperties;
}

export type IconName =
  | 'search' | 'house' | 'user' | 'chart' | 'gear' | 'bell' | 'plus' | 'check'
  | 'x' | 'arrowR' | 'caretD' | 'caretL' | 'caretR' | 'folder' | 'file'
  | 'calendar' | 'kanban' | 'bolt' | 'chat' | 'logout' | 'star' | 'heart'
  | 'more' | 'grid' | 'sync' | 'link' | 'info' | 'arrowSquareOut';

export type IconComponent = (p?: IconProps) => React.ReactElement;

export const Icons: Record<IconName, IconComponent> = {
  search:         (p = {}) => <PhIcon name="magnifying-glass"    size={p.size} style={p.style}/>,
  house:          (p = {}) => <PhIcon name="house"               size={p.size} style={p.style}/>,
  user:           (p = {}) => <PhIcon name="user"                size={p.size} style={p.style}/>,
  chart:          (p = {}) => <PhIcon name="chart-line"          size={p.size} style={p.style}/>,
  gear:           (p = {}) => <PhIcon name="gear"                size={p.size} style={p.style}/>,
  bell:           (p = {}) => <PhIcon name="bell"                size={p.size} style={p.style}/>,
  plus:           (p = {}) => <PhIcon name="plus"                size={p.size} style={p.style}/>,
  check:          (p = {}) => <PhIcon name="check"               size={p.size} style={p.style}/>,
  x:              (p = {}) => <PhIcon name="x"                   size={p.size} style={p.style}/>,
  arrowR:         (p = {}) => <PhIcon name="arrow-right"         size={p.size} style={p.style}/>,
  caretD:         (p = {}) => <PhIcon name="caret-down"          size={p.size} style={p.style}/>,
  caretL:         (p = {}) => <PhIcon name="caret-left"          size={p.size} style={p.style}/>,
  caretR:         (p = {}) => <PhIcon name="caret-right"         size={p.size} style={p.style}/>,
  folder:         (p = {}) => <PhIcon name="folder"              size={p.size} style={p.style}/>,
  file:           (p = {}) => <PhIcon name="file"                size={p.size} style={p.style}/>,
  calendar:       (p = {}) => <PhIcon name="calendar"            size={p.size} style={p.style}/>,
  kanban:         (p = {}) => <PhIcon name="kanban"              size={p.size} style={p.style}/>,
  bolt:           (p = {}) => <PhIcon name="lightning"           size={p.size} style={p.style}/>,
  chat:           (p = {}) => <PhIcon name="chat-text"           size={p.size} style={p.style}/>,
  logout:         (p = {}) => <PhIcon name="sign-out"            size={p.size} style={p.style}/>,
  star:           (p = {}) => <PhIcon name="star"                size={p.size} style={p.style}/>,
  heart:          (p = {}) => <PhIcon name="heart"               size={p.size} style={p.style}/>,
  more:           (p = {}) => <PhIcon name="dots-three"          size={p.size} style={p.style}/>,
  grid:           (p = {}) => <PhIcon name="squares-four"        size={p.size} style={p.style}/>,
  sync:           (p = {}) => <PhIcon name="arrows-clockwise"    size={p.size} style={p.style}/>,
  link:           (p = {}) => <PhIcon name="link"                size={p.size} style={p.style}/>,
  info:           (p = {}) => <PhIcon name="info"                size={p.size} style={p.style}/>,
  arrowSquareOut: (p = {}) => <PhIcon name="arrow-square-out"    size={p.size} style={p.style}/>,
};
```

- [ ] **Step 3: Exportar**

```ts
// project/package/src/index.ts — append (PhIcon NÃO é exportado)
export * from './primitives/Icons/Icons';
```

- [ ] **Step 4: Escrever o smoke**

```js
// project/package/scripts/smoke-icons.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icons } from '../dist/index.js';

// Tabela independente (copiada do legado, Primitives.jsx:33-60): chave da API -> glifo Phosphor.
const esperado = {
  search: 'magnifying-glass', house: 'house', user: 'user', chart: 'chart-line',
  gear: 'gear', bell: 'bell', plus: 'plus', check: 'check', x: 'x',
  arrowR: 'arrow-right', caretD: 'caret-down', caretL: 'caret-left', caretR: 'caret-right',
  folder: 'folder', file: 'file', calendar: 'calendar', kanban: 'kanban',
  bolt: 'lightning', chat: 'chat-text', logout: 'sign-out', star: 'star', heart: 'heart',
  more: 'dots-three', grid: 'squares-four', sync: 'arrows-clockwise', link: 'link',
  info: 'info', arrowSquareOut: 'arrow-square-out',
};

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const chaves = Object.keys(esperado).sort().join(',');
const reais = Object.keys(Icons).sort().join(',');
if (chaves !== reais) fail('conjunto de chaves de Icons difere do legado', { esperado: chaves, reais });
if (Object.keys(esperado).length !== 28) fail('a tabela esperada deveria ter 28 ícones');

for (const [chave, glifo] of Object.entries(esperado)) {
  const html = renderToStaticMarkup(Icons[chave]({ size: 18 }));
  if (!html.includes(`class="ph ph-${glifo}"`)) fail(`Icons.${chave} deveria renderizar ph-${glifo}`, html);
  if (!html.includes('font-size:18px')) fail(`Icons.${chave} deveria respeitar size=18`, html);
  if (!html.includes('aria-hidden="true"')) fail(`Icons.${chave} deveria ser aria-hidden`, html);
}

// Uso como componente JSX (Icons.check com props vazias) -> tamanho padrão 20.
const padrao = renderToStaticMarkup(React.createElement(Icons.check));
if (!padrao.includes('font-size:20px')) fail('tamanho padrão deveria ser 20px', padrao);

// style repassado e mesclado depois dos estilos base.
const comStyle = renderToStaticMarkup(Icons.plus({ size: 12, style: { color: 'red' } }));
if (!comStyle.includes('color:red') || !comStyle.includes('font-size:12px')) fail('style/size não repassados', comStyle);

console.log('OK: 28 ícones mapeiam para os glifos Phosphor esperados');
```

- [ ] **Step 5: Typecheck, build e smoke**

Rodar: `npm run typecheck && npm run build && node scripts/smoke-icons.mjs`
Esperado: tudo passa; smoke imprime `OK: 28 ícones mapeiam para os glifos Phosphor esperados`. Em `dist/index.d.ts`: `Icons`, `IconProps`, `IconName` e `IconComponent` aparecem no `export { ... }` final; `PhIcon` NÃO aparece.

- [ ] **Step 6: Diff mecânico da tabela de nomes contra o legado**

```bash
sed -n 33,60p project/ui_kits/web_app/Primitives.jsx | sed -E 's/^ *([A-Za-z]+): *\(p=\{\}\) => <PhIcon name="([^"]+)".*/\1=\2/' > /tmp/icons-legacy.txt
sed -n '/^export const Icons/,/^};/p' project/package/src/primitives/Icons/Icons.tsx | grep "PhIcon name" | sed -E 's/^ *([A-Za-z]+): *\(p = \{\}\) => <PhIcon name="([^"]+)".*/\1=\2/' > /tmp/icons-new.txt
wc -l /tmp/icons-legacy.txt /tmp/icons-new.txt
diff /tmp/icons-legacy.txt /tmp/icons-new.txt && echo "TABELA IDENTICA"
```

Esperado: 28 linhas em cada arquivo e `TABELA IDENTICA`.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/primitives/Icons project/package/scripts/smoke-icons.mjs project/package/src/index.ts
git commit -m "feat(icons): porta Icons para @onblide/ui"
```

---

### Task 4: Portar `Brands` e `BrandTile`

**Files:**
- Create: `project/package/src/primitives/Brands/Brands.tsx`
- Create: `project/package/src/primitives/BrandTile/BrandTile.tsx`
- Create: `project/package/scripts/smoke-brands.mjs`
- Modify: `project/package/src/index.ts`
- Source: `project/ui_kits/web_app/Primitives.jsx:69-150` (`Brands`), `154-166` (`BrandTile`)

**Interfaces:**
- Produces: `Brands: Record<BrandKey, Brand>`, `Brand = { name; hex; cat; desc: string; mark: (s: number) => React.ReactElement }`, `BrandKey` (união das 7 marcas), `BrandTile: React.FC<BrandTileProps>`, `BrandTileProps = { brand: BrandKey; size?: number }`. `BrandTile` mantém o `return null` para marca desconhecida (chamadas vindas de JS).

- [ ] **Step 1: Escrever `Brands.tsx`**

```tsx
// project/package/src/primitives/Brands/Brands.tsx
import React from 'react';

export type BrandKey = 'spotify' | 'slack' | 'notion' | 'figma' | 'github' | 'dropbox' | 'discord';

export interface Brand {
  name: string;
  hex: string;
  cat: string;
  desc: string;
  mark: (s: number) => React.ReactElement;
}

// Logos de marca — reproduções fiéis em SVG, nas cores autênticas de cada
// marca. O webfont do Phosphor não inclui glifos de marca (só o pacote React
// inclui), então estas marcas SVG seguem sendo a abordagem correta.
export const Brands: Record<BrandKey, Brand> = {
  spotify: {
    name: 'Spotify', hex: '#1DB954', cat: 'Mídia',
    desc: 'Sincronize playlists e mostre o que você está ouvindo.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="#1DB954"/>
        <path d="M6 11 C10 8.2 14 8.2 18 11" stroke="#000" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M6.8 13.6 C10 11.4 14 11.4 17.2 13.6" stroke="#000" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
        <path d="M7.7 16 C10.3 14.4 13.7 14.4 16.3 16" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  slack: {
    name: 'Slack', hex: '#611f69', cat: 'Comunicação',
    desc: 'Receba notificações de tarefas e menções no seu canal.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x="3" y="10" width="8" height="4" rx="2" fill="#36C5F0"/>
        <rect x="10" y="13" width="4" height="8" rx="2" fill="#2EB67D"/>
        <rect x="13" y="10" width="8" height="4" rx="2" fill="#ECB22E"/>
        <rect x="10" y="3" width="4" height="8" rx="2" fill="#E01E5A"/>
      </svg>
    ),
  },
  notion: {
    name: 'Notion', hex: '#000000', cat: 'Produtividade',
    desc: 'Exporte documentos e tarefas para suas páginas do Notion.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#000"/>
        <path d="M8 16.5 V8 M8 8 L15.5 16.5 M15.5 16.5 V8" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  figma: {
    name: 'Figma', hex: '#A259FF', cat: 'Design',
    desc: 'Importe frames e mantenha os tokens em sincronia.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 2 H8.5 A3.5 3.5 0 0 0 8.5 9 H12 Z" fill="#F24E1E"/>
        <path d="M12 2 H15.5 A3.5 3.5 0 0 1 15.5 9 H12 Z" fill="#FF7262"/>
        <path d="M12 9 H8.5 A3.5 3.5 0 0 0 8.5 16 H12 Z" fill="#A259FF"/>
        <circle cx="15.5" cy="12.5" r="3.5" fill="#1ABCFE"/>
        <path d="M12 16 H8.5 A3.5 3.5 0 0 0 8.5 23 H12 Z" fill="#0ACF83"/>
      </svg>
    ),
  },
  github: {
    name: 'GitHub', hex: '#181717', cat: 'Desenvolvimento',
    desc: 'Vincule commits e pull requests às tarefas do board.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path fill="#181717" fillRule="evenodd" d="M12 2.2C6.5 2.2 2 6.7 2 12.2c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5 0-5.5-4.5-10-10-10Z"/>
      </svg>
    ),
  },
  dropbox: {
    name: 'Dropbox', hex: '#0061FF', cat: 'Armazenamento',
    desc: 'Anexe arquivos da sua conta diretamente nas tarefas.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <g fill="#0061FF">
          <path d="M6.4 2 L1 5.4 L6.4 8.8 L11.8 5.4 Z"/>
          <path d="M17.2 2 L11.8 5.4 L17.2 8.8 L22.6 5.4 Z"/>
          <path d="M1 12.2 L6.4 8.8 L11.8 12.2 L6.4 15.6 Z"/>
          <path d="M22.6 12.2 L17.2 8.8 L11.8 12.2 L17.2 15.6 Z"/>
          <path d="M6.4 16.7 L11.8 13.3 L17.2 16.7 L11.8 20.1 Z"/>
        </g>
      </svg>
    ),
  },
  discord: {
    name: 'Discord', hex: '#5865F2', cat: 'Comunicação',
    desc: 'Avise sua comunidade quando algo importante acontecer.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path fill="#5865F2" fillRule="evenodd" d="M19.5 5.6a16 16 0 0 0-4-1.3l-.3.5a14 14 0 0 0-4.4 0l-.3-.5a16 16 0 0 0-4 1.3C2 9.8 1.4 13.9 1.7 17.9a16 16 0 0 0 4.9 2.5 12 12 0 0 0 1-1.7c-.6-.2-1.1-.5-1.6-.8l.4-.3a11 11 0 0 0 9.2 0l.4.3c-.5.3-1 .6-1.6.8a12 12 0 0 0 1 1.7 16 16 0 0 0 4.9-2.5c.4-4.6-.7-8.7-2.2-12.3ZM8.4 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/>
      </svg>
    ),
  },
};
```

- [ ] **Step 2: Escrever `BrandTile.tsx`**

```tsx
// project/package/src/primitives/BrandTile/BrandTile.tsx
import React from 'react';
import { Brands, BrandKey } from '../Brands/Brands';

export interface BrandTileProps {
  brand: BrandKey;
  size?: number;
}

// Moldura que emoldura a marca — mantém um fundo claro constante nos dois
// temas para que marcas escuras (GitHub, Notion) continuem legíveis.
export const BrandTile: React.FC<BrandTileProps> = ({ brand, size = 44 }) => {
  const b = Brands[brand];
  if (!b) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 11, background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
    }}>
      {b.mark(Math.round(size * 0.56))}
    </div>
  );
};
```

- [ ] **Step 3: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Brands/Brands';
export * from './primitives/BrandTile/BrandTile';
```

- [ ] **Step 4: Escrever o smoke**

```js
// project/package/scripts/smoke-brands.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Brands, BrandTile } from '../dist/index.js';

// Tabela independente (copiada do legado, Primitives.jsx:70-149).
const esperado = {
  spotify: { name: 'Spotify', hex: '#1DB954', cat: 'Mídia' },
  slack:   { name: 'Slack',   hex: '#611f69', cat: 'Comunicação' },
  notion:  { name: 'Notion',  hex: '#000000', cat: 'Produtividade' },
  figma:   { name: 'Figma',   hex: '#A259FF', cat: 'Design' },
  github:  { name: 'GitHub',  hex: '#181717', cat: 'Desenvolvimento' },
  dropbox: { name: 'Dropbox', hex: '#0061FF', cat: 'Armazenamento' },
  discord: { name: 'Discord', hex: '#5865F2', cat: 'Comunicação' },
};

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

if (Object.keys(Brands).sort().join(',') !== Object.keys(esperado).sort().join(',')) {
  fail('conjunto de marcas difere do legado', Object.keys(Brands));
}

for (const [chave, dados] of Object.entries(esperado)) {
  const b = Brands[chave];
  if (b.name !== dados.name || b.hex !== dados.hex || b.cat !== dados.cat) fail(`dados de ${chave} divergem`, b);
  if (typeof b.desc !== 'string' || b.desc.length === 0) fail(`desc de ${chave} vazia`);
  const svg = renderToStaticMarkup(b.mark(24));
  if (!svg.startsWith('<svg width="24" height="24" viewBox="0 0 24 24">')) fail(`mark(24) de ${chave} com cabeçalho inesperado`, svg);
}

// BrandTile: moldura 44px por padrão e marca em round(44 * 0.56) = 25px.
const tile = renderToStaticMarkup(React.createElement(BrandTile, { brand: 'github' }));
if (!tile.includes('width:44px;height:44px') || !tile.includes('background:#ffffff') || !tile.includes('<svg width="25" height="25"')) {
  fail('BrandTile github deveria ter moldura 44px e marca 25px', tile);
}
const tileGrande = renderToStaticMarkup(React.createElement(BrandTile, { brand: 'figma', size: 100 }));
if (!tileGrande.includes('width:100px;height:100px') || !tileGrande.includes('<svg width="56" height="56"')) {
  fail('BrandTile size=100 deveria ter marca 56px', tileGrande);
}

// Marca desconhecida (chamada vinda de JS) não renderiza nada.
const desconhecida = renderToStaticMarkup(React.createElement(BrandTile, { brand: 'myspace' }));
if (desconhecida !== '') fail('marca desconhecida deveria renderizar vazio', desconhecida);

console.log('OK: 7 marcas + BrandTile');
```

- [ ] **Step 5: Typecheck, build e smoke**

Rodar: `npm run typecheck && npm run build && node scripts/smoke-brands.mjs`
Esperado: tudo passa; `OK: 7 marcas + BrandTile`. Em `dist/index.d.ts`: `Brands`, `Brand`, `BrandKey`, `BrandTile`, `BrandTileProps` no `export { ... }` final.

- [ ] **Step 6: Diff mecânico do bloco das 7 marcas contra o legado**

```bash
sed -n 70,149p project/ui_kits/web_app/Primitives.jsx > /tmp/brands-legacy.txt
awk '/^  spotify: \{/{f=1} f{print} /^  discord: \{/{d=1} d && /^  \},$/{exit}' project/package/src/primitives/Brands/Brands.tsx > /tmp/brands-new.txt
wc -l /tmp/brands-legacy.txt /tmp/brands-new.txt
diff /tmp/brands-legacy.txt /tmp/brands-new.txt && echo "BRANDS IDENTICAS"
```

Esperado: 80 linhas em cada arquivo e `BRANDS IDENTICAS`.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/primitives/Brands project/package/src/primitives/BrandTile project/package/scripts/smoke-brands.mjs project/package/src/index.ts
git commit -m "feat(brands): porta Brands e BrandTile para @onblide/ui"
```

---

### Task 5: Portar `Link` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Link/Link.tsx`
- Create: `project/package/scripts/smoke-link.mjs`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-link.html`
- Source: `project/ui_kits/web_app/Components.jsx:94-113`

**Interfaces:**
- Consumes: `Icons` de `../../primitives/Icons/Icons` (Tarefa 3): usa só `Icons.arrowSquareOut`.
- Produces: `Link: React.FC<LinkProps>`, `LinkVariant = 'default' | 'subtle' | 'quiet'`, `LinkProps = { href?: string; children?: React.ReactNode; variant?: LinkVariant; external?: boolean; onClick?: React.MouseEventHandler<HTMLAnchorElement> }`.

- [ ] **Step 1: Escrever `Link.tsx`**

```tsx
// project/package/src/components/Link/Link.tsx
import React, { useState } from 'react';
import { Icons } from '../../primitives/Icons/Icons';

export type LinkVariant = 'default' | 'subtle' | 'quiet';

export interface LinkProps {
  href?: string;
  children?: React.ReactNode;
  variant?: LinkVariant;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Link: React.FC<LinkProps> = ({ href = '#', children, variant = 'default', external = false, onClick }) => {
  const [hover, setHover] = useState(false);
  const variants: Record<LinkVariant, React.CSSProperties> = {
    default: { color: 'var(--ob-blue)', textDecoration: hover ? 'underline' : 'none' },
    subtle:  { color: 'var(--ob-fg)', textDecoration: hover ? 'underline' : 'none' },
    quiet:   { color: 'var(--ob-fg-soft)', textDecoration: hover ? 'underline' : 'none' },
  };
  return (
    <a href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
        fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'color 120ms',
        ...variants[variant],
      }}>
      {children}
      {external && <Icons.arrowSquareOut size={13}/>}
    </a>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Link/Link';
```

- [ ] **Step 3: Escrever o smoke**

```js
// project/package/scripts/smoke-link.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, children = 'Texto') => renderToStaticMarkup(React.createElement(Link, props, children));

const padrao = render({});
if (!padrao.startsWith('<a href="#"') || padrao.includes('target=') || padrao.includes('rel=')) fail('link padrão: href="#" e sem target/rel', padrao);
if (!padrao.includes('color:var(--ob-blue)') || !padrao.includes('text-decoration:none')) fail('link padrão: cor azul sem sublinhado', padrao);
if (padrao.includes('ph-arrow-square-out')) fail('link interno não deveria ter ícone externo', padrao);

const subtle = render({ variant: 'subtle' });
if (!subtle.includes('color:var(--ob-fg);') && !subtle.includes('color:var(--ob-fg)"')) fail('subtle: cor --ob-fg', subtle);
const quiet = render({ variant: 'quiet' });
if (!quiet.includes('color:var(--ob-fg-soft)')) fail('quiet: cor --ob-fg-soft', quiet);

const externo = render({ href: 'https://onblide.com', external: true });
if (!externo.startsWith('<a href="https://onblide.com"')) fail('externo: href repassado', externo);
if (!externo.includes('target="_blank"') || !externo.includes('rel="noopener noreferrer"')) fail('externo: target/rel', externo);
if (!externo.includes('ph-arrow-square-out') || !externo.includes('font-size:13px')) fail('externo: ícone arrow-square-out 13px', externo);

if (!render({}, 'Olá').includes('Olá')) fail('children não renderizados');

console.log('OK: Link (variantes, externo, ícone)');
```

- [ ] **Step 4: Typecheck, build e smoke**

Rodar: `npm run typecheck && npm run build && node scripts/smoke-link.mjs`
Esperado: tudo passa; `OK: Link (variantes, externo, ícone)`; `LinkProps` e `LinkVariant` em `dist/index.d.ts`.

- [ ] **Step 5: Migrar a página de preview (SEM abrir navegador)**

`project/ds/components/components-link.html` carrega hoje só `Components.jsx`; a demo usa `Link` e o `Demo` local. Confirmar antes: `grep -oE '<[A-Z][A-Za-z]*' project/ds/components/components-link.html | sort -u` deve listar só `<Demo` e `<Link`.

Trocar a linha (2 espaços de indentação):

```html
  <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
```

por:

```html
  <script src="../../package/dist/onblide-ui.browser.js"></script>
```

E, no `<head>`, logo depois da linha `<link rel="stylesheet" href="../../colors_and_type.css">`, adicionar (a página não carrega o CSS do Phosphor, e o ícone do link externo ficaria invisível):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css"/>
```

O `<script type="text/babel">` inline da demo continua (o Babel do navegador ainda compila o JSX da demo).

- [ ] **Step 6: Conferir por grep (nenhuma verificação visual)**

```bash
grep -c "ui_kits/web_app" project/ds/components/components-link.html          # esperado: 0
grep -c "onblide-ui.browser.js" project/ds/components/components-link.html    # esperado: 1
grep -c "@phosphor-icons/web@2.1.2" project/ds/components/components-link.html # esperado: 1
```

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/Link project/package/scripts/smoke-link.mjs project/package/src/index.ts project/ds/components/components-link.html
git commit -m "feat(link): porta Link para @onblide/ui e migra preview"
```

---

### Task 6: Portar `Pagination` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Pagination/Pagination.tsx`
- Create: `project/package/scripts/smoke-pagination.mjs`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-pagination.html`
- Source: `project/ui_kits/web_app/Components.jsx:138-178`

**Interfaces:**
- Consumes: `Icons` (`caretL`, `caretR`) da Tarefa 3.
- Produces: `Pagination: React.FC<PaginationProps>`, `PaginationProps = { page?: number; total?: number; onChange?: (page: number) => void; siblings?: number }`.

**Defeito herdado — PRESERVAR:** `pages = [...new Set(pages)]` colapsa os dois `'…'` em um só (`page=6,total=20` → `1 … 5 6 7 20`). Não corrigir neste lote.

- [ ] **Step 1: Escrever `Pagination.tsx`**

```tsx
// project/package/src/components/Pagination/Pagination.tsx
import React from 'react';
import { Icons } from '../../primitives/Icons/Icons';

export interface PaginationProps {
  page?: number;
  total?: number;
  onChange?: (page: number) => void;
  siblings?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ page = 1, total = 10, onChange, siblings = 1 }) => {
  const range = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  let pages: (number | '…')[] = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  pages = [...new Set(pages)];

  const Arrow = ({ dir, disabled }: { dir: 'prev' | 'next'; disabled: boolean }) => (
    <button disabled={disabled} onClick={() => onChange?.(dir === 'prev' ? page - 1 : page + 1)} style={{
      width: 34, height: 34, borderRadius: 'var(--ob-r-sm)', border: '1px solid var(--ob-border)',
      background: 'var(--ob-surface)', color: disabled ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 120ms',
    }}>
      {dir === 'prev' ? <Icons.caretL size={16}/> : <Icons.caretR size={16}/>}
    </button>
  );

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Arrow dir="prev" disabled={page === 1} />
      {pages.map((p, i) => p === '…' ? (
        <span key={`e${i}`} style={{ width: 34, textAlign: 'center', color: 'var(--ob-fg-mute)' }}>…</span>
      ) : (
        <button key={p} onClick={() => onChange?.(p)} style={{
          minWidth: 34, height: 34, padding: '0 8px', borderRadius: 'var(--ob-r-sm)',
          border: `1px solid ${p === page ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
          background: p === page ? 'var(--ob-blue)' : 'var(--ob-surface)',
          color: p === page ? '#fff' : 'var(--ob-fg)', fontFamily: 'inherit', fontSize: 14,
          fontWeight: p === page ? 600 : 500, cursor: 'pointer', transition: 'all 120ms',
        }}>{p}</button>
      ))}
      <Arrow dir="next" disabled={page === total} />
    </div>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Pagination/Pagination';
```

- [ ] **Step 3: Escrever o smoke**

```js
// project/package/scripts/smoke-pagination.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const render = (props) => renderToStaticMarkup(React.createElement(Pagination, props));
// Rótulos na ordem: números dos botões de página e '…' dos separadores.
const rotulos = (html) => [...html.matchAll(/>([^<]+)<\/(?:button|span)>/g)].map((m) => m[1]);
const desabilitados = (html) => (html.match(/disabled=""/g) || []).length;

// DEFEITO HERDADO (preservado de propósito — o lote não muda comportamento):
// o legado faz `pages = [...new Set(pages)]` para deduplicar, mas o Set também
// colapsa os DOIS '…' (mesma string) em um só. Com reticências dos dois lados
// (ex.: page=6, total=20) só a da esquerda aparece: 1 … 5 6 7 20. Corrigir isso
// é decisão de API/visual para a fase de endurecimento, não deste porte.
const casos = [
  // [props, rótulos esperados (comportamento REAL do legado), botões de seta desabilitados]
  [{ page: 1, total: 8 },   ['1', '2', '…', '8'],                 1], // demo START
  [{ page: 6, total: 20 },  ['1', '…', '5', '6', '7', '20'],      0], // demo MIDDLE (só um '…', ver acima)
  [{ page: 8, total: 8 },   ['1', '…', '7', '8'],                 1],
  [{ page: 1, total: 1 },   ['1'],                                2],
  [{ page: 1, total: 2 },   ['1', '2'],                           1],
  [{ page: 4, total: 9, siblings: 0 }, ['1', '…', '4', '9'],      0], // idem: um único '…'
  [{},                      ['1', '2', '…', '10'],                1], // padrões: page=1 total=10
];

for (const [props, esperado, desab] of casos) {
  const html = render(props);
  const obtido = rotulos(html);
  if (obtido.join('|') !== esperado.join('|')) fail(`rótulos para ${JSON.stringify(props)}`, { esperado, obtido });
  if (desabilitados(html) !== desab) fail(`setas desabilitadas para ${JSON.stringify(props)}: esperado ${desab}`, desabilitados(html));
}

// A página atual é o botão preenchido de azul (background:var(--ob-blue)).
const ativa = render({ page: 6, total: 20 });
const botoes = ativa.split('<button').slice(1);
const preenchidos = botoes.filter((b) => b.includes('background:var(--ob-blue)'));
if (preenchidos.length !== 1 || !preenchidos[0].includes('>6</button>')) fail('só a página 6 deveria estar preenchida', preenchidos);

// Setas usam os ícones caret-left / caret-right (16px).
if (!ativa.includes('ph-caret-left') || !ativa.includes('ph-caret-right') || !ativa.includes('font-size:16px')) fail('ícones das setas', ativa);

console.log('OK: Pagination (janela de páginas, reticências, setas desabilitadas, página ativa)');
```

- [ ] **Step 4: Typecheck, build e smoke**

Rodar: `npm run typecheck && npm run build && node scripts/smoke-pagination.mjs`
Esperado: tudo passa; `PaginationProps` em `dist/index.d.ts`.

- [ ] **Step 5: Migrar a página de preview (SEM abrir navegador)**

`project/ds/components/components-pagination.html` carrega só `Components.jsx`; a demo usa `Pagination` e `Demo` local (e `const { useState } = React;`, do React global que a página já carrega por CDN). Confirmar por grep: `grep -oE '<[A-Z][A-Za-z]*' project/ds/components/components-pagination.html | sort -u` lista só `<Demo` e `<Pagination`.

Trocar `  <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>` por `  <script src="../../package/dist/onblide-ui.browser.js"></script>` e adicionar, logo depois de `<link rel="stylesheet" href="../../colors_and_type.css">`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css"/>
```

- [ ] **Step 6: Conferir por grep**

```bash
grep -c "ui_kits/web_app" project/ds/components/components-pagination.html          # esperado: 0
grep -c "onblide-ui.browser.js" project/ds/components/components-pagination.html    # esperado: 1
grep -c "@phosphor-icons/web@2.1.2" project/ds/components/components-pagination.html # esperado: 1
```

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/Pagination project/package/scripts/smoke-pagination.mjs project/package/src/index.ts project/ds/components/components-pagination.html
git commit -m "feat(pagination): porta Pagination para @onblide/ui e migra preview"
```

---

### Task 7: Portar `Modal` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Modal/Modal.tsx`
- Create: `project/package/scripts/smoke-modal.mjs`
- Modify: `project/package/src/index.ts`
- Modify: `project/package/scripts/fixtures/injected-styles.json` (regravado com `--update`: +1 chave)
- Modify: `project/ds/components/components-modal.html`
- Source: `project/ui_kits/web_app/Components.jsx:241-289` (`MODAL_WIDTHS`, `Modal`, keyframes)

**Interfaces:**
- Consumes: `Icons` (`x`) da Tarefa 3; `injectStyleOnce` da Tarefa 2.
- Produces: `Modal: React.FC<ModalProps>`, `ModalSize = 'sm' | 'md' | 'lg' | 'full'`, `ModalProps = { open: boolean; onClose?: () => void; title?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; width?: number | string; size?: ModalSize }`. `MODAL_WIDTHS` é interno (não exportado). `Modal` NÃO é portal: renderiza inline com `position: fixed`, como no original.

- [ ] **Step 1: Escrever `Modal.tsx`**

```tsx
// project/package/src/components/Modal/Modal.tsx
import React, { useEffect } from 'react';
import { Icons } from '../../primitives/Icons/Icons';
import { injectStyleOnce } from '../../internal/injectStyleOnce';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

const MODAL_WIDTHS: Record<ModalSize, number | string> = { sm: 360, md: 440, lg: 720, full: '92vw' };

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  size?: ModalSize;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, width, size = 'md' }) => {
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 'var(--ob-z-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,20,20,var(--ob-opacity-scrim))', backdropFilter: 'blur(2px)', padding: 24,
      animation: 'ob-fade 160ms ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: resolvedWidth, maxWidth: '100%', background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-overlay)',
        boxShadow: 'var(--ob-shadow-lg)', overflow: 'hidden', animation: 'ob-pop 200ms var(--ob-ease-spring)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '20px 24px 0' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</h3>
          <button onClick={onClose} style={{
            flex: 'none', width: 30, height: 30, borderRadius: 'var(--ob-r-sm)', border: 'none', background: 'transparent',
            color: 'var(--ob-fg-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <Icons.x size={18}/>
          </button>
        </div>
        <div style={{ padding: '12px 24px 20px', fontSize: 14, lineHeight: 1.6, color: 'var(--ob-fg)' }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--ob-border)', background: 'var(--ob-bg-alt)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
};

// keyframes do modal (fade do backdrop + pop do painel), injetadas uma única vez
injectStyleOnce(
  'ob-modal-kf',
  '@keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes ob-pop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }',
);
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Modal/Modal';
```

- [ ] **Step 3: Escrever o smoke**

```js
// project/package/scripts/smoke-modal.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Modal } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, children) => renderToStaticMarkup(React.createElement(Modal, props, children));

// Importar o módulo sob Node não pode lançar (injeção de keyframes com guard de `document`).
if (render({ open: false, title: 'x' }, 'y') !== '') fail('open=false deveria renderizar vazio');

const aberto = render({ open: true, title: 'Título', footer: 'Rodapé' }, 'Corpo');
if (!aberto.includes('<h3') || !aberto.includes('>Título</h3>')) fail('título não renderizado', aberto);
if (!aberto.includes('Corpo') || !aberto.includes('Rodapé')) fail('corpo/rodapé não renderizados', aberto);
if (!aberto.includes('position:fixed') || !aberto.includes('animation:ob-fade 160ms ease-out')) fail('backdrop', aberto);
if (!aberto.includes('animation:ob-pop 200ms var(--ob-ease-spring)')) fail('animação do painel', aberto);
if (!aberto.includes('ph-x') || !aberto.includes('font-size:18px')) fail('ícone de fechar (Icons.x 18px)', aberto);
if (!aberto.includes('width:440px')) fail('largura padrão (md) deveria ser 440px', aberto);
if (!aberto.includes('border-top:1px solid var(--ob-border)')) fail('rodapé deveria ter borda superior', aberto);

const larguras = { sm: 'width:360px', md: 'width:440px', lg: 'width:720px', full: 'width:92vw' };
for (const [size, css] of Object.entries(larguras)) {
  const html = render({ open: true, size, title: 't' }, 'c');
  if (!html.includes(css)) fail(`size=${size} deveria gerar ${css}`, html);
}

const custom = render({ open: true, width: 500, title: 't' }, 'c');
if (!custom.includes('width:500px')) fail('width explícito deveria vencer o size', custom);

const semRodape = render({ open: true, title: 't' }, 'c');
if (semRodape.includes('border-top:1px solid var(--ob-border)')) fail('sem footer não deveria renderizar o rodapé', semRodape);

console.log('OK: Modal (fechado, aberto, tamanhos, largura explícita, rodapé opcional)');
```

- [ ] **Step 4: Typecheck, build e smoke do Modal**

Rodar: `npm run typecheck && npm run build && node scripts/smoke-modal.mjs`
Esperado: tudo passa; `ModalProps` e `ModalSize` em `dist/index.d.ts`; `MODAL_WIDTHS` ausente.

- [ ] **Step 5: O golden agora TEM que acusar o estilo novo, e então ser atualizado**

Primeiro, confirmar que o guarda pega o estilo novo:

```bash
node scripts/smoke-injected-styles.mjs
```

Esperado: FALHA (`exit 1`) com exatamente `FAIL: estilo novo não registrado no golden: ob-modal-kf` (nenhum outro estilo pode divergir — se divergir, o refactor da Tarefa 2 está errado).

Depois regravar de propósito e conferir:

```bash
node scripts/smoke-injected-styles.mjs --update     # esperado: golden atualizado: 9 estilos
node scripts/smoke-injected-styles.mjs              # esperado: OK: 9 estilos injetados idênticos ao golden
git diff --stat scripts/fixtures/injected-styles.json
```

Esperado no diff: SÓ a chave `ob-modal-kf` acrescentada (as 8 anteriores intactas). E a string tem que ser idêntica à do legado (`Components.jsx:287`):

```bash
S='@keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes ob-pop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }'
grep -cF "$S" project/ui_kits/web_app/Components.jsx project/package/scripts/fixtures/injected-styles.json
```

Esperado: `1` para cada arquivo.

- [ ] **Step 6: Migrar a página de preview (SEM abrir navegador)**

`project/ds/components/components-modal.html` carrega `Primitives.jsx` e `Components.jsx` (a de `Primitives.jsx` só existia para fornecer `Icons` ao `Modal`). A demo usa `Modal`, o `Btn` local e o `Demo` local. Confirmar por grep: `grep -oE '<[A-Z][A-Za-z]*' project/ds/components/components-modal.html | sort -u` lista só `<Btn`, `<Demo`, `<Modal`.

Trocar as DUAS linhas (sem indentação):

```html
<script type="text/babel" src="../../ui_kits/web_app/Primitives.jsx"></script>
<script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
```

por UMA linha:

```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

E adicionar, logo depois de `<link rel="stylesheet" href="../../colors_and_type.css">`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css"/>
```

- [ ] **Step 7: Conferir por grep**

```bash
grep -c "ui_kits/web_app" project/ds/components/components-modal.html          # esperado: 0
grep -c "onblide-ui.browser.js" project/ds/components/components-modal.html    # esperado: 1
grep -c "@phosphor-icons/web@2.1.2" project/ds/components/components-modal.html # esperado: 1
```

- [ ] **Step 8: Commit**

```bash
git add project/package/src/components/Modal project/package/scripts/smoke-modal.mjs project/package/scripts/fixtures/injected-styles.json project/package/src/index.ts project/ds/components/components-modal.html
git commit -m "feat(modal): porta Modal para @onblide/ui e migra preview"
```

---

### Task 8: Tipos de `Table` e `Select` (+ verificação de tipos)

**Files:**
- Create: `project/package/tsconfig.types.json`
- Create: `project/package/scripts/types-check.tsx`
- Modify: `project/package/src/components/Table/Table.tsx`
- Modify: `project/package/src/components/Select/Select.tsx`
- Modify: `project/package/package.json` (script `typecheck`)

**Interfaces:**
- Consumes: os tipos públicos das Tarefas 3-7 (`IconName`…`ModalSize`), só para provar que estão exportados.
- Produces: `Table<T extends object = Record<string, unknown>>`; `SingleSelectProps`, `MultiSelectProps` e `SelectProps = SingleSelectProps | MultiSelectProps` (discriminada por `multi`). Runtime idêntico.

Ordem obrigatória: primeiro o teste de tipos, vermelho; depois a correção, verde.

- [ ] **Step 1: Escrever `tsconfig.types.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true },
  "include": ["scripts/types-check.tsx"]
}
```

- [ ] **Step 2: Escrever `scripts/types-check.tsx`**

```tsx
// project/package/scripts/types-check.tsx
//
// Verificação de TIPOS (só compila, nunca executa): `npm run typecheck` roda
// `tsc --noEmit -p tsconfig.types.json`. Cada `@ts-expect-error` abaixo DEVE
// continuar errando — se o erro sumir, o tsc reclama de diretiva não usada.
import React, { useState } from 'react';
import { Table, Select, Icons, BrandTile, Link, Modal, Pagination } from '../src/index';
import type {
  BadgeTone, OBTone, OBToastPosition,
  IconName, IconProps, IconComponent,
  Brand, BrandKey, BrandTileProps,
  LinkProps, LinkVariant, ModalProps, ModalSize, PaginationProps,
  SelectOption, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps, TableColumn, TableSort,
} from '../src/index';

// Todo tipo usado em prop pública precisa estar exportado por src/index.ts
// (lição de BadgeTone / OBTone / OBToastPosition): importar acima já prova isso.
export type TiposExportados = [
  BadgeTone, OBTone, OBToastPosition,
  IconName, IconProps, IconComponent,
  Brand, BrandKey, BrandTileProps,
  LinkProps, LinkVariant, ModalProps, ModalSize, PaginationProps,
  SelectOption, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps<object>, TableColumn<object>, TableSort,
];

interface Linha { id: number; nome: string } // interface: sem index signature
type LinhaAlias = { id: number };

export function Verificacoes({ linhas, aliases }: { linhas: Linha[]; aliases: LinhaAlias[] }) {
  const [texto, setTexto] = useState<string>('');
  const [textoOuNulo, setTextoOuNulo] = useState<string | null>(null);
  const [lista, setLista] = useState<string[]>([]);
  const dinamico = Math.random() > 0.5;

  return (
    <>
      {/* Table aceita interface e type alias como tipo de linha */}
      <Table rows={linhas} />
      <Table<Linha> rows={linhas} columns={[{ key: 'nome', label: 'Nome', render: (valor, linha) => `${String(valor)}-${linha.id}` }]} />
      <Table rows={aliases} />
      <Table />

      {/* Select: setState direto como onChange, nos dois modos */}
      <Select value={texto} onChange={setTexto} />
      <Select value={textoOuNulo} onChange={setTextoOuNulo} />
      <Select multi value={lista} onChange={setLista} />
      <Select options={['a', { label: 'b' }]} placeholder="x" />
      {/* @ts-expect-error multi com onChange de string */}
      <Select multi value={lista} onChange={setTexto} />
      {/* @ts-expect-error modo simples com value array */}
      <Select value={lista} />
      {/* @ts-expect-error multi vindo de variável boolean não discrimina a união */}
      <Select multi={dinamico} value={lista} onChange={setLista} />

      {/* Icons / BrandTile / Link / Pagination / Modal */}
      <Icons.check size={12} style={{ color: '#fff' }} />
      {Icons.house({ size: 18 })}
      {(['search', 'x'] as IconName[]).map((n) => <React.Fragment key={n}>{Icons[n]()}</React.Fragment>)}
      <BrandTile brand="github" size={32} />
      <Link href="#" variant="quiet" external onClick={(e) => e.preventDefault()}>x</Link>
      <Pagination page={2} total={9} onChange={(p) => void p.toFixed()} />
      <Modal open size="lg" title="t" footer={<b>f</b>}>c</Modal>
      {/* @ts-expect-error variante inexistente */}
      <Link variant="loud">x</Link>
      {/* @ts-expect-error tamanho inexistente */}
      <Modal open size="xl" />
      {/* @ts-expect-error marca inexistente */}
      <BrandTile brand="myspace" />
      {/* @ts-expect-error ícone inexistente */}
      <Icons.nope />
    </>
  );
}
```

- [ ] **Step 3: VERMELHO — o arquivo de tipos tem que falhar contra o código antigo**

Rodar (a partir de `project/package/`): `npx tsc --noEmit -p tsconfig.types.json`
Esperado: FALHA. Erros esperados, entre outros: `has no exported member 'SingleSelectProps'` / `'MultiSelectProps'`; `Type 'Linha[]' is not assignable to type 'Record<string, unknown>[]'` (e `Type 'Linha' does not satisfy the constraint 'Record<string, unknown>'`); `Dispatch<SetStateAction<string>>` não atribuível a `(value: string | string[]) => void` (nos três `<Select ... onChange={setX}>`); `Unused '@ts-expect-error' directive`. Registrar no relatório a contagem de erros (esperado: 8).

- [ ] **Step 4: Corrigir `Table.tsx` (duas edições)**

Trocar, uma ocorrência cada:

```tsx
// Componente genérico — React.FC<TableProps<T>> não permite que TS infira T
// a partir do uso (React.FC não é genérico), então Table é declarado como
// função direta, igual a como o React documenta componentes genéricos.
export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
```

por:

```tsx
// Componente genérico — React.FC<TableProps<T>> não permite que TS infira T
// a partir do uso (React.FC não é genérico), então Table é declarado como
// função direta, igual a como o React documenta componentes genéricos.
// `T extends object` (e não Record<string, unknown>) para aceitar também
// `interface` sem index signature como tipo de linha.
export function Table<T extends object = Record<string, unknown>>({
```

e trocar:

```tsx
{col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
```

por:

```tsx
{col.render ? col.render((row as Record<string, unknown>)[col.key], row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
```

- [ ] **Step 5: Corrigir `Select.tsx` (uma edição)**

Trocar o bloco (o `export interface SelectProps` original até a linha `}) => {` que abre o corpo do componente):

```tsx
export interface SelectProps {
  options?: (string | SelectOption)[];
  value?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
  multi?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  error?: React.ReactNode;
  width?: number | string;
}

export const Select: React.FC<SelectProps> = ({
  options = [],
  value = null,
  onChange,
  multi = false,
  label,
  placeholder = 'Selecione…',
  disabled = false,
  error,
  width,
}) => {
```

por:

```tsx
interface SelectBaseProps {
  options?: (string | SelectOption)[];
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  error?: React.ReactNode;
  width?: number | string;
}

export interface SingleSelectProps extends SelectBaseProps {
  multi?: false;
  value?: string | null;
  onChange?: (value: string) => void;
}

export interface MultiSelectProps extends SelectBaseProps {
  multi: true;
  value?: string[] | null;
  onChange?: (value: string[]) => void;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

// Forma frouxa (idêntica à SelectProps original), usada só dentro do corpo:
// a discriminação por `multi` existe na API pública, não na implementação.
interface SelectLooseProps extends SelectBaseProps {
  multi?: boolean;
  value?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
}

export const Select: React.FC<SelectProps> = (props) => {
  const {
    options = [],
    value = null,
    onChange,
    multi = false,
    label,
    placeholder = 'Selecione…',
    disabled = false,
    error,
    width,
  } = props as SelectLooseProps;
```

Nenhuma outra linha do corpo do `Select` muda.

- [ ] **Step 6: VERDE**

Rodar: `npx tsc --noEmit -p tsconfig.types.json`
Esperado: sai com código 0, sem nenhuma saída.

- [ ] **Step 7: Ligar a verificação de tipos ao `npm run typecheck`**

Em `project/package/package.json`, trocar

```json
    "typecheck": "tsc --noEmit"
```

por

```json
    "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.types.json"
```

- [ ] **Step 8: Typecheck completo, build e smoke do Select**

Rodar: `npm run typecheck && npm run build && node scripts/smoke-select.mjs`
Esperado: tudo passa; `SingleSelectProps` e `MultiSelectProps` (e `SelectProps`) no `export { ... }` final de `dist/index.d.ts`.

- [ ] **Step 9: Commit**

```bash
git add project/package/tsconfig.types.json project/package/scripts/types-check.tsx project/package/src/components/Table/Table.tsx project/package/src/components/Select/Select.tsx project/package/package.json
git commit -m "refactor(types): aceita interface em Table e discrimina Select por multi"
```

---

### Task 9: Script npm `smoke` (roda todos os `smoke-*.mjs`)

**Files:**
- Create: `project/package/scripts/run-smokes.mjs`
- Modify: `project/package/package.json`

**Interfaces:**
- Produces: `npm run smoke` (roda todos os `scripts/smoke-*.mjs`, um processo por script, sai com 1 se algum falhar) e `npm run verify` (typecheck + build + smoke).

- [ ] **Step 1: Escrever `run-smokes.mjs`**

```js
// project/package/scripts/run-smokes.mjs
//
// Roda todos os scripts/smoke-*.mjs, um processo por script, e falha se
// qualquer um falhar. Uso: `npm run build && npm run smoke` (os smokes leem
// dist/, então o build vem antes).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const arquivos = readdirSync(dir).filter((f) => /^smoke-.+\.mjs$/.test(f)).sort();

let falhas = 0;
for (const arquivo of arquivos) {
  const r = spawnSync(process.execPath, [join(dir, arquivo)], { stdio: 'inherit' });
  if (r.status !== 0) {
    falhas++;
    console.error(`FAIL: ${arquivo} (exit ${r.status})`);
  }
}
console.log(`${arquivos.length - falhas}/${arquivos.length} smokes ok`);
process.exit(falhas ? 1 : 0);
```

- [ ] **Step 2: Acrescentar os scripts npm**

O bloco `scripts` de `project/package/package.json` deve ficar exatamente assim:

```json
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.types.json",
    "smoke": "node scripts/run-smokes.mjs",
    "verify": "npm run typecheck && npm run build && npm run smoke"
  },
```

- [ ] **Step 3: Rodar**

Rodar: `npm run build && npm run smoke`
Esperado: cada smoke imprime a sua linha de `OK`, e a última linha é `18/18 smokes ok` (os 12 anteriores + `smoke-icons`, `smoke-brands`, `smoke-link`, `smoke-pagination`, `smoke-modal`, `smoke-injected-styles`); código de saída 0.

- [ ] **Step 4: Provar que o runner falha quando um smoke falha**

```bash
printf '%s\n' "process.exit(1);" > scripts/smoke-zz-falha.mjs
npm run smoke; echo "exit=$?"
rm scripts/smoke-zz-falha.mjs
npm run smoke; echo "exit=$?"
git status --porcelain scripts
```

Esperado: primeira execução termina com `FAIL: smoke-zz-falha.mjs (exit 1)`, `18/19 smokes ok` e `exit=1`; segunda volta a `18/18` e `exit=0`; o `git status` só mostra `run-smokes.mjs` (o arquivo temporário foi removido).

- [ ] **Step 5: Commit**

```bash
git add project/package/scripts/run-smokes.mjs project/package/package.json
git commit -m "chore(package): adiciona scripts npm smoke e verify"
```

---

### Task 10: Verificação final, varredura e contagem de páginas no `CLAUDE.md`

**Files:**
- Modify: `project/CLAUDE.md`
- Nenhum outro arquivo novo — checagens sobre tudo que as Tarefas 1-9 produziram.

**Interfaces:**
- Consumes: tudo das Tarefas 1-9.

**Nenhum passo desta tarefa usa navegador.** A conferência visual é do usuário (Step 8).

- [ ] **Step 1: Reinstalação limpa**

A partir de `project/package/`:

```bash
rm -rf node_modules dist
npm install
```

Esperado: sem erros.

- [ ] **Step 2: Verificação completa**

Rodar: `npm run verify`
Esperado: sai com código 0 — typecheck (os dois passos), build (os 4 artefatos de `dist/`) e `18/18 smokes ok`.

- [ ] **Step 3: Conferir a superfície do `.d.ts`**

```bash
tail -c 8000 dist/index.d.ts | grep -oE "\b(Icons|IconProps|IconName|IconComponent|Brands|Brand|BrandKey|BrandTile|BrandTileProps|Link|LinkProps|LinkVariant|Pagination|PaginationProps|Modal|ModalProps|ModalSize|SingleSelectProps|MultiSelectProps)\b" | sort -u
```

Esperado: os 19 nomes aparecem (no `export { ... }` final).

```bash
tail -c 8000 dist/index.d.ts | grep -cE "\b(PhIcon|PhIconProps|injectStyleOnce|MODAL_WIDTHS|OB_TONES|OB_TOAST_POS|BADGE_TONES)\b"
```

Esperado: `0` (nada interno vaza).

- [ ] **Step 4: Varredura de referências antigas em `ds/components/`**

```bash
grep -ln "ui_kits/web_app/Components.jsx\|ui_kits/web_app/Primitives.jsx" project/ds/components/*.html
```

Esperado: nenhuma saída — depois deste lote NENHUMA página de `ds/components/` carrega os scripts antigos. Se aparecer alguma, NÃO corrigir por conta própria: listar no relatório (nome + o que ela usa).

```bash
grep -rl "onblide-ui.browser.js" project/ds/components/ | sort
grep -rl "onblide-ui.browser.js" project/ds/components/ | wc -l
```

Esperado: `27` páginas (as 24 anteriores + `components-link.html`, `components-pagination.html`, `components-modal.html`); nenhuma das 27 referencia os scripts antigos.

- [ ] **Step 5: Atualizar a contagem em `project/CLAUDE.md`**

Na seção "Preview de componentes portados para @onblide/ui" trocar `24 páginas em` por `27 páginas em` (uma ocorrência) e trocar o final da lista

```text
`components-deadline-calendar.html`, `components-select.html`, `components-slider.html`).
```

por

```text
`components-deadline-calendar.html`, `components-select.html`, `components-slider.html`) mais
as 3 do Lote C (`components-link.html`, `components-pagination.html`, `components-modal.html`).
```

Manter o comando `grep -rl onblide-ui.browser.js ds/components/` e o aviso de página em branco sem `npm install && npm run build`. Conferir: `grep -n "27 páginas" project/CLAUDE.md` retorna 1 linha e `grep -n "24 páginas" project/CLAUDE.md` retorna nada.

- [ ] **Step 6: Commit**

```bash
git add project/CLAUDE.md
git commit -m "docs: atualiza contagem de páginas migradas no claude.md para 27"
```

- [ ] **Step 7: Nada mais a commitar**

Se algum passo acima exigiu correção de código, NÃO amendar (a branch já foi publicada): corrigir num commit novo com a mensagem que descreva a correção (`fix(escopo): ...`).

- [ ] **Step 8: Escrever no relatório a conferência visual que é do usuário**

No relatório da tarefa, declarar que nenhum navegador foi usado e listar as páginas que o USUÁRIO precisa abrir e conferir no navegador dele — as 3 deste lote (`components-link.html`, `components-pagination.html`, `components-modal.html`) e as 5 do Lote B que ainda aguardam olho humano (`components-select.html`, `components-deadline-calendar.html`, `components-slider.html`, `components-toast.html`, `components-code-input.html`). Como: `cd project/package && npm install && npm run build`, depois `python -m http.server 8000` a partir de `project/` e abrir `http://127.0.0.1:8000/ds/components/<página>`. O implementador NÃO faz isso.

---

### Task 11: Release — 0.4.0

**Files:**
- Create: `project/package/.changeset/<nome>.md` (consumido pelo `changeset version`)
- Modify: `project/package/package.json` (bump de versão, via `changeset version`)
- Modify: `project/package/CHANGELOG.md`

**Interfaces:**
- Consumes: o pacote completo das Tarefas 1-10. Versão atual: `0.3.1`.

- [ ] **Step 1: Registrar o changeset**

`npx changeset add` é interativo e não funciona no ambiente de execução: escrever o arquivo manualmente em `project/package/.changeset/` (ex.: `fase2-lote-c-release.md`) no formato que a CLI geraria, como já foi feito nos Lotes A e B:

```markdown
---
"@onblide/ui": minor
---

Adiciona Icons, Brands, BrandTile, Link, Pagination e Modal (Fase 2, Lote C); Table aceita interface como tipo de linha e Select ganha props discriminadas por multi (onChange recebe string no modo simples e string[] no multi); migra components-link, components-pagination e components-modal.
```

- [ ] **Step 2: Aplicar o bump de versão**

A partir de `project/package/`:

```bash
npx changeset version
```

Esperado: `package.json` vai de `0.3.1` para `0.4.0` (minor); `CHANGELOG.md` ganha uma entrada `## 0.4.0` com o resumo acima; o arquivo de changeset é consumido (apagado).

- [ ] **Step 3: Rebuild e verificação**

```bash
npm run verify
```

Esperado: sucesso (o bump não muda o conteúdo do build, só confirma que nada quebrou).

- [ ] **Step 4: Commit**

```bash
git add project/package/package.json project/package/CHANGELOG.md project/package/.changeset
git commit -m "chore(package): libera @onblide/ui 0.4.0"
```

Não criar tag nem fazer push: o controlador cuida disso.

---

## After this plan

`@onblide/ui` passa a ter **39 componentes/módulos públicos portados** (as 33 anteriores + `Icons`, `Brands`, `BrandTile`, `Link`, `Pagination`, `Modal`), com o legado `Components.jsx`/`Primitives.jsx` reduzido a `Logo` (fora de escopo) e ao que `Screens.jsx` ainda consome. A Fase 2 termina aqui. Pendências abertas, todas fora deste plano: a conferência visual das 8 páginas que só um humano pode fazer (Tarefa 10, Step 8), o merge de `dev` em `main`, a fase de endurecimento (defeito herdado do `Pagination`, tipagem single/range do `Slider`, `T extends object` já resolvido aqui) e, depois dela, rodar o `/design-sync` de verdade.
