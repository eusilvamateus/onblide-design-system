# `@onblide/ui` — Fase 3: endurecimento antes do `/design-sync`

**Status:** aprovado
**Data:** 2026-09-23

## Contexto

A Fase 2 terminou o porte: o pacote `@onblide/ui` (`project/package/`, versão `0.4.0`, branch
`dev`) tem todos os componentes do legado (`Components.jsx`/`Primitives.jsx`) e as 27 páginas
de preview que dependiam deles já carregam o bundle novo. Os três lotes passaram por revisão
final e deixaram uma lista de pontos adiados de propósito, porque a regra dos lotes de porte
era comportamento idêntico ao legado. Esta fase resolve essa lista **antes** de rodar o
`/design-sync` de verdade (ação separada, com efeito num serviço externo, decidida pelo
usuário): a partir daqui o pacote deixa de ser só uma cópia fiel do legado e passa a ser a
fonte de verdade.

Origem dos itens: achados M1–M5 da revisão final do Lote C
(`.superpowers/sdd/2026-09-23-onblide-ui-fase2-lote-c/final-review.md`), achados adiados do
Lote A (M2/M3/M5) e do Lote B, e defeitos herdados do legado registrados nas revisões.

## Regras desta fase

- **Mudanças de comportamento são permitidas, mas só as listadas abaixo**, cada uma numa
  tarefa própria, com smoke ou teste que trava o novo comportamento e registro no changeset.
  Tudo o mais continua idêntico ao que é hoje; nas tarefas só de tipos isso é provado por
  diff do JS emitido antes/depois.
- **Nenhum agente abre, fecha ou encerra Chrome/Edge** (nem headless, CDP ou `taskkill`) nem usa
  `mcp__claude-in-chrome__*`: uma verificação headless do Lote B encerrou o navegador do
  usuário. Verificação = comparação com o original, `tsc`, `npm run verify`, smokes Node
  (`react-dom/server`) e testes de tipos. Conferência visual é do usuário.

## Escopo

| # | Item | Tipo | Onde |
|---|---|---|---|
| 1 | Teste de tipos compilado contra o `.d.ts` **publicado**, não contra `src` (achado M3) | infra | `tsconfig.types.json`, `scripts/types-check.tsx`, `package.json` |
| 2 | `SelectBaseProps` exportado; quebra de tipos da união `SelectProps` documentada por teste e no changeset (M1/M2) | tipos | `Select.tsx`, `types-check.tsx` |
| 3 | Runner de smokes falha quando não encontra nenhum smoke (M4) | infra | `scripts/run-smokes.mjs` |
| 4 | Golden do CSS injetado trava a **ordem** de inserção e injeções duplicadas (M5) | infra | `scripts/lib/injected-styles.mjs`, `smoke-injected-styles.mjs`, fixture |
| 5 | `SliderProps` discriminado por `range` (adiado do Lote A, M5), sem mudar o runtime | tipos | `Slider.tsx`, `types-check.tsx` |
| 6 | `Pagination`: mostrar as duas reticências (defeito herdado do `Set`) | comportamento | `Pagination.tsx`, `smoke-pagination.mjs` |
| 7 | `Chip`: botão de remover com `type="button"` | comportamento | `Chip.tsx` |
| 8 | `Slider`: sem `NaN` com `min === max`; sem listeners pendurados ao desmontar durante um arrasto | comportamento | `Slider.tsx` |
| 9 | `Toggle`: `role="switch"`, `aria-checked`, foco por Tab e acionamento por Espaço/Enter | comportamento + a11y | `Toggle.tsx` |
| 10 | `Tooltip`: hover + foco não deixam mais o tooltip preso aberto | comportamento | `Tooltip.tsx` |
| 11 | `Modal`: `role="dialog"`, `aria-modal`, título associado, botão de fechar nomeado | a11y (atributos) | `Modal.tsx` |
| 12 | `Pagination`: `<nav aria-label>`, `aria-current="page"`, setas nomeadas | a11y (atributos) | `Pagination.tsx` |
| 13 | `README.md` do pacote (instalação, ESM vs IIFE, Phosphor, `Ph` vs `Icons`) | doc | `project/package/README.md` |
| 14 | Auditoria de prontidão para o `/design-sync` (`package.json`, `sideEffects`, `npm pack`, `exports`, `@dsCard`) | auditoria | só relatório |
| 15 | Verificação final e `project/CLAUDE.md` (comandos de verificação e a regra do navegador) | doc | `project/CLAUDE.md` |
| 16 | Release `0.5.0` | release | `package.json`, `CHANGELOG.md` |

Versão alvo: **0.5.0** (minor). Há quebra de tipos (`SliderProps` vira união, como `SelectProps`
na 0.4.0) e uma mudança visível (`Pagination`); em 0.x isso é minor.

## Decisões e o que a leitura do código mostrou

- **`SelectBaseProps` (M2).** Hoje é `interface` local do `Select.tsx`; o `tsup` a deixa no
  `.d.ts` sem exportá-la, então o consumidor não consegue nomeá-la. Basta `export`. Três padrões
  que compilavam na 0.3.x quebraram com a união da 0.4.0 e ficam travados por
  `@ts-expect-error` no teste: `interface X extends SelectProps`, `Omit<SelectProps, …>`
  repassado a `<Select {...p}/>` e `SelectProps['onChange']` com parâmetro implícito. As
  alternativas que funcionam (`extends SelectBaseProps`, `extends SingleSelectProps`,
  `Omit<SelectBaseProps, …>`) entram no mesmo teste. Todas as afirmações foram executadas com
  `tsc` numa cópia antes de entrarem no plano.
- **Teste de tipos contra o `.d.ts` (M3).** `tsconfig.types.json` ganha
  `paths: { "@onblide/ui": ["./dist/index.d.ts"] }` e o teste importa de `@onblide/ui`. Custo:
  ele precisa do `dist/`. Por isso `typecheck` volta a ser só `tsc --noEmit` (funciona num clone
  sem build), o teste vira `typecheck:dist`, e `verify` passa a ser
  `typecheck → build → typecheck:dist → smoke`. Provado: sem `dist/` dá `TS2307`; importando um
  tipo não exportado dá `TS2724`.
- **Golden com ordem (M5).** O coletor devolve um array `[{ id, css }]` com uma entrada por
  `appendChild` (hoje usa `Map.set` e ordena por chave, o que esconde ordem e duplicatas). A
  ordem real de inserção hoje é: `ob-skeleton-kf`, `ob-tip-kf`, `ob-prim-kf`, `ob-indet-kf`,
  `ob-toast-kf`, `ob-toast-pos`, `ob-shake-kf`, `ob-spin-kf`, `ob-modal-kf` (ela vem da ordem
  de `export *` em `src/index.ts`; reordenar exports agora exige `--update` de propósito). O CSS
  por id é idêntico ao golden antigo (comparado por script). O smoke ganhou duas guardas contra
  verde falso que apareceram ao testar: golden em formato antigo (objeto) e coleta vazia.
  Provado por mutação em cópias: trocar duas entradas, remover uma, injetar o mesmo id duas vezes
  e um `dist` que não injeta nada falham.
- **`Slider` (tipos).** Mesmo desenho do `Select`: `SingleSliderProps` (`range?: false`,
  `value?: number`, `onChange?: (n: number) => void`), `RangeSliderProps` (`range: true`,
  `value?: [number, number]`, `onChange?: (v: [number, number]) => void`), `SliderBaseProps`
  exportado, `SliderProps` a união. O corpo lê as props numa forma frouxa interna. Diff do JS
  emitido: um único hunk (a desestruturação passa de parâmetros para `const {…} = props`).
  Custo de API, documentado no changeset: deixam de compilar `<Slider range={variavelBoolean}/>`,
  `interface X extends SliderProps`, `Omit<SliderProps, …>` e `SliderProps['onChange']` com
  parâmetro implícito. `SliderValue` e `SliderTone` continuam exportados.
- **`Pagination` (reticências).** `[...new Set(pages)]` só deduplicava `'…'`: os números nunca se
  repetem (`left..right` fica dentro de `2..total-1`). Remover a linha reinstitui a segunda
  reticência (`page=6,total=20`: `1 … 5 6 7 … 20`; `page=4,total=9,siblings=0`: `1 … 4 … 9`). O
  smoke prova por varredura (8 totais × 3 `siblings` × todas as páginas) que o algoritmo novo é
  igual ao legado exceto pelo segundo `'…'`.
- **`Chip`.** O `<button>` de remover não tem `type`; dentro de um `<form>` o padrão HTML é
  `submit`. Uma linha. O restante do `Chip` (que já é `role="button"` num `<span>`) não muda.
- **`Slider` (comportamento).** (a) `pct` divide por `max - min`; com `min === max` gera
  `left:NaN%`/`right:NaN%` (confirmado renderizando o `dist` atual); passa a devolver 0. (b)
  `startDrag` registra `pointermove/up/cancel` no `document` e só os remove no `pointerup`; se o
  componente desmontar antes, os listeners ficam e `valFromX` lê `trackRef.current!` nulo. Um
  `Set` de limpezas ativas + `useEffect` de desmontagem resolve, inclusive para arrastos
  simultâneos. A parte (b) e a do `Tooltip` só são comprováveis por leitura e por revisão
  independente (hooks e listeners do `document` não rodam em `renderToStaticMarkup`); a spec
  aceita isso porque a correção tem poucas linhas e o cenário é descrito passo a passo.
- **`Toggle`.** Hoje é um `<span onClick>` sem foco nem semântica: inacessível por teclado. A
  correção é aditiva: `role="switch"`, `aria-checked`, `aria-disabled`, `tabIndex`, `aria-label`
  quando o `label` é string, e `onKeyDown` para Espaço/Enter (com `preventDefault` nos dois, para
  não rolar a página). Sem `outline: none`: o anel de foco padrão do navegador aparece só no
  foco por teclado (única mudança visual, desejada). O `Toggle` não usa hooks, então o smoke o
  chama como função e aciona os handlers sem DOM (teclado, clique, desabilitado).
- **`Tooltip`.** `show` cria um `setTimeout` sem limpar o anterior. Com hover e foco juntos há
  dois timers; `hide` só limpa o último, e o outro reabre o tooltip depois de fechado. Correção:
  limpar o timer anterior em `show`. Cenário para o revisor: mouseenter (timer A) → focus (limpa
  A, timer B) → mouseleave (limpa B, fecha) → nada reabre.
- **`Modal` e `Pagination` (a11y).** Só atributos. `Modal`: `role="dialog"` e `aria-modal="true"` no
  painel, `aria-labelledby` apontando para o `<h3>` (id via `useId`, único por instância, só
  quando há título) e `aria-label="Fechar"` no botão do ícone. `Pagination`: a raiz `<div>` vira
  `<nav aria-label="Paginação">` (mesmo `style`, mesmo layout), `aria-current="page"` na página
  ativa, `aria-label` "Página anterior"/"Próxima página" nas setas.
- **`Ph` vs `Icons`.** Existem dois caminhos para ícones e o `project/CLAUDE.md` pede um registro
  único. Nenhum é removido nem unificado nesta fase (seria mudança de API sem consumidor real
  para orientar); o README documenta quando usar cada um. Unificar fica como decisão futura.
- **`sideEffects`.** O `package.json` não declara `sideEffects`, o que os bundlers tratam como
  `true` (seguro): vários módulos injetam `<style>` no import e `ToastStack` define
  `window.obToast`. A auditoria testa com o `esbuild` num diretório temporário; como o `dist` é
  um arquivo único, mesmo `sideEffects: false` manteria as injeções quando o módulo é usado, mas
  seria semanticamente errado e frágil. Decisão: **não declarar**, e dizer isso no README.
- **`@dsCard`.** A ferramenta `DesignSync` monta os cartões do painel a partir do comentário
  `<!-- @dsCard group="…" -->` na **primeira linha** de cada HTML de preview. Das 27 páginas que
  carregam o bundle, 21 têm `<!doctype html>` na linha 1 e o comentário na linha 2 (convenção
  antiga do repositório). A auditoria só reporta; decidir/ajustar é parte de rodar o
  `/design-sync`, não desta fase.

## Adiado (com o motivo)

- **`<button>` sem `type` nos demais componentes** (19 linhas em 12 arquivos, fora o `Chip`:
  `Alert`, `Drawer`, `Dropdown`, `Modal`, `Pagination`, `SearchInput`, `SideNav`, `Tabs`, `Toast`,
  `Datepicker`, `DeadlineCalendar` e o `Button`). É a mesma classe do defeito do `Chip`, mas
  a decisão de escopo desta fase é só o que foi listado; o `Button` em particular não pode mudar
  sem antes dar ao consumidor uma prop `type` (hoje ele não tem, então não consegue enviar um
  formulário de outro jeito). Candidato a uma próxima rodada, com varredura única e teste.
- **`Modal`:** foco inicial, captura de foco (focus trap) e portal (um ancestral com `transform`
  quebra o `position: fixed`). São mudanças de comportamento/estrutura maiores que atributos.
- **`Icons`:** `aria-hidden` sem alternativa textual (decisão de API de ícone).
- **`Slider`:** segundo arrasto simultâneo, `step <= 0`, largura zero da trilha. Ninguém reportou;
  fora da lista.
- **`Toggle`:** clicar no texto do `label` não alterna (o `<label>` não tem controle associado).
  Corrigir muda o comportamento do clique.
- **`Tooltip`:** timer pendente ao desmontar (inofensivo no React 18).
- **`Logo`** e a remoção de `Components.jsx`/`Primitives.jsx` (as telas `Screens.jsx`/`Chrome.jsx`
  ainda os usam).
- **Rodar o `/design-sync`.**

## Riscos

- Duas correções (`Slider` ao desmontar, `Tooltip`) não têm teste automatizado possível sem um
  DOM; a mitigação é revisão com roteiro explícito, e o custo de erro é baixo (poucas linhas).
- `Toggle` passa a ser focável e mostra o anel de foco do navegador com o teclado: mudança visual
  intencional e pequena.
- Fim de linha: parte dos arquivos do working tree está em CRLF (`core.autocrlf=true`):
  `Slider.tsx`, `Chip.tsx`, `Toggle.tsx`, `Tooltip.tsx`, `smoke-slider.mjs` entre os que esta fase
  edita. A ferramenta de edição preserva o fim de linha; edições por script devem fazer o mesmo.
- O teste de tipos agora depende do build; o `verify` e o plano já refletem a ordem.

## Verificação

`npm run verify` (typecheck → build → typecheck:dist → smoke) verde ao fim de cada tarefa; nos
itens de comportamento, o smoke novo deve **falhar** contra o `dist` de antes da tarefa e passar
depois (vermelho→verde, registrado no relatório). Nas tarefas só de tipos, diff do JS emitido.
Conferência visual das páginas migradas nos Lotes B e C continua pendente e é do usuário.
