# @onblide/ui

Componentes React do design system Onblide, escritos em TypeScript. Pacote interno
(`"private": true`), mantido neste repositório em `project/package/`.

## Instalação e build

```bash
cd project/package
npm install
npm run build    # gera dist/: ESM, CJS, .d.ts e o bundle de navegador
npm run verify   # typecheck + build + teste de tipos (contra o .d.ts) + smokes
```

`dist/` é gerado e não é versionado: rode o build antes de usar o pacote ou de abrir as
páginas de preview em `project/ds/components/`.

## Uso

### Como módulo (ESM ou CJS)

```tsx
import { Button, Select, Ph, Icons } from '@onblide/ui';
import '@onblide/ui/styles.css'; // tokens + CSS do Phosphor (ver "Ícones")

export const Exemplo = () => (
  <>
    <Button>Salvar</Button>
    <Ph n="check" size={18} c="var(--ob-blue)" />
    <Icons.check size={16} />
  </>
);
```

`react` e `react-dom` (^18.3.1) são peer dependencies. O pacote também exporta
`@onblide/ui/tokens.css` (só os tokens) e `@onblide/ui/styles.css` (tokens + Phosphor).

### Como bundle de navegador (páginas de preview)

`dist/onblide-ui.browser.js` é um IIFE que registra todos os componentes como globais em
`window` (`Button`, `Select`, ...). Carregue-o **depois** de React e ReactDOM (UMD), pois ele
usa o `window.React` e o `window.ReactDOM` da página e não embute uma cópia própria de React:

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="../../package/dist/onblide-ui.browser.js"></script>
```

## Ícones

Os componentes renderizam `<i class="ph ph-...">`. O pacote **não** injeta o CSS do Phosphor:
ele precisa estar carregado na página, senão os ícones aparecem vazios.

- Com bundler: `import '@onblide/ui/styles.css'` já traz o Phosphor (dependência
  `@phosphor-icons/web`) junto dos tokens.
- Com o bundle de navegador (IIFE) o CSS não vem junto. Use o CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

### `Ph` ou `Icons`?

Os dois existem e nenhum foi removido:

- **`Icons`**: registro com 28 ícones semânticos (`Icons.check`, `Icons.caretR`, ...). Cada
  entrada é uma função: `<Icons.check size={16} />` ou `Icons.check({ size: 16 })`. Tamanho
  padrão 20; a cor vem de `style`. Use para os ícones do registro, porque trocar o peso ou a
  fonte dos ícones num lugar só é a regra do projeto (`project/CLAUDE.md`). `Link`,
  `Pagination` e `Modal` usam `Icons`.
- **`Ph`**: `<Ph n="check" size={18} c="var(--ob-blue)" />` renderiza qualquer glifo Phosphor
  pelo nome (`n`), com cor por prop (`c`). Tamanho padrão 18. Use quando o ícone não estiver
  no registro. `Alert`, `Checkbox`, `SearchInput`, `Select`, `SideNav`, `Tabs` e `Toast` usam
  `Ph`; `Chip`, `SearchInput` (ícone de carregamento) e `DeadlineCalendar` montam o
  `<i class="ph ph-...">` diretamente.

## Efeitos colaterais no import

Alguns módulos injetam `<style>` (keyframes e uma regra de mídia) no `<head>` quando o pacote é importado, e
`ToastStack` define `window.obToast`. Por isso o `package.json` **não** declara
`"sideEffects": false`: com ele, um bundler poderia descartar essas injeções.

## Versionamento

Versões e changelog via [Changesets](https://github.com/changesets/changesets): escreva um
arquivo em `.changeset/`, rode `npx changeset version`, depois `npm install --package-lock-only`
(o `changeset version` não atualiza o `package-lock.json`) e commite `package.json`,
`CHANGELOG.md` e `package-lock.json`. Commits seguem Conventional Commits em português (`project/CLAUDE.md`).
