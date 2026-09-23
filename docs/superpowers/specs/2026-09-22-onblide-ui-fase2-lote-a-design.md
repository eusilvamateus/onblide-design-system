# `@onblide/ui` — Fase 2, Lote A (13 componentes independentes)

**Status:** aprovado
**Data:** 2026-09-22

## Contexto

A Fase 1 (spec: `2026-09-22-onblide-ui-package-design.md`) montou toda a
infraestrutura do pacote `@onblide/ui` e portou 6 componentes piloto,
provando o padrão ponta a ponta: TypeScript real, build duplo (biblioteca +
bundle de compatibilidade para as páginas de preview), versionamento com
Changesets, revisão em duas camadas (por tarefa + branch inteira). Restam
**33 exports** em `Components.jsx`/`Primitives.jsx` — grande demais para um
plano só. Esta spec cobre **só o primeiro lote**, deliberadamente escolhido
por não ter nenhuma dependência externa a componentes já portados.

## Não-objetivos

- **Lote B** (~15 componentes compostos: `Modal`, `Drawer`, `Input`,
  `SearchInput`, `CodeInput`, `Select`, `Table`, `Tabs`, `SideNav`,
  `DeadlineCalendar`, `Alert`, `Toast`, `ToastStack`, `ProgressBar`, `Link`,
  `Pagination`) — spec própria, depois deste lote estar pronto.
- **Lote C** (`Icons`, `Brands`, `OB_TONES`/`OB_TOAST_POS`) — módulos de
  dados, não componentes visuais; porte como TS tipado, sem o ritual de
  verificação visual por item. `Link` e `Pagination` entram nesse lote (ou
  logo depois dele) porque dependem de `Icons.arrowSquareOut`/`caretL`/`caretR`.
- **`Logo`** — já redesenhado nesta sessão (marca nova); só é usado por
  `Screens.jsx`, fora de escopo desde a Fase 1. Sem prioridade agora.
- Tudo que já era não-objetivo na Fase 1 continua sendo: `Chrome.jsx`,
  `Screens.jsx`, `tweaks-panel.jsx`; suíte de testes automatizados;
  mudança de comportamento/visual de qualquer componente; rodar o
  `/design-sync` de verdade (ação separada, depois).

## Escopo — os 13 componentes e sua origem

| Componente | Arquivo:linhas | Depende de (já portado) |
|---|---|---|
| `Radio` | `Components.jsx:11-37` | — |
| `RadioGroup` | `Components.jsx:38-48` | `Radio` (mesmo lote — ordem importa) |
| `Toggle` | `Components.jsx:49-66` | — |
| `Skeleton` | `Components.jsx:116-137` | — |
| `Tooltip` | `Components.jsx:294-374` | — |
| `Chip` | `Components.jsx:381-430` | — |
| `StatusDot` | `Primitives.jsx:252-257` | — |
| `Badge` | `Primitives.jsx:258-284` | — |
| `Card` | `Primitives.jsx:285-294` | — |
| `Avatar` | `Primitives.jsx:295-302` | — |
| `Spinner` | `Primitives.jsx:790-817` | — |
| `ProgressCircle` | `Primitives.jsx:818-854` | — |
| `Slider` | `Primitives.jsx:542-724` | — |

Verificado por grep de uso (`<Nome` / `Nome.algo`) em cada bloco — nenhum
destes 13 referencia outro componente fora deste lote ou de `Icons`/`Brands`,
com a única exceção interna já esperada de `RadioGroup` usando `Radio`.

Grupo de destino (mesma convenção da Fase 1 — mapeia o arquivo de origem):
`src/components/` para os de `Components.jsx` (`Radio`, `RadioGroup`,
`Toggle`, `Skeleton`, `Tooltip`, `Chip`), `src/primitives/` para os de
`Primitives.jsx` (`StatusDot`, `Badge`, `Card`, `Avatar`, `Spinner`,
`ProgressCircle`, `Slider`).

## Migração de páginas de preview

Verificado por grep de tags JSX usadas em cada página candidata contra o
conjunto (Fase 1 + Lote A):

**9 páginas totalmente cobertas por este lote — migram:**
`components-radio.html` (cobre `Radio` **e** `RadioGroup`),
`components-toggle.html`, `components-skeleton.html`,
`components-tooltip.html`, `components-chip.html`,
`components-status-dot.html`, `components-badge.html`,
`components-spinner.html`, `components-progress-circle.html`.

**3 componentes sem migração de página nesta fase** (mesmo padrão da Fase 1
para `Button`/`FieldShell` — portados e verificados por script de smoke,
sem comparação visual ao vivo):
- `Card` e `Avatar` — não têm página de preview React dedicada no repo
  (`components-cards.html` existe mas é HTML/CSS estático, sem React).
- `Slider` — tem página (`components-slider.html`), mas ela também usa
  `Input` (Lote B) e carrega tanto `Primitives.jsx` quanto `Components.jsx`;
  migrar o script agora exigiria misturar o bundle novo com os scripts
  antigos na mesma página. Fica para quando `Input` for portado (Lote B) e
  a página puder trocar de vez.

## Decisões técnicas (herdadas da Fase 1, sem mudança)

TypeScript estrito, um componente por arquivo, fills/estilo 100%
`style={{ }}` preservados, build via `tsup` (biblioteca + bundle IIFE),
Conventional Commits em português na `dev`, sem rodapé de atribuição de IA,
documentação em português. Nenhuma decisão de arquitetura nova — este lote
é execução do padrão já validado, em maior escala.

## Riscos

- **`RadioGroup` depende de `Radio` dentro do mesmo lote** — a tarefa de
  `RadioGroup` no plano precisa vir depois da de `Radio`, mesma disciplina
  de ordenação que `Checkbox`→`Ph` e `Datepicker`→`FieldShell`/`Button` na
  Fase 1.
- **Volume**: 13 componentes é quase o dobro do piloto da Fase 1 (6). Tarefas
  mecânicas (sem navegador) devem usar o modelo mais barato, como na Fase 1;
  as 9 com migração de página real mantêm o modelo intermediário + verificação
  no navegador.

## Verificação

Mesma da Fase 1: `tsc --noEmit` limpo, `tsup` build produzindo os 4 arquivos
esperados, scripts de smoke para `Card`/`Avatar`/`Slider` (sem página ao
vivo), comparação visual via `python -m http.server` (nunca `file://`) para
as 9 páginas migradas, varredura final sem referências antigas a
`Components.jsx`/`Primitives.jsx` nas páginas migradas.
