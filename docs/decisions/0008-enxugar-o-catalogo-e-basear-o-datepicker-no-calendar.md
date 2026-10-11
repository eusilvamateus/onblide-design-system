# 0008. Enxugar o catálogo e basear o Datepicker em um Calendar

## Contexto

Uma revisão do catálogo (2026-10-11) mostrou componentes que cresceram sem a base que deveria vir antes deles e
outros que não existem nos design systems conhecidos. O `Datepicker` tinha a grade do calendário embutida e props
de domínio de reserva; havia dois menus de ações (`Dropdown` e `Menu`); peças de apoio (`FloatingPanel`,
`StatusDot`) eram públicas; e o pacote exportava logos de terceiros (`Brands`, `BrandTile`).

## Decisão

- **Calendar** passa a existir como componente (modos `single` e `range`, teclado completo) e o **Datepicker** é
  reescrito sobre ele, com o `Popover` e o `FieldShell`. As props de reserva saem; entram `min`, `max`,
  `isDateDisabled`, `weekStartsOn` e `mode`. As datas passam a ser `Date`.
- **Posicionamento compartilhado:** a lógica de escolher o lado e alinhar o painel sai do `Popover` para
  `src/internal/floating.ts`, e `Select`, `Autocomplete` e `Menu` passam a virar para cima quando falta espaço.
- **Removidos do pacote:** `Dropdown` (use o `Menu`), `KeyList`, `Brands` e `BrandTile`. `FloatingPanel` e
  `StatusDot` ficam internos.
- **`SearchInput`** vira só o campo de busca; a lista de sugestões é papel do `Autocomplete`.
- **Novos, por serem comuns no mercado:** `Kbd`, `AvatarGroup`, `EmptyState`, `Accordion` e `AlertDialog`
  (feito sobre o `Modal`, que ganha `role` e `closeButton`).
- Fora do escopo por ora: primitivas de layout (`Stack`, `Grid`) e componentes de texto (`Text`, `Heading`).
  `Menubar` permanece.

## Consequências

- Versão **major**: quem usava as props de reserva do `Datepicker`, a lista de resultados do `SearchInput` ou os
  componentes removidos precisa migrar.
- Logos de marcas de terceiros: usar os glifos `*-logo` do Phosphor pelo `Ph`.
- A regra de manter o catálogo restrito ao que é comum está no `project/CLAUDE.md`.
