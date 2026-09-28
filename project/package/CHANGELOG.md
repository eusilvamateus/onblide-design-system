# @onblide/ui

## 1.1.0

### Minor Changes

- Adiciona `ToggleButton` (botão com dois estados, pressionado e não pressionado, com `aria-pressed`) e
  `ButtonGroup` (agrupa `Button`/`ToggleButton` relacionados, anexados ou espaçados, com split button via
  `Menu` e seleção única ou múltipla via `ToggleButton`).

## 1.0.1

### Patch Changes

- `CodeInput` passa a usar `--ob-font-mono` (JetBrains Mono) nos dígitos, alinhado à
  convenção do design system para números e código — antes usava `--ob-font` (Poppins)
  por descuido.

## 1.0.0

### Major Changes

- Remove o componente `DeadlineCalendar`. Ele nasceu como uma variante do calendário feita
  para uma implementação específica e nunca deveria ter virado componente do design system —
  não há substituto, nem migração: quem precisar dessa funcionalidade deve construí-la fora
  do pacote.

## 0.16.0

### Minor Changes

- `Menu` ganha a prop `defaultOpen`, para montar o painel já aberto em demonstrações e capturas de tela (mesmo padrão do `Popover`).

  Corrige também um regex de normalização de texto (usado por `Autocomplete` e `TreeView` para busca sem acento) que guardava os caracteres Unicode literais em vez do escape `̀-ͯ`, o que podia corromper em pipelines que leem o arquivo com uma codificação diferente de UTF-8. Passa a usar `\p{Diacritic}`, sem nenhum caractere não-ASCII na fonte.

## 0.15.0

### Minor Changes

- 13 componentes novos, portados das propostas aprovadas no Claude Design: `Divider`, `List` (+ `ListItem`, `ListSubheader`, `ListDivider`), `Breadcrumbs`, `Textarea`, `NumberField`, `FileUpload`, `Autocomplete`, `Menu` (+ `ContextMenu`, `MenuPanel`), `Menubar` (+ `KeyList`), `Popover`, `Stepper` e `Timeline`. `TreeView` também entra nesta leva, com seleção simples/múltipla, busca, carregamento sob demanda, edição e arrastar-para-mover.

  Todos seguem o padrão já estabelecido no pacote: TypeScript estrito, tokens do design system, ARIA e teclado completos, smoke tests e demos/guias no site de documentação.

## 0.14.0

### Minor Changes

- **Breaking:** o componente `Toggle` foi renomeado para `Switch` (junto com o tipo `ToggleProps` → `SwitchProps`), alinhando o nome ao papel ARIA que ele já tinha (`role="switch"`) e ao nome mais usado no mercado para essa forma — pílula com bolinha deslizante, liga/desliga imediato. `Toggle` não existe mais; troque `import { Toggle } from '@onblide/ui'` por `import { Switch } from '@onblide/ui'` (mesma API, só o nome muda).

## 0.13.6

### Patch Changes

- Table: clicar num cabeçalho `sortable` agora ordena de verdade — sem `onSort`, a Table cicla crescente → decrescente → sem ordenação sozinha, reconhecendo data em `dd/mm/aaaa`, número e texto. `onSort` continua disponível para ordenação controlada (paginação no servidor, por exemplo), caso em que a Table só avisa a coluna clicada e não reordena por conta própria.

## 0.13.5

### Patch Changes

- Table: a linha embaixo do cabeçalho passa a usar a mesma cor das linhas do corpo (`--ob-line-soft`); só o contorno externo mantém `--ob-border`. A hierarquia do cabeçalho vem da tipografia, e a linha deixa de parecer mais grossa que as demais.

## 0.13.4

### Patch Changes

- Table: a última linha não tem mais borda de baixo (ela se somava à borda do invólucro numa linha de 2px no rodapé) e a linha do cabeçalho passa de 1,5px para 1px, sem espessura fracionada que engrossava em telas com escala. Vale para os estados normal, selecionável, carregando e vazio; novo smoke `smoke-table.mjs` garante isso.

## 0.13.3

### Patch Changes

- Checkbox: check marcado passa a usar o `check-fat` (fill) do Phosphor em 12px, que lê como marcado de fato — o check bold em 14px tinha traço de ~1,3px, visualmente igual ao regular. O indeterminado usa o minus bold oficial com contorno extra para ter a mesma espessura do check.

## 0.13.2

### Patch Changes

- `Checkbox`: check e traço passam a ser os SVGs oficiais do Phosphor (peso bold, `@phosphor-icons/core`, embutidos no build) em 14px, centralizados pela geometria — antes eram glifos de fonte de 12px, finos e deslocados em meio pixel. O contorno vira sombra interna (miolo de 18px inteiros, 2px de respiro exatos) e a caixa fica alinhada ao pixel mesmo em posição fracionada. `Radio` recebe a mesma correção no ponto central. Os dois usam entrelinha de 18px no rótulo.

## 0.13.1

### Patch Changes

- `SideNav`: itens, seções e grupos deixam de encolher quando a lista não cabe na altura (os itens ficavam esmagados, com cerca de metade da altura); no modo `flush` a lista rola. O item ativo perde a barra vertical sólida: fundo azul-claro e texto azul marcam a seleção.

## 0.13.0

### Minor Changes

- Biblioteca Phosphor inteira, nos seis pesos. `Ph` e `Icons` ganham a prop `weight` (`regular`, `fill`, `bold`, `light`, `thin`, `duotone`; padrão `regular`) e `styles.css` passa a carregar as seis fontes (cada uma só é baixada quando usada). Os componentes aplicam o peso pelo papel: `fill` no item ativo do `SideNav`, na aba ativa dos `Tabs` e no ícone de status do `Alert` e do `Toast`; `bold` em ícones de até 14px e no check/traço do `Checkbox`, que agora usam o mesmo peso e ficam centralizados. A `Table` passa a usar o `Checkbox` do design system (com estado indeterminado no "selecionar tudo") e `Checkbox` ganha `ariaLabel`. `Chip`, `SearchInput` e `DeadlineCalendar` deixam de montar `<i class="ph">` à mão.

## 0.12.0

### Minor Changes

- `SideNav`: itens aceitam `children` e viram grupos que abrem e fecham, com seta; o grupo começa aberto quando contém o item ativo.

## 0.11.1

### Patch Changes

- `Checkbox`: o rótulo inteiro passa a alternar a seleção (antes só o quadrado respondia ao clique), com `role="checkbox"`, `aria-checked` (incluindo `mixed` no indeterminado), foco por teclado e Espaço/Enter.
- Todas as props dos componentes ganham descrição (JSDoc), que aparece nos tipos, na documentação e no Claude Design. Os exemplos passam a cobrir as variantes que faltavam.

## 0.11.0

### Minor Changes

- Novos tokens de realce de sintaxe (`--ob-code-tag`, `--ob-code-attr`, `--ob-code-string`, `--ob-code-number`, `--ob-code-punct`, `--ob-code-comment`, `--ob-code-text`), derivados da paleta e válidos nos temas claro e escuro.

## 0.10.0

### Minor Changes

- `SideNav`: novas props opcionais `hideBrand`, `hideAccount` e `menuLabel` para usar o componente como lista de navegação simples, sem a marca e sem a conta do usuário. O comportamento padrão não muda.

## 0.9.2

### Patch Changes

- Unifica os tokens: `src/tokens.css` passa a ser o único arquivo (o antigo `colors_and_type.css` da raiz e a pasta `fonts/` duplicada foram removidos) e as páginas de `ds/` apontam para ele.

## 0.9.1

### Patch Changes

- Remove o web app de demonstração (`ui_kits/web_app`) e o smoke que o executava; o pacote não muda.

## 0.9.0

### Minor Changes

- `Brands` e `BrandTile` passam a usar os glifos oficiais de marca do Phosphor (`ph-<marca>-logo`, já presentes no webfont), na cor de cada marca, no lugar dos SVGs desenhados à mão. Marcas sem glifo no Phosphor não são implementadas.

## 0.8.3

### Patch Changes

- Reorganiza o código-fonte por papel na interface (`actions`, `forms`, `feedback`, `overlays`, `navigation`, `data-display`, `brand`, `iconography`), no lugar da divisão antiga `components`/`primitives`. A API pública não muda.

## 0.8.2

### Patch Changes

- `Datepicker`: qualquer dia do calendário ganha destaque ao passar o mouse (ou receber foco), em todos os modos, não só na pré-visualização do intervalo.

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
