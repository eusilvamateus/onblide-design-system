# Onblide — Project Instructions

## No legacy left behind

Whenever **any** part of the design system changes — a token, a component, a foundation,
a doc, the web app, the slides, the README — you MUST leave **zero** legacy files or dead
code behind. The system's own files must always reflect the system's current state; a
design system whose own artifacts don't follow it is broken.

**On every change, sweep and reconcile:**
1. Delete superseded/orphaned files and unregister their manifest entries (don't just stop
   linking them).
2. Update every downstream artifact that depends on what changed — including compiled/
   exported snapshots in `export/`, the web app, the slide deck, `README.md` and `SKILL.md`.
   Regenerate standalone bundles so they match the live source.
3. Grep the whole project for stale references (old filenames, old values, renamed folders,
   replaced libraries) and fix or remove every hit.
4. Keep `README.md`, `SKILL.md` and this file factually accurate — no dead paths, no
   outdated counts, no references to removed tooling.

Removing legacy is not optional cleanup; it ships with the change.

## Iconography: Phosphor only

All iconography in Onblide designs MUST come from the **Phosphor Icons** library — no other
icon set, and no ad-hoc hand-drawn SVG icons.

**Rules**
1. Use Phosphor icons exclusively. Never mix in other libraries (Lucide, Feather, Material,
   Heroicons, Font Awesome, etc.) and never invent freehand `<svg>` glyphs to stand in for an icon.
2. Match the iconography foundation spec (`ds/foundations/iconography.html`): the default size,
   single stroke weight, and grid defined there apply to every icon.
3. Reproduce Phosphor glyphs faithfully. When the exact Phosphor path can't be pulled in,
   reproduce the real Phosphor glyph as closely as possible in its line style — do not substitute
   a different shape or a different library's version.
4. Brand/company logos: Phosphor's brand-logo set (e.g. SpotifyLogo, SlackLogo, GithubLogo) is the
   source for those too. Keep them recognizable and on-brand (authentic colors/shapes).
5. Centralize icons behind a single icon component/registry (e.g. the `Icons` object in the web-app
   UI kit) so the whole system can change weight, size, or source in one place. Don't scatter raw
   icon markup across files.

## Implementation notes

**UI icons** are loaded via `@phosphor-icons/web@2.1.2` (CSS webfont, regular weight) in the web app.
This covers all interface icons (`ph-house`, `ph-gear`, `ph-check`, etc.).

**Brand logos** (`ph-spotify-logo`, `ph-slack-logo`, etc.) are NOT included in the webfont CSS —
they only exist in `@phosphor-icons/react` (requires a bundler). Until the React package is set up,
brand logo marks should be reproduced faithfully as SVG in the Phosphor glyph style and noted as
pending migration.
