---
name: onblide-design
description: Use this skill to generate well-branded interfaces and assets for Onblide, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` and `CLAUDE.md` files within this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `ds/` — foundations + components + docs, `ui_kits/`, `slides/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. The web-app UI kit at `ui_kits/web_app/` is a click-through reference — copy its primitives (`Primitives.jsx`, `Chrome.jsx`) when prototyping app-style interfaces; copy `slides/index.html` as the starting point for any deck.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand. The single source of truth for tokens is `colors_and_type.css`.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (audience, surface, content), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

## Quick reference

- **Colors:** `#0a4ee4` blue (primary) · `#779e3d` green (success) · `#eb7c2d` orange (warning/accent) · `#545454` ink · `#f2f0e8` cream (overlay only — page bg is white)
- **Fonts:** Poppins (UI/body, 300–800) · Playfair Display (editorial/italic accents) · JetBrains Mono (code, tokens, eyebrow labels)
- **Radii:** 8–12px register; 12px default
- **Components (20):** Button · Input · Badge · Card · Datepicker · Dropdown · Modal · Toggle · Radio · Checkbox · Pagination · Skeleton · Link · Tooltip · Code Input · Search Input · Alert · Toast · Progress Bar · Side Navigation
- **Shared primitive:** `OB_TONES` (info/success/warning/danger) is shared across Alert, Toast and ProgressBar for consistent color semantics across feedback components.
- **Iconography:** Phosphor only (regular weight) — never mix icon libraries; UI icons via `@phosphor-icons/web`, ~18–20px nav, 16px inline, 32–40px empty states. See `CLAUDE.md`.
- **Voice:** PT-BR, conversational, sentence case, no emoji
