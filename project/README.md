# Onblide

> **Build online.** Desenvolvimento web, automação e engenharia digital para negócios online.

Onblide nasce da ideia de "build online": desenvolver, conectar e colocar soluções digitais no ar. A marca representa a construção de soluções digitais online, com foco em desenvolvimento web, sistemas, automações e infraestrutura moderna.

The design system in this folder powers the Onblide web app and any future product surface. It's a living manifest — open the **Design System** tab to browse cards, or read the files in this folder directly.

---

## Index

| File / folder | Purpose |
|---|---|
| `colors_and_type.css` | Single source of truth for every design token (colors, type, spacing, radii, shadows, motion) |
| `CLAUDE.md` | Project rules injected into every session — currently the Phosphor-only iconography mandate |
| `assets/` | Brand marks: `onblide-{horizontal,stacked,symbol}-{primary,white,dark}.svg` — three lockups × three colorways |
| `fonts/` | Self-hosted `.ttf` for Poppins, Playfair Display & JetBrains Mono (all weights), wired via `@font-face` in `colors_and_type.css` |
| `ds/foundations/` | Foundation cards: color, type semantics, spacing, radii, shadows, iconography, brand |
| `ds/components/` | Component specs: buttons, inputs, badges, status dots, cards, datepicker, deadline calendar, dropdown, modal, drawer, toggle, radio, checkbox, pagination, skeleton, link, tooltip, code-input, search-input, alert, toast, progressbar, side-nav, select, tabs, table + dark theme |
| `ds/docs/` | Per-component documentation (usage · formatting · content · design guidance) |
| `package/` | `@onblide/ui` — biblioteca React/TypeScript com todos os componentes, `Icons`, `Brands` e `Logo`; `npm run build` gera `dist/onblide-ui.browser.js`, carregado pelas páginas de `ds/components/` e pelo web app |
| `ui_kits/web_app/` | Click-through dashboard (Início · Tarefas · Métricas · Integrações · Ajustes) with light/dark theme — as telas usam os componentes do `@onblide/ui` (rode o build do pacote antes de abrir) |
| `SKILL.md` | Cross-compatible Skill manifest if you want to use this in Claude Code |

---

## Brand context

**Onblide** — *build online* — é uma marca de desenvolvimento web, automação e engenharia digital. Foco em colocar soluções digitais no ar: web apps, sistemas, automações, infraestrutura.

A marca é **bold & energetic** em voz, **conversacional** em tom, **soft** nos cantos. Suficientemente flexível pra um dashboard web uma semana e uma apresentação de pitch a próxima — mas sempre com identidade clara.

**Sources used to create this system**
- Design tokens were specified directly by the maker: Poppins family + a five-color palette
- No codebase, Figma file, or screenshots were attached
- Brand voice / surfaces / iconography choices captured via questionnaire (May 2026)

---

## Content fundamentals

**Voice.** Bold &amp; energetic. We cheer the user on without shouting at them. We use *você* and *we/us* (in PT-BR: *você* / *a gente*). Contractions are welcome.

**Tone.** Conversational. Sentences are short, declarative. We avoid corporate hedging ("solução end-to-end") and inflated adjectives. When something works, we say it works. When it doesn't, we say it doesn't.

**Casing.** Sentence case in UI labels and button copy ("Nova tarefa", not "Nova Tarefa"). Title case is reserved for proper nouns and slide H1s. Eyebrow labels are UPPERCASE with `+0.04em` tracking.

**Examples**
- Empty state: "Você ainda não tem nada aqui. Que tal começar?" *(not "Comece agora!")*
- Success: "Salvo." *(not "Suas alterações foram salvas com sucesso.")*
- Error: "Algo deu errado. Tenta de novo?" *(not "Ocorreu um erro inesperado.")*
- Greeting: "Bom dia, Onblide." *(not "Bem-vindo(a) de volta")*

**Emoji.** None in product or marketing copy. Geometric shapes do the job emoji would do elsewhere.

**Numbers.** Use BR formatting — `R$ 38,4k`, `4,8%`, `2.847`. Decimals with comma, thousands with period.

---

## Visual foundations

### Color
Five colors carry the whole system:
- **`#0a4ee4` Blue** — the brand voice. Primary CTAs, links, focus rings, the brand glyph. Use it where you want the eye to land first.
- **`#779e3d` Green** — *semantic only*: success, completed states, positive deltas.
- **`#eb7c2d` Orange** — *semantic*: warnings, attention badges. Also the secondary brand accent on dark backgrounds.
- **`#545454` Ink** — body text. Headings step up to `#2a2a2a` (`ink-strong`).
- **`#f2f0e8` Cream** — *not* the page background. Cream is a warmth overlay on white: code chips, kanban column trays, slide section backgrounds, occasional cards.

The page itself is **white**. Cream peeks through to keep things from feeling sterile.

### Typography
Three families, each with a clear job:
- **Poppins** (`--ob-font`) is the workhorse — UI, headings, body. Six weights in active use (300/400/500/600/700/800). Display moments lean on **800 with -3% to -4% tracking** to give the brand its "bold &amp; energetic" voice; body is 400 / 1.6 line-height for comfortable reading.
- **Playfair Display** (`--ob-font-serif`) is the editorial accent — pull-quotes, slide-deck callouts, the occasional italic word inside a Poppins heading. Use it sparingly; it earns its presence by being rare.
- **JetBrains Mono** (`--ob-font-mono`) is for code, design tokens, and small UI labels (eyebrows, tags, page numbers). 500 weight at small sizes; never used at body size.

**Pairing rule.** Inside a Poppins 700/800 heading, wrap the brand-defining word in `<em>` to render it in **Playfair Display italic 500**. The contrast of bold sans + soft serif italic is how the brand expresses "bold &amp; energetic" without ever feeling shouty. Used in: slide-1 H1 (`energetic.`), comparison slide (`Onblide`), closing slide (`construir.`), web-app greeting (`Onblide`).

**Canonical reference.** The full set of text roles — Display, Heading 1–5, Eyebrow, Lead, Body, Caption, Label, Quote, Code — with usage rules and live examples lives in `ds/foundations/type-semantics.html`.

### Spacing
4px base scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`. Section padding on slides is **96px** horizontal; cards default to **20px** internal padding.

### Backgrounds
- **No gradients** in chrome. Solid color blocks only.
- **Geometric shapes** (circles, soft squares, pills, arcs) compose into illustrations and slide decoration. Never auto-generated SVG illustrations or stock imagery.
- **Cream overlays** add warmth — a 12-radius cream block behind a kanban column, a slide built on a cream canvas — but never a full-bleed cream page.

### Motion
- **Eases:** `cubic-bezier(0.2, 0.7, 0.2, 1)` for general motion; `cubic-bezier(0.16, 1, 0.3, 1)` for entrances.
- **Durations:** 120ms (micro), 200ms (default), 400ms (entrance).
- **No bounces** on UI elements. A spring ease (`0.34, 1.56, 0.64, 1`) is reserved for hero/empty-state moments.

### States
- **Hover (primary CTA):** background steps to `--ob-blue-700`, plus a soft `0 8px 24px rgba(10,78,228,0.28)` blue glow. The glow is the brand's signature.
- **Hover (secondary):** border darkens from `#ececec` → `#545454`. No fill change.
- **Hover (ghost / link):** opacity 0.75. No color shift.
- **Press:** no shrink. Background steps one tone darker; that's it.
- **Focus ring:** `0 0 0 4px rgba(10, 78, 228, 0.32)` — always visible on keyboard nav.

### Borders &amp; shadows
- Hairlines are `#ececec` (1.5px on form inputs, 1px elsewhere).
- Two patterns coexist: **bordered cards** (hairline, no shadow) and **elevated cards** (shadow-md, no border). Never both.
- Inner shadows: avoided.
- The "**pop**" shadow (`0 8px 24px rgba(10,78,228,0.28)`) is the only colored shadow — reserved for primary CTA hover.

### Radii
Soft personality, 8–12px is the default register. **`12px`** is the workhorse for cards, buttons (`10px` for tighter pills), and inputs. Pills (`999px`) reserved for badges and toggles.

### Transparency &amp; blur
Largely avoided. The brand's energy comes from solid color, not glass. The one exception: focus rings use 32% blue.

### Imagery
Geometric / abstract shapes only. Composed from circles, squares, pills, arcs and triangles in the brand palette. No photography, no hand-drawn illustrations, no AI imagery.

### Layout rules
- Page background: `#ffffff` always
- Sidebar background: `#fbfbfb` (subtle warmth)
- Cream is an *element* color, not a *page* color
- Max content width on marketing-ish layouts: ~1080px
- Slides: 1280×720 (16:9)

---

## Iconography

**Phosphor only.** The brand uses **Phosphor (regular weight)** as its single icon system — no other library, ever. This is a hard rule, documented in `CLAUDE.md` and specced in `ds/foundations/iconography.html`.

- **UI icons** are loaded from the official `@phosphor-icons/web@2.1.2` CSS webfont (`<i class="ph ph-house">`), centralized behind the `Icons` registry of `@onblide/ui` (`package/src/primitives/Icons/Icons.tsx`, built on `Ph`) so weight, size, or source can change in one place.
- **Brand logos** (Spotify, Slack, GitHub, etc.) come from Phosphor's brand-logo set. Marks not yet in the webfont are reproduced faithfully in the Phosphor glyph style, pending migration to `@phosphor-icons/react`.

**Rules**
- Default size: 18–20px in nav and chrome, 16px inline with text, 32–40px in empty states
- Color: `currentColor` — tints inherit from parent text color
- No emoji. No multi-color UI icons. No mixing icon libraries.
- Icons are auxiliary to labels; only "known" icons (specced in the iconography foundation) may appear without text.

---

## Caveats &amp; substitutions

- **Fonts:** Poppins, Playfair Display and JetBrains Mono are now **self-hosted** as `.ttf` files in `fonts/`, wired via `@font-face` in `colors_and_type.css`. No external font CDN is required.
- **Logo:** The real brand mark lives in `assets/` as three lockups (horizontal, stacked, symbol), each in `primary`, `white` and `dark`. The `Logo` component of `@onblide/ui` (`package/src/primitives/Logo/Logo.tsx`) inlines the horizontal lockup with token-driven fills so it adapts to light/dark; `ds/foundations/brand-logo.html` shows every variant.
- **Brand logos:** Third-party brand marks in the Integrations hub are faithful Phosphor-style reproductions; swap for the official `@phosphor-icons/react` glyphs once a bundler is in place.
- **Brand voice samples:** Copywriting examples are guesses based on the "bold &amp; energetic + conversational" direction. Treat them as a starting register, not a locked guideline.
