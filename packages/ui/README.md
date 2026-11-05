# @onblide/ui

Componentes React do design system Onblide, escritos em TypeScript. Pacote interno
(`"private": true`), mantido neste repositório em `packages/ui/`.

## Instalação e build

```bash
cd packages/ui
npm install
npm run build    # gera dist/: ESM, CJS, .d.ts e o bundle de navegador
npm run verify   # typecheck + build + teste de tipos (contra o .d.ts) + smokes
```

`dist/` é gerado e não é versionado: rode o build antes de usar o pacote.

## Estrutura do código

Um componente por pasta, agrupado pelo **papel dele na interface** (`src/<categoria>/<Nome>/<Nome>.tsx`):

| Categoria | Componentes |
|---|---|
| `actions` | Button, ButtonGroup, ToggleButton, Link |
| `forms` | Input, SearchInput, Select, Datepicker, CodeInput, Checkbox, Radio, RadioGroup, Switch, Slider, FieldShell, Textarea, NumberField, FileUpload, Autocomplete |
| `feedback` | Alert, Toast, ToastStack, ProgressBar, ProgressCircle, Spinner, Skeleton |
| `overlays` | Modal, AlertDialog, Drawer, Tooltip, Menu (+ ContextMenu, MenuPanel), Popover |
| `navigation` | Tabs, SideNav, Navbar, Pagination, Breadcrumbs, Stepper, Menubar |
| `data-display` | Table, Card, Calendar, Avatar, AvatarGroup, Badge, Chip, Divider, ScrollArea, Kbd, EmptyState, Accordion, List (+ ListItem, ListSubheader, ListDivider), Timeline, TreeView |
| `brand` | Logo |
| `iconography` | Icons, Ph |

Fora das categorias, `src/theme/` tem o tema claro/escuro (`themeManager`, `useTheme`, `themeInitScript`) e
`src/layout/` tem os breakpoints (`BREAKPOINTS`, `mediaQuery`, `useBreakpoint`).

`src/internal/` guarda o que é compartilhado e não faz parte da API pública (tons de cor, posições do toast, injeção de CSS, datas e lógica do calendário, posicionamento de painéis, `FloatingPanel` e `StatusDot`). Ao criar um componente, escolha a categoria pelo que ele faz para o usuário e exporte-o em `src/index.ts`.

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

### Como bundle de navegador (sem bundler)

`dist/onblide-ui.browser.js` é um IIFE que registra todos os componentes como globais em
`window` (`Button`, `Select`, ...). Carregue-o **depois** de React e ReactDOM (UMD), pois ele
usa o `window.React` e o `window.ReactDOM` da página e não embute uma cópia própria de React:

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="dist/onblide-ui.browser.js"></script>
```

## Ícones

Os componentes renderizam `<i class="ph ph-...">` (peso regular) ou `<i class="ph-<peso> ph-...">`. O pacote **não** injeta o CSS do Phosphor:
ele precisa estar carregado na página, senão os ícones aparecem vazios.

- Com bundler: `import '@onblide/ui/styles.css'` já traz os seis pesos do Phosphor (dependência
  `@phosphor-icons/web`) junto dos tokens. Cada fonte só é baixada quando algum ícone usa aquele peso.
- Com o bundle de navegador (IIFE) o CSS não vem junto. Use o CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/thin/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/light/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/fill/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/duotone/style.css">
```

### `Ph` ou `Icons`?

Os dois existem, e `Icons` é construído sobre `Ph`:

- **`Icons`**: registro com 28 ícones semânticos (`Icons.check`, `Icons.caretR`, ...). Cada
  entrada é uma função: `<Icons.check size={16} />` ou `Icons.check({ size: 16 })`. Tamanho
  padrão 20; a cor vem de `style`; a marcação é a mesma de `<Ph n="…" size={20} />`. Use para os ícones do registro, porque trocar o peso ou a
  fonte dos ícones num lugar só é a regra do projeto (`CLAUDE.md`). `Link`,
  `Pagination` e `Modal` usam `Icons`.
- **`Ph`**: `<Ph n="check" size={18} c="var(--ob-blue)" weight="bold" />` renderiza qualquer glifo Phosphor
  pelo nome (`n`), com cor por prop (`c`) e peso (`weight`: regular, fill, bold, light, thin, duotone). Tamanho padrão 18. Use quando o ícone não estiver
  no registro. `Alert`, `Checkbox`, `SearchInput`, `Select`, `SideNav`, `Tabs` e `Toast` usam
  `Ph`; `Chip` também. Nenhum componente monta `<i class="ph ...">` à mão.

### Vocabulário das props

`tone` é a cor, `appearance` é a pintura (`solid`, `soft`, `outline`, `ghost`) e `variant` é a forma, com o mesmo
significado em todos os componentes. A tabela de valores por componente está no site de documentação, em
Fundações › Vocabulário das props.

### Breakpoints

Escala mobile-first: `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px (abaixo de `sm` é `base`). Em CSS, só
`@media (min-width: …)` com esses valores; em JavaScript, `BREAKPOINTS`, `mediaQuery('md')` e o hook `useBreakpoint()`.
Regra completa no site de documentação, em Fundações › Breakpoints.

### Pesos

Cada peso tem um papel: **regular** é o padrão; **fill** é o estado ligado (item ativo do `SideNav`,
aba ativa dos `Tabs`, ícone de status do `Alert` e do `Toast`, check do `Checkbox`); **bold** é para ícones
de até 14px ou sobre fundo sólido; **light** para 32–48px; **thin** só editorial (64px+);
**duotone** só em destaques ilustrativos. As regras completas estão no site de documentação, em
Fundações › Iconografia.

## Marca

`<Logo />` renderiza o lockup horizontal da marca (SVG inline, cores pelos tokens `--ob-*`, então
acompanha o tema claro/escuro). `size` é a altura em px (padrão 28). As demais variantes (empilhada,
símbolo, em arquivo) ficam em `docs-site/marca/`.

## Efeitos colaterais no import

Alguns módulos injetam `<style>` (keyframes e regras de mídia) no `<head>` quando o pacote é importado. Por isso o
`package.json` **não** declara
`"sideEffects": false`: com ele, um bundler poderia descartar essas injeções.

## Versionamento

Versões e changelog via [Changesets](https://github.com/changesets/changesets): escreva um
arquivo em `.changeset/`, rode `npx changeset version`, depois `npm install --package-lock-only`
(o `changeset version` não atualiza o `package-lock.json`) e commite `package.json`,
`CHANGELOG.md` e `package-lock.json`. Commits seguem Conventional Commits em português (`CLAUDE.md`).
