# @onblide/ui Fase 2 — Lote B (13 componentes compostos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar os 13 componentes do Lote B (`Alert`, `ProgressBar`, `Toast`, `ToastStack`, `Drawer`, `CodeInput`, `SearchInput`, `SideNav`, `Tabs`, `Table`, `DeadlineCalendar`, `Select`, `Input`) para `@onblide/ui`, migrar as 11 páginas de preview que ficam totalmente cobertas por eles (incluindo `components-slider.html`, pendente desde o Lote A), e liberar a versão `0.3.0`.

**Architecture:** Mesma dos lotes anteriores — TypeScript real, um componente por arquivo, build via `tsup` (biblioteca + bundle de compatibilidade pro navegador). Sem decisão de arquitetura nova; execução do padrão já validado, mais dois módulos de dados compartilhados (`obTones.ts`, `obToastPos.ts`) no mesmo espírito de `badgeTones.ts` do Lote A.

**Tech Stack:** O mesmo já em `project/package/` — TypeScript 5, React 18.3.1, tsup, Changesets.

**Spec:** `docs/superpowers/specs/2026-09-23-onblide-ui-fase2-lote-b-design.md`

## Global Constraints

- Todo componente é um porte estrutural verbatim — zero mudança de comportamento ou visual. Duas exceções pontuais, disclosed e sem impacto funcional em uso real, estão documentadas na Task que as introduz: (a) `SideNav`'s `title={...it.label}` precisa de um `typeof it.label === 'string'` guard porque `label` agora é tipado `React.ReactNode` em vez de `any` (o atributo HTML `title` só aceita `string`); (b) `ToastStack`'s `window.obToast = ...` (module-level, sem guard no original) precisa de `typeof window !== 'undefined'` porque o módulo agora também é importado sob Node (smoke script) e não só no navegador.
- TypeScript estrito (`tsconfig.json` já tem `"strict": true`, herdado, sem mudança).
- Nenhum framework de teste novo — verificação por tarefa é `tsc --noEmit`, `tsup build`, e (a) um script de smoke em Node (`react-dom/server`) para componentes sem página de preview ao vivo, ou (b) comparação visual real via `python -m http.server` (nunca `file://`) pra componentes com página.
- Conventional Commits, em português, na branch `dev`, sem rodapé `Claude-Session:` nem qualquer outra atribuição de IA.
- Grupo de destino: `src/components/` para os originários de `Components.jsx` (`Alert`, `ProgressBar`, `Toast`, `ToastStack`, `Drawer`, `CodeInput`, `SearchInput`, `SideNav`, `Tabs`, `Table`, `Select`), `src/primitives/` para os de `Primitives.jsx` (`Input`, `DeadlineCalendar`).
- Fora de escopo (não tocar): `Modal`, `Link`, `Pagination` (dependem de `Icons`, ficam pro Lote C), `Icons`, `Brands`, `Logo`, `Chrome.jsx`/`Screens.jsx`/`tweaks-panel.jsx`, rodar o `/design-sync` de verdade.
- Nas 11 páginas de preview migradas deste lote, ao contrário do Lote A: quando todos os componentes usados numa página já estiverem portados, as DUAS tags de script Babel antigas (`Primitives.jsx` e `Components.jsx`) saem por completo — não fica nenhum script residual, mesmo que a página originalmente carregasse os dois. Confirmar por grep antes de cada migração de página que nenhum outro componente ainda-não-portado é usado nela.

## Review Focus

- **`Table`'s `indeterminate` via `ref` direto no DOM.** `el.indeterminate = partChecked` é setado imperativamente dentro do `ref` callback do checkbox "selecionar tudo" — não existe prop HTML `indeterminate` declarativa. Se o porte perder esse `ref` callback (por exemplo, tentando "limpar" para `checked={partChecked}` — o que mudaria o comportamento visual, já que `indeterminate` e `checked` são estados distintos), o traço indeterminado nunca aparece. A Task 10 (`Table`) preserva esse `ref` callback exatamente como está e a verificação no navegador confirma visualmente o traço (não só o preenchido/vazio) ao selecionar parte das linhas.
- **`ToastStack`'s efeitos colaterais module-level (keyframes + `window.obToast`) não são exercitáveis por `renderToStaticMarkup`.** O listener `window.addEventListener('ob-toast', ...)` só existe dentro de um `useEffect`, que não roda em SSR estático — então o smoke script da Task 4 só consegue confirmar que o módulo importa sem lançar exceção e que `ToastStack` renderiza `null` quando não há toasts na fila (comportamento real, mas estreito). A verificação mais profunda (injeção de keyframe idêntica ao original, guarda de `window.obToast`, remoção do listener no cleanup) é feita por leitura manual, comparando linha a linha contra `Components.jsx:870-931` — mesma disciplina já usada para o clamp de range do `Slider` no Lote A.
- **`SearchInput` injeta a mesma keyframe `ob-spin` que `Spinner` já injeta, sob um id de guarda diferente (`ob-spin-kf` vs `ob-prim-kf`).** Isso já existe assim no código original (duas definições independentes, mesmo conteúdo) — não é um bug introduzido pelo porte, e a Task 7 preserva essa duplicação de propósito, sem tentar "consolidar" as duas (isso mudaria comportamento se um dia um dos dois arquivos for removido/alterado independentemente). O revisor da Task 7 não deve pedir para deduplicar contra `Spinner.tsx`.
- **`Select` mistura 5 componentes já portados (`Checkbox`, `Chip`, `FieldShell`, `FloatingPanel`, `Ph`) numa única árvore.** É o maior risco de integração do lote — um erro de import (caminho relativo errado) ou uma prop com nome trocado (ex.: `onToggle` vs `onChange` do `Chip`) só aparece ao renderizar de verdade no navegador, não no `tsc --noEmit`. A Task 12 exige testar visualmente os modos `multi` e single, incluindo digitar para filtrar, navegar com teclado (`ArrowDown`/`ArrowUp`/`Enter`/`Escape`), e remover um chip selecionado clicando no X.
- **`components-slider.html` estava deliberadamente sem migração desde o Lote A** porque dependia de `Input`, que só chega neste lote. A Task 13 (`Input`) é a primeira vez que uma página herdada de um lote anterior é revisitada — antes de mexer nela, confirmar por grep que os 5 componentes que ela usa (`Button`, `Chip`, `Input`, `Slider`, `Toggle`) estão TODOS presentes no `dist/index.d.ts` atual, para não migrar uma página que na verdade ainda depende de algo não portado.

---

## File Structure

```text
project/package/src/
  components/
    obTones.ts                 # NOVO — módulo de dados compartilhado (Alert, Toast, ProgressBar)
    obToastPos.ts               # NOVO — módulo de dados compartilhado (só ToastStack)
    Alert/Alert.tsx
    ProgressBar/ProgressBar.tsx
    Toast/Toast.tsx
    ToastStack/ToastStack.tsx
    Drawer/Drawer.tsx
    CodeInput/CodeInput.tsx
    SearchInput/SearchInput.tsx
    SideNav/SideNav.tsx
    Tabs/Tabs.tsx
    Table/Table.tsx
    Select/Select.tsx
  primitives/
    Input/Input.tsx
    DeadlineCalendar/DeadlineCalendar.tsx
```

`obTones.ts` existe porque `Alert`, `Toast` e `ProgressBar` no original compartilham
a mesma tabela `OB_TONES` (`Components.jsx:495-500`) — mesmo raciocínio de
`badgeTones.ts` no Lote A: uma fonte de verdade, não uma abstração nova.
`obToastPos.ts` isola `OB_TOAST_POS` (`Components.jsx:862-869`), usado só por
`ToastStack`, mas separado do componente por ser dado puro, seguindo a mesma
convenção. Nenhum dos dois é reexportado em `src/index.ts` — infraestrutura
interna, como `badgeTones.ts`.

---

### Task 1: Criar `obTones.ts` e portar `Alert` + migrar a página de preview

**Files:**
- Create: `project/package/src/components/obTones.ts`
- Create: `project/package/src/components/Alert/Alert.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-alert.html`
- Source: `project/ui_kits/web_app/Components.jsx:495-500` (`OB_TONES`), `587-602` (`Alert`)

**Interfaces:**
- Produces: `OBTone = 'info' | 'success' | 'warning' | 'danger'`,
  `OB_TONES: Record<OBTone, { fg: string; bg: string; strong: string; icon: string }>`
  (de `obTones.ts` — **não exportado** de `index.ts`, infraestrutura interna).
  `Alert` — `React.FC<AlertProps>`,
  `AlertProps = { tone?: OBTone; title?: React.ReactNode; children?: React.ReactNode; dismissible?: boolean; onClose?: () => void; action?: React.ReactNode; onAction?: () => void }`.
- Consumes: nada de tarefas anteriores deste lote (primeira tarefa).
- Tasks 2 e 3 (`ProgressBar`, `Toast`) consomem `obTones.ts`.

- [ ] **Step 1: Escrever `obTones.ts`**

```ts
// project/package/src/components/obTones.ts
//
// Tabela de tons compartilhada por Alert, Toast e ProgressBar (o original em
// Components.jsx define isso uma vez, solto no meio do arquivo, e os três
// componentes leem dali — este arquivo é essa mesma tabela isolada, não uma
// abstração nova). `icon` é o nome de um ícone Phosphor (string), consumido
// via <Ph n={t.icon} .../> — não uma referência ao objeto `Icons`.
export type OBTone = 'info' | 'success' | 'warning' | 'danger';

export interface OBToneColors {
  fg: string;
  bg: string;
  strong: string;
  icon: string;
}

export const OB_TONES: Record<OBTone, OBToneColors> = {
  info:    { fg: 'var(--ob-blue)',   bg: 'var(--ob-blue-100)',   strong: 'var(--ob-blue-700)',   icon: 'info' },
  success: { fg: 'var(--ob-green)',  bg: 'var(--ob-green-100)',  strong: 'var(--ob-green-700)',  icon: 'check-circle' },
  warning: { fg: 'var(--ob-orange)', bg: 'var(--ob-orange-100)', strong: 'var(--ob-orange-700)', icon: 'warning' },
  danger:  { fg: 'var(--ob-danger)', bg: 'var(--ob-danger-bg)',  strong: 'var(--ob-danger)',     icon: 'warning-circle' },
};
```

- [ ] **Step 2: Escrever `Alert.tsx`**

```tsx
// project/package/src/components/Alert/Alert.tsx
import React from 'react';
import { Ph } from '../Ph/Ph';
import { OB_TONES, OBTone } from '../obTones';

export interface AlertProps {
  tone?: OBTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  onAction?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, dismissible = false, onClose, action, onAction }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="alert" style={{ display: 'flex', gap: 13, width: '100%', padding: '14px 16px', background: t.bg, border: `1px solid color-mix(in srgb, ${t.fg} 28%, transparent)`, borderRadius: 'var(--ob-r-md)', boxSizing: 'border-box' }}>
      <Ph n={t.icon} size={20} c={t.fg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13.5, color: 'var(--ob-fg)', lineHeight: 1.5 }}>{children}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 10, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action} →</button>}
      </div>
      {dismissible && onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-soft)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x" size={15} /></button>}
    </div>
  );
};
```

- [ ] **Step 3: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Alert/Alert';
```

(Não exportar `obTones.ts` — infraestrutura interna.)

- [ ] **Step 4: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `AlertProps` mas **não**
contém `OBTone`/`OB_TONES`.

- [ ] **Step 5: Migrar o script da página de preview**

`project/ds/components/components-alert.html` carrega só `Components.jsx` —
trocar a tag pelo bundle:
```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 6: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-alert.html`. Confirmar os 4
tons (`info`/`success`/`warning`/`danger`), com e sem `title`/`children`,
dismissible e com `action`, idênticos a antes. Sem erros no console.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/obTones.ts project/package/src/components/Alert project/package/src/index.ts project/ds/components/components-alert.html
git commit -m "feat(alert): extrai obTones e porta Alert para @onblide/ui, migra preview"
```

---

### Task 2: Portar `ProgressBar` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/ProgressBar/ProgressBar.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-progressbar.html`
- Source: `project/ui_kits/web_app/Components.jsx:634-659`

**Interfaces:**
- Consumes: `OB_TONES`, `OBTone` de `../obTones` (Task 1).
- Produces: `ProgressBar` — `React.FC<ProgressBarProps>`,
  `ProgressBarProps = { value?: number; tone?: OBTone; size?: 'sm' | 'md' | 'lg'; indeterminate?: boolean; showLabel?: boolean; segments?: number; currentSegment?: number }`.

- [ ] **Step 1: Escrever `ProgressBar.tsx`**

```tsx
// project/package/src/components/ProgressBar/ProgressBar.tsx
import React from 'react';
import { OB_TONES, OBTone } from '../obTones';

export interface ProgressBarProps {
  value?: number;
  tone?: OBTone;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  showLabel?: boolean;
  segments?: number;
  currentSegment?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value = 0, tone = 'info', size = 'md', indeterminate = false, showLabel = false, segments, currentSegment = 0 }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  const h = size === 'sm' ? 6 : size === 'lg' ? 14 : 10;
  if (segments) return (
    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
      {Array.from({ length: segments }).map((_, i) => <div key={i} style={{ flex: 1, height: h, borderRadius: 999, background: i < currentSegment ? t.fg : 'var(--ob-border)' }} />)}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      <div style={{ flex: 1, height: h, background: 'var(--ob-bg-warm)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
        {indeterminate
          ? <div style={{ position: 'absolute', height: '100%', background: t.fg, borderRadius: 999, animation: 'ob-indet 1.4s ease-in-out infinite' }} />
          : <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', background: t.fg, borderRadius: 999, transition: 'width 0.4s cubic-bezier(.4,0,.2,1)' }} />}
      </div>
      {showLabel && !indeterminate && <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)', width: 36, textAlign: 'right', flex: 'none' }}>{Math.round(value)}%</span>}
    </div>
  );
};

// injeta a keyframe do modo indeterminado uma única vez
if (typeof document !== 'undefined' && !document.getElementById('ob-indet-kf')) {
  const st = document.createElement('style'); st.id = 'ob-indet-kf';
  st.textContent = '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}';
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/ProgressBar/ProgressBar';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `ProgressBarProps`.

- [ ] **Step 4: Migrar o script da página de preview**

`project/ds/components/components-progressbar.html` carrega só
`Components.jsx` — trocar a tag pelo bundle.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-progressbar.html`. Confirmar
os 4 tons, os 3 tamanhos, modo `indeterminate` (animação rodando de verdade,
não só a keyframe injetada — inspecionar `getComputedStyle`), `showLabel`, e
o modo `segments`. Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/ProgressBar project/package/src/index.ts project/ds/components/components-progressbar.html
git commit -m "feat(progress-bar): porta ProgressBar para @onblide/ui e migra preview"
```

---

### Task 3: Criar `obToastPos.ts` e portar `Toast` + migrar a página de preview

**Files:**
- Create: `project/package/src/components/Toast/Toast.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-toast.html`
- Source: `project/ui_kits/web_app/Components.jsx:603-633`

**Interfaces:**
- Consumes: `OB_TONES`, `OBTone` de `../obTones` (Task 1).
- Produces: `Toast` — `React.FC<ToastProps>`,
  `ToastProps = { tone?: OBTone; title?: React.ReactNode; body?: React.ReactNode; action?: React.ReactNode; onAction?: () => void; onClose?: () => void; icon?: boolean }`.
  Task 4 (`ToastStack`) consome `Toast`/`ToastProps`.
- Esta página (`components-toast.html`) carrega HOJE `Primitives.jsx` E
  `Components.jsx`, mas usa só `Chip`/`RadioGroup`/`Toggle`/`Toast` — todos
  de `Components.jsx`, todos já portados (os 3 primeiros no Lote A). A tag
  de `Primitives.jsx` nesta página já está órfã hoje — confirmado por grep,
  sem nenhum tag `<Nome` de `Primitives.jsx` usado na demo.

- [ ] **Step 1: Escrever `Toast.tsx`**

```tsx
// project/package/src/components/Toast/Toast.tsx
import React from 'react';
import { Ph } from '../Ph/Ph';
import { OB_TONES, OBTone } from '../obTones';

export interface ToastProps {
  tone?: OBTone;
  title?: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
  onClose?: () => void;
  icon?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ tone = 'info', title, body, action, onAction, onClose, icon = true }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="status" aria-live="polite" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', maxWidth: 400, padding: 14, boxSizing: 'border-box',
      background: 'var(--ob-surface)',
      border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)',
      boxShadow: 'var(--ob-shadow-lg)',
    }}>
      {icon && (
        <span style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 'var(--ob-r-sm)',
          background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ph n={t.icon} size={17} c={t.fg} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.4 }}>{title}</div>
        {body && <div style={{ fontSize: 13, color: 'var(--ob-fg-soft)', marginTop: 3, lineHeight: 1.5 }}>{body}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 8, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action}</button>}
      </div>
      {onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-mute)', display: 'flex', padding: 2, flexShrink: 0 }}><Ph n="x" size={16} /></button>}
    </div>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Toast/Toast';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `ToastProps`.

- [ ] **Step 4: Migrar as tags de script da página de preview**

`project/ds/components/components-toast.html` tem duas tags:
```html
<script type="text/babel" src="../../ui_kits/web_app/Primitives.jsx"></script>
<script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
```
Confirmar por grep (`grep -oE '<[A-Z][A-Za-z]*' components-toast.html`) que
só `Chip`, `RadioGroup`, `Toggle`, `Toast` são usados — todos já portados.
Remover as DUAS tags, substituir por:
```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-toast.html`. Esta demo
constrói sua própria pilha visual de toasts (não usa `ToastStack`, só
`Toast` + estado local) e depende das keyframes `ob-toast-in-top` /
`ob-toast-out-top` / `ob-toast-in-bottom` / `ob-toast-out-bottom`, que são
injetadas pelo módulo `ToastStack` (Task 4), não por `Toast`. **Como
`ToastStack` ainda não existe nesta tarefa**, a animação de entrada/saída
não vai funcionar ainda ao testar esta página agora — confirmar apenas que
os 4 tons, conteúdo (título/corpo/ação), ícone opcional e todas as posições
renderizam sem erro no console; a animação real só fica completa depois da
Task 4. Anotar esse estado intermediário no relatório da tarefa para o
revisor não confundir com um bug.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Toast project/package/src/index.ts project/ds/components/components-toast.html
git commit -m "feat(toast): porta Toast para @onblide/ui e migra preview"
```

---

### Task 4: Criar `obToastPos.ts` e portar `ToastStack`

**Files:**
- Create: `project/package/src/components/obToastPos.ts`
- Create: `project/package/src/components/ToastStack/ToastStack.tsx`
- Modify: `project/package/src/index.ts`
- Create: `project/package/scripts/smoke-toast-stack.mjs`
- Source: `project/ui_kits/web_app/Components.jsx:862-931`

**Interfaces:**
- Consumes: `Toast`, `ToastProps` de `../Toast/Toast` (Task 3).
- Produces: `OBToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`,
  `OB_TOAST_POS: Record<OBToastPosition, {...}>` (de `obToastPos.ts` — **não
  exportado** de `index.ts`). `ToastStack` — `React.FC<ToastStackProps>`,
  `ToastStackProps = { position?: OBToastPosition }`.
- Sem instância JSX ao vivo em nenhuma página deste lote (só uma menção em
  comentário em `components-toast.html`) — verificação por script de smoke
  + leitura manual (ver Review Focus).

- [ ] **Step 1: Escrever `obToastPos.ts`**

```ts
// project/package/src/components/obToastPos.ts
//
// Tabela de âncoras de posição usada só por ToastStack (o original define
// isso solto em Components.jsx, logo antes de ToastStack — este arquivo é
// essa mesma tabela isolada).
export type OBToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface OBToastAnchor {
  top?: number;
  bottom?: number;
  left?: number | string;
  right?: number;
  align: 'flex-start' | 'flex-end' | 'center';
  cx?: boolean;
}

export const OB_TOAST_POS: Record<OBToastPosition, OBToastAnchor> = {
  'top-left':      { top: 24, left: 24,  align: 'flex-start' },
  'top-center':    { top: 24, left: '50%', align: 'center', cx: true },
  'top-right':     { top: 24, right: 24, align: 'flex-end' },
  'bottom-left':   { bottom: 24, left: 24,  align: 'flex-start' },
  'bottom-center': { bottom: 24, left: '50%', align: 'center', cx: true },
  'bottom-right':  { bottom: 24, right: 24, align: 'flex-end' },
};
```

- [ ] **Step 2: Escrever `ToastStack.tsx`**

```tsx
// project/package/src/components/ToastStack/ToastStack.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Toast, ToastProps } from '../Toast/Toast';
import { OB_TOAST_POS, OBToastPosition } from '../obToastPos';

export interface ToastStackProps {
  position?: OBToastPosition;
}

interface QueuedToast extends ToastProps {
  id: number;
  leaving: boolean;
}

export const ToastStack: React.FC<ToastStackProps> = ({ position = 'bottom-right' }) => {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);
  const dismiss = useCallback((id: number) => {
    setToasts(ts => ts.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 200);
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastProps>).detail;
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts.slice(-2), { ...detail, id, leaving: false }]);
      setTimeout(() => dismiss(id), 4800);
    };
    window.addEventListener('ob-toast', handler);
    return () => window.removeEventListener('ob-toast', handler);
  }, [dismiss]);
  if (!toasts.length) return null;
  const pos = OB_TOAST_POS[position] || OB_TOAST_POS['bottom-right'];
  const isTop = position.startsWith('top');
  const animIn  = isTop ? 'ob-toast-in-top'  : 'ob-toast-in-bottom';
  const animOut = isTop ? 'ob-toast-out-top' : 'ob-toast-out-bottom';
  const { align, cx, ...anchor } = pos;
  return (
    <div id="ob-toast-stack" data-pos={position} style={{
      position: 'fixed', zIndex: 'var(--ob-z-toast)', ...anchor,
      transform: cx ? 'translateX(-50%)' : undefined,
      display: 'flex', flexDirection: isTop ? 'column-reverse' : 'column',
      gap: 10, alignItems: align, pointerEvents: 'none',
      width: 'min(400px, calc(100vw - 32px))',
    } as React.CSSProperties}>
      {toasts.map(t => (
        <div key={t.id} style={{ width: '100%', pointerEvents: 'all', animation: `${t.leaving ? animOut : animIn} 0.2s cubic-bezier(0.16,1,0.3,1) both` }}>
          <Toast {...t} onClose={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
};

// injeta as keyframes de entrada/saída do toast e o ajuste de layout mobile,
// uma única vez (mesmo padrão de Skeleton/Tooltip/Spinner no Lote A)
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-kf')) {
  const st = document.createElement('style'); st.id = 'ob-toast-kf';
  st.textContent = [
    '@keyframes ob-toast-in-top{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes ob-toast-out-top{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-16px)}}',
    '@keyframes ob-toast-in-bottom{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes ob-toast-out-bottom{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}',
  ].join('');
  document.head.appendChild(st);
}
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-pos')) {
  const sp = document.createElement('style'); sp.id = 'ob-toast-pos';
  sp.textContent = [
    '@media(max-width:600px){',
    '#ob-toast-stack{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:calc(100vw - 24px)!important;align-items:stretch!important}',
    '#ob-toast-stack[data-pos^="top"]{top:16px!important;bottom:auto!important;flex-direction:column-reverse!important}',
    '#ob-toast-stack[data-pos^="bottom"]{bottom:16px!important;top:auto!important;flex-direction:column!important}',
    '}',
  ].join('');
  document.head.appendChild(sp);
}
declare global {
  interface Window {
    obToast?: (detail: ToastProps) => void;
  }
}
// Guard de `typeof window !== 'undefined'` NÃO existe no original (que só
// roda em navegador via Babel) — é necessário aqui porque este módulo agora
// também é importado sob Node (o smoke script desta tarefa), onde `window`
// não existe. Sem impacto de comportamento no navegador (window sempre
// existe lá); ver Global Constraints.
if (typeof window !== 'undefined') {
  window.obToast = (detail) => window.dispatchEvent(new CustomEvent('ob-toast', { detail }));
}
```

- [ ] **Step 3: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/ToastStack/ToastStack';
```

(Não exportar `obToastPos.ts` — infraestrutura interna.)

- [ ] **Step 4: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `ToastStackProps` mas
**não** contém `OBToastPosition`/`OB_TOAST_POS`.

- [ ] **Step 5: Escrever e rodar o script de smoke**

```js
// project/package/scripts/smoke-toast-stack.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToastStack } from '../dist/index.js';

// Importar o módulo sob Node não pode lançar (confirma o guard de `window`
// no efeito colateral module-level de window.obToast).
const empty = renderToStaticMarkup(React.createElement(ToastStack, {}));

if (empty !== '') {
  console.error('FAIL: ToastStack sem toasts deveria renderizar null (string vazia), recebeu:', empty);
  process.exit(1);
}
console.log('OK: ToastStack importa sem lançar e renderiza vazio sem toasts na fila');
```

Rodar: `node scripts/smoke-toast-stack.mjs`
Esperado: imprime `OK:`, sai com código 0.

**Este smoke script é deliberadamente estreito** (ver Review Focus) — não
exercita o listener de eventos, o dismiss, nem a injeção de keyframe. A
próxima etapa cobre a parte que o smoke não alcança.

- [ ] **Step 6: Leitura manual comparativa**

Comparar, linha a linha, `ToastStack.tsx` contra
`project/ui_kits/web_app/Components.jsx:862-931`, confirmando: (a) a tabela
`OB_TOAST_POS` bate com `OB_TOAST_POS` original, mesmos 6 valores; (b) o
bloco de keyframes injetado é caractere-por-caractere igual ao original
(`ob-toast-kf` e `ob-toast-pos`); (c) `window.obToast` dispara o mesmo
`CustomEvent('ob-toast', { detail })`; (d) o listener no `useEffect` faz o
mesmo `slice(-2)` (mantém só os 2 toasts mais recentes) e o mesmo
`setTimeout(() => dismiss(id), 4800)`. Documentar essa comparação no
relatório da tarefa.

- [ ] **Step 7: Commit**

```bash
git add project/package/src/components/obToastPos.ts project/package/src/components/ToastStack project/package/src/index.ts project/package/scripts/smoke-toast-stack.mjs
git commit -m "feat(toast-stack): extrai obToastPos e porta ToastStack para @onblide/ui"
```

---

### Task 5: Portar `Drawer` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Drawer/Drawer.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-drawer.html`
- Source: `project/ui_kits/web_app/Components.jsx:431-494`

**Interfaces:**
- Produces: `Drawer` — `React.FC<DrawerProps>`,
  `DrawerProps = { open: boolean; onClose: () => void; title?: React.ReactNode; children?: React.ReactNode; side?: 'left' | 'right'; width?: number | string; footer?: React.ReactNode }`.
- `components-drawer.html` usa `Btn`/`Field`/`TaskRow` — helpers locais da
  própria demo (definidos no `<script type="text/babel">` inline da página,
  não do kit) — confirmado por grep, sem dependência a portar.

- [ ] **Step 1: Escrever `Drawer.tsx`**

```tsx
// project/package/src/components/Drawer/Drawer.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  side?: 'left' | 'right';
  width?: number | string;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children, side = 'right', width = 400, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const transform = side === 'right'
    ? open ? 'translateX(0)' : 'translateX(100%)'
    : open ? 'translateX(0)' : 'translateX(-100%)';

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(20,20,20,var(--ob-opacity-scrim))',
        backdropFilter: 'blur(2px)', zIndex: 'var(--ob-z-overlay)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.22s ease',
      }}/>
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        [side]: 0,
        width, maxWidth: '100%',
        background: 'var(--ob-surface)',
        borderLeft: side === 'right' ? '1px solid var(--ob-border)' : 'none',
        borderRight: side === 'left' ? '1px solid var(--ob-border)' : 'none',
        zIndex: 'var(--ob-z-modal)', display: 'flex', flexDirection: 'column',
        transform, transition: 'transform 0.25s var(--ob-ease)',
      } as React.CSSProperties}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--ob-border)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 'var(--ob-r-sm)', border: 'none', background: 'none',
            color: 'var(--ob-fg-mute)', cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--ob-border)',
            background: 'var(--ob-bg-alt)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
```

(`as React.CSSProperties` no painel: a chave computada `[side]: 0` — TS não
consegue inferir estaticamente que `side` só assume `'left'`/`'right'`, que
são chaves válidas de `CSSProperties`; o cast preserva o objeto exatamente
como o original monta, sem mudar nenhum valor.)

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Drawer/Drawer';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `DrawerProps`.

- [ ] **Step 4: Migrar as tags de script da página de preview**

`project/ds/components/components-drawer.html` carrega
`Primitives.jsx`+`Components.jsx`; confirmar por grep que só `Drawer`
(do kit) e os helpers locais `Btn`/`Field`/`TaskRow` são usados. Remover as
DUAS tags, substituir por:
```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-drawer.html`. Confirmar
abrir/fechar pelos dois lados (`left`/`right`), fechar clicando no backdrop,
fechar com a tecla Escape, footer renderizando quando presente. Sem erros
no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Drawer project/package/src/index.ts project/ds/components/components-drawer.html
git commit -m "feat(drawer): porta Drawer para @onblide/ui e migra preview"
```

---

### Task 6: Portar `CodeInput` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/CodeInput/CodeInput.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-code-input.html`
- Source: `project/ui_kits/web_app/Components.jsx:503-548`

**Interfaces:**
- Produces: `CodeInput` — `React.FC<CodeInputProps>`,
  `CodeInputProps = { length?: number; value?: string; onChange?: (value: string) => void; status?: 'default' | 'error' | 'success' }`.

- [ ] **Step 1: Escrever `CodeInput.tsx`**

```tsx
// project/package/src/components/CodeInput/CodeInput.tsx
import React, { useRef } from 'react';

export interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  status?: 'default' | 'error' | 'success';
}

export const CodeInput: React.FC<CodeInputProps> = ({ length = 6, value = '', onChange, status = 'default' }) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const vals = value.split('');
  const set = (i: number, ch: string) => {
    const next = value.split(''); next[i] = ch;
    onChange?.(next.join('').slice(0, length));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };
  const keyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0)          refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const paste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, length);
    onChange?.(digits.join(''));
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };
  const borderFor = (filled: boolean) =>
    status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green)' : filled ? 'var(--ob-blue)' : 'var(--ob-border)';
  return (
    <div style={{ display: 'inline-flex', gap: 10, animation: status === 'error' ? 'ob-shake 0.4s' : 'none' }} onPaste={paste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} inputMode="numeric" maxLength={1}
          value={vals[i] || ''} onChange={e => set(i, e.target.value.replace(/\D/g, ''))} onKeyDown={e => keyDown(i, e)}
          style={{
            width: 48, height: 56, textAlign: 'center', fontFamily: 'var(--ob-font)', fontSize: 22, fontWeight: 700,
            borderRadius: 'var(--ob-r-md)', caretColor: 'var(--ob-blue)', outline: 'none',
            color: status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green-700)' : 'var(--ob-fg-strong)',
            background: 'var(--ob-surface)', border: `2px solid ${borderFor(!!vals[i])}`,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { if (status === 'default') e.target.style.boxShadow = '0 0 0 4px var(--ob-focus-ring)'; }}
          onBlur={e => { e.target.style.boxShadow = 'none'; }} />
      ))}
    </div>
  );
};

// injeta a keyframe do "shake" (estado de erro) uma única vez
if (typeof document !== 'undefined' && !document.getElementById('ob-shake-kf')) {
  const st = document.createElement('style'); st.id = 'ob-shake-kf';
  st.textContent = '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}';
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/CodeInput/CodeInput';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `CodeInputProps`.

- [ ] **Step 4: Migrar o script da página de preview**

`project/ds/components/components-code-input.html` carrega só
`Components.jsx` — trocar a tag pelo bundle.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-code-input.html`. Testar
digitação sequencial (avança o foco), Backspace (volta o foco quando a
casa está vazia), setas esquerda/direita, colar um número de 6+ dígitos
(preenche e foca a última casa), e o estado `status="error"` (shake +
borda vermelha). Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/CodeInput project/package/src/index.ts project/ds/components/components-code-input.html
git commit -m "feat(code-input): porta CodeInput para @onblide/ui e migra preview"
```

---

### Task 7: Portar `SearchInput` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/SearchInput/SearchInput.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-search-input.html`
- Source: `project/ui_kits/web_app/Components.jsx:549-586`

**Interfaces:**
- Consumes: `FieldShell` de `../../primitives/FieldShell/FieldShell` (Fase
  1), `FloatingPanel` de `../FloatingPanel/FloatingPanel` (Fase 1), `Ph` de
  `../Ph/Ph` (Fase 1).
- Produces: `SearchInput` — `React.FC<SearchInputProps>`,
  `SearchInputResult = { label: string; [key: string]: unknown }`,
  `SearchInputProps = { value?: string; onChange?: (value: string) => void; loading?: boolean; placeholder?: string; results?: (string | SearchInputResult)[]; onSelect?: (result: string | SearchInputResult) => void; width?: number | string }`.

- [ ] **Step 1: Escrever `SearchInput.tsx`**

```tsx
// project/package/src/components/SearchInput/SearchInput.tsx
import React, { useState } from 'react';
import { FieldShell } from '../../primitives/FieldShell/FieldShell';
import { FloatingPanel } from '../FloatingPanel/FloatingPanel';
import { Ph } from '../Ph/Ph';

export interface SearchInputResult {
  label: string;
  [key: string]: unknown;
}

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  results?: (string | SearchInputResult)[];
  onSelect?: (result: string | SearchInputResult) => void;
  width?: number | string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value = '', onChange, loading = false, placeholder = 'Buscar…', results = [], onSelect, width = 320 }) => {
  const [focus, setFocus] = useState(false);
  const showDrop = focus && results.length > 0;
  return (
    <div style={{ position: 'relative', width }}>
      <FieldShell focused={focus}>
        <Ph n="magnifying-glass" size={18} c="var(--ob-fg-mute)" />
        <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--ob-font)', fontSize: 14.5, color: 'var(--ob-fg-strong)' }} />
        {loading && <i className="ph ph-circle-notch" style={{ fontSize: 17, color: 'var(--ob-blue)', animation: 'ob-spin 0.8s linear infinite', flex: 'none' }} />}
        {!loading && value && <button onClick={() => onChange?.('')} aria-label="Limpar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-mute)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x-circle" size={17} /></button>}
      </FieldShell>
      {showDrop && (
        <FloatingPanel padding={0}>
          {results.map((r, i) => {
            const lbl = typeof r === 'string' ? r : r.label;
            return (
              <button key={i} onMouseDown={() => { onSelect?.(r); onChange?.(lbl); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', borderBottom: i < results.length - 1 ? '1px solid var(--ob-line-soft)' : 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--ob-font)', fontSize: 14, color: 'var(--ob-fg)', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <Ph n="arrow-elbow-down-right" size={14} c="var(--ob-fg-mute)" />{lbl}
              </button>
            );
          })}
        </FloatingPanel>
      )}
    </div>
  );
};

// injeta a keyframe do spinner de loading uma única vez. Mesmo conteúdo que
// Spinner.tsx injeta sob outro id ('ob-prim-kf') — duplicação já existente
// no original (SearchInput.jsx e Primitives.jsx guardam com ids
// diferentes), preservada verbatim; não consolidar com Spinner.tsx.
if (typeof document !== 'undefined' && !document.getElementById('ob-spin-kf')) {
  const st = document.createElement('style'); st.id = 'ob-spin-kf';
  st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/SearchInput/SearchInput';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `SearchInputProps`.

- [ ] **Step 4: Migrar o script da página de preview**

`project/ds/components/components-search-input.html` carrega só
`Components.jsx` — trocar a tag pelo bundle.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-search-input.html`. Testar
digitação, estado `loading` (spinner girando de verdade — inspecionar
`getComputedStyle`, não só a presença da keyframe), botão de limpar,
dropdown de resultados abrindo ao focar com resultados presentes e
fechando ~150ms depois de perder o foco (verificar que não fecha
instantaneamente ao clicar num resultado — o `onMouseDown` do item dispara
antes do `onBlur` do input). Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/SearchInput project/package/src/index.ts project/ds/components/components-search-input.html
git commit -m "feat(search-input): porta SearchInput para @onblide/ui e migra preview"
```

---

### Task 8: Portar `SideNav` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/SideNav/SideNav.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-side-nav.html`
- Source: `project/ui_kits/web_app/Components.jsx:660-706`

**Interfaces:**
- Consumes: `Ph` de `../Ph/Ph` (Fase 1).
- Produces: `SideNav` — `React.FC<SideNavProps>`,
  `SideNavItem = { id?: string; section?: string; label?: React.ReactNode; icon?: string; badge?: React.ReactNode }`,
  `SideNavProps = { items?: SideNavItem[]; active?: string; onNav?: (id?: string) => void; collapsed?: boolean; onToggle?: () => void; flush?: boolean; workspaceName?: string; userInitials?: string }`.
- `components-side-nav.html` usa um helper local `Skel` (definido no script
  inline da própria demo) — não é o `Skeleton` do kit, confirmado por grep.

- [ ] **Step 1: Escrever `SideNav.tsx`**

```tsx
// project/package/src/components/SideNav/SideNav.tsx
import React from 'react';
import { Ph } from '../Ph/Ph';

export interface SideNavItem {
  id?: string;
  section?: string;
  label?: React.ReactNode;
  icon?: string;
  badge?: React.ReactNode;
}

export interface SideNavProps {
  items?: SideNavItem[];
  active?: string;
  onNav?: (id?: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  flush?: boolean;
  workspaceName?: string;
  userInitials?: string;
}

export const SideNav: React.FC<SideNavProps> = ({ items = [], active, onNav, collapsed = false, onToggle, flush = false, workspaceName = 'Workspace', userInitials = 'OB' }) => (
  <div style={{ width: flush ? '100%' : (collapsed ? 72 : 240), minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', height: flush ? '100%' : undefined, background: 'var(--ob-surface)', border: flush ? 'none' : '1px solid var(--ob-border)', borderRight: flush ? '1px solid var(--ob-border)' : undefined, borderRadius: flush ? 0 : 'var(--ob-r-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
    {collapsed
      ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
          <button onClick={onToggle} title="Expandir" style={{ width: 36, height: 36, borderRadius: 'var(--ob-r-md)', border: '1.5px solid var(--ob-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ob-fg-soft)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--ob-bg-warm)';e.currentTarget.style.color='var(--ob-blue)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ob-fg-soft)';}}>
            <Ph n="caret-line-right" size={18}/>
          </button>
        </div>
      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 14px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 28, height: 28, borderRadius: 'var(--ob-r-sm)', background: 'var(--ob-blue)', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>O</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Onblide</span>
          </div>
          {onToggle && <button onClick={onToggle} title="Recolher" style={{ width: 30, height: 30, borderRadius: 'var(--ob-r-md)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ob-fg-soft)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--ob-bg-warm)';e.currentTarget.style.color='var(--ob-fg-strong)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ob-fg-soft)';}}>
            <Ph n="caret-line-left" size={18}/>
          </button>}
        </div>
    }
    {!collapsed && <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '0 10px 6px' }}>Menu</p>}
    {items.map((it, i) => {
      if (it.section) return !collapsed ? <p key={i} style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '12px 10px 4px' }}>{it.section}</p> : null;
      const on = active === it.id;
      return (
        <button key={it.id || i} onClick={() => onNav?.(it.id)} title={collapsed ? (typeof it.label === 'string' ? it.label : undefined) : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start', height: 42, padding: collapsed ? 0 : '0 12px', borderRadius: 'var(--ob-r-md)', border: 'none', cursor: 'pointer', position: 'relative', background: on ? 'var(--ob-blue-100)' : 'transparent', color: on ? 'var(--ob-blue-700)' : 'var(--ob-fg-soft)', fontFamily: 'var(--ob-font)', fontSize: 14, fontWeight: on ? 600 : 500, transition: 'background 0.12s' }}
          onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
          onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
          {on && <span style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 3, background: 'var(--ob-blue)' }} />}
          {it.icon && <Ph n={it.icon} size={20} />}
          {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>}
          {!collapsed && it.badge != null && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--ob-orange)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
          {collapsed && it.badge != null && <span style={{ position: 'absolute', top: 7, right: 9, width: 8, height: 8, borderRadius: 999, background: 'var(--ob-orange)', border: '2px solid var(--ob-surface)' }} />}
        </button>
      );
    })}
    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--ob-line-soft)', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0 2px' : '10px 8px 2px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--ob-blue)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{userInitials}</span>
      {!collapsed && <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Onblide</div><div style={{ fontSize: 11, color: 'var(--ob-fg-mute)' }}>{workspaceName}</div></div>}
    </div>
  </div>
);
```

(`title={collapsed ? (typeof it.label === 'string' ? it.label : undefined) : undefined}`:
o original passa `it.label` direto pro atributo HTML `title`, que só aceita
`string`; como `label` agora é tipado `React.ReactNode` — mais correto que
o `any` implícito do original — o guard `typeof ... === 'string'` evita um
erro de tipo sem mudar o comportamento em nenhum uso real (todo `label` nas
páginas de demo já é string). Ver Global Constraints.)

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/SideNav/SideNav';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `SideNavProps`.

- [ ] **Step 4: Migrar o script da página de preview**

`project/ds/components/components-side-nav.html` carrega só
`Components.jsx` — trocar a tag pelo bundle.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-side-nav.html`. Testar
`collapsed`/expandido, navegação entre itens (`active` destaca corretamente),
seções, badges (numérico e ponto no modo collapsed), `flush`. Sem erros no
console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/SideNav project/package/src/index.ts project/ds/components/components-side-nav.html
git commit -m "feat(side-nav): porta SideNav para @onblide/ui e migra preview"
```

---

### Task 9: Portar `Tabs` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Tabs/Tabs.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-tabs.html`
- Source: `project/ui_kits/web_app/Components.jsx:934-996`

**Interfaces:**
- Consumes: `Ph` de `../Ph/Ph` (Fase 1).
- Produces: `Tabs` — `React.FC<TabsProps>`,
  `TabItem = { id: string; label: React.ReactNode; icon?: string; badge?: React.ReactNode; disabled?: boolean }`,
  `TabsProps = { tabs?: TabItem[]; active?: string; onChange?: (id: string) => void; variant?: 'line' | 'pill'; size?: 'sm' | 'md' }`.
- Esta página carrega `Primitives.jsx`+`Components.jsx` hoje, mas só usa
  `Tabs` (de `Components.jsx`) — confirmado por grep, tag de `Primitives.jsx`
  já órfã.

- [ ] **Step 1: Escrever `Tabs.tsx`**

```tsx
// project/package/src/components/Tabs/Tabs.tsx
import React from 'react';
import { Ph } from '../Ph/Ph';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs?: TabItem[];
  active?: string;
  onChange?: (id: string) => void;
  variant?: 'line' | 'pill';
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({ tabs = [], active, onChange, variant = 'line', size = 'md' }) => {
  const isLine = variant === 'line';
  const pad = size === 'sm' ? '7px 14px' : '10px 18px';
  const fs  = size === 'sm' ? 13 : 14;

  return (
    <div style={{ position: 'relative' }}>
      {isLine && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--ob-border)' }}/>}
      <div style={{
        display: 'inline-flex', gap: isLine ? 0 : 4,
        background: isLine ? 'none' : 'var(--ob-bg-alt)',
        border: isLine ? 'none' : '1px solid var(--ob-border)',
        borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
        padding: isLine ? 0 : 3,
        position: 'relative',
      }}>
        {tabs.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              disabled={tab.disabled}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: pad, border: 'none', cursor: tab.disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--ob-font)', fontSize: fs, fontWeight: 600,
                borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
                transition: 'all 0.15s',
                position: 'relative',
                background: isLine ? 'none' : (isActive ? 'var(--ob-surface)' : 'none'),
                color: isActive ? 'var(--ob-fg-strong)' : 'var(--ob-fg-mute)',
                opacity: tab.disabled ? 0.45 : 1,
                boxShadow: (!isLine && isActive) ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.icon && <Ph n={tab.icon} size={15}/>}
              {tab.label}
              {tab.badge != null && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                  background: isActive ? 'var(--ob-blue)' : 'var(--ob-bg-warm)',
                  color: isActive ? '#fff' : 'var(--ob-fg-soft)',
                }}>
                  {tab.badge}
                </span>
              )}
              {isLine && isActive && (
                <span style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                  background: 'var(--ob-blue)', borderRadius: '2px 2px 0 0',
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Tabs/Tabs';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `TabsProps`.

- [ ] **Step 4: Migrar as tags de script da página de preview**

`project/ds/components/components-tabs.html` carrega
`Primitives.jsx`+`Components.jsx`; confirmar por grep que só `Tabs` é
usado. Remover as DUAS tags, substituir por:
```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-tabs.html`. Testar
variantes `line`/`pill`, tamanhos `sm`/`md`, troca de aba ativa, ícone e
badge por aba, aba `disabled` (não clicável, sem `onChange` disparado). Sem
erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Tabs project/package/src/index.ts project/ds/components/components-tabs.html
git commit -m "feat(tabs): porta Tabs para @onblide/ui e migra preview"
```

---

### Task 10: Portar `Table` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Table/Table.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-table.html`
- Source: `project/ui_kits/web_app/Components.jsx:997-1093`

**Interfaces:**
- Produces: `Table` — componente genérico `Table<T>` (função, não
  `React.FC`, para tipar `columns`/`rows`/`onSelect` de forma consistente;
  `React.FC` não suporta genéricos diretamente — ver comentário no Step 1),
  `TableColumn<T> = { key: string; label: React.ReactNode; width?: number | string; sortable?: boolean; bold?: boolean; render?: (value: unknown, row: T) => React.ReactNode }`,
  `TableSort = { key: string; dir: 'asc' | 'desc' }`,
  `TableProps<T> = { columns?: TableColumn<T>[]; rows?: T[]; selectable?: boolean; onSelect?: (rows: T[]) => void; loading?: boolean; emptyState?: React.ReactNode; onSort?: (key: string) => void; sort?: TableSort }`.
- `Table` usa `<input type="checkbox">` cru, não o componente `Checkbox` —
  sem dependência a portar.
- O `<div>` de loading usa `animation: 'ob-pulse ...'` — essa keyframe já é
  injetada pelo módulo `Spinner` (Lote A, `ob-prim-kf`), que já faz parte do
  bundle via `src/index.ts`; `Table` não precisa injetar nada.
- `components-table.html` usa `Badge` (Lote A) e `Table` — confirmado por
  grep, ambos já portados.

- [ ] **Step 1: Escrever `Table.tsx`**

```tsx
// project/package/src/components/Table/Table.tsx
import React, { useState } from 'react';

export interface TableColumn<T> {
  key: string;
  label: React.ReactNode;
  width?: number | string;
  sortable?: boolean;
  bold?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableSort {
  key: string;
  dir: 'asc' | 'desc';
}

export interface TableProps<T> {
  columns?: TableColumn<T>[];
  rows?: T[];
  selectable?: boolean;
  onSelect?: (rows: T[]) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  onSort?: (key: string) => void;
  sort?: TableSort;
}

// Componente genérico — React.FC<TableProps<T>> não permite que TS infira T
// a partir do uso (React.FC não é genérico), então Table é declarado como
// função direta, igual a como o React documenta componentes genéricos.
export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
  columns = [], rows = [], selectable = false, onSelect, loading = false, emptyState, onSort, sort,
}: TableProps<T>) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleAll = () => {
    const next = selected.length === rows.length ? [] : rows.map((_, i) => i);
    setSelected(next);
    onSelect?.(next.map(i => rows[i]));
  };
  const toggleRow = (i: number) => {
    const next = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
    setSelected(next);
    onSelect?.(next.map(j => rows[j]));
  };

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const partChecked = selected.length > 0 && selected.length < rows.length;

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--ob-font-mono)',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--ob-fg-mute)', borderBottom: '1.5px solid var(--ob-border)',
    background: 'var(--ob-surface)', whiteSpace: 'nowrap', userSelect: 'none',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 14, color: 'var(--ob-fg)',
    borderBottom: '1px solid var(--ob-line-soft)', verticalAlign: 'middle',
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: 'var(--ob-r-md)', border: '1px solid var(--ob-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--ob-surface)' }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...thStyle, width: 44, padding: '10px 14px' }}>
                <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = partChecked; }}
                  onChange={toggleAll} style={{ accentColor: 'var(--ob-blue)', width: 15, height: 15, cursor: 'pointer' }}/>
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} style={{ ...thStyle, cursor: col.sortable ? 'pointer' : 'default', width: col.width }}
                onClick={() => col.sortable && onSort?.(col.key)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {col.label}
                  {col.sortable && (
                    <span style={{ opacity: sort?.key === col.key ? 1 : 0.35, color: 'var(--ob-blue)' }}>
                      {sort?.key === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                {selectable && <td style={tdStyle}><div style={{ width: 15, height: 15, borderRadius: 3, background: 'var(--ob-bg-alt)' }}/></td>}
                {columns.map(col => (
                  <td key={col.key} style={tdStyle}>
                    <div style={{ height: 14, borderRadius: 4, background: 'var(--ob-bg-alt)', width: `${60 + Math.random() * 30}%`, animation: 'ob-pulse 1.4s ease-in-out infinite' }}/>
                  </td>
                ))}
              </tr>
            ))
            : rows.length === 0
            ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ ...tdStyle, textAlign: 'center', padding: '40px 14px', color: 'var(--ob-fg-mute)' }}>
                  {emptyState || 'Nenhum resultado encontrado.'}
                </td>
              </tr>
            )
            : rows.map((row, i) => (
              <tr key={i} style={{ background: selected.includes(i) ? 'var(--ob-blue-100)' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!selected.includes(i)) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selected.includes(i) ? 'var(--ob-blue-100)' : 'none'; }}>
                {selectable && (
                  <td style={tdStyle}>
                    <input type="checkbox" checked={selected.includes(i)} onChange={() => toggleRow(i)}
                      style={{ accentColor: 'var(--ob-blue)', width: 15, height: 15, cursor: 'pointer' }}/>
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} style={{ ...tdStyle, fontWeight: col.bold ? 600 : 400, color: col.bold ? 'var(--ob-fg-strong)' : 'var(--ob-fg)' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Table/Table';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `TableProps`.

- [ ] **Step 4: Migrar as tags de script da página de preview**

`project/ds/components/components-table.html` carrega
`Primitives.jsx`+`Components.jsx`; confirmar por grep que só `Badge`
(Lote A) e `Table` são usados. Remover as DUAS tags, substituir por:
```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-table.html`. Testar
seleção de linha individual, "selecionar tudo", e — o ponto de maior risco
desta tarefa (ver Review Focus) — **selecionar só ALGUMAS linhas e
confirmar visualmente que o checkbox do cabeçalho mostra o traço
indeterminado** (não marcado, não vazio: um traço), coluna ordenável
(clique alterna indicador ↑/↓/↕), estado `loading` (skeleton pulsando —
confirma que `ob-pulse` de fato existe no bundle via `Spinner`), e
`emptyState` com `rows: []`. Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Table project/package/src/index.ts project/ds/components/components-table.html
git commit -m "feat(table): porta Table para @onblide/ui e migra preview"
```

---

### Task 11: Portar `DeadlineCalendar` e migrar a página de preview

**Files:**
- Create: `project/package/src/primitives/DeadlineCalendar/DeadlineCalendar.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-deadline-calendar.html`
- Source: `project/ui_kits/web_app/Primitives.jsx:725-784`

**Interfaces:**
- Produces: `DeadlineCalendar` — `React.FC<DeadlineCalendarProps>`,
  `DeadlineCalendarPhase = { startDate?: string; endDate?: string }`,
  `DeadlineCalendarHoliday = { date: string; name: string }`,
  `DeadlineCalendarProps = { referenceDate?: string; production?: DeadlineCalendarPhase | null; delivery?: DeadlineCalendarPhase | null; estimatedDate?: string; holidays?: DeadlineCalendarHoliday[]; holidayCoverage?: string; deliveryPending?: boolean }`.
  (`holidayCoverage` fica como `string`, não um union literal — o original
  só compara contra `'national'` explicitamente; o outro branch não nomeia
  nenhum valor específico, então tipar como union inventaria uma restrição
  que o original não tem.)

- [ ] **Step 1: Escrever `DeadlineCalendar.tsx`**

```tsx
// project/package/src/primitives/DeadlineCalendar/DeadlineCalendar.tsx
import React, { useEffect, useState } from 'react';

export interface DeadlineCalendarPhase {
  startDate?: string;
  endDate?: string;
}

export interface DeadlineCalendarHoliday {
  date: string;
  name: string;
}

export interface DeadlineCalendarProps {
  referenceDate?: string;
  production?: DeadlineCalendarPhase | null;
  delivery?: DeadlineCalendarPhase | null;
  estimatedDate?: string;
  holidays?: DeadlineCalendarHoliday[];
  holidayCoverage?: string;
  deliveryPending?: boolean;
}

export const DeadlineCalendar: React.FC<DeadlineCalendarProps> = ({
  referenceDate,
  production = null,
  delivery = null,
  estimatedDate = '',
  holidays = [],
  holidayCoverage = 'national',
  deliveryPending = false,
}) => {
  const parse = (value?: string | null) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12) : null;
  };
  const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();
  const reference = parse(referenceDate) || new Date();
  const finish = parse(estimatedDate) || parse(production?.endDate) || reference;
  const minMonth = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const maxMonth = new Date(finish.getFullYear(), finish.getMonth(), 1);
  const [month, setMonth] = useState(minMonth);
  useEffect(() => setMonth(minMonth), [referenceDate]);
  const activeMonth = monthKey(month) < monthKey(minMonth) ? minMonth : monthKey(month) > monthKey(maxMonth) ? maxMonth : month;
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekdayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const holidayMap = Object.fromEntries((holidays || []).map((holiday) => [holiday.date, holiday]));
  const inPhase = (date: string, phase?: DeadlineCalendarPhase | null) => !!phase?.startDate && !!phase?.endDate && date >= phase.startDate && date <= phase.endDate;
  const firstDay = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1).getDay();
  const days = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    width: 28, height: 28, display: 'grid', placeItems: 'center', padding: 0,
    border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-sm)', background: 'var(--ob-surface)',
    color: 'var(--ob-fg-strong)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
  });
  const legend = (color: string | null, label: string, border?: string) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ob-fg-soft)', fontSize: 10 }}><i style={{ width: 8, height: 8, borderRadius: 3, background: color || 'transparent', border: border || 'none' }} />{label}</span>;

  return (
    <section aria-label="Calendário de prazos" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', background: 'var(--ob-surface)' }}>
      <strong style={{ color: 'var(--ob-fg-strong)', fontSize: 12 }}><i className="ph ph-calendar-blank" aria-hidden="true" /> Calendário de prazos</strong>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button type="button" aria-label="Mês anterior" disabled={monthKey(activeMonth) <= monthKey(minMonth)} onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))} style={buttonStyle(monthKey(activeMonth) <= monthKey(minMonth))}><i className="ph ph-caret-left" aria-hidden="true" /></button>
        <strong aria-live="polite" style={{ minWidth: 142, color: 'var(--ob-fg-strong)', fontSize: 12, textAlign: 'center' }}>{monthNames[activeMonth.getMonth()]} de {activeMonth.getFullYear()}</strong>
        <button type="button" aria-label="Próximo mês" disabled={monthKey(activeMonth) >= monthKey(maxMonth)} onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))} style={buttonStyle(monthKey(activeMonth) >= monthKey(maxMonth))}><i className="ph ph-caret-right" aria-hidden="true" /></button>
      </div>
      <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>{weekdayNames.map((name, index) => <span key={`${name}-${index}`} style={{ color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>{name}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, index) => <span key={`blank-${index}`} aria-hidden="true" style={{ minHeight: 28 }} />)}
        {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
          const date = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), day, 12);
          const key = iso(date); const holiday = holidayMap[key]; const weekend = date.getDay() === 0 || date.getDay() === 6;
          const productionDay = !weekend && !holiday && inPhase(key, production);
          const deliveryDay = !weekend && !holiday && inPhase(key, delivery);
          const estimated = key === estimatedDate;
          return <span key={key} title={holiday ? `Feriado nacional: ${holiday.name}` : estimated ? 'Data estimada de entrega' : undefined} aria-label={`${day} de ${monthNames[activeMonth.getMonth()]}${holiday ? ` · Feriado nacional: ${holiday.name}` : ''}${estimated ? ' · Data estimada de entrega' : ''}`} style={{ minHeight: 28, display: 'grid', placeItems: 'center', position: 'relative', borderRadius: 6, background: holiday ? 'var(--ob-warning-bg)' : deliveryDay ? 'var(--ob-success-bg)' : productionDay ? 'var(--ob-blue-100)' : weekend ? 'var(--ob-bg-alt)' : 'transparent', color: holiday ? 'var(--ob-orange-700)' : deliveryDay ? 'var(--ob-green-700)' : productionDay ? 'var(--ob-blue-700)' : weekend ? 'var(--ob-fg-mute)' : 'var(--ob-fg)', boxShadow: estimated ? 'inset 0 0 0 2px var(--ob-green-700)' : key === referenceDate ? 'inset 0 0 0 1px var(--ob-blue)' : 'none', fontSize: 11, fontWeight: estimated ? 800 : 600, cursor: holiday ? 'help' : 'default' }}>{day}{estimated && <i aria-hidden="true" style={{ width: 5, height: 5, position: 'absolute', right: 3, bottom: 3, borderRadius: '50%', background: 'var(--ob-green-700)' }} />}</span>;
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 9px' }}>{legend('var(--ob-blue-100)', 'Produção')}{legend('var(--ob-success-bg)', 'Transporte')}{legend(null, 'Entrega prevista', '2px solid var(--ob-green-700)')}{legend('var(--ob-warning-bg)', 'Feriado')}</div>
      <p style={{ margin: 0, color: holidayCoverage === 'national' ? 'var(--ob-fg-soft)' : 'var(--ob-orange-700)', fontSize: 10, lineHeight: 1.4 }}>{deliveryPending ? 'Selecione uma opção de frete para visualizar a data estimada de entrega.' : !estimatedDate ? 'Retirada combinada: sem prazo de transporte.' : holidayCoverage === 'national' ? 'Previsão considera fins de semana e feriados nacionais.' : 'Feriados nacionais indisponíveis; a previsão considera somente fins de semana.'}</p>
    </section>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/DeadlineCalendar/DeadlineCalendar';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `DeadlineCalendarProps`.

- [ ] **Step 4: Migrar o script da página de preview**

`project/ds/components/components-deadline-calendar.html` carrega só
`Primitives.jsx` — trocar a tag pelo bundle.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-deadline-calendar.html`.
Testar navegação entre meses (limitada a `minMonth`/`maxMonth`), dia com
feriado (tooltip + cor), fase de produção/entrega destacada, dia estimado
(marcador), `holidayCoverage` diferente de `'national'`, `deliveryPending`.
Sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/DeadlineCalendar project/package/src/index.ts project/ds/components/components-deadline-calendar.html
git commit -m "feat(deadline-calendar): porta DeadlineCalendar para @onblide/ui e migra preview"
```

---

### Task 12: Portar `Select` e migrar a página de preview

**Files:**
- Create: `project/package/src/components/Select/Select.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-select.html`
- Source: `project/ui_kits/web_app/Components.jsx:707-857`

**Interfaces:**
- Consumes: `Checkbox` de `../Checkbox/Checkbox` (Fase 1), `Chip` de
  `../Chip/Chip` (Lote A), `FieldShell` de `../../primitives/FieldShell/FieldShell`
  (Fase 1), `FloatingPanel` de `../FloatingPanel/FloatingPanel` (Fase 1),
  `Ph` de `../Ph/Ph` (Fase 1).
- Produces: `Select` — `React.FC<SelectProps>`,
  `SelectOption = { label: string; [key: string]: unknown }`,
  `SelectProps = { options?: (string | SelectOption)[]; value?: string | string[] | null; onChange?: (value: string | string[]) => void; multi?: boolean; label?: React.ReactNode; placeholder?: string; disabled?: boolean; error?: React.ReactNode; width?: number | string }`.
- **Maior risco de integração do lote** — 5 dependências renderizando
  juntas (ver Review Focus).

- [ ] **Step 1: Escrever `Select.tsx`**

```tsx
// project/package/src/components/Select/Select.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import { Chip } from '../Chip/Chip';
import { FloatingPanel } from '../FloatingPanel/FloatingPanel';
import { Ph } from '../Ph/Ph';
import { FieldShell } from '../../primitives/FieldShell/FieldShell';

export interface SelectOption {
  label: string;
  [key: string]: unknown;
}

export interface SelectProps {
  options?: (string | SelectOption)[];
  value?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
  multi?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  error?: React.ReactNode;
  width?: number | string;
}

export const Select: React.FC<SelectProps> = ({
  options = [],
  value = null,
  onChange,
  multi = false,
  label,
  placeholder = 'Selecione…',
  disabled = false,
  error,
  width,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // normaliza o valor
  const selected: string | string[] | null = multi
    ? (Array.isArray(value) ? value : [])
    : value;

  const getLabel = (o: string | SelectOption) => typeof o === 'string' ? o : o.label;

  const filtered = options.filter(o =>
    getLabel(o).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) setHighlighted(0);
  }, [open, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt: string | SelectOption) => {
    const lbl = getLabel(opt);
    if (multi) {
      const list = selected as string[];
      const next = list.includes(lbl)
        ? list.filter(s => s !== lbl)
        : [...list, lbl];
      onChange?.(next);
    } else {
      onChange?.(lbl);
      setOpen(false);
      setQuery('');
    }
  };

  const removeChip = (lbl: string) => onChange?.((selected as string[]).filter(s => s !== lbl));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && filtered[highlighted]) { e.preventDefault(); toggle(filtered[highlighted]); }
    if (e.key === 'Backspace' && multi && !query && (selected as string[]).length) {
      onChange?.((selected as string[]).slice(0, -1));
    }
  };

  const displayValue = !multi && selected && !open ? (selected as string) : '';

  return (
    <div ref={rootRef} style={{ position: 'relative', width: width || '100%', fontFamily: 'var(--ob-font)' }}>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: 6 }}>{label}</div>
      )}
      <FieldShell
        focused={open} error={!!error} disabled={disabled}
        padding={multi && (selected as string[]).length ? '6px 10px' : '0 12px'}
        onClick={() => { if (!disabled) { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 0); } }}
        style={{ flexWrap: 'wrap', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {/* Chips do modo multi — Chip real */}
        {multi && (selected as string[]).map(s => (
          <Chip key={s} label={s} size="sm" selected removable
            onToggle={() => {}} onRemove={() => removeChip(s)} />
        ))}
        <input
          ref={inputRef}
          value={open ? query : displayValue}
          placeholder={(!multi || !(selected as string[]).length) ? placeholder : ''}
          disabled={disabled}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => { if (!disabled) setOpen(true); }}
          style={{
            flex: 1, minWidth: 60, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: 'var(--ob-fg-strong)', cursor: disabled ? 'not-allowed' : 'text',
            padding: multi && (selected as string[]).length ? '0' : '0 2px', height: multi && (selected as string[]).length ? 26 : 40,
          }}
        />
        <Ph n="caret-down" size={16} c="var(--ob-fg-mute)"
          style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </FieldShell>

      {/* Dropdown */}
      {open && (
        <FloatingPanel maxHeight={240} padding={4}>
          {filtered.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ob-fg-mute)', textAlign: 'center' }}>
              Nenhuma opção encontrada
            </div>
          )}
          {filtered.map((opt, i) => {
            const lbl = getLabel(opt);
            const isSelected = multi ? (selected as string[]).includes(lbl) : selected === lbl;
            const isHigh = i === highlighted;
            return (
              <div key={lbl}
                onMouseDown={(e) => { e.preventDefault(); toggle(opt); }}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--ob-r-sm)', cursor: 'pointer',
                  fontSize: 14, fontWeight: (isSelected && !multi) ? 600 : 400,
                  color: (isSelected && !multi) ? 'var(--ob-blue-700)' : 'var(--ob-fg)',
                  background: isHigh ? 'var(--ob-bg-warm)' : (isSelected && !multi ? 'var(--ob-blue-100)' : 'transparent'),
                  transition: 'background 0.1s',
                }}>
                {multi ? (
                  /* Item de lista multi — Checkbox real */
                  <Checkbox checked={isSelected} onChange={() => {}} label={lbl} />
                ) : (
                  <>
                    <span>{lbl}</span>
                    {isSelected && <Ph n="check" size={15} c="var(--ob-blue)" />}
                  </>
                )}
              </div>
            );
          })}
        </FloatingPanel>
      )}

      {error && (
        <div style={{ fontSize: 12, color: 'var(--ob-danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Ph n="warning-circle" size={13} c="var(--ob-danger)" />
          {error}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './components/Select/Select';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `SelectProps`.

- [ ] **Step 4: Migrar o script da página de preview**

`project/ds/components/components-select.html` carrega só `Components.jsx`
— trocar a tag pelo bundle.

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-select.html`. Este é o
componente de maior risco do lote (ver Review Focus) — testar com atenção
redobrada: modo single (abre dropdown, filtra digitando, seleciona com
clique e com Enter, fecha com Escape ou clicando fora), modo `multi`
(chips reais aparecem no campo, `Checkbox` real marca/desmarca no
dropdown, Backspace com campo vazio remove o último chip), navegação por
teclado (`ArrowDown`/`ArrowUp` navega o destaque, `Enter` confirma),
`disabled`, `error`. Sem erros no console em nenhum desses fluxos.

- [ ] **Step 6: Commit**

```bash
git add project/package/src/components/Select project/package/src/index.ts project/ds/components/components-select.html
git commit -m "feat(select): porta Select para @onblide/ui e migra preview"
```

---

### Task 13: Portar `Input` e migrar `components-slider.html` (débito do Lote A)

**Files:**
- Create: `project/package/src/primitives/Input/Input.tsx`
- Modify: `project/package/src/index.ts`
- Modify: `project/ds/components/components-slider.html`
- Source: `project/ui_kits/web_app/Primitives.jsx:221-241`

**Interfaces:**
- Consumes: `FieldShell` de `../FieldShell/FieldShell` (Fase 1).
- Produces: `Input` — `React.FC<InputProps>`,
  `InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> & { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; icon?: React.ReactNode }`
  (estende os atributos nativos de `<input>` porque o original espalha
  `...rest` — tudo que não é `label`/`hint`/`error`/`icon` — direto no
  elemento; `style` é omitido porque o componente já define o próprio
  estilo do `<input>` interno, sem deixar o chamador sobrescrevê-lo, igual
  ao original).
- `Input` não tem página de preview React dedicada
  (`components-inputs.html` é HTML/CSS estático, mesmo padrão de
  `components-cards.html` no Lote A) — em vez disso, esta tarefa também
  migra `components-slider.html`, pendente desde o Lote A (ver Review
  Focus): confirmar por grep, ANTES de tocar na página, que os 5
  componentes que ela usa (`Button`, `Chip`, `Input`, `Slider`, `Toggle`)
  estão todos em `dist/index.d.ts`.

- [ ] **Step 1: Escrever `Input.tsx`**

```tsx
// project/package/src/primitives/Input/Input.tsx
import React, { useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, hint, error, icon, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <FieldShell focused={focused} error={!!error}>
        {icon && <span style={{ display: 'flex', color: 'var(--ob-fg-mute)', flex: 'none' }}>{icon}</span>}
        <input
          {...rest}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
          }}
        />
      </FieldShell>
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>}
    </label>
  );
};
```

- [ ] **Step 2: Exportar**

```ts
// project/package/src/index.ts — append
export * from './primitives/Input/Input';
```

- [ ] **Step 3: Typecheck e build**

Rodar: `npm run typecheck && npm run build`
Esperado: os dois passam; `dist/index.d.ts` contém `InputProps`; confirmar
com `grep -oE "\b(Button|Chip|Input|Slider|Toggle)\b" dist/index.d.ts` que
os 5 nomes aparecem.

- [ ] **Step 4: Migrar as tags de script de `components-slider.html`**

`project/ds/components/components-slider.html:33-35` tem hoje:
```html
<script>window.Icons = window.Icons || {};</script>
<script type="text/babel" src="../../ui_kits/web_app/Primitives.jsx"></script>
<script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
```
Confirmar por grep (`grep -oE '<[A-Z][A-Za-z]*' components-slider.html`)
que só `Button`, `Chip`, `Input`, `Slider`, `Toggle` (e `Demo`, local) são
usados. Remover as TRÊS linhas (incluindo o shim `window.Icons`, que só
existia pra evitar erro de referência antes de `Icons` existir — não é mais
necessário com o bundle novo, que não referencia `Icons`), substituir por:
```html
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

- [ ] **Step 5: Servir e comparar**

`http://127.0.0.1:8000/ds/components/components-slider.html`. Confirmar
que a página inteira (não só `Input`) continua funcionando — `Slider`
single e range, `Input` com label/hint/error/ícone, `Button`, `Chip`,
`Toggle`, todos juntos na mesma demo. Sem erros no console. Esta é a
página que fecha o débito do Lote A (ver Review Focus).

- [ ] **Step 6: Commit**

```bash
git add project/package/src/primitives/Input project/package/src/index.ts project/ds/components/components-slider.html
git commit -m "feat(input): porta Input para @onblide/ui e migra preview de slider"
```

---

### Task 14: Verificação final do pacote

**Files:**
- Nenhum arquivo novo — só roda checagens sobre tudo que as Tarefas 1-13
  produziram.

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
node scripts/smoke-toast-stack.mjs
```

Esperado: todos imprimem `OK:` e saem com código 0.

- [ ] **Step 5: Conferir a superfície do `.d.ts`**

```bash
tail -c 6000 dist/index.d.ts | grep -oE "\b(Alert|ProgressBar|Toast|ToastStack|Drawer|CodeInput|SearchInput|SideNav|Tabs|Table|DeadlineCalendar|Select|Input)\b" | sort -u
```

Esperado: os 13 nomes aparecem na última linha (o `export { ... }` final do
arquivo, onde o `tsup` consolida tudo — não em declarações individuais).

- [ ] **Step 6: Reconferir as 11 páginas migradas juntas**

Com `python -m http.server 8000` rodando a partir de `project/`, abrir as
11 em sequência e confirmar zero erro de console em cada uma:
`components-alert.html`, `components-progressbar.html`,
`components-toast.html`, `components-drawer.html`,
`components-code-input.html`, `components-search-input.html`,
`components-side-nav.html`, `components-tabs.html`,
`components-table.html`, `components-deadline-calendar.html`,
`components-select.html`, e `components-slider.html` (esta conta como a
12ª página tocada neste lote, mas já estava migrada desde antes na parte
React/Primitives — reconferir mesmo assim).

- [ ] **Step 7: Varredura por referências antigas**

```bash
grep -rn "ui_kits/web_app/Components.jsx\|ui_kits/web_app/Primitives.jsx" \
  project/ds/components/components-alert.html \
  project/ds/components/components-progressbar.html \
  project/ds/components/components-toast.html \
  project/ds/components/components-drawer.html \
  project/ds/components/components-code-input.html \
  project/ds/components/components-search-input.html \
  project/ds/components/components-side-nav.html \
  project/ds/components/components-tabs.html \
  project/ds/components/components-table.html \
  project/ds/components/components-deadline-calendar.html \
  project/ds/components/components-select.html \
  project/ds/components/components-slider.html
```

Esperado: nenhuma saída — diferente do Lote A, TODAS as páginas deste lote
tiveram os DOIS scripts antigos removidos por completo (nenhuma exceção
parcial), então o grep não deve achar nada em nenhuma delas.

- [ ] **Step 8: Commit (só se algum passo acima precisou de correção)**

Se tudo passou sem precisar mexer em nada, pular este passo. Se algo
precisou de correção, corrigir e:

```bash
git add -A project/package project/ds/components
git commit --amend --no-edit
```

(Incorporar ao commit da Tarefa 1-13 a que a correção pertence, seguindo o
`project/CLAUDE.md` — nunca um commit novo de "fix".)

---

### Task 15: Release — 0.3.0

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
- Resumo: `Adiciona Alert, ProgressBar, Toast, ToastStack, Drawer, CodeInput, SearchInput, SideNav, Tabs, Table, DeadlineCalendar, Select e Input (Fase 2, Lote B); migra components-slider.html.`

Se `npx changeset add` não aceitar entrada interativa no ambiente de
execução, escrever o arquivo de changeset manualmente em
`project/package/.changeset/` no formato que a CLI geraria (frontmatter
`---\n"@onblide/ui": minor\n---\n\n<resumo>\n`), como já foi feito no Lote A.

- [ ] **Step 2: Aplicar o bump de versão**

```bash
npx changeset version
```

Esperado: `package.json` vai de `0.2.0` para `0.3.0` (bump minor padrão do
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
git commit -m "chore(package): libera @onblide/ui 0.3.0"
```

- [ ] **Step 5: Tag e push**

```bash
git tag onblide-ui@0.3.0
git push origin dev
git push origin onblide-ui@0.3.0
```

Esperado: `dev` e a tag nova aparecem em `origin`.

---

## After this plan

`@onblide/ui` passa a ter **33 componentes** (7 da Fase 1 + 13 do Lote A +
13 deste Lote B). Falta só o Lote C (`Icons`, `Brands`, `OB_TOAST_POS` já
saiu daqui — na verdade só restam `Icons`/`Brands` como módulos de dados, e
`Modal`/`Link`/`Pagination` como componentes que dependem deles), cada um
com spec e plano próprios. Como nos lotes anteriores, rodar o
`/design-sync` de verdade continua sendo uma ação separada, não uma tarefa
deste plano.
