# @onblide/ui

## 0.8.1

### Patch Changes

- `Datepicker`: as setas de mês passam a usar ícones Phosphor (`caret-left`/`caret-right`) em vez do caractere de texto, com `type="button"` e `aria-label`.

## 0.8.0

### Minor Changes

- `Datepicker` (intervalo): com só o início escolhido, passar o mouse sobre outro dia destaca o intervalo inteiro (para a frente ou para trás do início); clicar num dia anterior ao início agora fecha o intervalo entre eles, em vez de reiniciar a seleção. Os dias e as setas do calendário também passam a herdar a fonte do design system.

## 0.7.0

### Minor Changes

- `Button` agora aceita as props nativas do `<button>` (`disabled`, `type`, `aria-*`, `name`...) e usa `type="button"` por padrão; desabilitado fica com opacidade reduzida, cursor `not-allowed` e sem brilho no hover.

## 0.6.0

### Minor Changes

- Fase 4 (remoção do UI kit antigo). Novo: `Logo` (lockup horizontal da marca em SVG inline, cores pelos tokens `--ob-*`; `size` é a altura em px, padrão 28) e o tipo `LogoProps`. O web app (`project/ui_kits/web_app/`) passa a usar só este pacote, pelo bundle de navegador. Mudanças internas sem efeito visual: `Icons` é construído sobre `Ph` — o `<i>` de cada ícone ganha `color: currentColor` inline (a mesma cor herdada de antes) e `aria-hidden` passa a vir antes de `style`; as keyframes compartilhadas foram consolidadas — o `<style id="ob-prim-kf">` deu lugar a `ob-spin-kf` (injetado uma vez, usado por `Spinner` e `SearchInput`) e `ob-pulse-kf` (injetado pelo `Table`), com as mesmas regras `@keyframes`. Infra: os smokes de marcas e do `Logo` leem fixtures congeladas em `scripts/fixtures/`; novo `scripts/smoke-web-app.mjs` confere, sem navegador, que o web app roda só com o bundle.

## 0.5.1

### Patch Changes

- `Select`: o primeiro clique no campo (sem foco) agora abre a lista; antes ela abria e fechava em seguida, e só o segundo clique abria. Clicar na seta, no espaço vazio do campo ou no corpo de um chip com a lista aberta agora fecha e mantém fechada (antes reabria por causa do refoco). Ao fechar por clique o foco não volta ao campo.

## 0.5.0

### Minor Changes

- Fase 3 (endurecimento). Mudança visível: `Pagination` passa a mostrar as duas reticências quando há páginas escondidas dos dois lados (`1 … 5 6 7 … 20`). Quebras de tipo: `SelectProps` (desde a 0.4.0) e agora `SliderProps` são uniões discriminadas por `multi` e `range`; deixam de compilar `interface X extends SelectProps`, `Omit<SelectProps, …>` repassado a `<Select {...p}/>`, `SelectProps['onChange']` com parâmetro implícito e `<Select multi={variavelBoolean}/>` (o mesmo vale para `SliderProps` e `range`); use os tipos exportados `SelectBaseProps`/`SliderBaseProps` ou um ramo da união (`SingleSelectProps`, `MultiSelectProps`, `SingleSliderProps`, `RangeSliderProps`). Correções: o botão de remover do `Chip` tem `type="button"` (não envia mais formulário); o `Slider` não gera `NaN` com `min === max` e não deixa listeners pendurados ao desmontar durante um arrasto; o `Tooltip` não fica mais preso aberto com hover e foco juntos. Acessibilidade: `Toggle` vira um switch (`role="switch"`, `aria-checked`, foco por Tab, Espaço/Enter); `Modal` ganha `role="dialog"`, `aria-modal`, título associado e botão de fechar nomeado; `Pagination` ganha `<nav aria-label>`, `aria-current` e setas nomeadas. Infra: teste de tipos contra o `.d.ts` publicado (`npm run typecheck:dist`), golden do CSS injetado com ordem, runner de smokes que falha sem smokes, `README.md` do pacote.

## 0.4.0

### Minor Changes

- Adiciona Icons, Brands, BrandTile, Link, Pagination e Modal (Fase 2, Lote C); Table aceita interface como tipo de linha e Select ganha props discriminadas por multi (onChange recebe string no modo simples e string[] no multi); migra components-link, components-pagination e components-modal.

## 0.3.1

### Patch Changes

- Exporta os tipos OBTone e OBToastPosition, usados nas props públicas de Alert, Toast, ProgressBar e ToastStack.

## 0.3.0

### Minor Changes

- Adiciona Alert, ProgressBar, Toast, ToastStack, Drawer, CodeInput, SearchInput, SideNav, Tabs, Table, DeadlineCalendar, Select e Input (Fase 2, Lote B); migra components-slider.html.

## 0.2.0

### Minor Changes

- Adiciona Radio, RadioGroup, Toggle, Skeleton, Tooltip, Chip, StatusDot, Badge, Card, Avatar, Spinner, ProgressCircle e Slider (Fase 2, Lote A).

## 0.1.0

### Minor Changes

- Primeira versão do pacote: Ph, Button, Checkbox, FieldShell, Datepicker, FloatingPanel e Dropdown portados para TypeScript.
