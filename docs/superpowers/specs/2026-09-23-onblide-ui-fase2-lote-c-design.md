# `@onblide/ui` — Fase 2, Lote C (o que sobra do legado + limpezas adiadas)

**Status:** aprovado
**Data:** 2026-09-23

## Contexto

O pacote `@onblide/ui` está em `0.3.1` com 33 componentes portados: Fase 1
(7, `0.1.0`), Lote A (13, `0.2.0`) e Lote B (13, `0.3.0`/`0.3.1`). Este é o
último lote da Fase 2: o que sobrou em `Primitives.jsx` e `Components.jsx`
depois dos dois primeiros, mais as limpezas que os Lotes A e B deixaram
adiadas de propósito. Depois dele, os dois arquivos legados não têm mais
nenhum componente que o pacote ainda não tenha (exceto `Logo`, ver
Não-objetivos).

Regra herdada e reforçada: **nenhum agente pode lançar, abrir, fechar ou
encerrar Chrome/Edge** (nem headless, nem CDP, nem `taskkill`), nem usar as
ferramentas `mcp__claude-in-chrome__*`. Uma verificação headless do Lote B
encerrou o navegador do usuário e destruiu o trabalho manual dele (memória
`feedback_nao_mexer_no_navegador.md`). Toda verificação deste lote é por
comparação linha a linha com o original, `tsc --noEmit`, `npm run build` e
scripts de smoke em Node. A conferência visual das páginas migradas é do
usuário.

## Escopo

### Portes (7 itens legados)

| Item | Origem | Depende de |
|---|---|---|
| `PhIcon` (interno) | `Primitives.jsx:28-30` | — |
| `Icons` (28 fábricas) | `Primitives.jsx:32-61` | `PhIcon` |
| `Brands` (7 marcas SVG) | `Primitives.jsx:69-150` | — |
| `BrandTile` | `Primitives.jsx:154-166` | `Brands` |
| `Link` | `Components.jsx:94-113` | `Icons` (`arrowSquareOut`) |
| `Pagination` | `Components.jsx:138-178` | `Icons` (`caretL`, `caretR`) |
| `Modal` (+ `MODAL_WIDTHS`) | `Components.jsx:241-289` | `Icons` (`x`) |

Correção de contagem em relação ao pedido inicial: `Icons` tem **28**
entradas (linhas 33-60), não 25. `PhIcon` NÃO é exportado para `window` no
legado (`Object.assign(window, { Logo, Icons, Brands, BrandTile, ... })` em
`Primitives.jsx:854`), então fica interno no pacote, como `badgeTones.ts`.

Destino (mesma convenção dos lotes anteriores): `src/primitives/` para o que
vem de `Primitives.jsx` (`Icons/PhIcon.tsx`, `Icons/Icons.tsx`,
`Brands/Brands.tsx`, `BrandTile/BrandTile.tsx`), `src/components/` para o que
vem de `Components.jsx` (`Link`, `Pagination`, `Modal`).

### Limpezas adiadas dos Lotes A e B

| Limpeza | Origem do adiamento | Tarefa |
|---|---|---|
| Helper interno `injectStyleOnce(id, css)` no lugar de 8 blocos repetidos de injeção de `<style>` em 7 arquivos | Lote A M3 / Lote B M4 | 2 |
| Golden do CSS injetado (guarda de regressão para o refactor acima) | novo, necessário pela regra de zero mudança de comportamento | 1 |
| `Table<T extends Record<string, unknown>>` rejeita `interface` sem index signature → `T extends object` | Lote B M1 | 8 |
| `Select.onChange` não aceita `setState` direto → props discriminadas por `multi` | Lote B M2 | 8 |
| Script npm `smoke` que roda todos os `smoke-*.mjs` | Lote B M6 | 9 |

A contagem "9 blocos" citada informalmente antes é, na verdade, **8 blocos
em 7 arquivos** (CodeInput, ProgressBar, SearchInput, Skeleton, Tooltip,
Spinner e ToastStack — este com dois). O mapeamento de tom→cor repetido
entre Spinner/ProgressCircle/Slider (Lote A M2) NÃO é consolidado: os
vocabulários de tom fazem parte da API pública de cada componente e não são
o mesmo conjunto.

## Não-objetivos

- **`Logo`** (`Primitives.jsx:11-23`) — decisão do usuário: já redesenhado com
  a marca nova, só `Screens.jsx` o usa e `Screens.jsx` está fora de escopo
  desde a Fase 1. Continua fora.
- **Tipagem discriminada single/range do `Slider`** (Lote A M5) — decisão de
  API sem nenhum consumidor ainda; fica para a fase de endurecimento antes
  do `/design-sync`.
- **`Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx`**, suíte de testes
  automatizados, mudança de comportamento ou visual de qualquer componente,
  rodar o `/design-sync` de verdade, remover os arquivos legados
  `Components.jsx`/`Primitives.jsx` (o `Screens.jsx` ainda depende deles).
- **Defeitos herdados do legado** (preservados, ver Riscos): o lote é um
  porte fiel e não corrige comportamento.

## Migração de páginas de preview

As três páginas abaixo são as **únicas** de `ds/components/` que ainda
carregam os scripts antigos (`grep -ln "ui_kits/web_app/\(Components\|Primitives\).jsx" ds/components/*.html`).
Nenhuma carrega o CSS do Phosphor, então os ícones (`Icons.*`) ficariam
invisíveis — cada migração adiciona o `<link>` do Phosphor
(`https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css`).

- `components-link.html` — só `Link` (+ `Demo` local); carrega só
  `Components.jsx`, que espera um global `Icons` que essa página nunca
  definiu (o link externo quebra hoje).
- `components-pagination.html` — só `Pagination` (+ `Demo` local); mesmo
  problema com `Icons` ausente.
- `components-modal.html` — `Modal` (+ `Btn`/`Demo` locais); carrega
  `Primitives.jsx` e `Components.jsx`; a tag antiga de `Primitives.jsx` só
  servia para fornecer `Icons` ao `Modal`.

Regra herdada do Lote B: confirmar por grep que todos os componentes
usados na demo estão no bundle e remover AS DUAS tags antigas por
completo. Depois do lote, `grep -ln "ui_kits/web_app/(Components|Primitives).jsx" ds/components/*.html`
deve retornar vazio; qualquer resultado é reportado.

`Icons`, `Brands`, `BrandTile`, `injectStyleOnce` e as limpezas de tipos não
têm página de preview própria: verificados por smoke (Node) e por
`tsc`.

## Decisões técnicas

Herdadas sem mudança: TypeScript estrito, um componente por arquivo,
estilo 100% `style={{ }}`, build `tsup` (biblioteca + IIFE, **`tsup.config.ts`
não muda**), Conventional Commits em português sem atribuição de IA,
documentação em português, `package-lock.json` (ruído local) nunca entra em
commit, sem amend de commit já publicado.

Novas neste lote:

1. **`Icons` tipado como `Record<IconName, IconComponent>`** com `IconName`
   como união explícita das 28 chaves (o compilador barra chave faltando ou
   sobrando) e `IconComponent = (p?: IconProps) => React.ReactElement`. A
   API legada `<Icons.check size={12}/>` e `Icons.check({ size: 12 })`
   continua funcionando. Tipos públicos exportados por `src/index.ts`:
   `IconProps`, `IconName`, `IconComponent`.
2. **`Brands: Record<BrandKey, Brand>`**; `BrandTile` mantém o `return null`
   para marca desconhecida (chamadas vindas de JS). Tipos públicos: `Brand`,
   `BrandKey`, `BrandTileProps`.
3. **`Modal`**: NÃO é portal (o original renderiza inline com
   `position: fixed`; nada de `ReactDOM.createPortal`), então não toca no
   mapeamento `react-dom`→`window.ReactDOM`. `open: boolean` obrigatório e
   `onClose?` opcional (o original usa `onClose?.()`). Tipos públicos:
   `ModalProps`, `ModalSize`.
4. **`injectStyleOnce(id, css)`** em `src/internal/injectStyleOnce.ts`
   (novo diretório `internal`, NÃO reexportado): mesmo guard, mesmo
   momento de execução (nível de módulo), mesmos ids e strings CSS.
5. **Golden de CSS injetado** (`scripts/fixtures/injected-styles.json` +
   `scripts/smoke-injected-styles.mjs` + `scripts/lib/injected-styles.mjs`):
   coleta todos os `<style>` injetados ao importar `dist/index.js` sob um
   `document` falso e compara byte a byte com o golden versionado. É
   capturado ANTES do refactor (Tarefa 1) e o refactor (Tarefa 2) não pode
   tocá-lo. A Tarefa 7 (Modal) acrescenta exatamente uma chave
   (`ob-modal-kf`) ao golden, de propósito.
6. **Tipos de `Table` e `Select`**: `Table<T extends object>` (acessos
   `row[col.key]` passam a usar `(row as Record<string, unknown>)[col.key]`,
   mesmo comportamento) e `SelectProps = SingleSelectProps | MultiSelectProps`
   discriminada por `multi` (o corpo do componente só troca a desestruturação
   por `props as SelectLooseProps`). Verificação por um arquivo de tipos
   (`scripts/types-check.tsx`, compilado por `tsconfig.types.json` dentro de
   `npm run typecheck`) com `@ts-expect-error` nos casos que devem errar.
   Custo aceito e documentado: `<Select multi={variavelBoolean} .../>` deixa
   de compilar (a união não discrimina um `boolean` solto); não há consumidor
   TypeScript hoje, e as páginas de demo são JS.
7. **`scripts/run-smokes.mjs` + scripts npm `smoke` e `verify`**
   (`verify` = typecheck + build + smoke).

## Riscos

- **Tabela de nomes do `Icons`.** Um nome de glifo Phosphor errado renderiza
  um ícone vazio, sem erro. Mitigação: `smoke-icons.mjs` tem uma tabela
  independente das 28 entradas, e a transcrição foi comparada por diff
  mecânico contra `Primitives.jsx:33-60` (idêntica).
- **`Pagination` tem um defeito herdado.** `pages = [...new Set(pages)]`
  também colapsa os DOIS `'…'` em um só: com reticências dos dois lados
  (ex.: `page=6, total=20`) só a da esquerda aparece (`1 … 5 6 7 20`). O
  porte preserva isso (zero mudança de comportamento) e o smoke documenta o
  comportamento real; corrigir é decisão para a fase de endurecimento.
  Confirmado rodando o algoritmo do legado em Node puro.
- **`Modal`**: `useEffect` de Escape com deps `[open, onClose]` antes do
  `return null` (ordem de hooks preservada), backdrop fecha no clique e o
  painel interrompe a propagação, e o par de keyframes `ob-fade`/`ob-pop`
  sob o id `ob-modal-kf`. Só `open:false` → vazio, `open:true` e as larguras
  são automatizáveis; Escape, clique no backdrop e hover do botão de fechar
  dependem de eventos e só a comparação de código os cobre.
- **Refactor `injectStyleOnce`**: risco de mudar uma string CSS por engano.
  Mitigado pelo golden capturado antes e pelo diff mecânico (um ensaio das
  trocas exatas deste plano, aplicadas numa cópia do `src/`, gerou golden
  idêntico).
- **`Table<T extends object>`**: o acesso indexado precisa do cast
  interno; comportamento em runtime é idêntico (é só tipo).
- **Conferência visual pendente.** Nenhum agente abre navegador, então as 3
  páginas deste lote, mais as 5 do Lote B que ainda aguardam olho humano
  (`components-select`, `components-deadline-calendar`, `components-slider`,
  `components-toast`, `components-code-input`), ficam para o usuário. O
  merge de `dev` em `main` continua parado por isso.

## Verificação

Sem navegador, sempre: `tsc --noEmit` (agora também `-p tsconfig.types.json`)
limpo, `npm run build` com os 4 artefatos, todos os `smoke-*.mjs` via
`npm run smoke`, superfície do `.d.ts` (nomes novos presentes; `PhIcon`,
`injectStyleOnce`, `MODAL_WIDTHS`, `OB_TONES`, `OB_TOAST_POS`,
`BADGE_TONES` ausentes), varredura de referências antigas em
`ds/components/`, e contagem real de páginas que carregam o bundle
atualizada em `project/CLAUDE.md` (24 → 27). Release `0.4.0` (minor)
via Changesets; tag e push ficam com o controlador.
