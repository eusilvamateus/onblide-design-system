# @onblide/ui

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
