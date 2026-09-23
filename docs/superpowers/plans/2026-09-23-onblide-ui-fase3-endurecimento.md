# @onblide/ui Fase 3 — Endurecimento antes do /design-sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver a lista de pontos adiados dos Lotes A, B e C antes de rodar o `/design-sync`: teste de tipos contra o `.d.ts` publicado, `SelectBaseProps`, runner de smokes e golden de CSS mais rígidos, tipos discriminados do `Slider`, correções de defeitos herdados (`Pagination`, `Chip`, `Slider`, `Toggle`, `Tooltip`), acessibilidade aditiva de `Modal` e `Pagination`, `README.md` do pacote, auditoria de prontidão e release `0.5.0`.

**Architecture:** A mesma dos lotes anteriores — TypeScript real, um componente por arquivo, build via `tsup`; **`tsup.config.ts` e `src/browser.ts` não mudam**. Diferente dos lotes de porte, aqui há mudanças de comportamento, mas só as listadas, cada uma numa tarefa própria com smoke que falha antes e passa depois. Novidade de infraestrutura: o teste de tipos passa a compilar contra `dist/index.d.ts` (script `typecheck:dist`), e o golden do CSS injetado passa a ser uma sequência ordenada.

**Tech Stack:** O mesmo já em `project/package/` — TypeScript 5, React 18.3.1, tsup, Changesets. Versão atual do pacote: `0.4.0`.

**Spec:** `docs/superpowers/specs/2026-09-23-onblide-ui-fase3-endurecimento-design.md`

## Global Constraints

- **NAVEGADOR PROIBIDO — vale para o implementador, o revisor e qualquer subagente, e deve constar em CADA prompt de subagente desta fase:** nenhum agente pode lançar, abrir, fechar ou encerrar Chrome, Edge ou qualquer navegador (nem headless, nem CLI, nem CDP/DevTools, nem `Start-Process`, nem `taskkill`/`Stop-Process` em `msedge`/`chrome`), nem usar as ferramentas `mcp__claude-in-chrome__*`, nem servir páginas com `python -m http.server` para abrir em navegador. Uma verificação headless do Lote B encerrou o navegador do usuário e destruiu o trabalho manual dele (memória `feedback_nao_mexer_no_navegador.md`). Verificação = comparação com o original + `tsc` + `npm run verify` + smokes Node (`react-dom/server`) + testes de tipos. A conferência visual das páginas de preview é do usuário.
- **Só as mudanças de comportamento listadas nas Tarefas 6 a 12 são permitidas.** Toda outra tarefa deixa o JS emitido idêntico ao de antes (as tarefas só de tipos provam isso por `diff` do `dist/index.js`). Nada de "aproveitar" para consertar outro `<button>` sem `type`, mexer em foco do `Modal`, etc. (ver "Adiado" na spec).
- Comandos rodam a partir de `project/package/`. **A partir da Tarefa 1**, `npm run typecheck` compila só `src` (funciona sem `dist/`) e `npm run typecheck:dist` compila o teste de tipos contra `dist/index.d.ts` (precisa de `npm run build` antes). `npm run verify` = `typecheck → build → typecheck:dist → smoke`. Toda tarefa termina com `npm run verify` verde.
- TypeScript estrito (`tsconfig.json` já tem `"strict": true`).
- Nenhum framework de teste novo e nenhuma dependência nova.
- **Fim de linha:** com `core.autocrlf=true`, parte dos arquivos do working tree está em CRLF (entre os que esta fase edita: `Slider.tsx`, `Chip.tsx`, `Toggle.tsx`, `Tooltip.tsx`, `scripts/smoke-slider.mjs`) e parte em LF. Preserve o fim de linha de cada arquivo. Os trechos abaixo estão em LF; a ferramenta `Edit` normaliza sozinha (foi testado com trechos de várias linhas em arquivo CRLF). Não aplique edições com `sed`/scripts sem cuidar disso.
- Conventional Commits, em português, na branch `dev`, sem rodapé `Claude-Session:` nem qualquer outra atribuição de IA. `project/package/package-lock.json` (ruído local conhecido, fica modificado na árvore) NUNCA entra em commit. Não há amend de commit já publicado (tudo até a `0.4.0` está no remoto); os commits desta fase são novos.
- Módulos internos (`PhIcon`, `injectStyleOnce`, `MODAL_WIDTHS`, tabelas de tons/posições) NÃO são reexportados em `src/index.ts`. Todo TIPO usado em prop pública precisa estar exportado (lição de `BadgeTone`/`OBTone`/`OBToastPosition`/`SelectBaseProps`).
- Fora de escopo (não tocar): `Logo`, `Chrome.jsx`/`Screens.jsx`/`tweaks-panel.jsx`, `tsup.config.ts`, `src/browser.ts`, o `Button` primitivo, `<button>` sem `type` fora do `Chip`, foco/portal do `Modal`, rodar o `/design-sync`, o merge `dev`→`main` (segue segurado até a conferência visual do usuário).
- Tag e push NÃO fazem parte das tarefas dos subagentes: o controlador faz depois da Tarefa 16.

## Review Focus

- **Nada além do listado.** O revisor de cada tarefa confere que o diff contém SÓ a mudança da tarefa. Em especial: a Tarefa 5 (tipos do `Slider`) deixa o `dist/index.js` idêntico exceto pela desestruturação (um único hunk); a correção de comportamento do `Slider` fica na Tarefa 8, separada.
- **Vermelho→verde real.** Nas Tarefas 6, 7, 8, 9, 11 e 12 o smoke novo tem que ter falhado contra o `dist` de antes da tarefa (o implementador registra a mensagem de falha) e passar depois. Um smoke que passa nos dois lados não trava nada.
- **`Slider` ao desmontar e `Tooltip` só se provam por leitura.** Hooks e listeners do `document` não rodam em `renderToStaticMarkup`. O revisor percorre os roteiros escritos nas Tarefas 8 e 10 (mousedown → desmontar; mouseenter → focus → mouseleave), confere que o `useEffect` da Tarefa 8 só limpa na desmontagem (array de dependências `[]`), que `Set.prototype.forEach` com `delete` durante a iteração é seguro, e que o `Tooltip` não ganhou nenhum outro efeito.
- **Golden ordenado (Tarefa 4).** O CSS por id tem que ser idêntico ao golden antigo e a ordem tem que ser a real (`ob-skeleton-kf`, `ob-tip-kf`, `ob-prim-kf`, `ob-indet-kf`, `ob-toast-kf`, `ob-toast-pos`, `ob-shake-kf`, `ob-spin-kf`, `ob-modal-kf`). As quatro mutações (ordem trocada, entrada faltando, id duplicado, `dist` sem injeção) precisam falhar. O smoke também precisa falhar com o fixture em formato antigo (objeto) — sem essa guarda ele dava verde falso.
- **Tipos como o consumidor vê (Tarefas 1, 2, 5).** O `types-check.tsx` importa de `@onblide/ui` (→ `dist/index.d.ts`). Confirmar que `npm run typecheck` sozinho ainda funciona sem `dist/`, que os `@ts-expect-error` de `Select`/`Slider` erram de verdade (remover um por vez numa cópia faz o `tsc` falhar) e que os quatro tipos novos (`SelectBaseProps`, `SliderBaseProps`, `SingleSliderProps`, `RangeSliderProps`) estão no `export {}` final do `.d.ts`.
- **Acessibilidade sem mudar layout (Tarefas 9, 11, 12).** `Modal` e `Pagination` só ganham atributos (a raiz da `Pagination` vira `<nav>` com o mesmo `style`); o `useId` do `Modal` tem que vir ANTES do `if (!open) return null` (ordem de hooks). `Toggle` não pode ganhar `outline: none`.

---

## File Structure

```text
project/package/
  README.md                            # NOVO (Tarefa 13)
  package.json                         # scripts: typecheck, typecheck:dist, smoke, verify; versão 0.5.0
  tsconfig.types.json                  # paths: @onblide/ui → dist/index.d.ts
  scripts/
    types-check.tsx                    # importa de @onblide/ui; + Select migração, + Slider
    run-smokes.mjs                     # falha sem nenhum smoke
    lib/injected-styles.mjs            # coleta ordenada [{ id, css }]
    smoke-injected-styles.mjs          # compara sequência + duplicatas + guardas
    fixtures/injected-styles.json      # golden: array ordenado (9 entradas)
    smoke-pagination.mjs               # duas reticências + a11y
    smoke-chip.mjs  smoke-toggle.mjs   # NOVOS
    smoke-slider.mjs  smoke-modal.mjs  # + min===max / + a11y
  src/components/
    Select/Select.tsx                  # export SelectBaseProps
    Pagination/Pagination.tsx          # sem Set; <nav>, aria-current, setas nomeadas
    Chip/Chip.tsx                      # type="button" no remover
    Toggle/Toggle.tsx                  # role=switch + teclado
    Tooltip/Tooltip.tsx                # limpa timer anterior
    Modal/Modal.tsx                    # role=dialog, aria-modal, aria-labelledby, aria-label
  src/primitives/Slider/Slider.tsx     # união por range; sem NaN; limpa listeners
project/CLAUDE.md                      # seção de verificação + regra do navegador (Tarefa 15)
```

---

### Task 1: Teste de tipos contra o `.d.ts` publicado (`typecheck:dist`)

**Files:**
- Modify: `project/package/tsconfig.types.json`
- Modify: `project/package/scripts/types-check.tsx`
- Modify: `project/package/package.json`

**Interfaces:**
- Produces: alias `@onblide/ui` → `./dist/index.d.ts` só para o teste de tipos; script `npm run typecheck:dist`; `npm run typecheck` volta a ser só `tsc --noEmit`; `npm run verify` = `typecheck → build → typecheck:dist → smoke`. As Tarefas 2 e 5 usam esse teste.

- [ ] **Step 1: Baseline verde**

```bash
cd project/package && npm run build && npm run verify
```

Esperado: exit 0, `18/18 smokes ok`.

- [ ] **Step 2: Aplicar as edições**

Crie (ou substitua o conteúdo de) `project/package/tsconfig.types.json` com:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "paths": { "@onblide/ui": ["./dist/index.d.ts"] }
  },
  "include": ["scripts/types-check.tsx"]
}
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
// Verificação de TIPOS (só compila, nunca executa): `npm run typecheck` roda
// `tsc --noEmit -p tsconfig.types.json`. Cada `@ts-expect-error` abaixo DEVE
// continuar errando — se o erro sumir, o tsc reclama de diretiva não usada.
```

por:

```tsx
// Verificação de TIPOS (só compila, nunca executa), do ponto de vista do
// CONSUMIDOR: importa de '@onblide/ui', que o tsconfig.types.json mapeia para o
// `dist/index.d.ts` PUBLICADO (não para `src`). Roda com `npm run typecheck:dist`,
// depois do build. Cada `@ts-expect-error` abaixo DEVE continuar errando — se o
// erro sumir, o tsc reclama de diretiva não usada.
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
import { Table, Select, Icons, BrandTile, Link, Modal, Pagination } from '../src/index';
```

por:

```tsx
import { Table, Select, Icons, BrandTile, Link, Modal, Pagination } from '@onblide/ui';
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
} from '../src/index';
```

por:

```tsx
} from '@onblide/ui';
```

Em `project/package/package.json`, substitua:

```json
    "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.types.json",
    "smoke": "node scripts/run-smokes.mjs",
    "verify": "npm run typecheck && npm run build && npm run smoke"
```

por:

```json
    "typecheck": "tsc --noEmit",
    "typecheck:dist": "tsc --noEmit -p tsconfig.types.json",
    "smoke": "node scripts/run-smokes.mjs",
    "verify": "npm run typecheck && npm run build && npm run typecheck:dist && npm run smoke"
```

- [ ] **Step 3: Vermelho sem `dist/`, verde com `dist/`**

```bash
rm -rf dist
npm run typecheck        # só src: funciona sem dist  → exit 0
npm run typecheck:dist   # esperado: exit 2, erros TS2307 "Cannot find module '@onblide/ui'"
npm run build
npm run typecheck:dist   # esperado: exit 0
```

- [ ] **Step 4: Mutação — um nome não exportado precisa falhar (e depois reverter)**

Acrescente temporariamente ao FIM de `scripts/types-check.tsx`:

```tsx
import type { PhIcon } from '@onblide/ui';
export type Vazamento = typeof PhIcon;
```

`npm run typecheck:dist` deve falhar com `TS2305: Module '"@onblide/ui"' has no exported member 'PhIcon'` (o `PhIcon` é interno). **Remova essas duas linhas** e confirme com `git diff scripts/types-check.tsx` que só restam as mudanças do Step 2; `npm run typecheck:dist` volta a exit 0.

- [ ] **Step 5: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0 (`typecheck`, build, `typecheck:dist`, `18/18 smokes ok`).

- [ ] **Step 6: Commit**

```bash
git add project/package/tsconfig.types.json project/package/scripts/types-check.tsx project/package/package.json
git commit -m "test: verifica os tipos contra o d.ts publicado"
```

---

### Task 2: `SelectBaseProps` exportado e a quebra da união documentada por teste

**Files:**
- Modify: `project/package/src/components/Select/Select.tsx`
- Modify: `project/package/scripts/types-check.tsx`

**Interfaces:**
- Consumes: o teste de tipos contra o `.d.ts` (Tarefa 1).
- Produces: `SelectBaseProps` exportado (a base comum de `SingleSelectProps`/`MultiSelectProps`). O texto da quebra de tipos vai no changeset da Tarefa 16.

- [ ] **Step 1: Vermelho — o teste passa a importar `SelectBaseProps` do `.d.ts` publicado**

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
  SelectOption, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps, TableColumn, TableSort,
} from '@onblide/ui';
```

por:

```tsx
  SelectOption, SelectBaseProps, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps, TableColumn, TableSort,
} from '@onblide/ui';
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
  SelectOption, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps<object>, TableColumn<object>, TableSort,
];
```

por:

```tsx
  SelectOption, SelectBaseProps, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps<object>, TableColumn<object>, TableSort,
];
```

```bash
npm run build && npm run typecheck:dist
```

Esperado: **falha** com `TS2724: '"@onblide/ui"' has no exported member named 'SelectBaseProps'` (hoje a interface é local e o `.d.ts` só a inlina).

- [ ] **Step 2: Verde — exportar o tipo**

Em `project/package/src/components/Select/Select.tsx`, substitua:

```tsx
interface SelectBaseProps {
```

por:

```tsx
export interface SelectBaseProps {
```

```bash
npm run build && npm run typecheck:dist
tail -c 4000 dist/index.d.ts | grep -o "SelectBaseProps" | head -1
```

Esperado: `typecheck:dist` exit 0, e o `grep` imprime `SelectBaseProps` (agora está no `export {}` final do `.d.ts`).

- [ ] **Step 3: Documentar a quebra e a migração por teste**

Acrescente ao final de `project/package/scripts/types-check.tsx`:

```tsx

// Migração 0.3.x → 0.4.0+: SelectProps virou uma união (por `multi`). Os padrões
// abaixo deixaram de compilar (cada um travado por um @ts-expect-error); os `Ok*`
// são as alternativas que funcionam, usando os tipos exportados.
// @ts-expect-error uma interface não pode estender uma união
interface QuebradoExtends extends SelectProps { extra?: string }

interface OkExtendsBase extends SelectBaseProps { extra?: string }    // estender a base
interface OkExtendsRamo extends SingleSelectProps { extra?: string }  // ou um ramo da união
type OkOmitBase = Omit<SelectBaseProps, 'label'>;                     // Omit na base
export type UsosMigrados = [OkExtendsBase, OkExtendsRamo, OkOmitBase, QuebradoExtends];

export function Wrapper(p: OkOmitBase) {
  return <Select {...p} />;
}
export function WrapperQuebrado(p: Omit<SelectProps, 'label'>) {
  // @ts-expect-error Omit sobre a união perde a discriminação de `multi`
  return <Select {...p} />;
}
// @ts-expect-error `v` fica implicitamente any ao indexar a união
export const handlerImplicito: SelectProps['onChange'] = (v) => v;
```

```bash
npm run typecheck:dist
```

Esperado: exit 0. Isso prova (o `tsc` reclama de `@ts-expect-error` que não erra) que os três padrões quebrados continuam quebrados e que as alternativas (`extends SelectBaseProps`, `extends SingleSelectProps`, `Omit<SelectBaseProps, …>`) compilam. Mutação: remova temporariamente a linha `// @ts-expect-error uma interface não pode estender uma união` e confirme que `typecheck:dist` falha com `TS2312`; restaure a linha.

- [ ] **Step 4: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0.

- [ ] **Step 5: Commit**

```bash
git add project/package/src/components/Select/Select.tsx project/package/scripts/types-check.tsx
git commit -m "feat(select): exporta SelectBaseProps e documenta a migração dos tipos"
```

---

### Task 3: O runner de smokes falha quando não encontra nenhum smoke

**Files:**
- Modify: `project/package/scripts/run-smokes.mjs`

**Interfaces:**
- Produces: `npm run smoke` com exit ≠ 0 se `scripts/smoke-*.mjs` não existir.

- [ ] **Step 1: Vermelho — o runner de hoje dá verde falso**

```bash
TMP=$(mktemp -d) && mkdir "$TMP/scripts" && cp scripts/run-smokes.mjs "$TMP/scripts/"
node "$TMP/scripts/run-smokes.mjs"; echo "exit=$?"
```

Esperado (antes da correção): `0/0 smokes ok` e `exit=0` — o defeito.

- [ ] **Step 2: Aplicar a correção**

Em `project/package/scripts/run-smokes.mjs`, substitua:

```js
const arquivos = readdirSync(dir).filter((f) => /^smoke-.+\.mjs$/.test(f)).sort();
```

por:

```js
const arquivos = readdirSync(dir).filter((f) => /^smoke-.+\.mjs$/.test(f)).sort();

// Um glob errado ou um diretório movido não pode virar "0/0 smokes ok" com exit 0.
if (arquivos.length === 0) {
  console.error(`FAIL: nenhum smoke-*.mjs encontrado em ${dir}`);
  process.exit(1);
}
```

- [ ] **Step 3: Verde — o mesmo teste agora falha; com smokes, passa**

```bash
node "$TMP/scripts/run-smokes.mjs"; echo "exit=$?"     # esperado: FAIL: nenhum smoke-*.mjs encontrado ... exit=1
printf "console.log('OK');\n" > "$TMP/scripts/smoke-a.mjs"
node "$TMP/scripts/run-smokes.mjs"; echo "exit=$?"     # esperado: OK, 1/1 smokes ok, exit=0
printf "process.exit(3);\n" > "$TMP/scripts/smoke-b.mjs"
node "$TMP/scripts/run-smokes.mjs"; echo "exit=$?"     # esperado: FAIL: smoke-b.mjs (exit 3), 1/2 smokes ok, exit=1
rm -rf "$TMP"
```

- [ ] **Step 4: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0, `18/18 smokes ok`.

- [ ] **Step 5: Commit**

```bash
git add project/package/scripts/run-smokes.mjs
git commit -m "fix(package): faz o runner de smokes falhar sem nenhum smoke"
```

---

### Task 4: O golden do CSS injetado trava a ordem e injeções duplicadas

**Files:**
- Modify: `project/package/scripts/lib/injected-styles.mjs`
- Modify: `project/package/scripts/smoke-injected-styles.mjs`
- Modify: `project/package/scripts/fixtures/injected-styles.json`

**Interfaces:**
- Produces: fixture como array ordenado `[{ id, css }]` (9 entradas). O coletor devolve o log de `appendChild` sem deduplicar. O smoke falha em: id duplicado, ordem/id/CSS diferentes, entrada extra ou faltando, fixture em formato antigo e coleta vazia.

- [ ] **Step 1: Baseline e cópia do golden antigo**

```bash
npm run build && node scripts/smoke-injected-styles.mjs
TMP=$(mktemp -d)
git show HEAD:project/package/scripts/fixtures/injected-styles.json > "$TMP/old.json"
```

Esperado: `OK: 9 estilos injetados idênticos ao golden`.

- [ ] **Step 2: Aplicar as edições (coletor e smoke)**

Crie (ou substitua o conteúdo de) `project/package/scripts/lib/injected-styles.mjs` com:

```js
// project/package/scripts/lib/injected-styles.mjs
//
// Coleta, EM ORDEM, todos os <style> que os módulos da biblioteca injetam ao
// serem importados, usando um `document` falso mínimo. Devolve um array
// [{ id, css }] com UMA entrada por `appendChild` (sem deduplicar): assim o
// golden trava também a ordem de inserção e injeções duplicadas do mesmo id.
// Precisa rodar num processo Node limpo: o import de dist/index.js é cacheado.
export async function collectInjectedStyles(distIndexUrl) {
  const ids = new Set();
  const log = [];
  globalThis.document = {
    getElementById: (id) => (ids.has(id) ? { id } : null),
    createElement: () => ({ id: '', textContent: '' }),
    head: {
      appendChild: (el) => {
        ids.add(el.id);
        log.push({ id: el.id, css: el.textContent });
      },
    },
  };
  try {
    await import(distIndexUrl.href);
  } finally {
    delete globalThis.document;
  }
  return log;
}
```

Crie (ou substitua o conteúdo de) `project/package/scripts/smoke-injected-styles.mjs` com:

```js
// project/package/scripts/smoke-injected-styles.mjs
//
// Guarda de regressão do CSS injetado pelos componentes (keyframes etc.):
// compara a SEQUÊNCIA de <style> coletada de dist/index.js (ordem, id e CSS,
// posição a posição) com o golden versionado em scripts/fixtures/injected-styles.json,
// e falha se algum id for injetado mais de uma vez. Qualquer mudança no CSS, nos
// ids de guarda ou na ordem de inserção precisa atualizar o golden de propósito:
//   node scripts/smoke-injected-styles.mjs --update
import { readFileSync, writeFileSync } from 'node:fs';
import { collectInjectedStyles } from './lib/injected-styles.mjs';

const goldenUrl = new URL('./fixtures/injected-styles.json', import.meta.url);
const atual = await collectInjectedStyles(new URL('../dist/index.js', import.meta.url));

if (process.argv.includes('--update')) {
  writeFileSync(goldenUrl, JSON.stringify(atual, null, 2) + '\n');
  console.log(`golden atualizado: ${atual.length} estilos`);
  process.exit(0);
}

const golden = JSON.parse(readFileSync(goldenUrl, 'utf8'));
// Guardas contra verde falso: golden no formato antigo (objeto) ou coleta vazia.
if (!Array.isArray(golden)) {
  console.error('FAIL: o golden não é um array [{ id, css }] (formato antigo?); rode --update de propósito');
  process.exit(1);
}
if (atual.length === 0) {
  console.error('FAIL: nenhum <style> coletado de dist/index.js (build faltando ou quebrado?)');
  process.exit(1);
}
let diffs = 0;

// 1) Nenhum id injetado mais de uma vez.
const vistos = new Set();
for (const { id } of atual) {
  if (vistos.has(id)) {
    console.error(`FAIL: injeção duplicada do id ${id}`);
    diffs++;
  }
  vistos.add(id);
}

// 2) Mesma sequência: ordem, id e CSS, posição a posição.
const total = Math.max(golden.length, atual.length);
for (let i = 0; i < total; i++) {
  const g = golden[i];
  const a = atual[i];
  if (!g) {
    console.error(`FAIL: estilo extra na posição ${i}: ${a.id}`);
    diffs++;
  } else if (!a) {
    console.error(`FAIL: estilo sumiu da posição ${i}: ${g.id}`);
    diffs++;
  } else if (g.id !== a.id) {
    console.error(`FAIL: ordem/id diferente na posição ${i}: golden ${g.id}, atual ${a.id}`);
    diffs++;
  } else if (g.css !== a.css) {
    console.error(`FAIL: CSS diferente para ${g.id}\n  golden: ${g.css}\n  atual:  ${a.css}`);
    diffs++;
  }
}
if (diffs) process.exit(1);
console.log(`OK: ${atual.length} estilos injetados idênticos ao golden (ordem, ids e CSS)`);
```

- [ ] **Step 3: Guarda de formato — com o fixture ainda no formato antigo o smoke tem que FALHAR**

```bash
node scripts/smoke-injected-styles.mjs; echo "exit=$?"
```

Esperado: `FAIL: o golden não é um array [{ id, css }] (formato antigo?); rode --update de propósito` e `exit=1`. (Sem essa guarda o laço não roda e dá `OK` falso — foi o que aconteceu no primeiro protótipo.)

- [ ] **Step 4: Regenerar o golden de propósito e comparar com o antigo**

```bash
node scripts/smoke-injected-styles.mjs --update     # golden atualizado: 9 estilos
node scripts/smoke-injected-styles.mjs              # OK: 9 estilos ... (ordem, ids e CSS)
node -e "
const fs=require('fs');
const antigo=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
const novo=JSON.parse(fs.readFileSync('scripts/fixtures/injected-styles.json','utf8'));
const ordem=['ob-skeleton-kf','ob-tip-kf','ob-prim-kf','ob-indet-kf','ob-toast-kf','ob-toast-pos','ob-shake-kf','ob-spin-kf','ob-modal-kf'];
const mesmoCss=novo.length===Object.keys(antigo).length&&novo.every((e)=>antigo[e.id]===e.css);
const mesmaOrdem=novo.map((e)=>e.id).join()===ordem.join();
console.log({mesmoCss,mesmaOrdem});
process.exit(mesmoCss&&mesmaOrdem?0:1);" "$TMP/old.json"; echo "exit=$?"
```

Esperado: `{ mesmoCss: true, mesmaOrdem: true }` e `exit=0` — o CSS por id não mudou; só o formato e a ordem passaram a ser travados.

- [ ] **Step 5: Provas de mutação (as quatro precisam falhar; tudo é revertido)**

```bash
cp scripts/fixtures/injected-styles.json "$TMP/golden.bak"

# A) ordem trocada no golden
node -e "const fs=require('fs');const p='scripts/fixtures/injected-styles.json';const g=JSON.parse(fs.readFileSync(p,'utf8'));[g[0],g[1]]=[g[1],g[0]];fs.writeFileSync(p,JSON.stringify(g,null,2)+'\n')"
node scripts/smoke-injected-styles.mjs; echo "A exit=$?"      # esperado: ordem/id diferente na posição 0 e 1, exit=1
cp "$TMP/golden.bak" scripts/fixtures/injected-styles.json

# B) golden sem a última entrada
node -e "const fs=require('fs');const p='scripts/fixtures/injected-styles.json';const g=JSON.parse(fs.readFileSync(p,'utf8'));g.pop();fs.writeFileSync(p,JSON.stringify(g,null,2)+'\n')"
node scripts/smoke-injected-styles.mjs; echo "B exit=$?"      # esperado: estilo extra na posição 8: ob-modal-kf, exit=1
cp "$TMP/golden.bak" scripts/fixtures/injected-styles.json

# C) e D) um dist falso, numa cópia temporária
mkdir -p "$TMP/c/scripts/lib" "$TMP/c/scripts/fixtures" "$TMP/c/dist"
cp scripts/smoke-injected-styles.mjs "$TMP/c/scripts/" && cp scripts/lib/injected-styles.mjs "$TMP/c/scripts/lib/" && cp scripts/fixtures/injected-styles.json "$TMP/c/scripts/fixtures/"
printf "const put = (id, css) => { const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s); };\nput('a', 'x');\nput('a', 'x');\n" > "$TMP/c/dist/index.js"
(cd "$TMP/c" && node scripts/smoke-injected-styles.mjs; echo "C exit=$?")   # esperado: injeção duplicada do id a, exit=1
printf "export {};\n" > "$TMP/c/dist/index.js"
(cd "$TMP/c" && node scripts/smoke-injected-styles.mjs; echo "D exit=$?")   # esperado: nenhum <style> coletado, exit=1

rm -rf "$TMP"
node scripts/smoke-injected-styles.mjs; echo "restaurado exit=$?"             # esperado: OK, exit=0
```

- [ ] **Step 6: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0, `18/18 smokes ok`.

- [ ] **Step 7: Commit**

```bash
git add project/package/scripts/lib/injected-styles.mjs project/package/scripts/smoke-injected-styles.mjs project/package/scripts/fixtures/injected-styles.json
git commit -m "test: golden do css injetado trava ordem e duplicatas"
```

---

### Task 5: `SliderProps` discriminado por `range` (só tipos, runtime idêntico)

**Files:**
- Modify: `project/package/src/primitives/Slider/Slider.tsx` (arquivo em CRLF)
- Modify: `project/package/scripts/types-check.tsx`

**Interfaces:**
- Consumes: o teste de tipos contra o `.d.ts` (Tarefa 1).
- Produces: `SliderBaseProps`, `SingleSliderProps`, `RangeSliderProps` e `SliderProps` (a união) exportados; `SliderValue` e `SliderTone` continuam. O corpo lê as props numa forma frouxa interna, como o `Select`.

- [ ] **Step 1: Guardar o JS de antes**

```bash
npm run build
TMP=$(mktemp -d) && cp dist/index.js "$TMP/index.before.js"
```

- [ ] **Step 2: Aplicar as edições**

Em `project/package/src/primitives/Slider/Slider.tsx`, substitua:

```tsx
import React, { useRef, useState } from 'react';

export type SliderValue = number | [number, number];
export type SliderTone = 'default' | 'success' | 'warning' | 'danger';

export interface SliderProps {
  value?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: SliderValue) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  showValue?: boolean;
  marks?: boolean;
  tone?: SliderTone;
  range?: boolean;
}
```

por:

```tsx
import React, { useRef, useState } from 'react';

export type SliderValue = number | [number, number];
export type SliderTone = 'default' | 'success' | 'warning' | 'danger';

export interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  showValue?: boolean;
  marks?: boolean;
  tone?: SliderTone;
}

export interface SingleSliderProps extends SliderBaseProps {
  range?: false;
  value?: number;
  onChange?: (value: number) => void;
}

export interface RangeSliderProps extends SliderBaseProps {
  range: true;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
}

export type SliderProps = SingleSliderProps | RangeSliderProps;

// Forma frouxa (idêntica à SliderProps original), usada só dentro do corpo:
// a discriminação por `range` existe na API pública, não na implementação.
interface SliderLooseProps extends SliderBaseProps {
  range?: boolean;
  value?: SliderValue;
  onChange?: (value: SliderValue) => void;
}
```

Em `project/package/src/primitives/Slider/Slider.tsx`, substitua:

```tsx
export const Slider: React.FC<SliderProps> = ({
  value, min = 0, max = 100, step = 1,
  onChange, label, hint, error, disabled = false,
  showValue = true, marks = false,
  tone = 'default',
  range = false,
}) => {
```

por:

```tsx
export const Slider: React.FC<SliderProps> = (props) => {
  const {
    value, min = 0, max = 100, step = 1,
    onChange, label, hint, error, disabled = false,
    showValue = true, marks = false,
    tone = 'default',
    range = false,
  } = props as SliderLooseProps;
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
import { Table, Select, Icons, BrandTile, Link, Modal, Pagination } from '@onblide/ui';
```

por:

```tsx
import { Table, Select, Slider, Icons, BrandTile, Link, Modal, Pagination } from '@onblide/ui';
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
  TableProps, TableColumn, TableSort,
} from '@onblide/ui';
```

por:

```tsx
  TableProps, TableColumn, TableSort,
  SliderBaseProps, SingleSliderProps, RangeSliderProps, SliderProps, SliderValue, SliderTone,
} from '@onblide/ui';
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
  TableProps<object>, TableColumn<object>, TableSort,
];
```

por:

```tsx
  TableProps<object>, TableColumn<object>, TableSort,
  SliderBaseProps, SingleSliderProps, RangeSliderProps, SliderProps, SliderValue, SliderTone,
];
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
  const [lista, setLista] = useState<string[]>([]);
```

por:

```tsx
  const [lista, setLista] = useState<string[]>([]);
  const [num, setNum] = useState<number>(0);
  const [par, setPar] = useState<[number, number]>([10, 20]);
```

Em `project/package/scripts/types-check.tsx`, substitua:

```tsx
      {/* Icons / BrandTile / Link / Pagination / Modal */}
```

por:

```tsx
      {/* Slider: props discriminadas por `range` */}
      <Slider />
      <Slider value={num} onChange={setNum} />
      <Slider value={num} onChange={(v) => void v.toFixed()} />
      <Slider range value={par} onChange={setPar} />
      <Slider range value={par} onChange={(v) => void v[0].toFixed()} />
      <Slider min={0} max={10} step={2} tone="success" marks label="x" />
      {/* @ts-expect-error modo simples com value em par */}
      <Slider value={par} />
      {/* @ts-expect-error range com onChange de número */}
      <Slider range value={par} onChange={setNum} />
      {/* @ts-expect-error range vindo de variável boolean não discrimina a união */}
      <Slider range={dinamico} value={num} onChange={setNum} />

      {/* Icons / BrandTile / Link / Pagination / Modal */}
```

- [ ] **Step 3: Tipos verdes e runtime idêntico**

```bash
npm run typecheck && npm run build && npm run typecheck:dist
diff "$TMP/index.before.js" dist/index.js
```

Esperado: os dois `tsc` com exit 0. O `diff` mostra **um único hunk**, dentro do `Slider`: o cabeçalho `var Slider = ({ value, min = 0, ... range = false }) => {` vira `var Slider = (props) => { const { value, min = 0, ... range = false } = props;`. Qualquer outra linha diferente é erro.

- [ ] **Step 4: Mutação nos `@ts-expect-error` do `Slider`**

Em `scripts/types-check.tsx`, remova temporariamente (uma por vez) cada uma das três linhas `{/* @ts-expect-error ... */}` do bloco `Slider` e confirme que `npm run typecheck:dist` falha (exit 2, erro de tipo) em cada caso; restaure todas. `git diff scripts/types-check.tsx` deve mostrar só as edições do Step 2.

- [ ] **Step 5: Verificação completa**

```bash
npm run verify
rm -rf "$TMP"
```

Esperado: exit 0 (`smoke-slider` continua passando: o markup não mudou).

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/Slider/Slider.tsx project/package/scripts/types-check.tsx
git commit -m "refactor(slider): discrimina as props por range"
```

---

### Task 6: `Pagination` mostra as duas reticências

**Files:**
- Modify: `project/package/src/components/Pagination/Pagination.tsx`
- Modify: `project/package/scripts/smoke-pagination.mjs`

**Interfaces:**
- Mudança de comportamento (visível): com páginas escondidas dos dois lados aparecem as duas `'…'` (`page=6,total=20`: `1 … 5 6 7 … 20`; `page=4,total=9,siblings=0`: `1 … 4 … 9`). Sem reticências dos dois lados nada muda.

- [ ] **Step 1: Vermelho — o smoke novo contra o código de hoje**

Aplique só a reescrita do smoke:

Crie (ou substitua o conteúdo de) `project/package/scripts/smoke-pagination.mjs` com:

```js
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

// Algoritmo do ORIGINAL (Components.jsx) em Node puro. O legado fazia
// `[...new Set(pages)]`, que também colapsava os DOIS '…' em um só.
function legado({ page = 1, total = 10, siblings = 1 }) {
  const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  let pages = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  return [...new Set(pages)].map(String);
}

// Algoritmo CORRIGIDO (Fase 3): a mesma lista, sem o Set — as duas reticências
// aparecem quando há páginas escondidas dos dois lados. Números nunca se
// repetem (left..right fica dentro de 2..total-1), então o Set só afetava '…'.
function corrigido({ page = 1, total = 10, siblings = 1 }) {
  const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  const pages = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  return pages.map(String);
}

// Única mudança de comportamento da Fase 3: corrigido == legado, exceto que o
// segundo '…' volta a existir. Provado por varredura em todo o espaço de uso.
for (const total of [1, 2, 3, 5, 7, 10, 20, 50]) {
  for (const siblings of [0, 1, 2]) {
    for (let page = 1; page <= total; page++) {
      const novo = corrigido({ page, total, siblings });
      const antigo = legado({ page, total, siblings });
      const semDuplicata = novo.filter((r, i) => r !== '…' || novo.indexOf('…') === i);
      if (semDuplicata.join('|') !== antigo.join('|')) fail(`corrigido diverge do legado além das reticências: page=${page} total=${total} siblings=${siblings}`, { novo, antigo });
    }
  }
}

const casos = [
  // [props, rótulos esperados, botões de seta desabilitados]
  [{ page: 1, total: 8 },   ['1', '2', '…', '8'],                       1], // demo START
  [{ page: 6, total: 20 },  ['1', '…', '5', '6', '7', '…', '20'],       0], // demo MIDDLE: agora com as DUAS reticências
  [{ page: 8, total: 8 },   ['1', '…', '7', '8'],                       1],
  [{ page: 1, total: 1 },   ['1'],                                      2],
  [{ page: 1, total: 2 },   ['1', '2'],                                 1],
  [{ page: 4, total: 9, siblings: 0 }, ['1', '…', '4', '…', '9'],       0],
  [{},                      ['1', '2', '…', '10'],                      1], // padrões: page=1 total=10
];

for (const [props, esperado, desab] of casos) {
  const ref = corrigido(props);
  if (ref.join('|') !== esperado.join('|')) fail(`expectativa diverge do algoritmo corrigido para ${JSON.stringify(props)}`, { esperado, ref });
  const html = render(props);
  const obtido = rotulos(html);
  if (obtido.join('|') !== esperado.join('|')) fail(`rótulos para ${JSON.stringify(props)}`, { esperado, obtido });
  if (desabilitados(html) !== desab) fail(`setas desabilitadas para ${JSON.stringify(props)}: esperado ${desab}`, desabilitados(html));
}

// O porte renderizado bate com o algoritmo corrigido em toda a varredura.
for (const total of [1, 2, 3, 5, 7, 10, 20]) {
  for (const siblings of [0, 1, 2]) {
    for (let page = 1; page <= total; page++) {
      const obtido = rotulos(render({ page, total, siblings }));
      const esperado = corrigido({ page, total, siblings });
      if (obtido.join('|') !== esperado.join('|')) fail(`porte diverge: page=${page} total=${total} siblings=${siblings}`, { esperado, obtido });
    }
  }
}

// A página atual é o botão preenchido de azul (background:var(--ob-blue)).
const ativa = render({ page: 6, total: 20 });
const botoes = ativa.split('<button').slice(1);
const preenchidos = botoes.filter((b) => b.includes('background:var(--ob-blue)'));
if (preenchidos.length !== 1 || !preenchidos[0].includes('>6</button>')) fail('só a página 6 deveria estar preenchida', preenchidos);

// Setas usam os ícones caret-left / caret-right (16px).
if (!ativa.includes('ph-caret-left') || !ativa.includes('ph-caret-right') || !ativa.includes('font-size:16px')) fail('ícones das setas', ativa);

console.log('OK: Pagination (janela de páginas, duas reticências, setas desabilitadas, página ativa)');
```

```bash
npm run build && node scripts/smoke-pagination.mjs; echo "exit=$?"
```

Esperado: **falha** (`exit=1`) com `FAIL: rótulos para {"page":6,"total":20}` — o porte ainda colapsa as reticências.

- [ ] **Step 2: Verde — remover o `Set`**

Em `project/package/src/components/Pagination/Pagination.tsx`, substitua:

```tsx
  let pages: (number | '…')[] = [];
```

por:

```tsx
  const pages: (number | '…')[] = [];
```

Em `project/package/src/components/Pagination/Pagination.tsx`, apague este trecho:

```tsx
  pages = [...new Set(pages)];
```

```bash
npm run build && node scripts/smoke-pagination.mjs
```

Esperado: `OK: Pagination (janela de páginas, duas reticências, setas desabilitadas, página ativa)`. O smoke prova por varredura (8 totais × 3 `siblings` × todas as páginas) que o algoritmo novo é igual ao legado exceto pelo segundo `'…'`, e que o componente renderizado bate com o algoritmo corrigido.

- [ ] **Step 3: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0.

- [ ] **Step 4: Commit**

```bash
git add project/package/src/components/Pagination/Pagination.tsx project/package/scripts/smoke-pagination.mjs
git commit -m "fix(pagination): mostra as duas reticências quando há páginas escondidas dos dois lados"
```

---

### Task 7: `Chip` — o botão de remover tem `type="button"`

**Files:**
- Modify: `project/package/src/components/Chip/Chip.tsx` (arquivo em CRLF)
- Create: `project/package/scripts/smoke-chip.mjs`

**Interfaces:**
- Mudança de comportamento: dentro de um `<form>`, remover um chip deixa de enviar o formulário.

- [ ] **Step 1: Vermelho — smoke novo contra o código de hoje**

Crie (ou substitua o conteúdo de) `project/package/scripts/smoke-chip.mjs` com:

```js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chip } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Chip, props));

// Botão de remover: precisa de type="button" (sem isso, dentro de um <form>
// ele envia o formulário).
const removivel = render({ label: 'Tag', removable: true });
if (!removivel.includes('<button type="button"')) fail('o botão de remover deveria ter type="button"', removivel);
if (!removivel.includes('aria-label="Remover Tag"')) fail('aria-label do botão de remover', removivel);
const botoes = removivel.match(/<button\b/g) || [];
const botoesTipados = removivel.match(/<button type="button"/g) || [];
if (botoes.length !== botoesTipados.length) fail('todo <button> do Chip deveria ter type="button"', removivel);

// Sem `removable` não há botão nenhum.
if (render({ label: 'Tag' }).includes('<button')) fail('Chip sem removable não deveria renderizar <button>');

// O resto do contrato segue igual.
if (!removivel.includes('role="button"') || !removivel.includes('aria-pressed="false"')) fail('role/aria-pressed do chip', removivel);
if (!render({ label: 'x', selected: true }).includes('aria-pressed="true"')) fail('aria-pressed quando selecionado');
if (!render({ label: 'x', disabled: true }).includes('tabindex="-1"')) fail('chip desabilitado deveria sair da ordem de tab');

console.log('OK: Chip (botão de remover com type="button", role, aria-pressed, desabilitado)');
```

```bash
npm run build && node scripts/smoke-chip.mjs; echo "exit=$?"
```

Esperado: **falha** (`exit=1`) com `FAIL: o botão de remover deveria ter type="button"`.

- [ ] **Step 2: Verde**

Em `project/package/src/components/Chip/Chip.tsx`, substitua:

```tsx
        <button
          onClick={e => { e.stopPropagation(); if (!disabled) onRemove?.(); }}
```

por:

```tsx
        <button
          type="button"
          onClick={e => { e.stopPropagation(); if (!disabled) onRemove?.(); }}
```

```bash
npm run build && node scripts/smoke-chip.mjs
```

Esperado: `OK: Chip (botão de remover com type="button", role, aria-pressed, desabilitado)`.

- [ ] **Step 3: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0, `19/19 smokes ok`.

- [ ] **Step 4: Commit**

```bash
git add project/package/src/components/Chip/Chip.tsx project/package/scripts/smoke-chip.mjs
git commit -m "fix(chip): define type button no botão de remover"
```

---

### Task 8: `Slider` — sem `NaN` com `min === max` e sem listeners pendurados ao desmontar

**Files:**
- Modify: `project/package/src/primitives/Slider/Slider.tsx` (CRLF)
- Modify: `project/package/scripts/smoke-slider.mjs` (CRLF)

**Interfaces:**
- Mudança de comportamento: (a) com `min === max` a posição vira 0% em vez de `NaN%` (`left:NaN%`/`right:NaN%` no markup de hoje); (b) desmontar o componente no meio de um arrasto remove os listeners de `pointermove/up/cancel` do `document`.

- [ ] **Step 1: Vermelho — o smoke novo contra o código de hoje (parte a)**

Em `project/package/scripts/smoke-slider.mjs`, substitua:

```js
console.log('OK: single, range e disabled renderizam corretamente');
```

por:

```js
// min === max: sem NaN (a divisão por zero em pct() virava `left:NaN%` / `right:NaN%`)
for (const props of [
  { value: 5, min: 5, max: 5 },
  { value: [5, 5], min: 5, max: 5, range: true },
  { value: 5, min: 5, max: 5, marks: true },
]) {
  const html = renderToStaticMarkup(React.createElement(Slider, props));
  if (html.includes('NaN')) {
    console.error(`FAIL (min === max): NaN no markup para ${JSON.stringify(props)}:`, html);
    process.exit(1);
  }
}

console.log('OK: single, range, disabled e min === max renderizam corretamente');
```

```bash
npm run build && node scripts/smoke-slider.mjs; echo "exit=$?"
```

Esperado: **falha** (`exit=1`) com `FAIL (min === max): NaN no markup para {"value":5,"min":5,"max":5}`.

- [ ] **Step 2: Verde — as correções**

Em `project/package/src/primitives/Slider/Slider.tsx`, substitua:

```tsx
import React, { useRef, useState } from 'react';
```

por:

```tsx
import React, { useEffect, useRef, useState } from 'react';
```

Em `project/package/src/primitives/Slider/Slider.tsx`, substitua:

```tsx
  onChangeRef.current = onChange;
```

por:

```tsx
  onChangeRef.current = onChange;

  // Listeners de arrasto ativos (no document). Se o componente desmontar no meio de
  // um arrasto, o `pointerup` nunca chega ao onUp e os listeners ficariam pendurados,
  // chamando valFromX com trackRef.current === null.
  const dragCleanups = useRef(new Set<() => void>());
  useEffect(() => () => { dragCleanups.current.forEach((limpar) => limpar()); }, []);
```

Em `project/package/src/primitives/Slider/Slider.tsx`, substitua:

```tsx
  const pct   = (v: number) => ((v - min) / (max - min)) * 100;
```

por:

```tsx
  const pct   = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100);
```

Em `project/package/src/primitives/Slider/Slider.tsx`, substitua:

```tsx
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    document.addEventListener('pointermove', onMove);
```

por:

```tsx
    const onUp = () => {
      draggingRef.current = null;
      dragCleanups.current.delete(onUp);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    dragCleanups.current.add(onUp);
    document.addEventListener('pointermove', onMove);
```

```bash
npm run build && node scripts/smoke-slider.mjs && npm run typecheck && npm run typecheck:dist
```

Esperado: `OK: single, range, disabled e min === max renderizam corretamente` e os dois `tsc` em exit 0.

- [ ] **Step 3: Roteiro de leitura (a parte b não roda em `renderToStaticMarkup`)**

Confirme lendo o código final de `startDrag`:

1. `mousedown` no thumb → `startDrag` registra 3 listeners no `document` e coloca `onUp` em `dragCleanups.current`.
2. O componente desmonta antes do `pointerup` → o `useEffect(() => () => {...}, [])` roda a limpeza: chama cada `onUp` do `Set`, que remove os 3 listeners e se remove do `Set` (`delete` durante o `forEach` de um `Set` é seguro). Nenhum `pointermove` posterior chega a `valFromX` (que leria `trackRef.current!` nulo).
3. Se o `pointerup` chega normalmente, `onUp` faz o mesmo e sai do `Set`; a limpeza da desmontagem não encontra nada.
4. Arrastos simultâneos (vários dedos): cada `startDrag` põe o seu `onUp` no `Set`; todos são limpos na desmontagem.
5. O array de dependências do efeito é `[]` (só desmontagem) e nada mais mudou em `startDrag`.

- [ ] **Step 4: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0.

- [ ] **Step 5: Commit**

```bash
git add project/package/src/primitives/Slider/Slider.tsx project/package/scripts/smoke-slider.mjs
git commit -m "fix(slider): evita NaN com min igual a max e limpa listeners ao desmontar"
```

---

### Task 9: `Toggle` — `role="switch"` e acionamento por teclado

**Files:**
- Modify: `project/package/src/components/Toggle/Toggle.tsx` (CRLF)
- Create: `project/package/scripts/smoke-toggle.mjs`

**Interfaces:**
- Mudança de comportamento (aditiva): o trilho vira um elemento focável com `role="switch"`, `aria-checked`, `aria-disabled` (só quando desabilitado), `aria-label` (só se o `label` for string), `tabIndex` 0/-1, e responde a Espaço/Enter (com `preventDefault` no Espaço/Enter para não rolar a página). O clique continua igual. Sem `outline: none`: o anel de foco padrão do navegador aparece só no foco por teclado.

- [ ] **Step 1: Vermelho — smoke novo contra o código de hoje**

Crie (ou substitua o conteúdo de) `project/package/scripts/smoke-toggle.mjs` com:

```js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Toggle } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(Toggle, props));

// Semântica de switch (leitores de tela) e ordem de tab.
const ligado = render({ checked: true, label: 'Notificações' });
const desligado = render({ checked: false, label: 'Notificações' });
if (!ligado.includes('role="switch"') || !ligado.includes('aria-checked="true"')) fail('switch ligado', ligado);
if (!desligado.includes('aria-checked="false"')) fail('switch desligado', desligado);
if (!ligado.includes('aria-label="Notificações"')) fail('nome acessível quando o label é string', ligado);
if (!ligado.includes('tabindex="0"')) fail('deveria entrar na ordem de tab', ligado);
if (desligado.includes('aria-disabled')) fail('habilitado não deveria ter aria-disabled', desligado);
const desabilitado = render({ checked: false, disabled: true });
if (!desabilitado.includes('tabindex="-1"') || !desabilitado.includes('aria-disabled="true"')) fail('desabilitado', desabilitado);
if (render({ checked: false, label: React.createElement('b', null, 'x') }).includes('aria-label=')) fail('label que não é string não vira aria-label');

// Teclado. O Toggle não usa hooks, então dá para chamá-lo como função e acionar
// os handlers do elemento retornado, sem DOM.
function elementoSwitch(props) {
  const raiz = Toggle(props);
  return React.Children.toArray(raiz.props.children)[0];
}
function acionar(props, evento) {
  const chamadas = [];
  const el = elementoSwitch({ ...props, onChange: (v) => chamadas.push(v) });
  let bloqueado = false;
  if (evento === 'click') el.props.onClick();
  else el.props.onKeyDown({ key: evento, preventDefault: () => { bloqueado = true; } });
  return { chamadas, bloqueado };
}
const espaco = acionar({ checked: false }, ' ');
if (espaco.chamadas.join() !== 'true' || !espaco.bloqueado) fail('Espaço deveria ligar e bloquear o scroll', espaco);
const enter = acionar({ checked: true }, 'Enter');
if (enter.chamadas.join() !== 'false') fail('Enter deveria desligar', enter);
if (acionar({ checked: false }, 'a').chamadas.length) fail('outras teclas não fazem nada');
if (acionar({ checked: false, disabled: true }, ' ').chamadas.length) fail('desabilitado ignora o teclado');
if (acionar({ checked: false }, 'click').chamadas.join() !== 'true') fail('clique continua alternando');
if (acionar({ checked: false, disabled: true }, 'click').chamadas.length) fail('desabilitado ignora o clique');

console.log('OK: Toggle (role=switch, aria-checked, tab, Espaço/Enter, clique, desabilitado)');
```

```bash
npm run build && node scripts/smoke-toggle.mjs; echo "exit=$?"
```

Esperado: **falha** (`exit=1`) com `FAIL: switch ligado`.

- [ ] **Step 2: Verde**

Em `project/package/src/components/Toggle/Toggle.tsx`, substitua:

```tsx
  const w = size === 'sm' ? 32 : 40, h = size === 'sm' ? 18 : 22, knob = h - 4;
  return (
```

por:

```tsx
  const w = size === 'sm' ? 32 : 40, h = size === 'sm' ? 18 : 22, knob = h - 4;
  const alternar = () => { if (!disabled) onChange?.(!checked); };
  return (
```

Em `project/package/src/components/Toggle/Toggle.tsx`, substitua:

```tsx
      <span onClick={() => !disabled && onChange?.(!checked)} style={{
        width: w, height: h, borderRadius: 999, flex: 'none', position: 'relative',
        background: checked ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background 200ms var(--ob-ease)',
      }}>
```

por:

```tsx
      <span
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        aria-label={typeof label === 'string' ? label : undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={alternar}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(); } }}
        style={{
          width: w, height: h, borderRadius: 999, flex: 'none', position: 'relative',
          background: checked ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background 200ms var(--ob-ease)',
        }}>
```

```bash
npm run build && node scripts/smoke-toggle.mjs
```

Esperado: `OK: Toggle (role=switch, aria-checked, tab, Espaço/Enter, clique, desabilitado)`. O smoke chama `Toggle(props)` como função (ele não usa hooks) e aciona `onKeyDown`/`onClick` do elemento retornado, então o teclado é testado de verdade, sem DOM.

- [ ] **Step 3: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0, `20/20 smokes ok`.

- [ ] **Step 4: Commit**

```bash
git add project/package/src/components/Toggle/Toggle.tsx project/package/scripts/smoke-toggle.mjs
git commit -m "feat(toggle): expõe role switch e aciona por teclado"
```

---

### Task 10: `Tooltip` não fica mais preso aberto com hover + foco

**Files:**
- Modify: `project/package/src/components/Tooltip/Tooltip.tsx` (CRLF)

**Interfaces:**
- Mudança de comportamento: `show` limpa o timer anterior antes de criar outro.

- [ ] **Step 1: Aplicar a correção**

Em `project/package/src/components/Tooltip/Tooltip.tsx`, substitua:

```tsx
  const show = () => { timer.current = setTimeout(() => setOpen(true), delay); };
```

por:

```tsx
  // Limpa o timer anterior: hover + foco chamam `show` duas vezes, e o primeiro timer,
  // órfão, reabriria o tooltip depois do `hide` (ele ficava preso aberto).
  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
```

- [ ] **Step 2: Roteiro de leitura (usa `useState`/`useRef`/timers; não roda em `renderToStaticMarkup`)**

Antes: `mouseenter` → `show` cria o timer A; `focus` → `show` cria o timer B e `timer.current = B` (A fica órfão); `mouseleave` → `hide` limpa só B e fecha; A dispara e reabre o tooltip → **preso aberto**.
Depois: `mouseenter` → timer A; `focus` → `show` limpa A e cria B; `mouseleave` → `hide` limpa B e fecha; nada reabre. O caminho de um só evento (só hover ou só foco) é idêntico ao de antes. Confirme que `hide` e o restante do componente não mudaram (`git diff` deve mostrar só o `show`).

- [ ] **Step 3: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0 (o smoke de estilos continua passando: a keyframe `ob-tip-kf` não mudou).

- [ ] **Step 4: Commit**

```bash
git add project/package/src/components/Tooltip/Tooltip.tsx
git commit -m "fix(tooltip): limpa o timer anterior para não ficar preso aberto"
```

---

### Task 11: `Modal` — atributos de acessibilidade

**Files:**
- Modify: `project/package/src/components/Modal/Modal.tsx`
- Modify: `project/package/scripts/smoke-modal.mjs`

**Interfaces:**
- Mudança (só atributos): o painel ganha `role="dialog"`, `aria-modal="true"` e `aria-labelledby` (só quando há `title`) apontando para o `<h3 id>`; o botão de fechar ganha `aria-label="Fechar"`. O id vem de `useId` (único por instância). Nada de estilo, foco, portal ou `type` de botão (fora de escopo).

- [ ] **Step 1: Vermelho — smoke novo contra o código de hoje**

Em `project/package/scripts/smoke-modal.mjs`, substitua:

```js
console.log('OK: Modal (fechado, aberto, tamanhos, largura explícita, rodapé opcional)');
```

por:

```js
// Acessibilidade (Fase 3): role, aria-modal, título associado e botão de fechar com nome.
const a11y = render({ open: true, title: 'Título' }, 'c');
if (!a11y.includes('role="dialog"') || !a11y.includes('aria-modal="true"')) fail('role="dialog" / aria-modal', a11y);
const rotulado = a11y.match(/aria-labelledby="([^"]+)"/);
const idTitulo = a11y.match(/<h3 id="([^"]+)"/);
if (!rotulado || !idTitulo || rotulado[1] !== idTitulo[1]) fail('aria-labelledby deveria apontar para o id do <h3>', a11y);
if (!a11y.includes('aria-label="Fechar"')) fail('botão de fechar sem nome acessível', a11y);
if (render({ open: true }, 'c').includes('aria-labelledby')) fail('sem título não deveria ter aria-labelledby');
// Dois modais abertos na mesma página não podem compartilhar o id do título.
const dois = renderToStaticMarkup(React.createElement('div', null,
  React.createElement(Modal, { open: true, title: 'A' }, 'a'),
  React.createElement(Modal, { open: true, title: 'B' }, 'b')));
const ids = [...dois.matchAll(/<h3 id="([^"]+)"/g)].map((m) => m[1]);
if (ids.length !== 2 || ids[0] === ids[1]) fail('ids de título deveriam ser únicos por instância', ids);

console.log('OK: Modal (fechado, aberto, tamanhos, largura explícita, rodapé opcional, acessibilidade)');
```

```bash
npm run build && node scripts/smoke-modal.mjs; echo "exit=$?"
```

Esperado: **falha** (`exit=1`) com `FAIL: role="dialog" / aria-modal`.

- [ ] **Step 2: Verde**

Em `project/package/src/components/Modal/Modal.tsx`, substitua:

```tsx
import React, { useEffect } from 'react';
```

por:

```tsx
import React, { useEffect, useId } from 'react';
```

Em `project/package/src/components/Modal/Modal.tsx`, substitua:

```tsx
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;
  useEffect(() => {
```

por:

```tsx
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;
  const titleId = useId();
  useEffect(() => {
```

Em `project/package/src/components/Modal/Modal.tsx`, substitua:

```tsx
      <div onClick={(e) => e.stopPropagation()} style={{
        width: resolvedWidth,
```

por:

```tsx
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} style={{
        width: resolvedWidth,
```

Em `project/package/src/components/Modal/Modal.tsx`, substitua:

```tsx
<h3 style={{ margin: 0,
```

por:

```tsx
<h3 id={titleId} style={{ margin: 0,
```

Em `project/package/src/components/Modal/Modal.tsx`, substitua:

```tsx
<button onClick={onClose} style={{
```

por:

```tsx
<button onClick={onClose} aria-label="Fechar" style={{
```

```bash
npm run build && node scripts/smoke-modal.mjs
```

Esperado: `OK: Modal (fechado, aberto, tamanhos, largura explícita, rodapé opcional, acessibilidade)`. Confira no código final que `useId()` vem ANTES do `if (!open) return null` (ordem de hooks) e que o `useEffect` de Escape não mudou.

- [ ] **Step 3: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0 (o golden de CSS segue igual: a keyframe `ob-modal-kf` não mudou).

- [ ] **Step 4: Commit**

```bash
git add project/package/src/components/Modal/Modal.tsx project/package/scripts/smoke-modal.mjs
git commit -m "feat(modal): adiciona role dialog, aria-modal e nome acessível"
```

---

### Task 12: `Pagination` — atributos de acessibilidade

**Files:**
- Modify: `project/package/src/components/Pagination/Pagination.tsx`
- Modify: `project/package/scripts/smoke-pagination.mjs`

**Interfaces:**
- Consumes: a `Pagination` já corrigida (Tarefa 6).
- Mudança (só atributos + tag): a raiz `<div>` vira `<nav aria-label="Paginação">` com o MESMO `style`; a página atual ganha `aria-current="page"`; as setas ganham `aria-label` "Página anterior"/"Próxima página".

- [ ] **Step 1: Vermelho — asserções novas contra o código de hoje**

Em `project/package/scripts/smoke-pagination.mjs`, substitua:

```js
console.log('OK: Pagination (janela de páginas, duas reticências, setas desabilitadas, página ativa)');
```

por:

```js
// Acessibilidade (Fase 3): navegação rotulada, página atual e setas com nome.
if (!ativa.startsWith('<nav aria-label="Paginação"')) fail('a raiz deveria ser <nav aria-label="Paginação">', ativa);
if ((ativa.match(/aria-current="page"/g) || []).length !== 1) fail('só a página atual deveria ter aria-current', ativa);
if (!/aria-current="page"[^>]*>6<\/button>/.test(ativa)) fail('aria-current deveria estar na página 6', ativa);
if (!ativa.includes('aria-label="Página anterior"') || !ativa.includes('aria-label="Próxima página"')) fail('setas sem nome acessível', ativa);

console.log('OK: Pagination (janela de páginas, duas reticências, setas desabilitadas, página ativa, acessibilidade)');
```

```bash
npm run build && node scripts/smoke-pagination.mjs; echo "exit=$?"
```

Esperado: **falha** (`exit=1`) com `FAIL: a raiz deveria ser <nav aria-label="Paginação">`.

- [ ] **Step 2: Verde**

Em `project/package/src/components/Pagination/Pagination.tsx`, substitua:

```tsx
    <button disabled={disabled} onClick={() => onChange?.(dir === 'prev' ? page - 1 : page + 1)} style={{
```

por:

```tsx
    <button disabled={disabled} onClick={() => onChange?.(dir === 'prev' ? page - 1 : page + 1)} aria-label={dir === 'prev' ? 'Página anterior' : 'Próxima página'} style={{
```

Em `project/package/src/components/Pagination/Pagination.tsx`, substitua:

```tsx
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
```

por:

```tsx
    <nav aria-label="Paginação" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
```

Em `project/package/src/components/Pagination/Pagination.tsx`, substitua:

```tsx
      <Arrow dir="next" disabled={page === total} />
    </div>
```

por:

```tsx
      <Arrow dir="next" disabled={page === total} />
    </nav>
```

Em `project/package/src/components/Pagination/Pagination.tsx`, substitua:

```tsx
<button key={p} onClick={() => onChange?.(p)} style={{
```

por:

```tsx
<button key={p} onClick={() => onChange?.(p)} aria-current={p === page ? 'page' : undefined} style={{
```

```bash
npm run build && node scripts/smoke-pagination.mjs
```

Esperado: `OK: Pagination (janela de páginas, duas reticências, setas desabilitadas, página ativa, acessibilidade)`.

- [ ] **Step 3: Verificação completa**

```bash
npm run verify
```

Esperado: exit 0.

- [ ] **Step 4: Commit**

```bash
git add project/package/src/components/Pagination/Pagination.tsx project/package/scripts/smoke-pagination.mjs
git commit -m "feat(pagination): adiciona nav, aria-current e nome nas setas"
```

---

### Task 13: `README.md` do pacote

**Files:**
- Create: `project/package/README.md`

**Interfaces:**
- Produces: o README que o `npm pack` inclui automaticamente. Todas as afirmações foram conferidas contra o código: `styles.css` importa `@phosphor-icons/web/regular/style.css` e `tokens.css`; `Icons` tem 28 entradas e tamanho padrão 20; `Ph` tem `n`/`size` (18)/`c`/`style`; `Link`/`Pagination`/`Modal` usam `Icons`; `Alert`/`Select`/`SideNav` usam `Ph`.

- [ ] **Step 1: Criar o arquivo**

Crie (ou substitua o conteúdo de) `project/package/README.md` com:

````markdown
# @onblide/ui

Componentes React do design system Onblide, escritos em TypeScript. Pacote interno
(`"private": true`), mantido neste repositório em `project/package/`.

## Instalação e build

```bash
cd project/package
npm install
npm run build    # gera dist/: ESM, CJS, .d.ts e o bundle de navegador
npm run verify   # typecheck + build + teste de tipos (contra o .d.ts) + smokes
```

`dist/` é gerado e não é versionado: rode o build antes de usar o pacote ou de abrir as
páginas de preview em `project/ds/components/`.

## Uso

### Como módulo (ESM ou CJS)

```tsx
import { Button, Select } from '@onblide/ui';
import '@onblide/ui/styles.css'; // tokens + CSS do Phosphor (ver "Ícones")
```

`react` e `react-dom` (^18.3.1) são peer dependencies. O pacote também exporta
`@onblide/ui/tokens.css` (só os tokens) e `@onblide/ui/styles.css` (tokens + Phosphor).

### Como bundle de navegador (páginas de preview)

`dist/onblide-ui.browser.js` é um IIFE que registra todos os componentes como globais em
`window` (`Button`, `Select`, ...). Carregue-o **depois** de React e ReactDOM (UMD), pois ele
usa o `window.React` e o `window.ReactDOM` da página e não embute uma cópia própria de React:

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

## Ícones

Os componentes renderizam `<i class="ph ph-...">`. O pacote **não** injeta o CSS do Phosphor:
ele precisa estar carregado na página, senão os ícones aparecem vazios.

- Com bundler: `import '@onblide/ui/styles.css'` já traz o Phosphor (dependência
  `@phosphor-icons/web`) junto dos tokens.
- Com o bundle de navegador (IIFE) o CSS não vem junto. Use o CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

### `Ph` ou `Icons`?

Os dois existem e nenhum foi removido:

- **`Icons`**: registro com 28 ícones semânticos (`Icons.check`, `Icons.caretR`, ...). Cada
  entrada é uma função: `<Icons.check size={16} />` ou `Icons.check({ size: 16 })`. Tamanho
  padrão 20; a cor vem de `style`. Use para os ícones do registro, porque trocar o peso ou a
  fonte dos ícones num lugar só é a regra do projeto (`project/CLAUDE.md`). `Link`,
  `Pagination` e `Modal` usam `Icons`.
- **`Ph`**: `<Ph n="check" size={18} c="var(--ob-blue)" />` renderiza qualquer glifo Phosphor
  pelo nome (`n`), com cor por prop (`c`). Tamanho padrão 18. Use quando o ícone não estiver
  no registro. A maioria dos componentes (`Alert`, `Select`, `SideNav`, ...) usa `Ph`.

## Efeitos colaterais no import

Alguns módulos injetam `<style>` (keyframes) no `<head>` quando o pacote é importado, e
`ToastStack` define `window.obToast`. Por isso o `package.json` **não** declara
`"sideEffects": false`: com ele, um bundler poderia descartar essas injeções.

## Versionamento

Versões e changelog via [Changesets](https://github.com/changesets/changesets): escreva um
arquivo em `.changeset/`, rode `npx changeset version` e commite `package.json` e
`CHANGELOG.md`. Commits seguem Conventional Commits em português (`project/CLAUDE.md`).
````

- [ ] **Step 2: Conferir**

```bash
npm pack --dry-run --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const f=JSON.parse(s)[0].files.map(x=>x.path);console.log('README incluído:',f.includes('README.md'))})"
```

Esperado: `README incluído: true`. Releia o README contra o código se algum comando ou nome tiver mudado nas tarefas anteriores (por exemplo, `typecheck:dist`).

- [ ] **Step 3: Commit**

```bash
git add project/package/README.md
git commit -m "docs(package): adiciona README do pacote"
```

---

### Task 14: Auditoria de prontidão para o `/design-sync` (só relatório)

**Files:**
- Nenhum arquivo do repositório muda nesta tarefa, a menos que a auditoria ache um defeito real (aí corrija numa tarefa própria e commit próprio, e diga no relatório). O entregável é o relatório da tarefa, com a seção "Prontidão para o /design-sync".

**Interfaces:**
- Consumes: o pacote das Tarefas 1–13, com `dist/` construído (`npm run build`).

- [ ] **Step 1: Os alvos de `main`/`module`/`types`/`exports` existem**

```bash
npm run build
node --input-type=module -e "
import { readFileSync, existsSync } from 'node:fs';
const p = JSON.parse(readFileSync('package.json', 'utf8'));
const walk = (o) => (typeof o === 'string' ? [o] : Object.values(o).flatMap(walk));
let faltando = 0;
for (const alvo of [p.main, p.module, p.types, ...walk(p.exports)]) {
  const ok = existsSync(alvo);
  if (!ok) faltando++;
  console.log(ok ? 'ok    ' : 'FALTA ', alvo);
}
console.log(faltando ? 'FALHA: ' + faltando + ' alvo(s) inexistente(s)' : 'OK: todos os alvos de main/module/types/exports existem');
process.exit(faltando ? 1 : 0);
"
```

Esperado: `OK: todos os alvos ... existem` (`./dist/index.cjs`, `./dist/index.js`, `./dist/index.d.ts`, `./src/styles.css`, `./src/tokens.css`).

- [ ] **Step 2: ESM e CJS carregam e não vazam internos**

```bash
node -e "const m=require('./dist/index.cjs');console.log('cjs:',typeof m.Button,typeof m.Select,Object.keys(m).length,'exports')"
node --input-type=module -e "const m=await import('./dist/index.js');console.log('esm:',typeof m.Button,typeof m.Select,Object.keys(m).length,'exports');console.log('sem internos:',['PhIcon','MODAL_WIDTHS','injectStyleOnce','OB_TONES','OB_TOAST_POS','BADGE_TONES'].filter((k)=>k in m).length===0)"
```

Esperado: `function function 39 exports` nos dois formatos e `sem internos: true`.

- [ ] **Step 3: O que o `npm pack` publicaria**

```bash
npm pack --dry-run --json | node -e "
let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
  const j=JSON.parse(s)[0];const f=j.files.map((x)=>x.path);
  const deve=['package.json','README.md','dist/index.js','dist/index.cjs','dist/index.d.ts','dist/onblide-ui.browser.js','src/styles.css','src/tokens.css'];
  const naoDeve=f.filter((p)=>/^(src\/(components|primitives|internal)|scripts|\.changeset|node_modules)\//.test(p)||p==='src/index.ts');
  console.log('entradas:',j.entryCount,'tamanho:',j.size,'bytes; fontes:',f.filter((p)=>p.startsWith('src/fonts/')).length);
  console.log('faltando:',deve.filter((p)=>!f.includes(p)));
  console.log('não deveria estar:',naoDeve);
  process.exit(deve.every((p)=>f.includes(p))&&!naoDeve.length?0:1);
});"; echo "exit=$?"
```

Esperado: `faltando: []`, `não deveria estar: []`, `exit=0`. Referência antes do README: 74 entradas (63 fontes) e ~6,4 MB (as fontes dominam); com o README, 75.

- [ ] **Step 4: `sideEffects` — experimento com o `esbuild` (não altera o repositório)**

O `package.json` não declara `sideEffects` (o padrão dos bundlers é `true`). Verifique o que aconteceria se alguém declarasse `false`:

```bash
TMP=$(mktemp -d) && mkdir -p "$TMP/a/dist" "$TMP/b/dist"
cp dist/index.js "$TMP/a/dist/" && cp dist/index.js "$TMP/b/dist/"
node -e "
const fs=require('fs');const [tmp]=process.argv.slice(1);
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
fs.writeFileSync(tmp+'/a/package.json',JSON.stringify({...p,private:true},null,2));
fs.writeFileSync(tmp+'/b/package.json',JSON.stringify({...p,sideEffects:false},null,2));
for(const d of ['a','b'])fs.writeFileSync(tmp+'/'+d+'/entry.mjs','import { Button } from \"./dist/index.js\";\nconsole.log(typeof Button);\n');
" "$TMP"
for d in a b; do (cd "$TMP/$d" && "$OLDPWD/node_modules/.bin/esbuild" entry.mjs --bundle --format=esm --platform=neutral --external:react --external:react-dom --external:react/jsx-runtime --outfile=out.js --log-level=error && printf "%s: sideEffects=%s | linhas com ob-skeleton-kf/ob-modal-kf no bundle: " "$d" "$(node -p "JSON.stringify(require('./package.json').sideEffects)")" && grep -c "ob-skeleton-kf\|ob-modal-kf" out.js); done
rm -rf "$TMP"
```

Esperado (medido na 0.4.0): `a: sideEffects=undefined | ... 2` e `b: sideEffects=false | ... 2` — como o `dist/index.js` é um arquivo único e o módulo é usado (`Button`), as injeções ficam nos dois casos. **Decisão registrada:** não declarar `sideEffects` (o correto semanticamente, já que há injeção de `<style>` no import e `window.obToast`); o README já explica isso. Se o resultado divergir, reporte com os números.

- [ ] **Step 5: `@dsCard` na primeira linha**

A ferramenta `DesignSync` monta os cartões do painel a partir do comentário `<!-- @dsCard group="…" -->` na primeira linha de cada HTML de preview. Liste as páginas que carregam o bundle cuja linha 1 NÃO é esse comentário:

```bash
cd ../ds/components
for f in $(grep -l onblide-ui.browser.js *.html); do l=$(head -1 "$f" | tr -d '\r'); case "$l" in "<!-- @dsCard"*) ;; *) echo "linha 1 != @dsCard: $f";; esac; done | wc -l
grep -l onblide-ui.browser.js *.html | wc -l
cd ../../package
```

Esperado (medido): 21 de 27 têm `<!doctype html>` na linha 1 e o comentário na linha 2. **Só reporte**; ajustar (ou não) é decisão de quem roda o `/design-sync`.

- [ ] **Step 6: Escrever a seção "Prontidão para o /design-sync" no relatório**

Inclua: (a) os resultados dos Steps 1–5; (b) o que já está pronto (`name`, `version`, `exports`, `files`, `peerDependencies` de `react`/`react-dom`, `types`; `dist` gerado; pacote `private: true`); (c) o que a ferramenta `DesignSync` exige, segundo o esquema dela: o usuário inicia o `/design-sync`; o projeto de destino tem que ser do tipo design system (`list_projects`/`create_project`); `finalize_plan` fixa os caminhos (`writes`/`deletes`, até 256 entradas, globs permitidos) e o `localDir`; `write_files` lê de `localPath` dentro do `localDir` (até 256 arquivos por chamada); os cartões vêm do `@dsCard` da linha 1; existe `report_validate` com contagens de um `.render-check.json` — o que só o `/design-sync` vai dizer não deve ser inventado; (d) pendências para o usuário: conferência visual das 8 páginas dos Lotes B e C (`link`, `pagination`, `modal`, `select`, `deadline-calendar`, `slider`, `toast`, `code-input`), decisão sobre o `@dsCard` na linha 2 e o merge `dev`→`main`.

Sem commit (nada a commitar), salvo correção de defeito real, com commit próprio.

---

### Task 15: Verificação final e `project/CLAUDE.md`

**Files:**
- Modify: `project/CLAUDE.md`

**Interfaces:**
- Consumes: tudo das Tarefas 1–14.
- Produces: instruções duráveis para qualquer agente (verificação e a regra do navegador), já que a memória pessoal de um agente não vale para outro.

- [ ] **Step 1: Reinstalação limpa e verificação completa**

```bash
cd project/package
rm -rf node_modules dist && npm install
npm run verify
```

Esperado: exit 0 nos quatro passos e `20/20 smokes ok`.

- [ ] **Step 2: Superfície do `.d.ts` e varredura**

```bash
tail -c 5000 dist/index.d.ts | grep -oE "\b(SelectBaseProps|SingleSelectProps|MultiSelectProps|SliderBaseProps|SingleSliderProps|RangeSliderProps|SliderProps|SliderValue|SliderTone)\b" | sort -u
tail -c 5000 dist/index.d.ts | grep -cE "\b(PhIcon|MODAL_WIDTHS|injectStyleOnce|OB_TONES|OB_TOAST_POS|BADGE_TONES)\b"
cd ../ds/components && grep -rl onblide-ui.browser.js . | wc -l && grep -rln "ui_kits/web_app/\(Components\|Primitives\).jsx" . | wc -l && cd ../../package
```

Esperado: os nove nomes de tipo listados; `0` ocorrências de internos; `27` páginas com o bundle; `0` páginas com referência aos scripts antigos.

- [ ] **Step 3: Atualizar `project/CLAUDE.md`**

Em `project/CLAUDE.md`, antes da seção `## Implementation notes`, acrescente (use a ferramenta `Edit`, que preserva o fim de linha):

````markdown
## Verificação do pacote @onblide/ui

Tudo em `project/package/`:

```bash
npm run verify   # typecheck (src) → build → typecheck:dist (tipos como o consumidor vê) → smoke
```

- `npm run typecheck` só compila `src` e funciona sem `dist/`; `npm run typecheck:dist` compila
  `scripts/types-check.tsx` contra o `dist/index.d.ts` publicado e precisa do build antes.
- `npm run smoke` roda todos os `scripts/smoke-*.mjs` (falha se nenhum for encontrado). O golden do
  CSS injetado (`scripts/fixtures/injected-styles.json`) só muda de propósito, com
  `node scripts/smoke-injected-styles.mjs --update`.
- **Nenhum agente abre, fecha ou encerra Chrome/Edge** (nem headless, CDP ou `taskkill`) nem usa
  `mcp__claude-in-chrome__*`: uma verificação headless já encerrou o navegador do usuário e
  destruiu o trabalho manual dele. A conferência visual das páginas de preview é do usuário.

````

- [ ] **Step 4: Commit**

```bash
git add project/CLAUDE.md
git commit -m "docs: documenta a verificação do pacote e a regra do navegador no claude.md"
```

---

### Task 16: Release — 0.5.0

**Files:**
- Create: `project/package/.changeset/<nome>.md` (consumido pelo `changeset version`)
- Modify: `project/package/package.json` (bump de versão, via `changeset version`)
- Modify: `project/package/CHANGELOG.md`

**Interfaces:**
- Consumes: o pacote completo das Tarefas 1–15. Versão atual: `0.4.0`.

- [ ] **Step 1: Registrar o changeset**

`npx changeset add` é interativo e não funciona no ambiente de execução: escrever o arquivo manualmente em `project/package/.changeset/` (ex.: `fase3-endurecimento-release.md`), como nos releases anteriores:

```markdown
---
"@onblide/ui": minor
---

Fase 3 (endurecimento). Mudança visível: `Pagination` passa a mostrar as duas reticências quando há páginas escondidas dos dois lados (`1 … 5 6 7 … 20`). Quebras de tipo: `SelectProps` (desde a 0.4.0) e agora `SliderProps` são uniões discriminadas por `multi` e `range`; deixam de compilar `interface X extends SelectProps`, `Omit<SelectProps, …>` repassado a `<Select {...p}/>`, `SelectProps['onChange']` com parâmetro implícito e `<Select multi={variavelBoolean}/>` (o mesmo vale para `SliderProps` e `range`); use os tipos exportados `SelectBaseProps`/`SliderBaseProps` ou um ramo da união (`SingleSelectProps`, `MultiSelectProps`, `SingleSliderProps`, `RangeSliderProps`). Correções: o botão de remover do `Chip` tem `type="button"` (não envia mais formulário); o `Slider` não gera `NaN` com `min === max` e não deixa listeners pendurados ao desmontar durante um arrasto; o `Tooltip` não fica mais preso aberto com hover e foco juntos. Acessibilidade: `Toggle` vira um switch (`role="switch"`, `aria-checked`, foco por Tab, Espaço/Enter); `Modal` ganha `role="dialog"`, `aria-modal`, título associado e botão de fechar nomeado; `Pagination` ganha `<nav aria-label>`, `aria-current` e setas nomeadas. Infra: teste de tipos contra o `.d.ts` publicado (`npm run typecheck:dist`), golden do CSS injetado com ordem, runner de smokes que falha sem smokes, `README.md` do pacote.
```

- [ ] **Step 2: Aplicar o bump de versão**

```bash
npx changeset version
```

Esperado: `package.json` vai de `0.4.0` para `0.5.0` (minor); `CHANGELOG.md` ganha uma entrada `## 0.5.0` com o resumo acima; o arquivo de changeset é consumido (apagado).

- [ ] **Step 3: Rebuild e verificação**

```bash
npm run verify
```

Esperado: exit 0 (o bump não muda o conteúdo do build).

- [ ] **Step 4: Commit**

```bash
git add project/package/package.json project/package/CHANGELOG.md project/package/.changeset
git commit -m "chore(package): libera @onblide/ui 0.5.0"
```

---

## After this plan

O pacote fica pronto para o `/design-sync` de verdade (ação separada, decidida pelo usuário, com efeito num serviço externo). Pendências que não são tarefas de subagente: a conferência visual das 8 páginas dos Lotes B e C, a decisão sobre o `@dsCard` na linha 2 das 21 páginas, e o merge `dev`→`main`. Candidatos a uma próxima rodada (ver "Adiado" na spec): `<button>` sem `type` nos demais componentes, foco/portal do `Modal`, `aria-hidden` dos ícones, unificação `Ph`/`Icons`.
