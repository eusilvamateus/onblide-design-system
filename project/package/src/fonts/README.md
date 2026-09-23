# Fonts

Three families, all **self-hosted** in this folder (`fonts/`). No CDN dependency.

| Family | Token | Role | Weights locally available |
|---|---|---|---|
| **Poppins** | `--ob-font` | UI, headings, body — the workhorse | 100–900 (all weights + italics) |
| **Playfair Display** | `--ob-font-serif` | Editorial accents, pull-quotes, italic emphasis | 400–900 + italics |
| **JetBrains Mono** | `--ob-font-mono` | Code, tokens, design-system labels | 100–800 + italics |

## @font-face

All three families are declared in `colors_and_type.css` via `@font-face` blocks pointing to `fonts/*.ttf`. No `@import` from Google Fonts.

## Offline use

Because fonts are local, the design system works fully offline — no network request needed for typography.
