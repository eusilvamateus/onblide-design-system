# `@onblide/ui` — Fase 2, Lote B (13 componentes compostos)

**Status:** aprovado
**Data:** 2026-09-23

## Contexto

O Lote A (spec: `2026-09-22-onblide-ui-fase2-lote-a-design.md`) portou 13
componentes independentes, elevando o pacote `@onblide/ui` a 20 componentes
no total (7 da Fase 1 + 13 do Lote A), release `0.2.0`, já mergeado em
`main`. Este é o segundo lote da Fase 2: os componentes **compostos**, que
dependem de componentes já portados (Fase 1 ou Lote A) para funcionar.

## Escopo — os 13 componentes e sua origem

| Componente | Arquivo:linhas | Depende de (já portado) |
|---|---|---|
| `Drawer` | `Components.jsx:431-494` | — |
| `Table` | `Components.jsx:997-1095` | — |
| `Tabs` | `Components.jsx:934-996` | `Ph` |
| `SideNav` | `Components.jsx:660-706` | `Ph` |
| `DeadlineCalendar` | `Primitives.jsx:725-789` | — |
| `Alert` | `Components.jsx:587-602` | `Ph` |
| `ProgressBar` | `Components.jsx:634-659` | — |
| `CodeInput` | `Components.jsx:503-548` | — |
| `SearchInput` | `Components.jsx:549-586` | `FieldShell`, `FloatingPanel`, `Ph` |
| `Select` | `Components.jsx:707-861` | `Checkbox`, `Chip`, `FieldShell`, `FloatingPanel`, `Ph` |
| `Input` | `Primitives.jsx:221-242` | `FieldShell` |
| `Toast` | `Components.jsx:603-633` | `Ph` |
| `ToastStack` | `Components.jsx:870-933` | `Toast` (mesmo lote — ordem importa) |

Verificado por grep de uso (`<Nome` / `Nome.algo`) em cada bloco. `Table`
usa `<input type="checkbox">` cru, não o componente `Checkbox` — sem
dependência daí. Grupo de destino (mesma convenção da Fase 1/Lote A):
`src/components/` para os de `Components.jsx`, `src/primitives/` para os de
`Primitives.jsx` (`Input`, `DeadlineCalendar`).

## Não-objetivos

- **`Modal`** (`Components.jsx:243-293`), **`Link`** (`Components.jsx:94-115`)
  e **`Pagination`** (`Components.jsx:138-184`) — os três usam `Icons`
  (`Icons.x`, `Icons.caretL`/`caretR`, etc.), que só entra no Lote C. Ficam
  para lá (ou logo depois), junto de `Icons`/`Brands`.
- **Lote C** (`Icons`, `Brands`, `OB_TONES`/`OB_TOAST_POS`) — módulos de
  dados tipados, sem ritual de verificação visual por item, spec própria.
- Tudo que já era não-objetivo nos lotes anteriores continua sendo:
  `Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx`, `Logo`; suíte de testes
  automatizados; mudança de comportamento/visual de qualquer componente;
  rodar o `/design-sync` de verdade.

## Migração de páginas de preview

Verificado por grep de tags JSX e de `<script src=".../.jsx">` em cada
página candidata.

**9 páginas migram — full removal dos scripts antigos** (diferente do Lote
A: nestas 9, TODAS as tags/usos vêm de componentes que já estarão portados
assim que a tarefa da página rodar, então as DUAS tags de script antigas
saem por completo, não fica nenhum script Babel residual):
- `components-drawer.html` (`Drawer`; helpers `Btn`/`Field`/`TaskRow` são
  locais à própria demo, não do kit — confirmado via grep, sem dependência).
- `components-table.html` (`Table`; usa `Badge`, já portado no Lote A).
- `components-tabs.html` (`Tabs`).
- `components-side-nav.html` (`SideNav`; helper `Skel` é local à demo, não
  é o `Skeleton` do kit — confirmado via grep).
- `components-deadline-calendar.html` (`DeadlineCalendar`).
- `components-alert.html` (`Alert`).
- `components-progressbar.html` (`ProgressBar`).
- `components-code-input.html` (`CodeInput`).
- `components-search-input.html` (`SearchInput`).
- `components-select.html` (`Select`).
- `components-toast.html` (`Toast`+`ToastStack` juntos na mesma tarefa de
  migração de página, já que ambos vêm de `Components.jsx` e a página só usa
  `Chip`/`RadioGroup`/`Toggle`/`Toast`, todos já portados — a tag de
  `Primitives.jsx` nesta página já está órfã hoje).

Isso soma 11 páginas migradas de fato (a de toast/toaststack conta como
uma). Nota explícita para evitar o achado I1 do Lote A (scripts antigos
residuais): antes de cada tarefa de migração de página, confirmar por grep
que TODOS os componentes usados na demo já estão no bundle — se estiverem,
remover as DUAS tags de script antigas por completo, não só uma.

**2 componentes sem página de preview própria neste lote:**
- `Input` — não tem página React dedicada (`components-inputs.html` existe
  mas é HTML/CSS estático, sem React, mesmo padrão de `components-cards.html`
  no Lote A). Em vez disso, a tarefa de `Input` também migra
  **`components-slider.html`** (que dependia de `Input` e ficou pendente
  desde o Lote A — agora todos os 5 componentes que essa página usa,
  `Button`, `Chip`, `Input`, `Slider`, `Toggle`, estarão portados). Isso
  fecha o débito deixado explicitamente pelo Lote A.
- `ToastStack` — sem instância JSX ao vivo em nenhuma página (só uma menção
  em comentário em `components-toast.html`). Verificado só por script de
  smoke, mesmo padrão de `Card`/`Avatar`/`Slider` no Lote A.

## Decisões técnicas (herdadas, sem mudança)

TypeScript estrito, um componente por arquivo, fills/estilo 100%
`style={{ }}` preservados, build via `tsup` (biblioteca + bundle IIFE),
Conventional Commits em português na `dev`, sem rodapé de atribuição de IA,
documentação em português.

## Riscos

- **`ToastStack` depende de `Toast` dentro do mesmo lote** — ordenação
  obrigatória na tarefa, mesma disciplina de `RadioGroup`→`Radio` no Lote A.
- **`Select` é o maior componente do lote** (`Components.jsx:707-861`, ~155
  linhas) e tem a maior lista de dependências internas (5 componentes já
  portados) — maior risco de integração; merece verificação no navegador
  com atenção redobrada a cada dependência renderizando corretamente juntas.
- **`Table`** usa `<input type="checkbox">` cru para seleção de linha, não
  o componente `Checkbox` — não há dependência a portar, mas o
  comportamento de `indeterminate` (via `ref` direto no DOM) precisa ser
  transcrito com cuidado (mesma classe de risco já vista em `RadioGroup`).
- **`components-slider.html`** muda de "sem migração" (Lote A) para
  "migração completa" nesta tarefa — primeira vez que uma página herdada de
  um lote anterior é revisitada; garantir que os 5 componentes que ela usa
  realmente estão todos disponíveis no bundle antes de tocar nela.

## Verificação

Mesma dos lotes anteriores: `tsc --noEmit` limpo, `tsup` build produzindo os
4 arquivos esperados, script de smoke para `ToastStack` (sem página ao
vivo), comparação visual via `python -m http.server` (nunca `file://`) para
as 11 páginas migradas (incluindo a revisita a `components-slider.html`),
varredura final sem referências antigas a `Components.jsx`/`Primitives.jsx`
nas páginas totalmente migradas (agora sem exceções parciais, diferente do
Lote A).
