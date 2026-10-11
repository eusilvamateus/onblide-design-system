# @onblide/ui

## 5.0.0

### Major Changes

- Toast que dá para disparar, escolher a posição e testar de verdade.

  Quebra de compatibilidade: o global `window.obToast` e o evento `ob-toast` foram removidos. Use a função exportada `toast`: `toast({ tone, title, body, action, onAction, icon, duration })` e os atalhos `toast.success`, `toast.info`, `toast.warning` e `toast.danger`; `toast.dismiss(id)` fecha um toast (ou todos, sem id). O módulo não escreve mais em `window` ao ser importado.

  Correções e novidades no `ToastStack`:

  - Cada toast agora vai para uma fila só. Antes, todo `ToastStack` na página recebia o mesmo toast e ele aparecia duplicado em várias posições; a nova prop `name` (com `stack` no toast) permite ter várias filas.
  - Novas props `duration` (0 mantém até fechar) e `limit`. A duração padrão passou de 4,8 s para 5 s.
  - Passar o mouse sobre a fila pausa a contagem, como o guia já prometia.
  - A fila ganha `role="region"` e nome acessível, e o `id` fixo virou classe, para poder haver mais de uma na página.

## 4.2.0

### Minor Changes

- FileUpload com foto de perfil de verdade: na variante `image`, a área toda (foto, botão e texto) aceita arrastar e soltar, com destaque e "Solte aqui", e a foto vazia convida a adicionar. As novas props `shape="circle"` e `size` deixam a prévia redonda e do tamanho que você precisar. Com foto, as ações viram botões só com ícone e tooltip (trocar e remover), passar o mouse na foto mostra "Trocar", e o envio mostra um progresso circular sobre a imagem. O botão de escolher imagem ganha ícone, a variante `button` avisa que dá para arrastar, e a lista de arquivos mostra miniatura das imagens.

## 4.1.0

### Minor Changes

- Navegação ampla no Calendar e no Datepicker: clicar no mês do cabeçalho abre a grade dos 12 meses, e clicar no ano abre um bloco de 12 anos, com setas que passam de ano em ano e de 12 em 12 anos. A escolha desce de nível (ano, mês, dia) e Esc volta um nível. Meses e anos inteiros fora de `min` e `max` ficam desabilitados, e a nova prop `openTo` define a vista inicial (`days`, `months` ou `years`).

## 4.0.1

### Patch Changes

- No Calendar e no Datepicker em modo intervalo, cada dia do intervalo volta a ser um quadrado arredondado próprio, com espaço entre eles, em vez de uma faixa contínua.

## 4.0.0

### Major Changes

- Catálogo revisado para ficar só com componentes comuns nos design systems conhecidos, e cada peça sobre a base certa.

  Quebras de compatibilidade:

  - O `Datepicker` foi reescrito sobre o novo `Calendar`. `value`, `defaultValue` e `onChange` usam `Date` (ou um intervalo com `start` e `end` no modo `range`), `mode="range"` substitui `singleDate`, e `min`, `max`, `isDateDisabled` e `weekStartsOn` substituem `minBookingDate` e `maxBookingDays`. Saem `DatepickerValues`, `showSubmitButton`, `resetOnSubmit`, `submitLabel`, `clearLabel`, `startDateLabel` e `endDateLabel`.
  - O `SearchInput` é só o campo de busca: saem `results`, `onSelect` e o tipo `SearchInputResult` (use o `Autocomplete` para sugestões); entram `ariaLabel` e `disabled`.
  - Saem do pacote `Dropdown` (use o `Menu`), `KeyList`, `Brands` e `BrandTile`. `FloatingPanel` e `StatusDot` passam a ser internos.

  Novidades:

  - Novos componentes: `Calendar`, `Kbd`, `AvatarGroup`, `EmptyState`, `Accordion` e `AlertDialog`.
  - `Modal` ganha `role` e `closeButton`. `Avatar` aceita até três caracteres em `initials`.
  - `Select`, `Autocomplete` e `Menu` abrem para cima quando falta espaço embaixo, com o posicionamento compartilhado com o `Popover`.
  - `Tooltip` e `Menu` desenham atalhos com o `Kbd`.
  - O `Breadcrumbs` recolhe os níveis num `Menu`.

## 3.1.1

### Patch Changes

- Componentes alinhados às regras do design system. Alert, Toast, Modal, Drawer e Popover usam o `Button` (neutral, iconOnly) no botão de fechar, e o Drawer passa a usar o ícone do Phosphor no lugar do caractere de texto. As ações de Alert e Toast também usam `Button`. O contador de SideNav e Tabs usa o `Badge`, e o botão de remover do Chip usa o ícone do Phosphor. Cores e sombras fixas viraram tokens: `--ob-fg-on-color`, `--ob-scrim` (o fundo de Modal e Drawer agora acompanha o tema escuro), `--ob-shadow-xs`, `--ob-shadow-md`, `--ob-shadow-pop` e `color-mix` sobre os tokens de tom no Slider. Corrige o rótulo do ProgressBar, que mostrava valores acima de 100% ou abaixo de 0%. Remove os comentários do código dos componentes.

## 3.1.0

### Minor Changes

- Gerenciador de aparência: `themeManager` (init, get, set, subscribe), hook `useTheme()` e `themeInitScript` (também em `@onblide/ui/theme-init`) para evitar o flash no carregamento. Escolha entre claro, escuro e sistema, persistida em `localStorage` e sincronizada entre abas. O tema claro agora também existe em `[data-theme="light"]`, então uma região clara dentro de uma página escura volta aos tokens claros.

## 3.0.0

### Major Changes

- Navbar: removido `NavbarIconButton`, que duplicava o Button. Use `<Button kind="neutral" iconOnly aria-label="..." icon={<Icons.bell size={20} />} count={3} />` nas `actions`; o botão de menu da Navbar (`onMenuToggle`) também passa a ser um Button.

## 2.4.0

### Minor Changes

- Button: novo estilo `neutral` (transparente, com fundo sutil no hover), props `pressed` (marca `aria-pressed` e destaca o fundo no `neutral`) e `count` (contador em badge no canto) e anel de foco visível ao navegar pelo teclado.

## 2.3.0

### Minor Changes

- SideNav: o rodapé de conta usa o componente Avatar e aceita foto (`accountImage` e `accountImageAlt`, com volta às iniciais se a imagem falhar), os botões de recolher e abrir usam o Button com `iconOnly`, e o nome e o detalhe da conta ficam alinhados à esquerda.

## 2.2.0

### Minor Changes

- Button: nova prop `iconOnly` para botão só com ícone, quadrado (32, 40 ou 48px conforme `size`), sem texto; exige `aria-label`.

## 2.1.0

### Minor Changes

- Avatar: as iniciais passam a ser a primeira letra da primeira e da última palavra do nome ("Mateus Silva" vira "MS", antes saía "MA"; com uma palavra só continuam as duas primeiras letras) e a nova prop `initials` substitui as iniciais geradas.

## 2.0.0

### Major Changes

- SideNav: a marca deixa de ser texto. Removido `brandName`; `brand` agora é a logo horizontal (padrão: logo da Onblide) e o novo `brandMark` é o símbolo exibido recolhida. Removido `workspaceName`; o rodapé usa `accountName` (padrão "Conta"), o novo `accountDetail` (linha secundária) e iniciais derivadas do nome quando `userInitials` é omitido. O botão de abrir a barra recolhida existe mesmo com `hideBrand` (ícone `caret-right`), e o botão sobre a logo ganha contorno ao passar o mouse. O rótulo de acessibilidade do rodapé passa a ser `Abrir menu de` + o nome da conta.

## 1.6.4

### Patch Changes

- SideNav: os botões de recolher e abrir ficam com aparência fixa e só trocam de ícone ao passar o mouse (`caret-left` → `caret-line-left` na borda; logo → `caret-line-right` quando recolhida).

## 1.6.3

### Patch Changes

- SideNav: os botões de recolher e abrir têm o mesmo formato (quadrado arredondado) e o mesmo par de ícones (`caret-line-left`/`caret-line-right`), com efeito de hover que desloca o ícone e destaca a borda; sobre a logo, ela se dissolve no ícone.

## 1.6.2

### Patch Changes

- SideNav: a barra de rolagem da lista fica fina e só aparece quando o mouse está sobre a lista, sem setas.

## 1.6.1

### Patch Changes

- SideNav: os botões de recolher e abrir usam o mesmo glifo (`caret-left`/`caret-right`), só espelhado.

## 1.6.0

### Minor Changes

- SideNav: botão circular de recolher na borda da barra (com `onToggle`), logo que vira o botão de abrir ao passar o mouse quando recolhida, largura fixa de 72px recolhida mesmo com `flush`, lista rolável separada do rodapé e menu de conta que não é mais cortado. Menu ganha `placement` `right`/`right-end` e `block`. Tooltip passa a ter texto legível no tema escuro.

## 1.5.1

### Patch Changes

- `Table`: o tamanho da fonte do conteúdo passa de 14px fixo para `var(--ob-fs-xs)` (12px), acompanhando o token tipográfico em vez de um número solto.

## 1.5.0

### Minor Changes

- `SideNav`: o nome da marca no cabeçalho (`brandName`, ou `brand` pra substituir o bloco inteiro) e o nome da conta no rodapé (`accountName`) agora são configuráveis, em vez de "Onblide" fixo no código. O rodapé de conta virou um gatilho de `Menu` (Perfil/Configurações/Sair por padrão, customizável via `accountMenu`/`onProfile`/`onSettings`/`onSignOut`), em vez de um bloco estático.

  `Menu`: nova prop `placement` (`'bottom' | 'top' | 'auto'`, padrão `'auto'`). Com `auto`, mede o espaço abaixo do gatilho e abre o painel para cima quando necessário — usado pelo rodapé de conta da `SideNav`, mas disponível em qualquer `Menu`.

## 1.4.0

### Minor Changes

- Implementa de verdade a prop `maxBookingDays` do `Datepicker`, antes aceita mas sem nenhum efeito. Com ela definida, dias além do limite (contado a partir da data inicial) ficam desabilitados no calendário e a digitação manual de uma data final além do limite mostra erro.

## 1.3.0

### Minor Changes

- Adiciona suporte a imagem no `Avatar` (`src`/`alt`), com fallback automático pras iniciais quando a imagem não é informada ou falha ao carregar.

## 1.2.0

### Minor Changes

- Adiciona `LogoMark`, o símbolo isolado da marca Onblide (sem o wordmark), e passa a usá-lo como marca
  padrão do `Navbar` e no cabeçalho da `SideNav`. No modo recolhido da `SideNav`, o botão de expandir some por
  trás do símbolo e só aparece no hover/foco, em vez de disputar espaço com ele o tempo todo.
- Adiciona o componente `Navbar`: barra de navegação superior com três layouts (`links`, `search`, `context`), segundo nível opcional (`secondary`), modo compacto e responsivo, e os subcomponentes `NavbarLink`, `NavbarIconButton` e `NavbarAccount`.

## 1.1.2

### Patch Changes

- `Avatar` passa a aceitar imagem por `src`, com `alt` opcional e fallback para as iniciais quando não houver imagem.

## 1.1.1

### Patch Changes

- Corrige um vão de 1-2px que podia aparecer nas linhas conectoras do `Stepper` (variante `horizontal`), em
  telas com `devicePixelRatio` 1. Cada conector é desenhado em duas metades, uma de cada célula vizinha, que
  arredondavam a largura fracionária pra baixo de forma independente.

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
