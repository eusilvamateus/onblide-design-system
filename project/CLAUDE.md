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

## Git workflow

This repo is exclusively Mateus's — no clones, forks, or collaborators — so
rewriting already-pushed history on his working branch is allowed under the rules below.

### Branch model

- **`main`** — release-only. Nothing is developed directly here; it only receives merges
  from `dev` at release points (see Versioning below). Default branch on GitHub.
- **`dev`** — the standing development branch. All day-to-day work happens here. This is
  the branch the amend/rewrite rules below apply to.

Renamed from `master` on 2026-09-22 (real rename, pushed to remote — no leftover
`master` branch); `dev` was created from `main` the same day.

### Commit hygiene (on `dev`)

1. Before creating a new commit, check whether the current change logically belongs to
   the last commit (a fix, complement, or small adjustment to what was just committed).
2. If it belongs to the last commit:
   - Not yet pushed: `git add . && git commit --amend --no-edit`
   - Already pushed: `git add . && git commit --amend --no-edit && git push --force-with-lease`
     (never `git push --force` — always `--force-with-lease`)
3. Create a new commit only when the change is a logically separate unit of work.
4. Avoid generic fix commits ("fix typo", "small fix", "correção", "fix again", ...) — fold
   that work into the commit it belongs to instead.
5. Temporary/incremental commits during development are fine, but before calling a task
   done, review the branch history and squash related commits into one logical commit
   (`git rebase -i HEAD~N`, or `git reset --soft HEAD~N && git commit -m "..."` when
   intermediate structure doesn't need preserving), then `git push --force-with-lease`.
6. Decision rule before every commit: "does this change complete/fix the last commit, or
   is it a new logical unit?" — amend for the former, new commit for the latter.

Goal: `dev`'s history reads as logical changes, never as a trail of small "fix"/"adjust"
commits on top of each other. `main` only ever moves via merges from `dev`, never
rewritten.

### Commit message format — Conventional Commits, in Portuguese

`tipo(escopo): descrição` — description in Portuguese, lowercase, short imperative
("adiciona", "corrige", "remove" — never "adicionado"/"adicionando"), no trailing period.

- Types: `feat`, `fix`, `docs`, `refactor`, `style` (formatting/visual only, no behavior
  change), `chore` (build/deps/config), `test`
- Scope: the component or area touched (`feat(checkbox): ...`); omit it when the change
  is broad (`feat: ...`)
- Not enforced by tooling (no commitlint/husky) — this is documented discipline, not a
  commit hook.

## Implementation notes

**UI icons** are loaded via `@phosphor-icons/web@2.1.2` (CSS webfont, regular weight) in the web app.
This covers all interface icons (`ph-house`, `ph-gear`, `ph-check`, etc.).

**Brand logos** (`ph-spotify-logo`, `ph-slack-logo`, etc.) are NOT included in the webfont CSS —
they only exist in `@phosphor-icons/react` (requires a bundler). Until the React package is set up,
brand logo marks should be reproduced faithfully as SVG in the Phosphor glyph style and noted as
pending migration.
