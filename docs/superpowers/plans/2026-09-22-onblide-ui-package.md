# @onblide/ui Package (Fase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@onblide/ui`, a real TypeScript npm package under `project/package/`, port 6 pilot components into it with zero behavior change, and wire a browser-compatible bundle so the existing preview pages keep working without Babel Standalone — leaving the package ready for a follow-up `/design-sync` run.

**Architecture:** Single TypeScript source of truth (`src/<group>/<Name>/<Name>.tsx`, one component per file) built by `tsup` (esbuild) into two outputs: a real ESM/CJS/`.d.ts` package for `/design-sync`, and a flat-global IIFE bundle (`dist/onblide-ui.browser.js`) that keeps `window.Checkbox`, `window.Button`, etc. working for the ~24 preview pages that aren't migrated in this phase. Styling stays 100% inline `style={{ }}` reading `var(--ob-*)` tokens — no CSS-in-JS to introduce.

**Tech Stack:** TypeScript 5, React 18.3.1, tsup (esbuild) for the build, `@changesets/cli` for versioning, `@phosphor-icons/web` as a real dependency (replacing the CDN `<link>`).

**Spec:** `docs/superpowers/specs/2026-09-22-onblide-ui-package-design.md`

## Global Constraints

- Package lives at `project/package/`, name `@onblide/ui`, `"private": true` (not published to any registry).
- `react` / `react-dom` are peerDependencies pinned to `^18.3.1` (matches the CDN version the rest of the repo already loads).
- TypeScript only — no JSDoc-typed `.jsx`. `tsconfig.json` has `"strict": true`.
- **Zero behavior or visual changes.** Every component is a verbatim structural port. This explicitly includes preserving pre-existing bugs in `Datepicker` (the `values`/`defaultValues` precedence issue, and `minBookingDate` not being enforced on calendar-day clicks) — do not fix them here.
- No test framework is introduced (no Vitest/Jest/RTL) — per spec non-goals. Verification per task is: `tsc --noEmit`, a `tsup` build, and either a tiny Node smoke script (components with no existing preview page) or a live before/after comparison of the real preview page (components that have one).
- Preview pages are always opened via `python -m http.server` from `project/`, **never** `file://` (project memory: Babel-Standalone's XHR fetch of external `.jsx` is blocked by CORS under `file://`).
- Every commit follows `project/CLAUDE.md`'s Git workflow: Conventional Commits in Portuguese, made on the `dev` branch, amended (not stacked) when a change completes the prior commit.
- Icons: `@phosphor-icons/web@2.1.2` becomes a real npm dependency of the package (self-hosted), not a CDN `<link>`.
- Out of scope (do not touch): `Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx`; the ~34 components in `Components.jsx`/`Primitives.jsx` not listed below (Fase 2); actually invoking the `/design-sync` skill (a separate action after this plan finishes — see "After this plan" at the end).

---

## File Structure

```text
project/package/
  package.json
  tsconfig.json
  tsup.config.ts
  .gitignore
  scripts/
    smoke-ph.mjs
    smoke-button.mjs
    smoke-fieldshell.mjs
  src/
    index.ts                       # re-exports every ported component
    browser.ts                     # IIFE entry: Object.assign(window, *)
    styles.css                     # @import chain: Phosphor CSS + tokens.css
    tokens.css                     # copy of project/colors_and_type.css
    components/
      Ph/Ph.tsx
      Checkbox/Checkbox.tsx
      FloatingPanel/FloatingPanel.tsx
      Dropdown/Dropdown.tsx
    primitives/
      Button/Button.tsx
      FieldShell/FieldShell.tsx
      Datepicker/Datepicker.tsx
  dist/                             # build output, gitignored
```

`components/` and `primitives/` mirror exactly where each component already
lives today (`Components.jsx` vs `Primitives.jsx`) — this is the real
existing split, not a new one.

---

### Task 1: Package skeleton

**Files:**
- Create: `project/package/package.json`
- Create: `project/package/.gitignore`
- Create: `project/package/tsconfig.json`
- Create: `project/package/src/index.ts`

**Interfaces:**
- Produces: an installable, typecheckable, empty package at `project/package/` that Task 2 adds a build to.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@onblide/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "src/styles.css", "src/tokens.css"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "dependencies": {
    "@phosphor-icons/web": "2.1.2"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```text
node_modules/
dist/
*.log
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create an empty entry point**

```ts
// project/package/src/index.ts
export {};
```

- [ ] **Step 5: Install dependencies**

Run (from `project/package/`):

```bash
npm install
```

Expected: completes with a `node_modules/` and `package-lock.json` created,
no errors.

- [ ] **Step 6: Typecheck the empty skeleton**

Run: `npm run typecheck`
Expected: exits 0, no output (nothing to check yet, but confirms the
toolchain — `tsc`, the `tsconfig.json`, React types — resolves cleanly).

- [ ] **Step 7: Commit**

```bash
git add project/package/package.json project/package/.gitignore project/package/tsconfig.json project/package/src/index.ts project/package/package-lock.json
git commit -m "chore(package): inicializa esqueleto do pacote @onblide/ui"
```

(`node_modules/` stays untracked per `.gitignore`.)

---

### Task 2: Dual build — library output + browser-compat bundle

**Files:**
- Create: `project/package/tsup.config.ts`
- Create: `project/package/src/browser.ts`
- Modify: `project/package/package.json` (add `"build"` already present from
  Task 1 — no change needed there; this task only adds the config file)

**Interfaces:**
- Consumes: `src/index.ts` (Task 1)
- Produces: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts`,
  and `dist/onblide-ui.browser.js` (IIFE) — every later component task
  rebuilds through this same pipeline.

- [ ] **Step 1: Write the browser-compat entry point**

```ts
// project/package/src/browser.ts
//
// Built as a standalone IIFE (see tsup.config.ts). Re-exporting everything
// from `index` and assigning it onto `window` reproduces exactly what
// `Object.assign(window, { Checkbox, Modal, ... })` does today in
// Components.jsx/Primitives.jsx — so ds/components/*.html pages that
// reference `Checkbox`, `Button`, etc. as bare globals keep working once
// their <script type="text/babel" src="..."> tag is swapped for this file.
import * as OnblideUI from './index';

Object.assign(window, OnblideUI);
```

- [ ] **Step 2: Write `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // The real package build: what /design-sync and any future npm consumer use.
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
  },
  {
    // Browser-global compatibility bundle for the existing ds/components/*.html
    // preview pages. clean:false is required here — tsup runs array entries as
    // separate builds, and a second clean:true would delete the first build's
    // output before this one starts.
    entry: { 'onblide-ui.browser': 'src/browser.ts' },
    format: ['iife'],
    sourcemap: true,
    clean: false,
    minify: true,
    outDir: 'dist',
  },
]);
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`,
`dist/onblide-ui.browser.js` (+ `.map` files) all exist. `dist/index.d.ts`
contains nothing but re-export scaffolding (the source is still empty).

Verify:

```bash
ls dist/index.js dist/index.cjs dist/index.d.ts dist/onblide-ui.browser.js
```

Expected: all four paths print, no "No such file" errors.

- [ ] **Step 4: Commit**

```bash
git add project/package/tsup.config.ts project/package/src/browser.ts
git commit -m "chore(package): configura build dual (lib + bundle browser)"
```

---

### Task 3: Versioning — Changesets

**Files:**
- Create: `project/package/.changeset/config.json`
- Create: `project/package/.changeset/README.md`

**Interfaces:**
- Produces: the `changeset add` / `changeset version` workflow described in
  the spec, ready to use starting with Task 5's first real component.

- [ ] **Step 1: Initialize Changesets**

Run (from `project/package/`):

```bash
npx changeset init
```

Expected: creates `.changeset/config.json` and `.changeset/README.md`.

- [ ] **Step 2: Confirm the generated config matches the package**

Open `.changeset/config.json` and confirm `"access"` is `"restricted"` (the
default — correct here, since the package is `"private": true` and never
published) and there is no `changelog` override needed (the default
`@changesets/cli/changelog` generator is fine).

- [ ] **Step 3: Commit**

```bash
git add project/package/.changeset
git commit -m "chore(package): configura changesets para versionamento"
```

---

### Task 4: Tokens, styles, and self-hosted icons

**Files:**
- Create: `project/package/src/tokens.css` (copy of `project/colors_and_type.css`)
- Create: `project/package/src/styles.css`
- Modify: `project/package/package.json` (add `@phosphor-icons/web` — already
  present in Task 1's `dependencies`; this task installs it for real)

**Interfaces:**
- Produces: `src/styles.css`, the stylesheet entry point every component
  visually depends on (tokens + Phosphor glyphs), consumed later by
  `/design-sync` (not built by `tsup` — CSS ships as source, per the spec).

- [ ] **Step 1: Copy the token stylesheet**

```bash
cp ../../project/colors_and_type.css project/package/src/tokens.css
```

(Run from the repo root; adjust the relative path if your shell's cwd
differs — the source is `project/colors_and_type.css`, the destination is
`project/package/src/tokens.css`.)

This is a **one-time copy**, not a live link — note in a code comment (next
step) that it can drift from the original and needs to be re-synced by hand
if `project/colors_and_type.css` changes before Fase 2.

- [ ] **Step 2: Add a drift warning at the top of the copy**

Open `project/package/src/tokens.css` and add as the very first lines:

```css
/* Copied from project/colors_and_type.css — NOT a live import. If the
   original changes, re-copy it here by hand (see Fase 1 plan, Task 4). */
```

- [ ] **Step 3: Write `styles.css`**

```css
/* project/package/src/styles.css */
@import "@phosphor-icons/web/regular/style.css";
@import "./tokens.css";
```

- [ ] **Step 4: Install the icon dependency**

Run (from `project/package/`):

```bash
npm install @phosphor-icons/web@2.1.2
```

Expected: `package.json`'s `dependencies` already listed it (Task 1); this
installs it into `node_modules` for real and updates the lockfile.

- [ ] **Step 5: Confirm the import resolves**

```bash
ls node_modules/@phosphor-icons/web/regular/style.css
```

Expected: the path exists.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/tokens.css project/package/src/styles.css project/package/package.json project/package/package-lock.json
git commit -m "chore(package): adiciona tokens.css e phosphor auto-hospedado"
```

---

### Task 5: Port `Ph` (icon primitive)

**Files:**
- Create: `project/package/src/components/Ph/Ph.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-ph.mjs`
- Source: `project/ui_kits/web_app/Components.jsx:375-378`

**Interfaces:**
- Produces: `Ph` — `React.FC<PhProps>`, `PhProps = { n: string; size?: number; c?: string; style?: React.CSSProperties }`.
  `Checkbox` (Task 7) imports this.

- [ ] **Step 1: Write `Ph.tsx`**

```tsx
// project/package/src/components/Ph/Ph.tsx
import React from 'react';

export interface PhProps {
  /** Phosphor icon name suffix, e.g. "check" renders the ph-check glyph. */
  n: string;
  size?: number;
  /** CSS color value; defaults to currentColor. */
  c?: string;
  style?: React.CSSProperties;
}

export const Ph: React.FC<PhProps> = ({ n, size = 18, c, style }) => (
  <i
    className={`ph ph-${n}`}
    aria-hidden="true"
    style={{
      fontSize: size,
      color: c || 'currentColor',
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  />
);
```

- [ ] **Step 2: Export it from the package entry point**

```ts
// project/package/src/index.ts
export * from './components/Ph/Ph';
```

(Replace the placeholder `export {};` from Task 1.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `dist/index.d.ts` now contains `PhProps` and `Ph`.

Verify:

```bash
grep -c "PhProps" dist/index.d.ts
```

Expected: `1` or more.

- [ ] **Step 5: Write the smoke script**

```js
// project/package/scripts/smoke-ph.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ph } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(Ph, { n: 'check', size: 20, c: '#fff' }));

if (!html.includes('ph ph-check') || !html.includes('font-size:20px')) {
  console.error('FAIL: unexpected markup:', html);
  process.exit(1);
}
console.log('OK:', html);
```

- [ ] **Step 6: Run the smoke script**

Run: `node scripts/smoke-ph.mjs`
Expected: prints `OK: <i class="ph ph-check" ...>`, exits 0.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/Ph project/package/src/index.ts project/package/scripts/smoke-ph.mjs
git commit -m "feat(ph): porta componente Ph para @onblide/ui"
```

---

### Task 6: Port `Button`

**Files:**
- Create: `project/package/src/primitives/Button/Button.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-button.mjs`
- Source: `project/ui_kits/web_app/Primitives.jsx:169-191`

**Interfaces:**
- Produces: `Button` — `React.FC<ButtonProps>`, `ButtonKind = 'primary' | 'secondary' | 'ghost' | 'cream' | 'danger'`,
  `ButtonSize = 'sm' | 'md' | 'lg'`. `Datepicker` (Task 9) imports this.
- No standalone preview page exists for `Button` today (`ds/components/components-buttons.html`
  is static HTML/CSS, not the real React component) — its real-world
  verification happens via Task 9's `Datepicker` page, which renders two
  real `Button`s in its calendar footer. This task's own gate is the smoke
  script below.

- [ ] **Step 1: Write `Button.tsx`**

```tsx
// project/package/src/primitives/Button/Button.tsx
import React from 'react';

export type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'cream' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  kind = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  style = {},
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
    fontFamily: 'inherit', fontWeight: 600, border: 'none', borderRadius: 'var(--ob-r-control)',
    cursor: 'pointer', transition: 'all 160ms cubic-bezier(0.2,0.7,0.2,1)',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
    padding: size === 'sm' ? '7px 12px' : size === 'lg' ? '14px 22px' : '10px 18px',
  };
  const kinds: Record<ButtonKind, React.CSSProperties> = {
    primary:   { background: 'var(--ob-blue)', color: '#fff' },
    secondary: { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', border: '1.5px solid var(--ob-border)' },
    ghost:     { background: 'transparent', color: 'var(--ob-blue)' },
    cream:     { background: 'var(--ob-bg-warm)', color: 'var(--ob-fg-strong)' },
    danger:    { background: 'var(--ob-danger)', color: '#fff' },
  };
  return (
    <button
      style={{ ...base, ...kinds[kind], ...style }}
      onClick={onClick}
      onMouseEnter={(e) => { if (kind === 'primary') e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,78,228,0.28)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {icon}{children}
    </button>
  );
};
```

- [ ] **Step 2: Export it**

```ts
// project/package/src/index.ts — append
export * from './primitives/Button/Button';
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds; `dist/index.d.ts` contains `ButtonProps`.

- [ ] **Step 5: Write and run the smoke script**

```js
// project/package/scripts/smoke-button.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(Button, { kind: 'primary' }, 'Continuar'));

if (!html.includes('Continuar') || !html.includes('background:var(--ob-blue)')) {
  console.error('FAIL: unexpected markup:', html);
  process.exit(1);
}
console.log('OK:', html);
```

Run: `node scripts/smoke-button.mjs`
Expected: prints `OK: <button ...>Continuar</button>`, exits 0.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/Button project/package/src/index.ts project/package/scripts/smoke-button.mjs
git commit -m "feat(button): porta componente Button para @onblide/ui"
```

---

### Task 7: Port `Checkbox` and migrate its preview page

**Files:**
- Create: `project/package/src/components/Checkbox/Checkbox.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-checkbox.html:18`
- Source: `project/ui_kits/web_app/Components.jsx:69-91`

**Interfaces:**
- Consumes: `Ph` (Task 5) — `<Ph n="check" size={12} c="#fff" style={{ lineHeight: 1 }} />`
- Produces: `Checkbox` — `React.FC<CheckboxProps>`,
  `CheckboxProps = { checked: boolean; onChange?: (checked: boolean) => void; label?: React.ReactNode; disabled?: boolean; indeterminate?: boolean; description?: React.ReactNode }`

- [ ] **Step 1: Write `Checkbox.tsx`**

```tsx
// project/package/src/components/Checkbox/Checkbox.tsx
import React from 'react';
import { Ph } from '../Ph/Ph';

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  indeterminate?: boolean;
  description?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description,
}) => (
  <label style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }}>
    <span onClick={() => !disabled && onChange?.(!checked)} style={{
      flex: 'none', marginTop: 1, width: 18, height: 18, borderRadius: 6,
      border: `1.5px solid ${checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
      background: checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 160ms var(--ob-ease)',
    }}>
      {checked && !indeterminate && (
        <Ph n="check" size={12} c="#fff" style={{ lineHeight: 1 }} />
      )}
      {indeterminate && <span style={{ width: 9, height: 2, background: '#fff', borderRadius: 1 }} />}
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);
```

- [ ] **Step 2: Export it**

```ts
// project/package/src/index.ts — append
export * from './components/Checkbox/Checkbox';
```

- [ ] **Step 3: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed; `dist/index.d.ts` contains `CheckboxProps`.

- [ ] **Step 4: Migrate the preview page's script tag**

In `project/ds/components/components-checkbox.html`, line 18, change:

```diff
- <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
+ <script src="../../package/dist/onblide-ui.browser.js"></script>
```

Leave the second `<script type="text/babel">` block on that page (the demo
code itself) untouched — it still references `Checkbox` as a bare
identifier, which `dist/onblide-ui.browser.js` continues to provide on
`window`.

- [ ] **Step 5: Serve and compare**

From `project/`, run (background is fine):

```bash
python -m http.server 8000
```

Open `http://127.0.0.1:8000/ds/components/components-checkbox.html` (never
`file://` — see Global Constraints). Confirm:
- The "Selecionar tudo" checkbox, the three child checkboxes, and the four
  STATES checkboxes (Marcado / Vazio / Indeterminado / Desabilitado) render
  identically to before the migration (same colors, same check glyph, same
  indeterminate dash).
- Clicking "Selecionar tudo" still toggles all three children.
- No console errors (`Checkbox is not defined` would mean the script swap
  didn't take, or the IIFE bundle failed to build).

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Checkbox project/package/src/index.ts project/ds/components/components-checkbox.html
git commit -m "feat(checkbox): porta Checkbox para @onblide/ui e migra preview"
```

---

### Task 8: Port `FieldShell`

**Files:**
- Create: `project/package/src/primitives/FieldShell/FieldShell.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-fieldshell.mjs`
- Source: `project/ui_kits/web_app/Primitives.jsx:197-218`

**Interfaces:**
- Produces: `FieldShell` — `React.FC<FieldShellProps>`,
  `FieldShellProps = { focused?: boolean; error?: boolean; disabled?: boolean; minHeight?: number | string; padding?: string; onClick?: React.MouseEventHandler<HTMLDivElement>; style?: React.CSSProperties; children?: React.ReactNode }`.
  `Datepicker` (Task 9) imports this.
- No standalone preview page exists for `FieldShell` (it's an internal
  shared shell, never showcased alone) — verified by the smoke script here,
  and in real use once Task 9 lands.

- [ ] **Step 1: Write `FieldShell.tsx`**

```tsx
// project/package/src/primitives/FieldShell/FieldShell.tsx
import React from 'react';

export interface FieldShellProps {
  focused?: boolean;
  error?: boolean;
  disabled?: boolean;
  minHeight?: number | string;
  padding?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const FieldShell: React.FC<FieldShellProps> = ({
  focused = false, error = false, disabled = false, minHeight = 44, padding = '0 14px',
  onClick, style = {}, children,
}) => {
  const borderColor = error ? 'var(--ob-danger)' : focused ? 'var(--ob-blue)' : 'var(--ob-border)';
  const ring = !focused ? 'none'
    : error ? '0 0 0 4px color-mix(in srgb, var(--ob-danger) 22%, transparent)'
            : '0 0 0 4px var(--ob-focus-ring)';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      minHeight, padding,
      background: disabled ? 'var(--ob-bg-alt)' : 'var(--ob-surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--ob-r-control)',
      boxShadow: ring,
      transition: 'border-color .15s, box-shadow .15s',
      opacity: disabled ? 0.6 : 1,
      boxSizing: 'border-box',
      ...style,
    }}>
      {children}
    </div>
  );
};
```

- [ ] **Step 2: Export it**

```ts
// project/package/src/index.ts — append
export * from './primitives/FieldShell/FieldShell';
```

- [ ] **Step 3: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed; `dist/index.d.ts` contains `FieldShellProps`.

- [ ] **Step 4: Write and run the smoke script**

```js
// project/package/scripts/smoke-fieldshell.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FieldShell } from '../dist/index.js';

const html = renderToStaticMarkup(
  React.createElement(FieldShell, { focused: true }, React.createElement('input'))
);

if (!html.includes('border:1.5px solid var(--ob-blue)') || !html.includes('<input')) {
  console.error('FAIL: unexpected markup:', html);
  process.exit(1);
}
console.log('OK:', html);
```

Run: `node scripts/smoke-fieldshell.mjs`
Expected: prints `OK: <div ...><input/></div>`, exits 0.

- [ ] **Step 5: Commit**

```bash
git add project/package/src/primitives/FieldShell project/package/src/index.ts project/package/scripts/smoke-fieldshell.mjs
git commit -m "feat(fieldshell): porta FieldShell para @onblide/ui"
```

---

### Task 9: Port `Datepicker` and migrate its preview page

**Files:**
- Create: `project/package/src/primitives/Datepicker/Datepicker.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-datepicker.html:36`
- Source: `project/ui_kits/web_app/Primitives.jsx:303-539` (includes the
  `dpFmt`/`dpParse`/`dpMask`/`dpToIso` helpers, lines 304-322)

**Interfaces:**
- Consumes: `FieldShell` (Task 8), `Button` (Task 6)
- Produces: `Datepicker` — `React.FC<DatepickerProps>`,
  `DatepickerValues = { startDate: string | null; endDate: string | null }`

**Known pre-existing bugs — preserve, do not fix (per Global Constraints):**
1. `localValues`/`startText`/`endText` are seeded from `values || defaultValues`
   — since the demo always passes a non-null `values` default object, the
   calendar's day-highlighting can miss `defaultValues` even though the
   text inputs pick it up via `values?.startDate || defaultValues?.startDate`.
2. `minBookingDate` is enforced only in `handleStartInput` (typed entry);
   clicking a day directly on the calendar bypasses it.
3. `maxBookingDays` is accepted in the props but never used anywhere.

- [ ] **Step 1: Write `Datepicker.tsx`**

```tsx
// project/package/src/primitives/Datepicker/Datepicker.tsx
import React, { useEffect, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../Button/Button';

export interface DatepickerValues {
  startDate: string | null;
  endDate: string | null;
}

export interface DatepickerProps {
  singleDate?: boolean;
  clearLabel?: string;
  defaultValues?: DatepickerValues;
  endDateLabel?: string;
  onChange?: (values: DatepickerValues) => void;
  onClear?: () => void;
  resetOnSubmit?: boolean;
  showSubmitButton?: boolean;
  startDateLabel?: string;
  onSubmit?: (startDate: string | null, endDate: string | null) => void;
  submitLabel?: string;
  values?: DatepickerValues;
  minBookingDate?: Date | null;
  /** Accepted for API compatibility with the pre-port component; not
   * enforced anywhere — same as before the port. See Task 9 notes. */
  maxBookingDays?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
}

const dpFmt = (d: string | Date | null | undefined): string => {
  if (!d) return '';
  if (typeof d === 'string') {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const dpParse = (str: string): Date | null => {
  if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return null;
  const [dd, mm, yyyy] = str.split('/').map(Number);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return (d.getDate() === dd && d.getMonth() === mm - 1 && d.getFullYear() === yyyy) ? d : null;
};

const dpMask = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const dpToIso = (d: Date | null): string | null =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;

export const Datepicker: React.FC<DatepickerProps> = ({
  singleDate = false,
  clearLabel = 'Limpar',
  defaultValues = { startDate: null, endDate: null },
  endDateLabel = 'até',
  onChange,
  onClear,
  resetOnSubmit = false,
  showSubmitButton = true,
  startDateLabel = 'de',
  onSubmit,
  submitLabel = 'Confirmar',
  values = { startDate: null, endDate: null },
  minBookingDate = null,
  label,
  hint,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [localValues, setLocalValues] = useState<DatepickerValues>(values || defaultValues);
  const [startText, setStartText] = useState(dpFmt(values?.startDate || defaultValues?.startDate));
  const [endText, setEndText] = useState(dpFmt(values?.endDate || defaultValues?.endDate));
  const [startErr, setStartErr] = useState('');
  const [endErr, setEndErr] = useState('');
  const [startFocus, setStartFocus] = useState(false);
  const [endFocus, setEndFocus] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleStartInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = dpMask(e.target.value);
    setStartText(masked);
    if (masked.length < 10) { setStartErr(''); return; }
    const d = dpParse(masked);
    if (!d) { setStartErr('Data inválida'); return; }
    if (minBookingDate && d < minBookingDate) { setStartErr(`Mín: ${dpFmt(minBookingDate)}`); return; }
    setStartErr('');
    const iso = dpToIso(d);
    const newVals = { ...localValues, startDate: iso, endDate: null };
    setLocalValues(newVals);
    setEndText('');
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  const handleEndInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = dpMask(e.target.value);
    setEndText(masked);
    if (masked.length < 10) { setEndErr(''); return; }
    const d = dpParse(masked);
    if (!d) { setEndErr('Data inválida'); return; }
    if (localValues.startDate && dpToIso(d)! < localValues.startDate) { setEndErr('Deve ser após data inicial'); return; }
    setEndErr('');
    const iso = dpToIso(d);
    const newVals = { ...localValues, endDate: iso };
    setLocalValues(newVals);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  const isInRange = (day: number) => {
    const dIso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!localValues.startDate || !localValues.endDate) return false;
    return dIso > localValues.startDate && dIso < localValues.endDate;
  };

  const handleDayClick = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    const iso = dpToIso(d);
    if (singleDate) {
      const newVals = { startDate: iso, endDate: iso };
      setLocalValues(newVals); setStartText(dpFmt(d)); setStartErr('');
      onChange?.(newVals); setOpen(false);
    } else {
      if (!localValues.startDate || (localValues.startDate && localValues.endDate) || iso! < localValues.startDate!) {
        const newVals = { startDate: iso, endDate: null };
        setLocalValues(newVals); setStartText(dpFmt(d)); setEndText(''); setStartErr(''); setEndErr('');
        onChange?.(newVals);
      } else {
        const newVals = { ...localValues, endDate: iso };
        setLocalValues(newVals); setEndText(dpFmt(d)); setEndErr('');
        onChange?.(newVals); setOpen(false);
      }
    }
  };

  const handleClear = () => {
    const newVals = { startDate: null, endDate: null };
    setLocalValues(newVals); setStartText(''); setEndText(''); setStartErr(''); setEndErr('');
    onClear?.(); onChange?.(newVals);
  };

  const handleSubmit = () => {
    onSubmit?.(localValues.startDate, localValues.endDate);
    if (resetOnSubmit) handleClear();
    setOpen(false);
  };

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1));

  const handleInputClick = (e: React.SyntheticEvent) => { e.stopPropagation(); setOpen(true); };

  const dpInputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}
         onClick={(e) => e.stopPropagation()}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {!singleDate ? (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{startDateLabel}</div>
              <FieldShell focused={startFocus} error={!!startErr} onClick={handleInputClick}>
                <input
                  type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                  onChange={handleStartInput} onClick={handleInputClick}
                  onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)}
                  style={dpInputStyle}
                />
              </FieldShell>
              {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{endDateLabel}</div>
              <FieldShell focused={endFocus} error={!!endErr} onClick={handleInputClick}>
                <input
                  type="text" value={endText} maxLength={10} placeholder="dd/mm/yyyy"
                  onChange={handleEndInput} onClick={handleInputClick}
                  onFocus={() => setEndFocus(true)} onBlur={() => setEndFocus(false)}
                  style={dpInputStyle}
                />
              </FieldShell>
              {endErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{endErr}</div>}
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <FieldShell focused={startFocus} error={!!startErr} onClick={handleInputClick}>
              <input
                type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                onChange={handleStartInput} onClick={handleInputClick}
                onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)}
                style={dpInputStyle}
              />
            </FieldShell>
            {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
          </div>
        )}
      </div>

      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
          borderRadius: 'var(--ob-r-surface)', padding: 16, boxShadow: 'var(--ob-shadow-lg)',
          zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'],
          minWidth: 300,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 'var(--ob-r-xs)' }}>←</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{monthNames[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 'var(--ob-r-xs)' }}>→</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 10 }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ob-fg-mute)', padding: '4px 0' }}>{d}</div>
            ))}
            {blanks.map((_, i) => <div key={`b-${i}`} />)}
            {days.map(day => {
              const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isStart = iso === localValues.startDate;
              const isEnd = iso === localValues.endDate;
              const inRange = isInRange(day);
              return (
                <button key={day} onClick={() => handleDayClick(day)} style={{
                  padding: '6px 0', borderRadius: 'var(--ob-r-xs)', border: 'none', textAlign: 'center',
                  background: isStart || isEnd ? 'var(--ob-blue)' : inRange ? 'var(--ob-blue-100)' : 'var(--ob-surface)',
                  color: isStart || isEnd ? '#fff' : 'var(--ob-fg-strong)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background 100ms',
                }}>{day}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--ob-border)', paddingTop: 10 }}>
            <Button kind="ghost" onClick={handleClear} style={{ flex: 1, fontSize: 12 }}>{clearLabel}</Button>
            {showSubmitButton && (
              <Button kind="primary" onClick={handleSubmit} style={{ flex: 1, fontSize: 12 }}>{submitLabel}</Button>
            )}
          </div>
        </div>
      )}
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)', marginTop: 4 }}>{error || hint}</span>}
    </div>
  );
};
```

- [ ] **Step 2: Export it**

```ts
// project/package/src/index.ts — append
export * from './primitives/Datepicker/Datepicker';
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0. If TypeScript flags a nullability error on a comparison
(e.g. around `iso! < localValues.startDate!` or `dpToIso(d)!`), the fix is
always a non-null assertion (`!`) at that exact spot — never a logic
change. Every such spot in the code above is already guarded at runtime by
the surrounding `if`, so asserting non-null there is safe.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds; `dist/index.d.ts` contains `DatepickerProps` and
`DatepickerValues`.

- [ ] **Step 5: Migrate the preview page's script tag**

In `project/ds/components/components-datepicker.html`, line 36, change:

```diff
- <script type="text/babel" src="../../ui_kits/web_app/Primitives.jsx"></script>
+ <script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 6: Serve and compare**

From `project/`, run `python -m http.server 8000` (if not already running),
open `http://127.0.0.1:8000/ds/components/components-datepicker.html`.
Confirm, for every entry in the VARIAÇÃO dropdown (range, single, nosubmit,
resetonsubmit, prefilled, mindate, error):
- The field(s), calendar, and Limpar/Confirmar buttons render identically
  to before the migration.
- Typing a date, clicking a calendar day, and switching months all behave
  the same as before.
- The known bugs listed above (start of this task) are still present and
  unchanged — that confirms the port didn't silently "fix" anything.
- No console errors.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/primitives/Datepicker project/package/src/index.ts project/ds/components/components-datepicker.html
git commit -m "feat(datepicker): porta Datepicker para @onblide/ui e migra preview"
```

---

### Task 10: Port `FloatingPanel` + `Dropdown` and migrate the preview page

**Files:**
- Create: `project/package/src/components/FloatingPanel/FloatingPanel.tsx`
- Create: `project/package/src/components/Dropdown/Dropdown.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-dropdown.html:18`
- Source: `project/ui_kits/web_app/Components.jsx:185-238`

**Interfaces:**
- Produces: `FloatingPanel` — `React.FC<FloatingPanelProps>`,
  `FloatingPanelAlign = 'left' | 'right' | 'stretch'`; `Dropdown` —
  `React.FC<DropdownProps>`, `DropdownItem = { label?: React.ReactNode; onClick?: () => void; disabled?: boolean; danger?: boolean; divider?: boolean; icon?: React.ReactNode }`
- Consumes (within this task): `Dropdown` uses `FloatingPanel`.

- [ ] **Step 1: Write `FloatingPanel.tsx`**

```tsx
// project/package/src/components/FloatingPanel/FloatingPanel.tsx
import React from 'react';

export type FloatingPanelAlign = 'left' | 'right' | 'stretch';

export interface FloatingPanelProps {
  align?: FloatingPanelAlign;
  maxHeight?: number | string;
  padding?: number | string;
  minWidth?: number | string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  align = 'stretch', maxHeight, padding = 4, minWidth, style = {}, children,
}) => {
  const pos: React.CSSProperties =
    align === 'right' ? { right: 0 } : align === 'left' ? { left: 0 } : { left: 0, right: 0 };
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)',
      zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'],
      background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)', boxShadow: 'var(--ob-shadow-lg)',
      padding, overflow: maxHeight ? 'hidden auto' : 'hidden',
      ...pos,
      ...(maxHeight ? { maxHeight } : {}),
      ...(minWidth ? { minWidth } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
};
```

- [ ] **Step 2: Write `Dropdown.tsx`**

```tsx
// project/package/src/components/Dropdown/Dropdown.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FloatingPanel, FloatingPanelAlign } from '../FloatingPanel/FloatingPanel';

export interface DropdownItem {
  label?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: FloatingPanelAlign;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{trigger}</span>
      {open && (
        <FloatingPanel align={align} minWidth={180} padding={6}>
          {items.map((it, i) => it.divider ? (
            <div key={`d${i}`} style={{ height: 1, background: 'var(--ob-border)', margin: '6px 0' }} />
          ) : (
            <button key={i} onClick={() => { it.onClick?.(); setOpen(false); }} disabled={it.disabled} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px',
              border: 'none', borderRadius: 'var(--ob-r-sm)', background: 'transparent', cursor: it.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500, textAlign: 'left',
              color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-strong)', opacity: it.disabled ? 0.5 : 1,
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              {it.icon && <span style={{ color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-soft)', display: 'flex' }}>{it.icon}</span>}
              {it.label}
            </button>
          ))}
        </FloatingPanel>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Export both**

```ts
// project/package/src/index.ts — append
export * from './components/FloatingPanel/FloatingPanel';
export * from './components/Dropdown/Dropdown';
```

- [ ] **Step 4: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed; `dist/index.d.ts` contains `FloatingPanelProps`,
`DropdownProps`, and `DropdownItem`.

- [ ] **Step 5: Migrate the preview page's script tag**

In `project/ds/components/components-dropdown.html`, line 18, change:

```diff
- <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
+ <script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 6: Serve and compare**

Open `http://127.0.0.1:8000/ds/components/components-dropdown.html`
(server from Task 7 still running, or start a new one from `project/`).
Confirm every dropdown variant on the page opens/closes on trigger click,
closes on outside click, shows dividers and danger items correctly, and
matches the pre-migration render. No console errors.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/FloatingPanel project/package/src/components/Dropdown project/package/src/index.ts project/ds/components/components-dropdown.html
git commit -m "feat(dropdown): porta FloatingPanel e Dropdown para @onblide/ui e migra preview"
```

---

### Task 11: Full-package verification pass

**Files:**
- No new files — this task only runs checks across everything Tasks 1-10 produced.

**Interfaces:**
- Consumes: everything produced by Tasks 1-10.

- [ ] **Step 1: Clean reinstall**

From `project/package/`:

```bash
rm -rf node_modules dist
npm install
```

Expected: completes with no errors (proves the package is reproducible from
just `package.json` + the lockfile, not leftover local state).

- [ ] **Step 2: Full typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 3: Full build**

Run: `npm run build`
Expected: exits 0; `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`,
`dist/onblide-ui.browser.js` all present.

- [ ] **Step 4: Run every smoke script**

```bash
node scripts/smoke-ph.mjs
node scripts/smoke-button.mjs
node scripts/smoke-fieldshell.mjs
```

Expected: all three print `OK:` and exit 0.

- [ ] **Step 5: Confirm the `.d.ts` surface matches all 7 ported exports**

```bash
grep -oE "^export (declare )?(const|interface|type) \w+" dist/index.d.ts | sort
```

Expected output includes (order may vary): `Button`, `ButtonProps`,
`Checkbox`, `CheckboxProps`, `Datepicker`, `DatepickerProps`,
`DatepickerValues`, `Dropdown`, `DropdownItem`, `DropdownProps`,
`FieldShell`, `FieldShellProps`, `FloatingPanel`, `FloatingPanelProps`,
`Ph`, `PhProps`.

- [ ] **Step 6: Re-check all three migrated preview pages together**

With `python -m http.server 8000` running from `project/`, open all three
in sequence and confirm no console errors on any of them:
- `http://127.0.0.1:8000/ds/components/components-checkbox.html`
- `http://127.0.0.1:8000/ds/components/components-datepicker.html`
- `http://127.0.0.1:8000/ds/components/components-dropdown.html`

- [ ] **Step 7: Grep sweep for accidental stale references**

```bash
grep -rn "ui_kits/web_app/Components.jsx\|ui_kits/web_app/Primitives.jsx" project/ds/components/components-checkbox.html project/ds/components/components-datepicker.html project/ds/components/components-dropdown.html
```

Expected: no output (all three migrated pages should have zero references
to the old script paths left).

- [ ] **Step 8: Commit (only if any of the above required a fix)**

If every check above passed with no changes needed, skip this step — there
is nothing to commit. If a check surfaced something to fix, fix it, then:

```bash
git add -A project/package project/ds/components
git commit --amend --no-edit
```

(Amend into whichever Task 5-10 commit the fix belongs to, per
`project/CLAUDE.md`'s Git workflow — not a new "fix" commit.)

---

### Task 12: First release — 0.1.0

**Files:**
- Create: `project/package/.changeset/<random-name>.md` (generated by
  `changeset add`)
- Modify: `project/package/package.json` (version bump, via `changeset version`)
- Create: `project/package/CHANGELOG.md` (via `changeset version`)

**Interfaces:**
- Consumes: the completed package from Tasks 1-11.

- [ ] **Step 1: Record the changeset**

From `project/package/`, run:

```bash
npx changeset add
```

When prompted:
- Bump type: **minor** (first components added to a `0.x` package — not a
  breaking change relative to nothing existing before).
- Summary: `Primeira versão do pacote: Ph, Button, Checkbox, FieldShell, Datepicker, FloatingPanel e Dropdown portados para TypeScript.`

Expected: a new file appears in `.changeset/` with that content.

- [ ] **Step 2: Apply the version bump**

```bash
npx changeset version
```

Expected: `package.json`'s `"version"` becomes `0.2.0` (0.1.0 + minor,
per semver — Changesets bumps the minor digit even pre-1.0), `CHANGELOG.md`
is created with today's entry, and the changeset file from Step 1 is
deleted (consumed).

Note: if you specifically want the very first published version to read
`0.1.0` instead of `0.2.0`, edit `package.json`'s `"version"` back to
`0.1.0` by hand after this step and adjust the `CHANGELOG.md` heading to
match — Changesets always adds to whatever version is currently set, so a
project's actual first release number is a one-time manual choice.

- [ ] **Step 3: Rebuild with the new version**

```bash
npm run build
```

Expected: succeeds (the version bump doesn't change build output, this just
confirms nothing broke).

- [ ] **Step 4: Commit**

```bash
git add project/package/package.json project/package/CHANGELOG.md project/package/.changeset
git commit -m "chore(package): libera @onblide/ui 0.1.0"
```

- [ ] **Step 5: Tag the release**

```bash
git tag onblide-ui@0.1.0
git push origin dev
git push origin onblide-ui@0.1.0
```

Expected: `dev` and the new tag both appear on `origin`.

---

## After this plan

`project/package/` now builds a real `@onblide/ui` 0.1.0 with 7 components
(`Ph`, `Button`, `Checkbox`, `FieldShell`, `Datepicker`, `FloatingPanel`,
`Dropdown`), a `.d.ts` for each, self-hosted Phosphor icons, and a
browser-compat bundle that 3 of the ~30 preview pages already use. This
plan does **not** invoke `/design-sync` itself — that's a separate,
long-running, heavily-gated skill (it creates its own Claude Design
project and does its own visual verification pass, "up to a few hours" on
its own admission). Once this plan's tasks are all checked off, the natural
next action is to run `/design-sync` pointed at `project/package/` as its
own invocation — not a step inside this plan.

Porting the remaining ~34 components is Fase 2, and gets its own spec and
plan once this one is done and reviewed.
