---
name: onblide-design
description: Use this skill to generate well-branded interfaces and assets for Onblide, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` and `CLAUDE.md` files within this skill, and explore the other available files (`package/src/tokens.css`, `assets/`, `ds/` — foundations + components + docs).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Reuse the components of `@onblide/ui` (`package/`): load `package/dist/onblide-ui.browser.js` after `npm run build`, as the preview pages in `ds/components/` do.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand. The single source of truth for tokens is `package/src/tokens.css`.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (audience, surface, content), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

## Quick reference

- **Colors:** `#0a4ee4` blue (primary) · `#779e3d` green (success) · `#eb7c2d` orange (warning/accent) · `#545454` ink · `#f2f0e8` cream (overlay only — page bg is white)
- **Fonts:** Poppins (UI/body, 300–800) · Playfair Display (editorial/italic accents) · JetBrains Mono (code, tokens, eyebrow labels)
- **Radii:** 8–12px register; 12px default
- **Components (30):** Button · Input · Badge · Status dot · Chip · Card · Datepicker · Deadline calendar · Dropdown · Select · Modal · Drawer · Switch · Radio · Checkbox · Pagination · Skeleton · Link · Tooltip · Code Input · Search Input · Alert · Toast · Progress Bar · Side Navigation · Tabs · Table · Slider · Spinner · ProgressCircle
- **Shared primitives:** `FieldShell` (field surface — border, radius, focus ring, error, disabled) · `FloatingPanel` (floating list surface) · tons semânticos `OBTone` (info/success/warning/danger) · `Slider` (single + range, tone-aware, pointer-captured drag).
- **Código:** `@onblide/ui` em `package/` — 40 exports de runtime (componentes, `Icons`, `Brands`, `Logo`, `Ph`), fonte única dos componentes das páginas de preview; valide com `npm run verify`.
- **Iconography:** Phosphor only, all six weights with fixed jobs (regular UI · fill "on" state · bold ≤14px/solid fills · light 32–48px · thin editorial 64px+ · duotone illustrative) — never mix icon libraries; UI icons via `@phosphor-icons/web`, ~18–20px nav, 16px inline, 32–40px empty states. See `CLAUDE.md`.
- **Voice:** PT-BR, conversational, sentence case, no emoji
