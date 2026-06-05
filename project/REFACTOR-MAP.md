# Mapa de Refatoração — Consistência Interna do Design System

> **Status:** execução em andamento — **Passo 1 (família de campo) concluído**
> **Escopo:** auditoria completa de `ui_kits/web_app/*.jsx`, `ds/components/*`, `ds/docs/*`, `ds/foundations/*`, `colors_and_type.css`
> **Excluído:** `tweaks-panel.jsx` (chrome de starter component, não faz parte do DS) e os brand logos SVG em `Primitives.jsx` (migração para Phosphor já registrada no CLAUDE.md, rastreada em H3)

Cada item é uma inconsistência verificada no código, com localização e correção proposta.
A ordem das categorias reflete prioridade de execução (A = mais estrutural).

---

## ✅ Execução — Passo 1: primitivo `FieldShell` + família de campo

Concluído nesta passada (web app source — `Primitives.jsx`, `Components.jsx`):

- **B3 ✅** — criado `FieldShell` (borda, raio `--ob-r-control`, focus ring `--ob-focus-ring`, erro, disabled).
- **A2 ✅ / A4 ✅** — `Input` e `SearchInput` compõem `FieldShell`.
- **A1 ✅** — `Select` multi usa o componente `Chip` real (removível).
- **A3 ✅** — `Select` multi usa o componente `Checkbox` real nos itens da lista.
- **B1 ✅** — raios da família unificados em `--ob-r-control` (Input, Select, Datepicker, SearchInput).
- **B2 ✅** — focus ring unificado em `--ob-focus-ring` (Input, SearchInput, Select, Datepicker, CodeInput).
- **D1/D2/D3 ✅** — caret, check e ícone de erro do `Select` → Phosphor (`Ph`).
- **D4 (parcial)** — `Ph` agora aceita `style`; unificação total do registro de ícones segue pendente.
- **C2/C3 (parcial)** — sombra do dropdown do Select e popup do Datepicker → `--ob-shadow-lg`; focus rings rgba hardcoded do Datepicker/Select → token.

**Pendências da família** (próximas passadas):
- **A6 (parcial)** — Datepicker foi tokenizado mas **ainda não** compõe `FieldShell` (layout de range com 2 inputs). Migrar.
- **F1** — previews `components-select/search-input/inputs/datepicker` ainda reimplementam inline; passar a importar a fonte real.

---

## ✅ Execução — Passo 2: primitivo `FloatingPanel` (A5)

- **A5 ✅** — criado `FloatingPanel` (posição, surface, borda, raio `--ob-r-surface`, sombra `--ob-shadow-lg`, z-index 1200).
- `Dropdown`, `SearchInput` e `Select` agora compõem `FloatingPanel` em vez de cada um desenhar sua lista suspensa.
- Unificado: z-index (era 1000 no Dropdown vs 1200 nos outros), raio e sombra; item do Dropdown radius 8 → `--ob-r-sm`.

---

## ✅ Execução — Passo 3: varredura de hardcodes → tokens (C + E + H1)

- **C1 ✅** — raios numéricos → tokens: Button 10 → `--ob-r-control`; Card 12 → `--ob-r-surface`; Modal 16 → `--ob-r-overlay`; Pagination, Modal/Drawer close-btn, SideNav logo 8 → `--ob-r-sm`.
- **C2 ✅** — sombras hardcoded → tokens: Card elevated → `--ob-shadow-md`; Toast → `--ob-shadow-lg`.
- **H1 ✅** — backdrops de Modal e Drawer (`rgba(20,20,20,.45/.40)`) → `rgba(20,20,20,var(--ob-opacity-scrim))`; unificados em 0.45.
- **E1/E2/E3 ✅ (adoção)** — os tokens semânticos `--ob-r-control/surface/overlay` e `--ob-opacity-scrim` agora têm uso real.

**Pendências:** Toggle knob shadow (micro-sombra de controle, mantida deliberadamente); BrandTile branco/borda/sombra (tema-independente, intencional como os brand logos — H3).

---

## ✅ Execução — Passo 4: previews importam a fonte real (F1)

Previews que reimplementavam o componente inline agora carregam `Primitives.jsx` + `Components.jsx` reais e usam os componentes do `window` (paridade garantida, sem drift):

- **badge, chip, modal, drawer, tabs, table** ✅ — removida a reimplementação inline; usam o componente real.
- **inputs, buttons, cards** ✅ — eram vitrines CSS estáticas com **hex e raios hardcoded**; tokenizadas (`--ob-blue`, `--ob-r-control/surface`, `--ob-shadow-md/pop`, etc.) e agora theme-aware.

**Pendência F1:** `components-datepicker.html` ainda é uma reimplementação vanilla-JS completa, com muito hex/raio hardcoded. Merece passada própria — idealmente convertendo para o `Datepicker` React real (também destrava **A6**). Rastreado para execução futura.

---

---

## A · Composição — componentes reinventam outros componentes

A camada mais grave. O DS tem as peças, mas não as reutiliza entre si.

| # | Inconsistência | Local | Correção |
|---|---|---|---|
| A1 | **Select multi reinventa o Chip** — desenha chip inline (fundo `blue-100`, radius `r-sm`, `×` próprio) | `Components.jsx` ~786–791 | Usar `<Chip removable>` real |
| A2 | **Select autocomplete reinventa o campo de texto** — `<input>` cru com wrapper próprio | `Components.jsx` ~788–800 | Compor o primitivo de campo (ver B) |
| A3 | **Select multi usa checkmark, não Checkbox** — item de lista multi mostra `<svg>` de check à mão | `Components.jsx` ~834–837 | Usar `<Checkbox>` nos itens multi |
| A4 | **SearchInput reinventa o campo de texto** — `<input>` cru com wrapper próprio | `Components.jsx` ~540–551 | Compor o primitivo de campo (ver B) |
| A5 | **Três "listas suspensas" diferentes** — Select, SearchInput e Dropdown cada um desenha a sua | `Components.jsx` Select ~805–843 · SearchInput ~553–570 · Dropdown ~195–215 | Extrair primitivo `Popover/Listbox` único |
| A6 | **Datepicker reinventa o campo de texto** — `inputStyle()` próprio | `Primitives.jsx` ~403–409 | Compor o primitivo de campo (ver B) |

---

## B · Campo de texto — 3+ implementações divergentes do mesmo elemento

Quatro campos de texto, nenhum compartilha base. Raios e foco todos diferentes.

| Implementação | Radius | Focus ring | Local |
|---|---|---|---|
| `Input` (primitivo) | `10px` hardcoded | borda only (handler JS) | `Primitives.jsx` 199 |
| `Datepicker` | `10px` hardcoded | `4px rgba(10,78,228,.16)` hardcoded | `Primitives.jsx` 404, 425/436/448 |
| `SearchInput` | `--ob-r-md` (12px) | `4px var(--ob-blue-100)` | `Components.jsx` 544 |
| `Select` | `--ob-r-sm` (8px) | `3px var(--ob-focus-ring)` | `Components.jsx` 782, 748 |
| `CodeInput` (célula) | — | `4px var(--ob-blue-100)` | `Components.jsx` 523 |

- **B1** Quatro raios distintos para o mesmo papel (controle). Devem todos usar `--ob-r-control`.
- **B2** Quatro tratamentos de foco distintos (3px vs 4px; `blue-100` vs `focus-ring` vs rgba hardcoded). Definir **um** token de focus ring e aplicar a todos.
- **B3 (raiz)** Não existe primitivo de campo. **Criar `<Field>`** que encapsula borda, raio, foco, erro e ícone — e fazer Input, SearchInput, Select, Datepicker e CodeInput consumirem ele.

---

## C · Tokens hardcoded — valores crus que já têm token

### C1 · border-radius numérico (deveria ser `--ob-r-*`)
- `Input` 10 → `--ob-r-control` · `Primitives.jsx` 199
- `Datepicker` input 10, nav 6, dia 6 → `--ob-r-control` / `--ob-r-xs` · `Primitives.jsx` 404, 462–464, 478
- `Button` 10 → `--ob-r-control` · `Primitives.jsx` 168
- `Card` 12 → `--ob-r-surface` · `Primitives.jsx` 251
- `Avatar` 11 → revisar (valor fora da escala) · `Primitives.jsx` 155
- `Modal` 16 → `--ob-r-overlay` · `Components.jsx` 242
- `Dropdown` 12, item 8 → `--ob-r-surface` / `--ob-r-sm` · `Components.jsx` 198, 205
- `Pagination` 8 → `--ob-r-sm` · `Components.jsx` 152, 168
- `Drawer` close-btn 8, `Modal` close-btn 8/30 → `--ob-r-sm` · `Components.jsx` 248, 452

### C2 · box-shadow hardcoded (já existe `--ob-shadow-*`)
- `Toast` `0 10px 30px rgba(0,0,0,.13)` → `--ob-shadow-lg` · `Components.jsx` 593
- `Select` dropdown `0 8px 24px rgba(0,0,0,.12)` → `--ob-shadow-md/lg` · `Components.jsx` 808
- `Card` elevated `0 4px 12px… , 0 1px 3px…` → `--ob-shadow-sm/md` · `Primitives.jsx` 248
- `Datepicker` popup `0 8px 24px rgba(20,20,20,.12)` → `--ob-shadow-lg` · `Primitives.jsx` 459
- `Avatar` `0 1px 2px rgba(0,0,0,.05)` → `--ob-shadow-xs` · `Primitives.jsx` 156
- `Toggle` knob `0 1px 2px rgba(0,0,0,.2)` → revisar token · `Components.jsx` 60

### C3 · focus ring rgba hardcoded
- `Select` erro `rgba(214,54,54,.15)` → token de erro · `Components.jsx` 748
- `Datepicker` `rgba(10,78,228,.16)` (3×) → token de focus · `Primitives.jsx` 425, 436, 448

### C4 · cores hardcoded
- `Avatar` `#ffffff`, `rgba(0,0,0,.08)` → `--ob-surface`, `--ob-border` · `Primitives.jsx` 155–156

---

## D · Iconografia — viola CLAUDE.md (Phosphor-only via registro central)

| # | Inconsistência | Local | Correção |
|---|---|---|---|
| D1 | Select **caret** desenhado como `<svg><path>` cru | `Components.jsx` 796–800 | `Ph n="caret-down"` |
| D2 | Select **check** desenhado como `<svg><path>` cru | `Components.jsx` 835–837 | `Ph n="check"` ou Checkbox (A3) |
| D3 | Select **ícone de erro** desenhado como `<svg>` cru | `Components.jsx` 847 | `Ph n="warning-circle"` |
| D4 | Acesso a ícone **não centralizado** — coexistem `Ph`, `Icons.*` e `<svg>` cru | múltiplos | Unificar num único registro de ícones |

---

## E · Tokens semânticos definidos mas não adotados

Criamos aliases na refatoração de foundations que **nenhum componente usa** (grep retornou zero ocorrências em `ds/components` e `ui_kits`).

- **E1** `--ob-r-control` / `--ob-r-surface` / `--ob-r-overlay` — 0 usos. Adotar em C1.
- **E2** `--ob-gap-xs/sm/md/lg`, `--ob-pad-card/page`, `--ob-stack-sm/md` — 0 usos. Adotar onde há gap/padding cru equivalente.
- **E3** `--ob-opacity-hover/focus/scrim/disabled/strong` — verificar adoção; backdrops de Modal/Drawer usam `rgba(20,20,20,.45)` hardcoded em vez de `--ob-opacity-scrim`.
- **E4** Breakpoints e grid (`--ob-bp-*`, `--ob-grid-*`) — o web app usa layout fixo; não há media queries adotando os tokens. Avaliar se o app deve ser responsivo de fato.

---

## F · Previews — cada `components-*.html` reimplementa o componente inline

Risco de **drift**: a preview e o `Components.jsx` têm definições duplicadas que podem divergir silenciosamente.

- **F1** `components-modal.html`, `components-drawer.html`, `components-chip.html`, `components-tabs.html`, `components-table.html`, `components-badge.html` etc. **redefinem** o componente dentro do próprio HTML em vez de importar `Components.jsx`/`Primitives.jsx`.
- Consequência: já há divergências (ex: o Chip inline da preview vs o Chip de `Components.jsx` podem evoluir separados).
- **Correção:** decidir uma estratégia — (a) previews importam as fontes reais via `<script src>`, ou (b) processo que garante paridade. Opção (a) é a verdadeiramente consistente.

---

## G · Docs — afirmações que contradizem a implementação

- **G1** Vários docs marcam **"Usa os design tokens ✓"** na matriz de conformidade, mas o componente tem hardcodes (Select, Toast, Datepicker, Input…). Claim falso até C ser resolvido. Reavaliar a matriz após a refatoração.
- **G2** Glyphs `✓` / `✕` nas tags do-dont e na matriz são caracteres de texto, não Phosphor. Decisão: aceitável como tipografia, ou migrar para `Ph` por rigor? (menor)

---

## H · Diversos / rastreamento

- **H1** Backdrops de overlay (`Modal`, `Drawer`) usam `rgba(20,20,20,.45)` hardcoded → deveria referenciar `--ob-opacity-scrim` (liga com E3).
- **H2** `tweaks-panel.jsx` — **excluído** do escopo (chrome de starter component, isolado do DS).
- **H3** Brand logos como `<svg>` cru em `Primitives.jsx` (Spotify, Slack, Notion, Figma, GitHub, Dropbox, Discord…) — **já rastreado** no CLAUDE.md como pendente de migração para `@phosphor-icons/react`. Não é novo, mas continua aberto.

---

## Ordem de execução proposta

1. **B3** — criar primitivo `<Field>` (destrava A2, A4, A6, B1, B2)
2. **A1 + A3** — Select adota Chip e Checkbox reais
3. **A5** — extrair primitivo de lista suspensa (Select/SearchInput/Dropdown)
4. **D1–D4** — ícones do Select → Phosphor; unificar registro
5. **C1–C4 + E1–E3 + H1** — varredura de hardcodes → tokens (semânticos onde existirem)
6. **F1** — previews passam a importar as fontes reais
7. **G1** — reavaliar matrizes de conformidade dos docs
8. **H3** — migração de brand logos (quando o pacote React entrar)

> Cada passo deve ser validado individualmente antes do commit, conforme o fluxo do projeto.
