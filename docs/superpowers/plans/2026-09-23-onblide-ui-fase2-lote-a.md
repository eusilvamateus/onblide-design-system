# @onblide/ui Fase 2 — Lote A (13 componentes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar os 13 componentes do Lote A (`Radio`, `RadioGroup`, `Toggle`, `Skeleton`, `Tooltip`, `Chip`, `StatusDot`, `Badge`, `Card`, `Avatar`, `Spinner`, `ProgressCircle`, `Slider`) para `@onblide/ui`, migrar as 9 páginas de preview que ficam totalmente cobertas por eles, e liberar a versão `0.2.0`.

**Architecture:** Mesma do pacote já existente — TypeScript real, um componente por arquivo, build via `tsup` (biblioteca + bundle de compatibilidade pro navegador). Nenhuma decisão de arquitetura nova; só execução do padrão da Fase 1 em maior escala, mais um módulo de dados compartilhado (`badgeTones.ts`) que `StatusDot` e `Badge` usam.

**Tech Stack:** O mesmo já em `project/package/` — TypeScript 5, React 18.3.1, tsup, Changesets.

**Spec:** `docs/superpowers/specs/2026-09-22-onblide-ui-fase2-lote-a-design.md` (e, para o contexto do pacote em si, `docs/superpowers/specs/2026-09-22-onblide-ui-package-design.md`)

## Global Constraints

- Todo componente é um porte estrutural verbatim — zero mudança de comportamento ou visual. Isso inclui preservar comportamento hoje "estranho" mas intencional (ex.: `Slider` em modo `range` nunca deixa o thumb `lo` passar do `hi`, via `Math.min`/`Math.max`).
- TypeScript estrito (`tsconfig.json` já tem `"strict": true`, herdado, sem mudança).
- Nenhum framework de teste novo — verificação por tarefa é `tsc --noEmit`, `tsup build`, e (a) um script de smoke em Node (`react-dom/server`) para componentes sem página de preview ao vivo, ou (b) comparação visual real via `python -m http.server` (nunca `file://`) pra componentes com página.
- Conventional Commits, em português, na branch `dev`, sem rodapé `Claude-Session:` nem qualquer outra atribuição de IA.
- Grupo de destino: `src/components/` para os originários de `Components.jsx` (`Radio`, `RadioGroup`, `Toggle`, `Skeleton`, `Tooltip`, `Chip`), `src/primitives/` para os de `Primitives.jsx` (`StatusDot`, `Badge`, `Card`, `Avatar`, `Spinner`, `ProgressCircle`, `Slider`).
- Fora de escopo (não tocar): Lote B, Lote C (`Icons`, `Brands`, `Link`, `Pagination`), `Logo`, `Chrome.jsx`/`Screens.jsx`/`tweaks-panel.jsx`, rodar o `/design-sync` de verdade.

## Review Focus

- **Estados `disabled` continuam totalmente inertes.** `Radio`, `Toggle`, `Chip` e `Slider` têm prop `disabled` que guarda cliques/teclado (`!disabled && onChange?.(...)`, `if (disabled) return;`). Um usuário razoável espera que nada dispare `onChange` num controle desabilitado — a tarefa de cada um desses 4 precisa confirmar visualmente (ou por smoke script, no caso do Slider onde não há página) que o guard sobreviveu ao porte.
- **Injeção de keyframes é idempotente.** `Skeleton`, `Tooltip`, `Spinner`+`ProgressCircle` injetam um `<style>` global uma única vez (guardado por `document.getElementById('<id>')`). Se o porte perder esse guard, montar o componente várias vezes na mesma página duplica a tag — inofensivo visualmente, mas indica que o porte não foi de fato verbatim. As tarefas 4 (Skeleton), 5 (Tooltip), 11 (Spinner) e 12 (ProgressCircle) preservam o bloco de injeção exatamente como está, com o mesmo id.
- **`RadioGroup` não quebra com `options` vazio.** O original faz `options.map(...)` sem checar tamanho — uma lista vazia simplesmente não renderiza nada, sem erro. A Tarefa 2 preserva isso (nenhuma guarda nova de "lista vazia" deve ser adicionada — isso mudaria o comportamento) e inclui um smoke script que renderiza `RadioGroup` com `options: []` e confirma que não lança exceção.
- **`Slider` em modo `range`: `lo` nunca ultrapassa `hi` (e vice-versa).** `applyVal` usa `Math.min(v, hi)` / `Math.max(v, lo)` pra impedir os dois thumbs de se cruzarem. Um usuário arrastando rápido esperaria que os thumbs "colidam" em vez de trocar de posição. **Isso não dá pra testar via `renderToStaticMarkup`** (exigiria simular arrasto de ponteiro num DOM real, e este componente não tem página de preview nesta fase) — a verificação da Tarefa 13 é o revisor conferir, linha a linha, que `applyVal` na Tarefa 13 usa exatamente os mesmos `Math.min`/`Math.max` do original (`Primitives.jsx:581-582`), não uma versão "simplificada".
- **`Tooltip` não fica "grudado" aberto ao passar o mouse rápido por vários gatilhos.** `hide()` faz `clearTimeout(timer.current)` antes de fechar — se o porte perder essa chamada, um hover rápido que sai antes do `delay` ainda assim abriria o tooltip depois (timer nunca cancelado). A Tarefa 5 preserva `show`/`hide` exatamente, e a verificação na página migrada testa um hover rápido (entrar e sair antes do delay padrão de 120ms) além do hover normal.

---

## File Structure

```text
project/package/src/
  components/
    Radio/Radio.tsx
    RadioGroup/RadioGroup.tsx
    Toggle/Toggle.tsx
    Skeleton/Skeleton.tsx
    Tooltip/Tooltip.tsx
    Chip/Chip.tsx
  primitives/
    badgeTones.ts              # NOVO — módulo de dados compartilhado, não um componente
    StatusDot/StatusDot.tsx
    Badge/Badge.tsx
    Card/Card.tsx
    Avatar/Avatar.tsx
    Spinner/Spinner.tsx
    ProgressCircle/ProgressCircle.tsx
    Slider/Slider.tsx
```

`badgeTones.ts` existe porque `StatusDot` e `Badge` no original compartilham a
mesma tabela `BADGE_TONES` (`Primitives.jsx:243-249`) — portar isso duas vezes
duplicaria a tabela; um arquivo à parte, importado pelos dois, é a forma
correta de preservar "uma fonte de verdade" sem inventar uma abstração nova
que o original não tem (é literalmente a mesma constante, só num arquivo
próprio em vez de solta no meio de `Primitives.jsx`).

---

### Task 1: Portar `Radio`

**Files:**
- Create: `project/package/src/components/Radio/Radio.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-radio.mjs`
- Source: `project/ui_kits/web_app/Components.jsx:11-36`

**Interfaces:**
- Produces: `Radio` — `React.FC<RadioProps>`,
  `RadioProps = { name?: string; value: string; checked: boolean; onChange?: (value: string) => void; label?: React.ReactNode; disabled?: boolean; description?: React.ReactNode }`.
  Task 2 (`RadioGroup`) consome isso.

- [ ] **Step 1: Escrever `Radio.tsx`**

```tsx
// project/package/src/components/Radio/Radio.tsx
import React from 'react';

export interface RadioProps {
  name?: string;
  value: string;
  checked: boolean;
  onChange?: (value: string) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  description?: React.ReactNode;
}

export const Radio: React.FC<RadioProps> = ({
  name, value, checked, onChange, label, disabled = false, description,
}) => (
  <label style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }}>
    <span style={{ position: 'relative', flex: 'none', marginTop: 1 }}>
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled}
        onChange={() => onChange?.(value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{
        display: 'block', width: 18, height: 18, borderRadius: '50%',
        border: `1.5px solid ${checked ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
        background: 'var(--ob-surface)', transition: 'border-color 160ms',
      }}>
        {checked && <span style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 8, height: 8, borderRadius: '50%', background: 'var(--ob-blue)',
        }} />}
      </span>
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Radio/Radio';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `RadioProps`.

- [ ] **Step 4: Escrever e rodar o script de smoke**

```js
// project/package/scripts/smoke-radio.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Radio } from '../dist/index.js';

const checkedHtml = renderToStaticMarkup(React.createElement(Radio, { value: 'a', checked: true, label: 'Opção A' }));
const uncheckedHtml = renderToStaticMarkup(React.createElement(Radio, { value: 'b', checked: false, label: 'Opção B' }));

if (!checkedHtml.includes('background:var(--ob-blue)') || uncheckedHtml.includes('background:var(--ob-blue)')) {
  console.error('FAIL: checked/unchecked dot color mismatch:', checkedHtml, uncheckedHtml);
  process.exit(1);
}
console.log('OK:', checkedHtml);
```

Rodar: `node scripts/smoke-radio.mjs`
Esperado: imprime `OK:`, sai com código 0.

- [ ] **Step 5: Commit**

```bash
git add project/package/src/components/Radio project/package/src/index.ts project/package/scripts/smoke-radio.mjs
git commit -m "feat(radio): porta componente Radio para @onblide/ui"
```

---

### Task 2: Portar `RadioGroup` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/RadioGroup/RadioGroup.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-radio-group.mjs`
- Modify: `project/ds/components/components-radio.html`
- Source: `project/ui_kits/web_app/Components.jsx:38-46`

**Interfaces:**
- Consumes: `Radio` (Task 1) — `import { Radio } from '../Radio/Radio'`
- Produces: `RadioGroup` — `React.FC<RadioGroupProps>`,
  `RadioGroupOption = { value: string; label?: React.ReactNode; description?: React.ReactNode; disabled?: boolean }`,
  `RadioGroupProps = { options: RadioGroupOption[]; value?: string; onChange?: (value: string) => void; name?: string }`

- [ ] **Step 1: Escrever `RadioGroup.tsx`**

```tsx
// project/package/src/components/RadioGroup/RadioGroup.tsx
import React from 'react';
import { Radio } from '../Radio/Radio';

export interface RadioGroupOption {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, name = 'radio-group' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {options.map(opt => (
      <Radio key={opt.value} name={name} value={opt.value} label={opt.label}
        description={opt.description} disabled={opt.disabled}
        checked={value === opt.value} onChange={onChange} />
    ))}
  </div>
);
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/RadioGroup/RadioGroup';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `RadioGroupProps` e `RadioGroupOption`.

- [ ] **Step 4: Escrever e rodar um smoke script para o caso de lista vazia**

```js
// project/package/scripts/smoke-radio-group.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RadioGroup } from '../dist/index.js';

// options vazio não pode lançar exceção nem renderizar nada além do wrapper
const empty = renderToStaticMarkup(React.createElement(RadioGroup, { options: [] }));
if (!empty.includes('<div') || empty.includes('<label')) {
  console.error('FAIL: options vazio deveria renderizar só o wrapper, sem nenhum <label>:', empty);
  process.exit(1);
}

// options preenchido continua funcionando normalmente
const filled = renderToStaticMarkup(React.createElement(RadioGroup, {
  options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
  value: 'b',
}));
if ((filled.match(/<label/g) || []).length !== 2) {
  console.error('FAIL: esperava 2 <label> para 2 opções:', filled);
  process.exit(1);
}

console.log('OK: options vazio e preenchido, ambos corretos');
```

Rodar: `node scripts/smoke-radio-group.mjs`
Esperado: imprime `OK:`, sai com código 0.

- [ ] **Step 5: Migrar o script da página de preview**

Em `project/ds/components/components-radio.html`, trocar a linha que carrega
`ui_kits/web_app/Components.jsx` via Babel Standalone:

```diff
- <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
+ <script src="../../package/dist/onblide-ui.browser.js"></script>
```

Deixar o segundo `<script type="text/babel">` (o código de demo da página)
intocado — ele referencia `Radio` e `RadioGroup` como globais soltas, que o
bundle novo continua provendo.

- [ ] **Step 6: Servir e comparar**

A partir de `project/`, rodar `python -m http.server 8000` (se ainda não
estiver rodando). Abrir `http://127.0.0.1:8000/ds/components/components-radio.html`
(nunca `file://`). Confirmar:
- O grupo de rádio renderiza igual a antes da migração (mesmas cores, mesmo
  ponto preenchido no selecionado).
- Clicar numa opção diferente muda a seleção.
- Um item marcado como `disabled` (se a página tiver um) não responde a
  clique nem muda o estado — ver "Review Focus" no topo do plano.
- Sem erros no console.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/RadioGroup project/package/src/index.ts project/package/scripts/smoke-radio-group.mjs project/ds/components/components-radio.html
git commit -m "feat(radio-group): porta RadioGroup para @onblide/ui e migra preview"
```

---

### Task 3: Portar `Toggle` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Toggle/Toggle.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-toggle.html`
- Source: `project/ui_kits/web_app/Components.jsx:49-66`

**Interfaces:**
- Produces: `Toggle` — `React.FC<ToggleProps>`,
  `ToggleProps = { checked: boolean; onChange?: (checked: boolean) => void; label?: React.ReactNode; disabled?: boolean; size?: 'sm' | 'md' }`

- [ ] **Step 1: Escrever `Toggle.tsx`**

```tsx
// project/package/src/components/Toggle/Toggle.tsx
import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled = false, size = 'md' }) => {
  const w = size === 'sm' ? 32 : 40, h = size === 'sm' ? 18 : 22, knob = h - 4;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <span onClick={() => !disabled && onChange?.(!checked)} style={{
        width: w, height: h, borderRadius: 999, flex: 'none', position: 'relative',
        background: checked ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background 200ms var(--ob-ease)',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? w - knob - 2 : 2, width: knob, height: knob,
          borderRadius: '50%', background: '#fff', transition: 'left 200ms var(--ob-ease)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </span>
      {label && <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500 }}>{label}</span>}
    </label>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Toggle/Toggle';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `ToggleProps`.

- [ ] **Step 4: Migrar o script da página de preview**

Em `project/ds/components/components-toggle.html`, mesma troca de linha do
Task 2 (Step 4), mas para o script que essa página carrega (confirmar se é
`Components.jsx` — `Toggle` está lá).

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-toggle.html`. Confirmar
tamanhos `sm`/`md`, transição da bolinha ao alternar, e que um toggle
`disabled` (se presente na página) não muda de estado ao clicar. Sem erros
no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Toggle project/package/src/index.ts project/ds/components/components-toggle.html
git commit -m "feat(toggle): porta Toggle para @onblide/ui e migra preview"
```

---

### Task 4: Portar `Skeleton` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Skeleton/Skeleton.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-skeleton.html`
- Source: `project/ui_kits/web_app/Components.jsx:116-135`

**Interfaces:**
- Produces: `Skeleton` — `React.FC<SkeletonProps>`,
  `SkeletonProps = { width?: number | string; height?: number | string; radius?: number | string; circle?: boolean; style?: React.CSSProperties }`

**Cuidado:** este componente injeta um `<style>` global com a keyframe da
animação de shimmer, uma única vez (guardado por
`document.getElementById('ob-skeleton-kf')`). Preservar esse bloco
exatamente — ver "Review Focus" no topo do plano.

- [ ] **Step 1: Escrever `Skeleton.tsx`**

```tsx
// project/package/src/components/Skeleton/Skeleton.tsx
import React from 'react';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, radius = 6, circle = false, style = {} }) => (
  <span style={{
    display: 'block',
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : radius,
    background: 'linear-gradient(90deg, var(--ob-bg-alt) 25%, var(--ob-border) 50%, var(--ob-bg-alt) 75%)',
    backgroundSize: '200% 100%',
    animation: 'ob-shimmer 1.4s ease-in-out infinite',
    ...style,
  }} />
);

// injeta a keyframe do shimmer uma única vez
if (typeof document !== 'undefined' && !document.getElementById('ob-skeleton-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-skeleton-kf';
  st.textContent = '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Skeleton/Skeleton';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `SkeletonProps`.

- [ ] **Step 4: Migrar o script da página de preview**

Mesma troca de linha em `project/ds/components/components-skeleton.html`.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-skeleton.html`. Confirmar
que a animação de shimmer roda (visualmente, um brilho se movendo), formas
`circle`/retangular corretas, e — importante — abrir o DevTools e confirmar
que só existe **uma** tag `<style id="ob-skeleton-kf">` no `<head>`, mesmo
com vários skeletons na página. Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Skeleton project/package/src/index.ts project/ds/components/components-skeleton.html
git commit -m "feat(skeleton): porta Skeleton para @onblide/ui e migra preview"
```

---

### Task 5: Portar `Tooltip` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Tooltip/Tooltip.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-tooltip.html`
- Source: `project/ui_kits/web_app/Components.jsx:294-372`

**Interfaces:**
- Produces: `Tooltip` — `React.FC<TooltipProps>`,
  `TooltipProps = { children: React.ReactNode; variant?: 'text' | 'inverted' | 'image'; placement?: 'top' | 'bottom' | 'left' | 'right'; label?: React.ReactNode; shortcut?: React.ReactNode; image?: string; title?: React.ReactNode; subtitle?: React.ReactNode; delay?: number; maxWidth?: number }`

**Cuidado:** injeta a keyframe `ob-tip` uma única vez (mesmo padrão do
Skeleton). E o `hide()` precisa continuar cancelando o timer pendente — ver
"Review Focus" no topo do plano.

- [ ] **Step 1: Escrever `Tooltip.tsx`**

```tsx
// project/package/src/components/Tooltip/Tooltip.tsx
import React, { useRef, useState } from 'react';

export type TooltipVariant = 'text' | 'inverted' | 'image';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  variant?: TooltipVariant;
  placement?: TooltipPlacement;
  label?: React.ReactNode;
  shortcut?: React.ReactNode;
  image?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  delay?: number;
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children, variant = 'text', placement = 'top', label, shortcut, image, title, subtitle, delay = 120, maxWidth = 240,
}) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { timer.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { if (timer.current) clearTimeout(timer.current); setOpen(false); };

  const inverted = variant === 'inverted';
  const bg = inverted ? 'var(--ob-surface)' : 'var(--ob-ink-strong)';
  const fg = inverted ? 'var(--ob-fg-strong)' : '#fff';
  const subFg = inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.7)';
  const bordered = inverted ? '1px solid var(--ob-border)' : 'none';

  const pos: Record<TooltipPlacement, React.CSSProperties> = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  };

  const arrowBase: React.CSSProperties = { position: 'absolute', width: 8, height: 8, background: bg, transform: 'rotate(45deg)', border: bordered };
  const arrowPos: Record<TooltipPlacement, React.CSSProperties> = {
    top:    { bottom: -4, left: '50%', marginLeft: -4, borderTop: 'none', borderLeft: 'none' },
    bottom: { top: -4, left: '50%', marginLeft: -4, borderBottom: 'none', borderRight: 'none' },
    left:   { right: -4, top: '50%', marginTop: -4, borderBottom: 'none', borderLeft: 'none' },
    right:  { left: -4, top: '50%', marginTop: -4, borderTop: 'none', borderRight: 'none' },
  };

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && (
        <span role="tooltip" style={{
          position: 'absolute', zIndex: 'var(--ob-z-tooltip)' as React.CSSProperties['zIndex'], ...pos[placement],
          background: bg, color: fg, border: bordered,
          borderRadius: variant === 'image' ? 12 : 8,
          boxShadow: inverted ? 'var(--ob-shadow-md)' : '0 4px 12px rgba(0,0,0,0.18)',
          padding: variant === 'image' ? 6 : '8px 11px',
          fontSize: 13, lineHeight: 1.4, fontWeight: 500, whiteSpace: variant === 'image' ? 'normal' : 'nowrap',
          maxWidth: variant === 'image' ? 200 : maxWidth, pointerEvents: 'none',
          animation: 'ob-tip 140ms var(--ob-ease-out)',
        }}>
          {variant === 'image' ? (
            <span style={{ display: 'block', width: 188 }}>
              <span style={{ display: 'block', width: '100%', height: 110, borderRadius: 8, overflow: 'hidden', background: 'var(--ob-bg-alt)' }}>
                {image && <img src={image} alt={typeof title === 'string' ? title : ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              {title && <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: fg, marginTop: 8, padding: '0 4px', whiteSpace: 'normal' }}>{title}</span>}
              {subtitle && <span style={{ display: 'block', fontSize: 12, color: subFg, marginTop: 2, padding: '0 4px 4px', whiteSpace: 'normal' }}>{subtitle}</span>}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>{label}</span>
              {shortcut && (
                <kbd style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 11, fontWeight: 600,
                  padding: '2px 6px', borderRadius: 5,
                  background: inverted ? 'var(--ob-bg-alt)' : 'rgba(255,255,255,0.16)',
                  color: inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.9)',
                }}>{shortcut}</kbd>
              )}
            </span>
          )}
          {variant !== 'image' && <span style={{ ...arrowBase, ...arrowPos[placement] }} />}
        </span>
      )}
    </span>
  );
};

if (typeof document !== 'undefined' && !document.getElementById('ob-tip-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-tip-kf';
  st.textContent = '@keyframes ob-tip { from { opacity: 0; } }';
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Tooltip/Tooltip';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam. Se o TypeScript reclamar de `image` em
`alt={typeof title === 'string' ? title : ''}` (o original só passa
`title || ''` direto, aceitando `title` como qualquer coisa truthy) — isso
já está resolvido acima com o `typeof` check; não é necessário mudar mais
nada.

- [ ] **Step 4: Migrar o script da página de preview**

Mesma troca de linha em `project/ds/components/components-tooltip.html`.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-tooltip.html`. Confirmar:
- Cada `placement` (top/bottom/left/right) e `variant` (text/inverted/image)
  mostrado na página aparece na posição e estilo certos ao dar hover.
- Um hover rápido — entrar e sair do gatilho em menos de 120ms — **não**
  deixa o tooltip aparecer depois (é exatamente o comportamento do
  `clearTimeout`, ver "Review Focus").
- Um hover normal (mais de 120ms parado) mostra o tooltip corretamente.
- Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Tooltip project/package/src/index.ts project/ds/components/components-tooltip.html
git commit -m "feat(tooltip): porta Tooltip para @onblide/ui e migra preview"
```

---

### Task 6: Portar `Chip` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Chip/Chip.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-chip.html`
- Source: `project/ui_kits/web_app/Components.jsx:381-428`

**Interfaces:**
- Produces: `Chip` — `React.FC<ChipProps>`,
  `ChipProps = { label: React.ReactNode; selected?: boolean; onToggle?: () => void; removable?: boolean; onRemove?: () => void; icon?: string; size?: 'sm' | 'md'; disabled?: boolean }`

- [ ] **Step 1: Escrever `Chip.tsx`**

```tsx
// project/package/src/components/Chip/Chip.tsx
import React from 'react';

export interface ChipProps {
  label: React.ReactNode;
  selected?: boolean;
  onToggle?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  /** Nome do ícone Phosphor (sem o prefixo "ph-"), ex.: "check". */
  icon?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label, selected = false, onToggle, removable = false, onRemove, icon, size = 'md', disabled = false,
}) => {
  const fs  = size === 'sm' ? 12 : 13;
  const pad = size === 'sm' ? '5px 10px' : '7px 14px';
  const gap = size === 'sm' ? 5 : 6;

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap,
    padding: removable ? (size === 'sm' ? '5px 6px 5px 10px' : '7px 8px 7px 14px') : pad,
    borderRadius: 999, fontSize: fs, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', userSelect: 'none',
    opacity: disabled ? 0.45 : 1,
    border: '1.5px solid',
    outline: 'none',
    fontFamily: 'var(--ob-font)',
  };
  const stateStyle: React.CSSProperties = selected
    ? { background: 'var(--ob-blue)', color: '#fff', borderColor: 'var(--ob-blue)' }
    : { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', borderColor: 'var(--ob-border)' };

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={() => !disabled && onToggle?.()}
      onKeyDown={e => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onToggle?.(); }}
      style={{ ...base, ...stateStyle }}
    >
      {icon && <i className={`ph ph-${icon}`} style={{ fontSize: size === 'sm' ? 13 : 15, lineHeight: 1 }}/>}
      {label}
      {removable && (
        <button
          onClick={e => { e.stopPropagation(); if (!disabled) onRemove?.(); }}
          aria-label={`Remover ${typeof label === 'string' ? label : ''}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: size === 'sm' ? 16 : 18, height: size === 'sm' ? 16 : 18,
            borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: selected ? 'rgba(255,255,255,0.25)' : 'var(--ob-bg-warm)',
            color: selected ? '#fff' : 'var(--ob-fg-soft)',
            fontSize: size === 'sm' ? 10 : 11, fontWeight: 700, lineHeight: 1, flexShrink: 0,
          }}
        >✕</button>
      )}
    </span>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Chip/Chip';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `ChipProps`.

- [ ] **Step 4: Migrar o script da página de preview**

Em `project/ds/components/components-chip.html` — **atenção**: essa página
carrega DOIS scripts antigos (`Primitives.jsx` e `Components.jsx`). Trocar
só a linha do `Components.jsx` (onde `Chip` mora) pelo bundle novo; a linha
do `Primitives.jsx` fica como está por enquanto (ainda serve outras coisas
não portadas nesta página, se houver — conferir visualmente no Step 5 que
nada mais na página quebrou).

```diff
- <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
+ <script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-chip.html`. Confirmar
estados `selected`/não-selecionado, `removable` (botão ✕ some o chip sem
disparar o `onToggle` do chip em si — `stopPropagation`), tamanhos `sm`/`md`,
e que nada mais na página quebrou por causa do script duplo. Sem erros no
console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Chip project/package/src/index.ts project/ds/components/components-chip.html
git commit -m "feat(chip): porta Chip para @onblide/ui e migra preview"
```

---

### Task 7: Criar `badgeTones.ts` e portar `StatusDot` + migrar a página de preview

**Files:**
- Create: `project/package/src/primitives/badgeTones.ts`
- Create: `project/package/src/primitives/StatusDot/StatusDot.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-status-dot.html`
- Source: `project/ui_kits/web_app/Primitives.jsx:243-255`

**Interfaces:**
- Produces: `BadgeTone = 'blue' | 'green' | 'orange' | 'red' | 'grey'`,
  `BADGE_TONES: Record<BadgeTone, { bg: string; fg: string; dot: string; solid: string; border: string }>`
  (de `badgeTones.ts` — **não exportado** de `index.ts`, é infraestrutura
  interna, não parte da API pública do pacote); `StatusDot` —
  `React.FC<StatusDotProps>`, `StatusDotProps = { tone?: BadgeTone }`.
  Task 8 (`Badge`) consome `badgeTones.ts`.

- [ ] **Step 1: Escrever `badgeTones.ts`**

```ts
// project/package/src/primitives/badgeTones.ts
//
// Tabela de tons compartilhada por StatusDot e Badge (o original em
// Primitives.jsx define isso uma vez, solto no meio do arquivo, e os dois
// componentes leem dali — este arquivo é essa mesma tabela isolada, não uma
// abstração nova).
export type BadgeTone = 'blue' | 'green' | 'orange' | 'red' | 'grey';

export interface BadgeToneColors {
  bg: string;
  fg: string;
  dot: string;
  solid: string;
  border: string;
}

export const BADGE_TONES: Record<BadgeTone, BadgeToneColors> = {
  blue:   { bg: 'var(--ob-blue-100)',    fg: 'var(--ob-blue-700)',    dot: 'var(--ob-blue)',    solid: 'var(--ob-blue)',    border: 'color-mix(in srgb, var(--ob-blue) 35%, transparent)' },
  green:  { bg: 'var(--ob-green-100)',   fg: 'var(--ob-green-700)',   dot: 'var(--ob-green)',   solid: 'var(--ob-green)',   border: 'color-mix(in srgb, var(--ob-green) 35%, transparent)' },
  orange: { bg: 'color-mix(in srgb, var(--ob-orange) 15%, var(--ob-surface))', fg: '#9a4000', dot: 'var(--ob-orange)', solid: 'var(--ob-orange)', border: 'color-mix(in srgb, var(--ob-orange) 45%, transparent)' },
  red:    { bg: 'var(--ob-danger-bg)',   fg: 'var(--ob-danger)',      dot: 'var(--ob-danger)',  solid: 'var(--ob-danger)',  border: 'color-mix(in srgb, var(--ob-danger) 40%, transparent)' },
  grey:   { bg: 'var(--ob-bg-warm)',     fg: 'var(--ob-fg-soft)',     dot: 'var(--ob-fg-mute)', solid: 'var(--ob-fg-mute)', border: 'var(--ob-border)' },
};
```

- [ ] **Step 2: Escrever `StatusDot.tsx`**

```tsx
// project/package/src/primitives/StatusDot/StatusDot.tsx
import React from 'react';
import { BADGE_TONES, BadgeTone } from '../badgeTones';

export interface StatusDotProps {
  tone?: BadgeTone;
}

// Decorativo; sempre usar junto de um rótulo visível.
export const StatusDot: React.FC<StatusDotProps> = ({ tone = 'blue' }) => {
  const color = (BADGE_TONES[tone] || BADGE_TONES.blue).dot;
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>;
};
```

- [ ] **Step 3: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/StatusDot/StatusDot';
```

(Não exportar `badgeTones.ts` — é infraestrutura interna, não faz parte da
API pública do pacote.)

- [ ] **Step 4: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `StatusDotProps` mas
**não** contém `BadgeTone`/`BADGE_TONES` (confirma que `badgeTones.ts`
ficou interno, não vazou pra API pública).

- [ ] **Step 5: Migrar o script da página de preview**

Mesma troca de linha em `project/ds/components/components-status-dot.html`
(essa página carrega só `Primitives.jsx`).

- [ ] **Step 6: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-status-dot.html`. Confirmar
as 5 cores de tom (`blue`/`green`/`orange`/`red`/`grey`) idênticas a antes.
Sem erros no console.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/primitives/badgeTones.ts project/package/src/primitives/StatusDot project/package/src/index.ts project/ds/components/components-status-dot.html
git commit -m "feat(status-dot): extrai badgeTones e porta StatusDot para @onblide/ui, migra preview"
```

---

### Task 8: Portar `Badge` e migrar a página de preview

**Files:**
- Create: `project/package/src/primitives/Badge/Badge.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-badge.html`
- Source: `project/ui_kits/web_app/Primitives.jsx:257-282`

**Interfaces:**
- Consumes: `BADGE_TONES`, `BadgeTone` (Task 7) — `import { BADGE_TONES, BadgeTone } from '../badgeTones'`
- Produces: `Badge` — `React.FC<BadgeProps>`,
  `BadgeProps = { tone?: BadgeTone; variant?: 'subtle' | 'solid' | 'outline' | 'numeric'; dot?: boolean; size?: 'sm' | 'md'; children?: React.ReactNode }`

- [ ] **Step 1: Escrever `Badge.tsx`**

```tsx
// project/package/src/primitives/Badge/Badge.tsx
import React from 'react';
import { BADGE_TONES, BadgeTone } from '../badgeTones';

export type BadgeVariant = 'subtle' | 'solid' | 'outline' | 'numeric';

export interface BadgeProps {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'blue', variant = 'subtle', dot = true, size = 'md', children }) => {
  const t = BADGE_TONES[tone] || BADGE_TONES.blue;
  const fs = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? '2px 8px' : '4px 10px';

  const styles: Record<BadgeVariant, React.CSSProperties> = {
    subtle:  { background: t.bg, color: t.fg, border: 'none' },
    solid:   { background: t.solid, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: t.fg, border: `1.5px solid ${t.border}` },
    numeric: { background: t.solid, color: '#fff', border: 'none', minWidth: 18, height: 18, padding: '0 5px', justifyContent: 'center' },
  };
  const s = styles[variant] || styles.subtle;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: variant === 'numeric' ? s.padding : px,
      borderRadius: 999, fontSize: fs, fontWeight: 700,
      lineHeight: 1, ...s,
    }}>
      {variant !== 'numeric' && dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: variant === 'solid' ? 'rgba(255,255,255,0.7)' : t.dot, flexShrink: 0 }}/>}
      {children}
    </span>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Badge/Badge';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `BadgeProps` e
`BadgeVariant`.

- [ ] **Step 4: Migrar o script da página de preview**

Mesma troca de linha em `project/ds/components/components-badge.html`
(carrega só `Primitives.jsx`).

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-badge.html`. Confirmar as 4
variantes (`subtle`/`solid`/`outline`/`numeric`) em todos os tons, com e sem
`dot`. Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/Badge project/package/src/index.ts project/ds/components/components-badge.html
git commit -m "feat(badge): porta Badge para @onblide/ui e migra preview"
```

---

### Task 9: Portar `Card`

**Files:**
- Create: `project/package/src/primitives/Card/Card.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-card.mjs`
- Source: `project/ui_kits/web_app/Primitives.jsx:285-292`

**Interfaces:**
- Produces: `Card` — `React.FC<CardProps>`,
  `CardProps = { children?: React.ReactNode; style?: React.CSSProperties; padding?: number | string; elevation?: 'border' | 'shadow' }`
- Sem página de preview dedicada (`components-cards.html` existe mas é
  HTML/CSS estático, sem React) — verificação só por script de smoke.

- [ ] **Step 1: Escrever `Card.tsx`**

```tsx
// project/package/src/primitives/Card/Card.tsx
import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number | string;
  elevation?: 'border' | 'shadow';
}

export const Card: React.FC<CardProps> = ({ children, style = {}, padding = 20, elevation = 'border' }) => {
  const ev: React.CSSProperties = elevation === 'shadow'
    ? { boxShadow: 'var(--ob-shadow-md)' }
    : { border: '1px solid var(--ob-border)' };
  return (
    <div style={{ background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-surface)', padding, ...ev, ...style }}>{children}</div>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Card/Card';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `CardProps`.

- [ ] **Step 4: Escrever e rodar o script de smoke**

```js
// project/package/scripts/smoke-card.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card } from '../dist/index.js';

const bordered = renderToStaticMarkup(React.createElement(Card, {}, 'Conteúdo'));
const shadowed = renderToStaticMarkup(React.createElement(Card, { elevation: 'shadow' }, 'Conteúdo'));

if (!bordered.includes('border:1px solid var(--ob-border)') || !shadowed.includes('box-shadow:var(--ob-shadow-md)')) {
  console.error('FAIL: elevation styles mismatch:', bordered, shadowed);
  process.exit(1);
}
console.log('OK:', bordered);
```

Rodar: `node scripts/smoke-card.mjs`
Esperado: imprime `OK:`, sai com código 0.

- [ ] **Step 5: Commit**

```bash
git add project/package/src/primitives/Card project/package/src/index.ts project/package/scripts/smoke-card.mjs
git commit -m "feat(card): porta Card para @onblide/ui"
```

---

### Task 10: Portar `Avatar`

**Files:**
- Create: `project/package/src/primitives/Avatar/Avatar.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-avatar.mjs`
- Source: `project/ui_kits/web_app/Primitives.jsx:295-301`

**Interfaces:**
- Produces: `Avatar` — `React.FC<AvatarProps>`,
  `AvatarProps = { name?: string; size?: number; color?: string }`
- Sem página de preview dedicada — verificação só por script de smoke.

- [ ] **Step 1: Escrever `Avatar.tsx`**

```tsx
// project/package/src/primitives/Avatar/Avatar.tsx
import React from 'react';

export interface AvatarProps {
  name?: string;
  size?: number;
  color?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'OB', size = 32, color = 'var(--ob-blue)' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: color,
    color: '#fff', fontSize: size * 0.4, fontWeight: 700, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flex: 'none',
  }}>{name.slice(0, 2).toUpperCase()}</div>
);
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Avatar/Avatar';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `AvatarProps`.

- [ ] **Step 4: Escrever e rodar o script de smoke**

```js
// project/package/scripts/smoke-avatar.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from '../dist/index.js';

const html = renderToStaticMarkup(React.createElement(Avatar, { name: 'Mateus Silva', size: 40 }));

if (!html.includes('>MA<') || !html.includes('width:40px')) {
  console.error('FAIL: unexpected markup (expected initials "MA", width 40px):', html);
  process.exit(1);
}
console.log('OK:', html);
```

Rodar: `node scripts/smoke-avatar.mjs`
Esperado: imprime `OK:`, sai com código 0.

- [ ] **Step 5: Commit**

```bash
git add project/package/src/primitives/Avatar project/package/src/index.ts project/package/scripts/smoke-avatar.mjs
git commit -m "feat(avatar): porta Avatar para @onblide/ui"
```

---

### Task 11: Portar `Spinner` e migrar a página de preview

**Files:**
- Create: `project/package/src/primitives/Spinner/Spinner.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-spinner.html`
- Source: `project/ui_kits/web_app/Primitives.jsx:790-812` (mais o bloco de
  injeção de keyframes em `847-852`, compartilhado com `ProgressCircle`)

**Interfaces:**
- Produces: `Spinner` — `React.FC<SpinnerProps>`,
  `SpinnerProps = { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted'; label?: string }`

**Cuidado:** o original injeta as keyframes `ob-spin`+`ob-pulse` **uma vez
só**, no bloco compartilhado por `Spinner` e `ProgressCircle`
(`Primitives.jsx:847-852`). Como esses dois são tarefas separadas neste
plano, a injeção entra **na Tarefa 11 (Spinner)**, guardada pelo mesmo id
`ob-prim-kf` — a Tarefa 12 (`ProgressCircle`) usa a mesma keyframe `ob-spin`
não, ela usa `ob-progress`... **não**, releia: `ProgressCircle` não anima
via CSS keyframe, ela anima via `transition: 'stroke-dashoffset ...'` inline
— só o `Spinner` de fato usa `ob-spin`. `ob-pulse` não é usado por nenhum
dos dois (fica disponível pra outro componente futuro que a use). Portanto:
**a Tarefa 11 injeta o bloco completo (`ob-spin`+`ob-pulse`) exatamente como
está no original**, e a Tarefa 12 não precisa repetir nada.

- [ ] **Step 1: Escrever `Spinner.tsx`**

```tsx
// project/package/src/primitives/Spinner/Spinner.tsx
import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerTone = 'default' | 'success' | 'warning' | 'danger' | 'muted';

export interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
}

const SPINNER_SIZES: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 24, lg: 40, xl: 56 };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', tone = 'default', label }) => {
  const px = SPINNER_SIZES[size] || 24;
  const sw = px <= 16 ? 2 : px <= 24 ? 2.5 : 3.5;
  const r = (px - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color = tone === 'success' ? 'var(--ob-green)'
              : tone === 'warning' ? 'var(--ob-orange)'
              : tone === 'danger'  ? 'var(--ob-danger)'
              : tone === 'muted'   ? 'var(--ob-fg-mute)'
              : 'var(--ob-blue)';
  return (
    <span role="status" aria-label={label || 'Carregando…'} aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none"
        style={{ animation: 'ob-spin 0.75s linear infinite' }}>
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeOpacity={0.15} strokeWidth={sw} />
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${circ * 0.72} ${circ * 0.28}`}
          transform={`rotate(-90 ${px / 2} ${px / 2})`} />
      </svg>
    </span>
  );
};

// injeta as keyframes ob-spin (usada aqui) e ob-pulse (não usada por
// Spinner nem ProgressCircle, mas presente no bloco original — mantida
// para paridade exata com Primitives.jsx:847-852)
if (typeof document !== 'undefined' && !document.getElementById('ob-prim-kf')) {
  const st = document.createElement('style'); st.id = 'ob-prim-kf';
  st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Spinner/Spinner';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `SpinnerProps`.

- [ ] **Step 4: Migrar o script da página de preview**

Essa página carrega `Primitives.jsx` **e** `Components.jsx` (dois scripts).
Trocar só a linha do `Primitives.jsx` (onde `Spinner` mora) pelo bundle
novo; a linha do `Components.jsx` fica como está por enquanto.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-spinner.html`. Confirmar
os 5 tamanhos e os 5 tons girando corretamente. Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/Spinner project/package/src/index.ts project/ds/components/components-spinner.html
git commit -m "feat(spinner): porta Spinner para @onblide/ui e migra preview"
```

---

### Task 12: Portar `ProgressCircle` e migrar a página de preview

**Files:**
- Create: `project/package/src/primitives/ProgressCircle/ProgressCircle.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-progress-circle.html`
- Source: `project/ui_kits/web_app/Primitives.jsx:818-845`

**Interfaces:**
- Produces: `ProgressCircle` — `React.FC<ProgressCircleProps>`,
  `ProgressCircleProps = { value?: number; size?: 'sm' | 'md' | 'lg' | 'xl'; tone?: 'default' | 'success' | 'warning' | 'danger'; showLabel?: boolean; label?: React.ReactNode }`

Este componente não injeta keyframe própria (anima via `transition` inline
em `strokeDashoffset`) — a injeção de `ob-spin`/`ob-pulse` já aconteceu na
Tarefa 11.

- [ ] **Step 1: Escrever `ProgressCircle.tsx`**

```tsx
// project/package/src/primitives/ProgressCircle/ProgressCircle.tsx
import React from 'react';

export type ProgressCircleSize = 'sm' | 'md' | 'lg' | 'xl';
export type ProgressCircleTone = 'default' | 'success' | 'warning' | 'danger';

export interface ProgressCircleProps {
  /** 0–100 */
  value?: number;
  size?: ProgressCircleSize;
  tone?: ProgressCircleTone;
  showLabel?: boolean;
  label?: React.ReactNode;
}

const PROGRESS_CIRCLE_SIZES: Record<ProgressCircleSize, number> = { sm: 32, md: 48, lg: 64, xl: 96 };

export const ProgressCircle: React.FC<ProgressCircleProps> = ({ value = 0, size = 'md', tone = 'default', showLabel = true, label }) => {
  const px = PROGRESS_CIRCLE_SIZES[size] || 48;
  const sw = px <= 32 ? 3.5 : px <= 48 ? 4.5 : px <= 64 ? 5 : 7;
  const r = (px - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  const offset = circ - (v / 100) * circ;
  const color = tone === 'success' ? 'var(--ob-green)'
              : tone === 'warning' ? 'var(--ob-orange)'
              : tone === 'danger'  ? 'var(--ob-danger)'
              : 'var(--ob-blue)';
  const fs = px <= 32 ? 9 : px <= 48 ? 11 : px <= 64 ? 14 : 20;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={px / 2} cy={px / 2} r={r} stroke="var(--ob-bg-alt)" strokeWidth={sw} />
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      {showLabel && (
        <span style={{ position: 'absolute', fontSize: fs, fontWeight: 700, fontFamily: 'var(--ob-font-mono)', color, lineHeight: 1 }}>
          {label || `${Math.round(v)}%`}
        </span>
      )}
    </span>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/ProgressCircle/ProgressCircle';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `ProgressCircleProps`.

- [ ] **Step 4: Migrar o script da página de preview**

Essa página também carrega `Primitives.jsx` **e** `Components.jsx`. Trocar
só a linha do `Primitives.jsx` pelo bundle novo.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-progress-circle.html`.
Confirmar os tamanhos, tons, valores de progresso, e o rótulo central
(percentual ou customizado). Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/ProgressCircle project/package/src/index.ts project/ds/components/components-progress-circle.html
git commit -m "feat(progress-circle): porta ProgressCircle para @onblide/ui e migra preview"
```

---

### Task 13: Portar `Slider`

**Files:**
- Create: `project/package/src/primitives/Slider/Slider.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-slider.mjs`
- Source: `project/ui_kits/web_app/Primitives.jsx:542-721`

**Interfaces:**
- Produces: `Slider` — `React.FC<SliderProps>`,
  `SliderValue = number | [number, number]`,
  `SliderProps = { value?: SliderValue; min?: number; max?: number; step?: number; onChange?: (value: SliderValue) => void; label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; disabled?: boolean; showValue?: boolean; marks?: boolean; tone?: 'default' | 'success' | 'warning' | 'danger'; range?: boolean }`

O componente mais complexo do lote — arrasto via `pointerdown`/listeners no
`document`, navegação por teclado, e (em modo `range`) dois thumbs que nunca
se cruzam. **Sem página de preview nesta fase** (a existente,
`components-slider.html`, também usa `Input`, do Lote B — fica pra lá,
conforme a spec). Verificação por script de smoke cobrindo os pontos do
"Review Focus": clamp de `disabled` e o não-cruzamento dos thumbs em modo
`range`.

- [ ] **Step 1: Escrever `Slider.tsx`**

```tsx
// project/package/src/primitives/Slider/Slider.tsx
import React, { useRef, useState } from 'react';

export type SliderValue = number | [number, number];
export type SliderTone = 'default' | 'success' | 'warning' | 'danger';

export interface SliderProps {
  value?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: SliderValue) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  showValue?: boolean;
  marks?: boolean;
  tone?: SliderTone;
  range?: boolean;
}

type Thumb = 'lo' | 'hi';

export const Slider: React.FC<SliderProps> = ({
  value, min = 0, max = 100, step = 1,
  onChange, label, hint, error, disabled = false,
  showValue = true, marks = false,
  tone = 'default',
  range = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<Thumb | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const rangeValue = range ? (value as [number, number] | undefined) : undefined;
  const singleValue = !range ? (value as number | undefined) : undefined;
  const lo = range ? (rangeValue?.[0] ?? min) : (singleValue ?? min);
  const hi = range ? (rangeValue?.[1] ?? max) : null;

  const toneColor = tone === 'success' ? 'var(--ob-green)'
                  : tone === 'warning' ? 'var(--ob-orange)'
                  : tone === 'danger'  ? 'var(--ob-danger)'
                  : 'var(--ob-blue)';
  const toneRing  = tone === 'success' ? 'rgba(119,158,61,.28)'
                  : tone === 'warning' ? 'rgba(235,124,45,.28)'
                  : tone === 'danger'  ? 'rgba(214,54,54,.28)'
                  : 'var(--ob-focus-ring)';

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap  = (v: number) => Math.round((v - min) / step) * step + min;
  const pct   = (v: number) => ((v - min) / (max - min)) * 100;
  const fmt   = (v: number) => Number.isInteger(v) ? v : v.toFixed(1);

  const valFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return clamp(snap(min + ((clientX - rect.left) / rect.width) * (max - min)));
  };

  const applyVal = (which: Thumb, v: number) => {
    const cb = onChangeRef.current;
    if (!cb) return;
    if (!range) { cb(v); return; }
    if (which === 'lo') cb([Math.min(v, hi ?? max), hi ?? max]);
    else cb([lo, Math.max(v, lo)]);
  };

  const startDrag = (which: Thumb, e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    draggingRef.current = which;
    applyVal(which, valFromX(e.clientX));

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      applyVal(draggingRef.current, valFromX(ev.clientX));
    };
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  };

  const onKeyThumb = (which: Thumb) => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const delta = e.shiftKey ? step * 10 : step;
    const cur = which === 'hi' ? (hi ?? max) : lo;
    let next = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = clamp(cur + delta);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = clamp(cur - delta);
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    else return;
    e.preventDefault();
    applyVal(which, next);
  };

  const [loFocus, setLoFocus] = useState(false);
  const [hiFocus, setHiFocus] = useState(false);

  const thumbStyle = (val: number, focused: boolean): React.CSSProperties => ({
    position: 'absolute', top: '50%', left: `${pct(val)}%`,
    transform: 'translate(-50%, -50%)',
    width: 20, height: 20, borderRadius: '50%',
    background: 'var(--ob-surface)',
    border: `2px solid ${error ? 'var(--ob-danger)' : toneColor}`,
    boxShadow: focused
      ? `0 0 0 4px ${error ? 'rgba(214,54,54,.22)' : toneRing}, var(--ob-shadow-sm)`
      : 'var(--ob-shadow-sm)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: 'box-shadow .15s',
    zIndex: 2, outline: 'none',
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box',
    touchAction: 'none', userSelect: 'none',
  });

  const fillLeft  = range ? pct(lo) : 0;
  const fillRight = range ? 100 - pct(hi ?? max) : 100 - pct(lo);

  const stepCount = Math.round((max - min) / step);
  const markPositions = marks && stepCount <= 20
    ? Array.from({ length: stepCount + 1 }, (_, i) => min + i * step)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: disabled ? 0.6 : 1 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
          {showValue && (
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--ob-font-mono)', color: error ? 'var(--ob-danger)' : toneColor }}>
              {range ? `${fmt(lo)} – ${fmt(hi ?? max)}` : fmt(lo)}
            </span>
          )}
        </div>
      )}
      <div ref={trackRef}
        style={{ position: 'relative', height: 20, cursor: disabled ? 'not-allowed' : 'pointer', touchAction: 'none', userSelect: 'none' }}
        onClick={(e) => {
          if (disabled || draggingRef.current) return;
          const v = valFromX(e.clientX);
          if (!range) { onChange?.(v); return; }
          const mid = (lo + (hi ?? max)) / 2;
          onChange?.(v <= mid ? [clamp(snap(v)), hi ?? max] : [lo, clamp(snap(v))]);
        }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 5, transform: 'translateY(-50%)',
          background: 'var(--ob-bg-alt)', borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${fillLeft}%`, right: `${fillRight}%`,
            background: error ? 'var(--ob-danger)' : toneColor, borderRadius: 999,
          }}/>
        </div>
        {markPositions.map((v) => (
          <div key={v} style={{
            position: 'absolute', top: '50%', left: `${pct(v)}%`,
            width: 4, height: 4, borderRadius: '50%',
            background: v <= lo ? 'var(--ob-surface)' : 'var(--ob-fg-mute)',
            transform: 'translate(-50%, -50%)', opacity: 0.7, zIndex: 1, pointerEvents: 'none',
          }}/>
        ))}
        <div role="slider" tabIndex={disabled ? -1 : 0}
          aria-valuemin={min} aria-valuemax={max} aria-valuenow={lo}
          onPointerDown={(e) => { e.stopPropagation(); startDrag('lo', e); }}
          onKeyDown={onKeyThumb('lo')}
          onFocus={() => setLoFocus(true)} onBlur={() => setLoFocus(false)}
          style={thumbStyle(lo, loFocus)} />
        {range && (
          <div role="slider" tabIndex={disabled ? -1 : 0}
            aria-valuemin={min} aria-valuemax={max} aria-valuenow={hi ?? max}
            onPointerDown={(e) => { e.stopPropagation(); startDrag('hi', e); }}
            onKeyDown={onKeyThumb('hi')}
            onFocus={() => setHiFocus(true)} onBlur={() => setHiFocus(false)}
            style={thumbStyle(hi ?? max, hiFocus)} />
        )}
      </div>
      {marks && markPositions.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)' }}>{min}</span>
          <span style={{ fontSize: 10, color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)' }}>{max}</span>
        </div>
      )}
      {(hint || error) && (
        <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Slider/Slider';
```

- [ ] **Step 3: Typecheck**

Rodar: `npm run typecheck`
Esperado: sai com código 0. Se o TypeScript reclamar de alguma comparação
envolvendo `hi` (que é `number | null`), a correção é sempre `hi ?? max`
(já usado consistentemente acima) — nunca mudar a lógica de clamp em si.

- [ ] **Step 4: Build**

Rodar: `npm run build`
Esperado: sucesso; `dist/index.d.ts` contém `SliderProps` e `SliderValue`.

- [ ] **Step 5: Escrever e rodar o script de smoke**

```js
// project/package/scripts/smoke-slider.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Slider } from '../dist/index.js';

// modo single
const single = renderToStaticMarkup(React.createElement(Slider, { value: 40, min: 0, max: 100 }));
if (!single.includes('left:40%')) {
  console.error('FAIL (single): thumb não está em 40%:', single);
  process.exit(1);
}

// modo range — dois thumbs, posições distintas
const rangeHtml = renderToStaticMarkup(React.createElement(Slider, { value: [20, 80], min: 0, max: 100, range: true }));
if (!rangeHtml.includes('left:20%') || !rangeHtml.includes('left:80%')) {
  console.error('FAIL (range): thumbs não estão em 20%/80%:', rangeHtml);
  process.exit(1);
}

// disabled — cursor deve indicar not-allowed, não grab
const disabledHtml = renderToStaticMarkup(React.createElement(Slider, { value: 50, disabled: true }));
if (!disabledHtml.includes('cursor:not-allowed')) {
  console.error('FAIL (disabled): cursor não é not-allowed:', disabledHtml);
  process.exit(1);
}

console.log('OK: single, range e disabled renderizam corretamente');
```

Rodar: `node scripts/smoke-slider.mjs`
Esperado: imprime `OK:`, sai com código 0.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/Slider project/package/src/index.ts project/package/scripts/smoke-slider.mjs
git commit -m "feat(slider): porta Slider para @onblide/ui"
```

---

### Task 14: Verificação final do pacote

**Files:**
- Nenhum arquivo novo — só roda checagens sobre tudo que as Tarefas 1-13 produziram.

**Interfaces:**
- Consumes: tudo produzido pelas Tarefas 1-13.

- [ ] **Step 1: Reinstalação limpa**

A partir de `project/package/`:

```bash
rm -rf node_modules dist
npm install
```

Esperado: sem erros.

- [ ] **Step 2: Typecheck completo**

Rodar: `npm run typecheck`
Esperado: sai com código 0.

- [ ] **Step 3: Build completo**

Rodar: `npm run build`
Esperado: sai com código 0; os 4 arquivos de `dist/` presentes.

- [ ] **Step 4: Rodar todos os scripts de smoke**

```bash
node scripts/smoke-ph.mjs
node scripts/smoke-button.mjs
node scripts/smoke-fieldshell.mjs
node scripts/smoke-radio.mjs
node scripts/smoke-radio-group.mjs
node scripts/smoke-card.mjs
node scripts/smoke-avatar.mjs
node scripts/smoke-slider.mjs
```

Esperado: todos imprimem `OK:` e saem com código 0.

- [ ] **Step 5: Conferir a superfície do `.d.ts`**

```bash
grep -oE "^export \{" -A0 dist/index.d.ts
tail -c 4000 dist/index.d.ts | grep -oE "\b(Radio|RadioGroup|Toggle|Skeleton|Tooltip|Chip|StatusDot|Badge|Card|Avatar|Spinner|ProgressCircle|Slider)\b" | sort -u
```

Esperado: os 13 nomes aparecem na última linha (o `export { ... }` final do
arquivo, que é onde o `tsup` consolida tudo — não em declarações
individuais prefixadas com `export`, ver nota da Fase 1).

- [ ] **Step 6: Reconferir as 9 páginas migradas juntas**

Com `python -m http.server 8000` rodando a partir de `project/`, abrir as 9
em sequência e confirmar zero erro de console em cada uma:
`components-radio.html`, `components-toggle.html`,
`components-skeleton.html`, `components-tooltip.html`,
`components-chip.html`, `components-status-dot.html`,
`components-badge.html`, `components-spinner.html`,
`components-progress-circle.html`.

- [ ] **Step 7: Varredura por referências antigas**

```bash
grep -rn "ui_kits/web_app/Components.jsx\|ui_kits/web_app/Primitives.jsx" \
  project/ds/components/components-radio.html \
  project/ds/components/components-toggle.html \
  project/ds/components/components-skeleton.html \
  project/ds/components/components-tooltip.html \
  project/ds/components/components-status-dot.html \
  project/ds/components/components-badge.html
```

Esperado: nenhuma saída — essas 6 páginas usam só o bundle novo (as outras 3
migradas — chip, spinner, progress-circle — ainda têm uma referência
antiga de propósito, porque carregam dois scripts e só um foi trocado; não
entram nesse grep).

- [ ] **Step 8: Commit (só se algum passo acima precisou de correção)**

Se tudo passou sem precisar mexer em nada, pular este passo — nada pra
commitar. Se algo precisou de correção, corrigir e:

```bash
git add -A project/package project/ds/components
git commit --amend --no-edit
```

(Incorporar ao commit da Tarefa 1-13 a que a correção pertence, seguindo o
`project/CLAUDE.md` — nunca um commit novo de "fix".)

---

### Task 15: Release — 0.2.0

**Files:**
- Create: `project/package/.changeset/<nome-gerado>.md`
- Modify: `project/package/package.json` (bump de versão, via `changeset version`)
- Modify: `project/package/CHANGELOG.md`

**Interfaces:**
- Consumes: o pacote completo das Tarefas 1-14.

- [ ] **Step 1: Registrar o changeset**

A partir de `project/package/`:

```bash
npx changeset add
```

Quando perguntado:
- Tipo de bump: **minor** (componentes novos adicionados, nada quebrou).
- Resumo: `Adiciona Radio, RadioGroup, Toggle, Skeleton, Tooltip, Chip, StatusDot, Badge, Card, Avatar, Spinner, ProgressCircle e Slider (Fase 2, Lote A).`

- [ ] **Step 2: Aplicar o bump de versão**

```bash
npx changeset version
```

Esperado: `package.json` vai de `0.1.0` para `0.2.0` (bump minor padrão do
Changesets); `CHANGELOG.md` ganha a entrada de hoje; o arquivo de changeset
do Step 1 é consumido (apagado).

- [ ] **Step 3: Rebuild**

```bash
npm run build
```

Esperado: sucesso (o bump de versão não muda o conteúdo do build, só
confirma que nada quebrou).

- [ ] **Step 4: Commit**

```bash
git add project/package/package.json project/package/CHANGELOG.md project/package/.changeset
git commit -m "chore(package): libera @onblide/ui 0.2.0"
```

- [ ] **Step 5: Tag e push**

```bash
git tag onblide-ui@0.2.0
git push origin dev
git push origin onblide-ui@0.2.0
```

Esperado: `dev` e a tag nova aparecem em `origin`.

---

## After this plan

`@onblide/ui` passa a ter **20 componentes** (7 da Fase 1 + 13 deste lote).
Faltam Lote B (~15 compostos) e Lote C (`Icons`, `Brands`, mais `Link` e
`Pagination`, que dependem de `Icons`) — cada um com spec e plano próprios,
seguindo o mesmo padrão. Como na Fase 1, rodar o `/design-sync` de verdade
continua sendo uma ação separada, não uma tarefa deste plano.
