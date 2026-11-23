# @onblide/ui

## 1.0.0

### Major Changes

- 0478457: `Input`: `icon` passa a se chamar `startIcon`, o par do `endIcon`, e também aceita um botão compacto, como o `endIcon`. Para atualizar, troque `icon=` por `startIcon=` nos `Input`. O `NumberField` ganha `startIcon` também. Um ícone decorativo nos dois lados fica no recuo do texto; um `Button` fica no recuo dos botões internos.
- 92abf4a: Nova pintura `plain` no vocabulário de `appearance` (tipo `Appearance`): superfície e borda neutras, com a cor do tom só no ícone.

  - `Alert`: aceita `plain` (padrão), `outline` e `soft`. O padrão continua com o visual de antes (superfície, borda neutra e ícone na cor do tom), agora com o nome `plain`. `appearance="outline"` passa a usar o fundo clarinho do tom (`--ob-*-050`) com uma borda de 1px na cor do tom, na mesma receita do `Badge` (35%, 45% no `warning` e 40% no `danger`).
  - **`Toast`, `toast()` e `ToastStack`: o antigo `appearance="outline"` passa a se chamar `plain`**, sem mudar o visual, e `plain` é o novo padrão. **`outline` passa a ser o fundo clarinho com a borda na cor do tom** (o visual do antigo `soft`, agora na receita de borda do `Alert`), e **`soft` perde a borda**, ficando só com o fundo clarinho do tom.

- 0b06aef: **`SideNav` passa a se chamar `Sidebar`** (`SideNavItem` → `SidebarItem`, `SideNavProps` → `SidebarProps`), com uma API no modelo de mercado:

  - itens são links de verdade (`href`) dentro de `<nav aria-label>`, com `aria-current="page"` no ativo; `onNav` intercepta só o clique simples, e Ctrl+clique e o botão do meio abrem em outra aba; item sem `href` vira botão;
  - **`items` com `section` dá lugar a `groups`** (`{ label?, items }[]`); o rótulo "Menu" (`menuLabel`) sai;
  - **marca e conta embutidas saem** (`brand`, `brandMark`, `hideBrand`, `hideAccount`, `accountName`, `accountDetail`, `userInitials`, `accountImage`, `accountImageAlt`, `accountMenu`, `onProfile`, `onSettings`, `onSignOut`); no lugar, `header` e `footer` livres, que aceitam uma função de `{ collapsed }`;
  - **`onToggle` dá lugar a `collapsible`, `collapsed`, `defaultCollapsed` e `onCollapsedChange`**: aberta, um botão com o ícone de barra lateral (`sidebar-simple`) sobre a borda direita aparece no hover da barra e no foco; recolhida, o cabeçalho vira o botão de expandir, com o ícone no lugar da marca no hover e no foco; em telas de toque, os dois ficam sempre visíveis; `toggleShortcut` liga um atalho com Ctrl ou ⌘ (como Ctrl+B), mostrado no `Tooltip`; recolhida, cada item mostra o rótulo no `Tooltip`, o contador vira ponto, os títulos de grupo viram divisórias e os subitens abrem num `Menu` ao lado;
  - **`flush` dá lugar a `variant="floating" | "flush"`**;
  - com `onMobileOpenChange`, abaixo de `sm` (768px) a barra abre num `Drawer` controlado por `mobileOpen`;
  - o contador é neutro por padrão, com `badgeTone`.

  Na `Navbar`, **`NavbarAccount`, `NavbarAccountProps` e `NavbarLink` saem**: a conta é montada com `Menu`, `Button` e `Avatar`. **A marca padrão sai** (`brand` vazio não mostra marca, sem o link falso `href="#"`). Com `onNav`, só o clique simples é interceptado; item sem `href` vira botão; novos `badgeTone` (contador neutro por padrão) e `menuOpen` (marca `aria-expanded` no botão de menu). Novos tipos `SidebarGroup`, `SidebarVariant`, `SidebarState` e `SidebarSlot`.

- b8ac36b: Tipografia completa. Pesos de 100 a 900 com os nomes da indústria (`--ob-w-thin`, `extralight`, `light`, `regular`, `medium`, `semibold`, `bold`, `extrabold`, `black`); **`--ob-w-black` passa de 800 para 900**, e quem queria 800 usa `--ob-w-extrabold`. A escala de tamanhos passa a ter o nome igual ao valor, como o espaçamento: `--ob-fs-10` a `--ob-fs-88` (10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 28, 36, 48, 64, 88); **saem `--ob-fs-xs` a `--ob-fs-5xl`** (xs → 12, sm → 14, base → 16, md → 18, lg → 22, xl → 28, 2xl → 36, 3xl → 48, 4xl → 64, 5xl → 88). Novos `--ob-lh-none`, `--ob-lh-display`, `--ob-tracking-tighter` e `--ob-tracking-normal`; **sai `--ob-tracking-wide`**. Novos estilos de texto `h6`, `.ob-body-lg`, `.ob-body-sm`, `.ob-label` e `.ob-numeric`; **`.ob-lead` sai, substituído por `.ob-body-lg`**; `.ob-eyebrow` passa a JetBrains Mono sem caixa-alta, e `.ob-caption` a 13px. A tipografia não usa mais caixa-alta: o cabeçalho da `Table` e as seções da `SideNav` ficam em JetBrains Mono de 12px, peso médio. A `Table` ganha `numeric` por coluna (à direita e em JetBrains Mono, para as casas alinharem), e os números da `Pagination`, o contador do `Textarea` e a porcentagem do `FileUpload` passam à fonte mono, porque a Poppins não tem algarismos de largura fixa. Os componentes deixam de escrever tamanho e peso à mão (o título do `Drawer` vai de 17 para 18px, o número do `CodeInput` grande de 26 para 28px e o do `ProgressCircle` menor de 9 para 10px). As fontes passam a `woff2` com `font-display: swap` (de 13 MB para 3,2 MB), a variante JetBrains Mono NL, que nada usava, sai, e o corpo deixa de ligar `ss01` e `cv11`.

### Minor Changes

- 3aacb07: `Accordion` ganha `attached` (padrão `true`, igual ao visual atual; com `false`, cada item fica solto com 8px entre eles), `appearance` (`outline`, padrão, ou `ghost`, sem borda externa nem fundo), tamanhos `sm`, `md` (padrão) e `lg`, e `headingLevel` (`2` a `6`, padrão `3`) para o título de cada cabeçalho seguir a hierarquia da página. Ao abrir e fechar, o conteúdo agora anima a altura com `--ob-dur-base` e respeita o movimento reduzido; fechado, continua fora do alcance do Tab e do leitor de tela. Novos tipos `AccordionAppearance`, `AccordionSize` e `AccordionHeadingLevel`.
- 9717835: `Alert`: novo visual e prop `appearance`. O padrão `outline` usa a superfície, borda neutra e só o ícone colorido; `soft` usa o fundo clarinho do tom. A ação vira um `Button` pequeno com ícone Phosphor à direita do conteúdo. O alerta fica mais baixo (preenchimento de 12px) e o corpo passa a 14px. `info` e `success` passam a `role="status"`; `warning` e `danger` continuam em `role="alert"`. Novas props: `icon`, e o componente repassa atributos como `className`, `style` e `role`. Tokens novos no tema escuro: `--ob-green-050`, `--ob-orange-050` e `--ob-red-050`.
- 3c03bee: Adiciona o hook `useDragAndDrop` e a função `applyDragMove`, para arrastar e soltar entre listas verticais no padrão do design system: o próprio item sobe 1% com a sombra média, segue o ponteiro enquanto os vizinhos abrem espaço e uma vaga mostra onde ele vai cair, e ao soltar viaja até a vaga sem quique, tudo com os tokens de movimento (e imediato com `prefers-reduced-motion`). Funciona com mouse (o item inteiro), toque (pela alça) e teclado (Espaço, setas e Esc), avisa o leitor de tela, recusa destinos com `canDrop` e chama `onMove` uma vez, ao assentar. Dentro de um `ScrollArea` ou de outra área com rolagem própria, o hook encontra a área sozinho: rola a área perto da borda, mantém a vaga dentro da lista e, com o ponteiro, faz uma cópia idêntica do item viajar por cima da página, sem ser cortada pela borda.
- dfa4aa9: `Badge`: nova pintura `ghost`, só com o texto e o ponto ou ícone, sem fundo, borda nem preenchimento, para listas densas.
- 4c57762: `Badge`: nova prop `icon`, que mostra um ícone Phosphor no lugar do ponto. O ícone segue a cor do texto, usa o peso `bold` e tem 14px no tamanho `md` e 12px no `sm`. É ignorado na variante `numeric`.
- a499cca: `Badge`: aceita a pintura `plain`, com superfície, borda fina e texto neutros e a cor do tom só no ponto ou no ícone.
- 9717835: **Quebra de compatibilidade.** Os breakpoints viram uma escala única, mobile-first, usada de verdade pelo pacote (veja a página "Breakpoints" na documentação).

  - Escala: `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px; abaixo de `sm` é a faixa `base`. O `--ob-bp-xs` (480px) foi removido.
  - Novos exports: `BREAKPOINTS` (os valores em px), `BREAKPOINT_ORDER`, `mediaQuery(nome)` (devolve `(min-width: 1024px)` para `md`), o hook `useBreakpoint()` (devolve `current` e `atLeast(nome)`; no servidor a faixa é `base`) e os tipos `Breakpoint` e `BreakpointName`.
  - Tokens de grade renomeados para os nomes da escala: `--ob-grid-cols-mobile|tablet|desktop` viram `--ob-grid-cols`, `--ob-grid-cols-sm`, `--ob-grid-cols-md`; o mesmo vale para `--ob-grid-gutter-*` e `--ob-grid-margin-*`.
  - `--ob-max-w-*` vira `--ob-container-*`, e cada nome vale o mesmo que o breakpoint de mesmo nome: `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px. `--ob-max-w-page` vira `--ob-container-page` (1280px). Saíram `--ob-max-w-sm` (640px) e `--ob-max-w-2xl`; o antigo `--ob-max-w-md` (768px) corresponde a `--ob-container-sm`, e `--ob-max-w-lg` (1024px) a `--ob-container-md`.
  - `Modal`: abaixo de `sm`, os tamanhos `md`, `lg` e `full` ocupam a tela inteira; o `sm` (e o `AlertDialog`) continua um cartão centralizado. A partir de `sm`, nada muda.
  - `ToastStack`: o modo celular (centralizado, quase na largura da tela) passa a valer abaixo de `sm` (768px), não mais abaixo de 600px. O posicionamento sai do estilo inline e vai para CSS mobile-first, sem `!important`.

- 9717835: `Button` ganha `countTone` para escolher o tom do contador entre os tons do `Badge`. Sem ele, o contador segue vermelho, e passa a ser azul no estilo `danger`, onde o vermelho se perdia no fundo.
- 7ff7c28: `Button` ganha `loading`: um `Spinner` na cor do texto ocupa o lugar do conteúdo, a largura não muda e o botão ignora cliques até terminar, sem perder o foco. `AlertDialog` ganha `loading`: o botão de confirmar entra em carregamento, o de cancelar fica desabilitado, e Esc e o backdrop deixam de fechar enquanto a confirmação está em andamento.
- 9717835: `Button`: novo estilo `kind="quiet"` e nova prop `tone` (`neutral`, `primary`, `success`, `warning`, `danger`). Em repouso o botão é neutro, sem borda nem fundo; no hover, no foco visível e quando `pressed`, o ícone e o texto assumem a cor do tom, com um fundo leve do mesmo tom. Serve para ações em ícone como aprovar, editar e excluir.

  `ToggleButton`: nova prop `tone` (`primary`, `success`, `warning`, `danger`) que define a cor do estado pressionado, antes sempre azul.

- 9717835: Nova prop `fill` no `Button` do estilo `quiet`: com `fill={false}` o hover, o foco e o `pressed` mudam só a cor do ícone e do texto, sem o fundo leve do tom. O anel de foco do teclado continua.
- ac7b787: Painéis flutuantes deixam de ser cortados ou escondidos por Modal, Drawer, Accordion, Table e áreas com rolagem.

  - A lista do `Select` e do `Autocomplete` e o painel do `Menu`, do `ContextMenu` e do `Menubar` abrem no `body`, presos ao gatilho, e vão para o lado oposto quando falta espaço.
  - O `Modal` e o `AlertDialog` abrem no `body` e ficam acima do `Drawer`: uma confirmação aberta de dentro de um drawer aparece na frente dele.
  - Nova ordem das camadas: `--ob-z-dropdown` 500, `--ob-z-toast` 600, `--ob-z-tooltip` 700 e `--ob-z-drag` 800, acima de `--ob-z-overlay` (Drawer, 300) e `--ob-z-modal` (Modal, 400). `Popover`, `Datepicker` e `Tooltip` passam a aparecer dentro de Modal e Drawer.
  - O Esc fecha só a lista ou o menu aberto, sem fechar o Modal ou o Drawer em volta.

- 83ce124: `Checkbox` passa a ter um `<input type="checkbox">` nativo por baixo da caixa desenhada, como nos design systems do mercado. Ganha `name`, `value` e `required` para formulários e `error`, que mostra a mensagem no lugar da descrição e deixa a borda vermelha. O Espaço marca e desmarca; o Enter deixa de alternar a caixa e fica livre para enviar o formulário. Ganha hover, anel de foco ao navegar pelo teclado e um leve encolhimento ao pressionar. A borda passa a ter 1px em `--ob-fg-mute`, mais visível quando desmarcada, e o check passa a ser o `check` bold do Phosphor, com a mesma espessura do traço do indeterminado. O nome acessível vem só do `label`, e a descrição fica ligada por `aria-describedby`.
- 9717835: `Chip` ganha o tamanho `lg`, com texto, espaçamento, ícone e botão de remover proporcionais, completando a escala `sm`, `md` e `lg` que o `Button` já tem.
- 9717835: Nova prop `tone` no `Chip` (`neutral`, `primary`, `success`, `warning`, `danger`): fundo leve e texto no tom em repouso, e preenchido com a cor forte quando selecionado. O `Chip` sem `selected` nem `onToggle` agora é um botão de ação simples e não emite mais `aria-pressed`; com qualquer um dos dois continua sendo uma alternância.
- f7a7f7a: Adiciona o `ColorPicker`, painel para escolher uma cor por área livre, grade, espectro ou barras de RGB, com campos em HEX, RGB ou HSL, transparência (`alpha`), conta-gotas, comparação com a cor anterior e cores salvas (`swatches`, `swatchesOnly`, redondas ou quadradas com `swatchShape`), e o `ColorInput`, campo de formulário que aceita HEX, `rgb()` e `hsl()` digitados ou colados e abre o painel em um popover. Os dois emitem a cor em hexadecimal, avisam o fim da escolha em `onChangeEnd`, anunciam o nome aproximado de cada cor ao leitor de tela e aumentam as áreas de toque abaixo de `sm`.
- 9717835: Adiciona `calendarDisplay="inline"` ao `Datepicker` para compor filtros que precisam manter campos editáveis e calendário visível na mesma superfície.
- 9717835: `Datepicker` de data única aceita `↑` e `↓` no campo (dia), `Shift` com as setas (mês) e `PageUp` e `PageDown` (ano) para navegar sem abrir o calendário, respeitando `min`, `max` e `isDateDisabled`. A nova prop `stepper` (`day`, `month` ou `year`) mostra botões de seta ao lado do campo. Em `month` e `year` o campo mostra só `mm/aaaa` ou `aaaa`, e o botão de calendário abre a grade de meses ou de anos, onde escolher um item seleciona o período. Para isso o `Calendar` de data única ganhou a prop `precision` (`day`, `month` ou `year`). O texto dos campos de data, únicos e de intervalo, passa a ser centralizado. A `precision` também vale para o intervalo, no `Calendar` e no `Datepicker` (`mode="range"`): o início é o primeiro dia do mês ou do ano, e o fim, o último dia.
- 9717835: **Quebra de compatibilidade.** A escala de espaçamento passa a ter quinze passos, e o nome de cada token é o valor dele: `--ob-space-2`, `-4`, `-6`, `-8`, `-10`, `-12`, `-16`, `-20`, `-24`, `-32`, `-40`, `-48`, `-64`, `-96` e `-128`. Os componentes usam esses tokens em todo `gap`, `padding` e `margin`.

  - Os tokens `--ob-s-1` a `--ob-s-10` foram removidos. Troque `--ob-s-1` por `--ob-space-4`, `-2` por `-8`, `-3` por `-12`, `-4` por `-16`, `-5` por `-24`, `-6` por `-32`, `-7` por `-48`, `-8` por `-64`, `-9` por `-96` e `-10` por `-128`. Os apelidos `--ob-gap-*`, `--ob-pad-*` e `--ob-stack-*` continuam com os mesmos valores.
  - Espaçamentos dos componentes que estavam fora da escala foram para o passo mais próximo (no empate, o maior). Os mais visíveis: padding horizontal do `Button` `md` de 18 para 20px e `lg` de 22 para 24px; padding de campos, células da `Table`, `Alert`, `Toast` e itens do `Select`/`Autocomplete` de 14 para 16px; `Chip` `md` de 7×14 para 8×16px; cabeçalho do `Drawer` de 18 para 20px; recuo do `SideNav` por nível de 14 para 16px. Outros ajustes são de 1px.
  - `Card`, `Popover` e o painel flutuante usam tokens como padrão de `padding`; o `padding` do `Popover` passa a aceitar string além de número.

- 9717835: Nova função `formatarPeriodo(inicio, fim, { hoje })` que resume um intervalo de datas para chips e botões de filtro: meses fechados mostram só os nomes, períodos quebrados mostram dia e mês, e o ano aparece nas duas pontas sempre que alguma delas está fora do ano atual. Também disponível pelo subpath enxuto `@onblide/ui/periodo` para consumidores sem interface React.
- 9717835: Os componentes passam a usar os tokens de movimento, raio, camada, opacidade e foco, sem números soltos. Um teste automático (`smoke-fundacoes`) recusa valores fora das escalas.

  - **Movimento:** novos `--ob-ease-in-out`, `--ob-dur-spin` (800ms, uma volta de spinner) e `--ob-dur-loop` (1400ms, pulsos de carregamento). Durações soltas (100, 140, 150, 160, 220, 250ms) passam para `--ob-dur-fast` (120ms) ou `--ob-dur-base` (200ms). Com `prefers-reduced-motion: reduce`, `--ob-dur-fast`, `--ob-dur-base` e `--ob-dur-slow` valem 0ms, então todo componente respeita a preferência; o `Modal` e o `ScrollArea` deixam de ter regras próprias para isso.
  - **Raios:** novos `--ob-r-2xs` (2px, para sublinhados e indicadores) e `--ob-r-circle` (50%). `999` vira `--ob-r-pill`. O `Checkbox` passa de 6px para `--ob-r-xs` (4px) e o raio padrão do `Skeleton` passa de 6px para `--ob-r-xs`.
  - **Camadas:** novo `--ob-z-drag` (600) para a prévia de arrastar do `TreeView`, que usava 1000.
  - **Opacidade:** todo estado desabilitado usa `--ob-opacity-disabled` (0.45); antes variava entre 0.45, 0.5 e 0.6. Novo `--ob-opacity-muted` (0.4) para itens inativos (dias fora do mês, ícone de ordenação inativo, etapa pendente).
  - **Foco:** novo `--ob-focus-ring-width` (3px). Todo anel e contorno de foco usa essa largura e a cor `--ob-focus-ring`; antes variavam entre 2, 3 e 4px, e o `Accordion`, o `Calendar` e o `FileUpload` usavam um contorno azul sólido.

- 9717835: `Input` e `NumberField` ganham `startAddon` e `endAddon`: conteúdo dentro da mesma borda do campo, separado por uma divisória (texto, `Select` com `embedded` ou botão compacto). O foco e o erro envolvem o campo e o complemento juntos. No `Input`, o rótulo agora é um `<label for>` e o clique em qualquer ponto do campo (fora do complemento) foca o input.
- 384f419: `Input` e `NumberField` ganham `endIcon`: um ícone ou botão compacto no fim do campo, dentro da mesma borda e sem divisória, para mostrar a senha, limpar o texto ou indicar um status. Um `Button` com `iconOnly` e `size="sm"` se ajusta ao tamanho do campo, e o clique nele não move o foco para o input.
- 9717835: `Link`: o tamanho da fonte deixa de ser fixo em 14px e passa a ser herdado do texto ao redor (a fonte e o peso continuam como antes). Quem usa o link sozinho, fora de um texto com tamanho definido, passa a ver o tamanho do contêiner; para manter os 14px, defina `font-size: 14px` no contêiner. Permite usar o `Link` em texto menor ou maior, como um código numa tabela, sem sobrescrever o estilo do componente.
- 6cd7f4f: `List` separa a densidade pelo tipo de lista. O padrão (`md`) passa a ser a densidade de conteúdo, para pessoas, arquivos e registros: 12px em cima e embaixo, 16px nas laterais, 48px de altura mínima, 4px entre o título e a descrição e a descrição em 13px. A densidade anterior do `md` vira `sm` (opções e navegação), e a anterior do `sm` vira o novo `xs` (painéis densos). `Menu`, `Autocomplete` e `TreeView` pedem as densidades de opção e não mudam de aparência. O `FileUpload` deixa de sobrescrever o espaçamento da lista de arquivos e usa o padrão novo. Quem usava `List` ou `ListItem` sem `size` ganha mais respiro; quem usava `size="sm"` e quer a aparência de antes passa a usar `size="xs"`.
- bfa8b40: `Menu` permite definir as cores de fundo e das iniciais do avatar nos itens de conta. `Avatar` também aceita `textColor` sem alterar sua aparência padrão.
- b702b97: `Menu`: o item `type: 'account'` aceita `src`, com a foto da pessoa, e `initials`, para trocar as iniciais geradas pelo nome. Antes o avatar mostrava sempre as iniciais, e a conta montada no rodapé da `Sidebar` ou nas ações da `Navbar` não tinha como exibir a foto.
- 9717835: Novo item `type: 'custom'` no `Menu`, que aceita conteúdo livre (por exemplo um `Tabs` `pill`) entre os itens. O bloco não participa da navegação por setas e usa o teclado do próprio conteúdo; vale também no `accountMenu` do `SideNav`.
- 9717835: `Modal` passa a limitar a altura do painel à janela: o corpo rola e o cabeçalho e o rodapé ficam fixos (antes o conteúdo alto era cortado). Novas props `maxHeight`, `motion="none"` (remove o fade e o pop internos), `backdropRef` e `contentRef`. As animações internas agora respeitam `prefers-reduced-motion`.
- 93b80c9: `Pagination` ganha tamanhos `sm`, `md` (padrão) e `lg`, com 32, 40 e 48px, as alturas do `Button` e dos campos; `showEdges` (primeira e última página); `totalItems`, `pageSize`, `defaultPageSize`, `pageSizeOptions` e `onPageSizeChange` (resumo "11–20 de 487" e seletor de itens por página, com a legenda "Itens por página" fora do seletor e só o número dentro); e `variant="compact"` ("Página [3] de 20" entre as setas, para telas estreitas, com o número editável: Enter navega, Esc ou clicar fora volta à página atual). No tamanho padrão, os botões passam de 34 para 40px e o raio passa a ser o `--ob-r-control`, o mesmo do `Button`. Novos tipos `PaginationSize` e `PaginationVariant`.
- 3601dc3: `Pagination`: as reticências viram botões que abrem um painel "Página [ ] de 40" para ir a qualquer página: o campo já recebe o foco e mostra as páginas escondidas como exemplo; Enter ou "Ir" navega, Esc ou clicar fora fecha sem navegar. Uma reticência nunca esconde uma página só (a página aparece no lugar dela). Sem `page`, a Pagination guarda a própria página, com a nova prop `defaultPage`. As setas não perdem mais o foco ao avançar pelo teclado, todo botão tem `type="button"`, cada página tem nome acessível ("Página 3") e `page` fora do intervalo é limitado entre 1 e `total`.
- 83531b3: `Pagination`: na primeira página, as setas de voltar (e a de primeira página, com `showEdges`) somem; na última, as de avançar. O espaço delas continua reservado, para os números não mudarem de lugar ao trocar de página.
- f84f4c0: Remove o bundle de navegador `dist/onblide-ui.browser.js`. O pacote passa a gerar só ESM e CJS, como o Material UI, e fica pronto para o React 19, que não tem mais a versão UMD da qual esse bundle dependia.
- 9717835: Novo componente `ScrollArea`: área com rolagem nativa e uma barra fina e discreta, desenhada com os tokens do tema (`--ob-scrollbar-thumb`, `--ob-scrollbar-thumb-hover` e `--ob-scrollbar-track`). Rola na vertical, na horizontal ou nos dois eixos, mostra a barra ao rolar, ao passar o mouse e ao focar (`visibility="hover"`, o padrão) e entra na ordem de tabulação quando há o que rolar. O corpo do `Modal`, o `Drawer`, a lista do `SideNav`, a `Table` e a `Timeline` (horizontal), a lista do `Autocomplete` e o painel do `Select` passam a rolar por ele, e o `SideNav` deixa de ter uma barra própria.
- 9717835: `Select` aceita `defaultValue` (modo não controlado, para uso sem estado externo) e mantém o anel de foco enquanto o campo tem foco, mesmo com o menu fechado. No modo de seleção única, um `value` que não seja texto é ignorado.
- 9717835: `Select` ganha a prop `embedded` (seleção única), que remove a borda, o fundo e o rótulo para ser usado dentro de outro campo, e a prop `ariaLabel` para o nome acessível quando não há rótulo visível.
- 96b4169: `Stepper` ganha o tamanho `lg`, para fluxos de página inteira: marcador de 34px, rótulo de 16px, dica de 14px e linhas, barra e espaçamento maiores, em todas as variantes.
- 0724758: `Table` ganha `rowKey`, `selectedKeys` e `defaultSelectedKeys` (a seleção segue a linha ao paginar, filtrar, ordenar ou excluir, e pode ser controlada e limpa por fora; `onSelect` recebe também os identificadores), `align` por coluna, tamanhos `sm`, `md` (padrão) e `lg`, cabeçalho fixo com `maxHeight`, `onRowClick` (linha clicável, também pelo teclado), linhas expansíveis com `renderExpanded`, `expandedKeys`, `defaultExpandedKeys` e `onExpandedChange`, e `caption` e `ariaLabel`. O cabeçalho ordenável vira um botão, acessível pelo teclado e com `aria-sort`, e as setas passam a ser ícones Phosphor. O carregamento usa o `Skeleton`, com larguras estáveis. No tamanho padrão, o texto das células passa de 12 para 14px. Novos tipos `TableSize`, `TableAlign` e `TableRowKey`.
- 9dfcd79: O `Tabs` passa a ser anunciado como lista de abas: cada aba tem o papel de aba e diz se está selecionada, só a aba ativa entra na ordem do `Tab`, e as setas, `Home` e `End` andam entre as abas já ativando, pulando as desabilitadas. Novas props: `ariaLabel`, que nomeia o grupo, e `panelId` em cada aba, que a liga ao painel que ela mostra (`aria-controls`). As abas também deixam de enviar formulário (`type="button"`).
- 30ca96d: `Tabs` e `Badge` ganham o tamanho `lg`. Nas `Tabs`, o texto vai a 15px, com mais espaçamento, ícone de 18px e contador no `Badge` `md`. No `Badge`, o texto vai a 13px, com ponto, ícone e espaçamento maiores, e o contador numérico mede 22px. Novos tipos `TabsSize` e `BadgeSize`.
- 9717835: `Tabs`: a aba ativa ganha um indicador único (o traço na `line`, a pílula na `pill`) que desliza até a aba escolhida e ajusta a largura, junto com a cor e a sombra do `tone` e da `appearance`, em `--ob-dur-base` com `--ob-ease-out`. O indicador mede a aba ativa e acompanha mudanças de largura; com `prefers-reduced-motion` a troca é imediata. Sem JavaScript (renderização no servidor), a aba ativa pinta o próprio destaque como antes, e o indicador assume ao medir.
- 9717835: `Tabs`: cada aba ganha `tone` (`primary`, `success`, `warning`, `danger`), que pinta o texto da aba ativa (e o traço, na variante `line`) e o contador dela. Na pílula, o `Tabs` ganha `appearance` (`soft` ou `solid`) para pintar também o fundo da aba ativa: fundo clarinho do tom (`soft`) ou preenchido com a cor forte (`solid`). A prop `dot` mostra um ponto do tom antes do rótulo de cada aba colorida. Abas sem `tone` ficam como antes.
- 7d58165: `Checkbox`, `Radio`, `RadioGroup` e `Switch` ganham a mesma escala de tamanho: `sm`, `md` (padrão, igual ao tamanho atual) e `lg`. A caixa do `Checkbox` e o círculo do `Radio` medem 16, 18 e 20px; o trilho do `Switch` mede 32×18, 40×22 e 48×26px. O texto acompanha em 13, 14 e 15px, como no `Button`. No `Switch` `sm`, o texto passa de 14 para 13px. Novos tipos `CheckboxSize`, `RadioSize` e `SwitchSize`.
- 30ca96d: Os campos de formulário ganham a escala de tamanho `sm`, `md` (padrão) e `lg`, com 32, 40 e 48px de altura, as mesmas do `Button`, para campo e botão alinharem lado a lado: `Input`, `Select`, `SearchInput`, `NumberField`, `Datepicker`, `Autocomplete` e o `FieldShell`. O texto acompanha em 13, 14 e 15px, junto com recuo, ícones, botões internos, chips da seleção múltipla e opções da lista. O `Textarea` ganha a mesma escala de texto, altura da linha e recuo, e o `CodeInput` ganha células de 40×48, 48×56 e 56×64px. Novos tipos `FieldShellSize`, `InputSize`, `SelectSize`, `SearchInputSize`, `NumberFieldSize`, `DatepickerSize`, `AutocompleteSize`, `TextareaSize` e `CodeInputSize`.

  Mudanças visíveis no tamanho padrão: os campos passam de 44 para 40px de altura; o recuo lateral do `Select`, do `Autocomplete`, do `NumberField` e do `Textarea` passa para 16px, igual ao do `Input`; o texto do `SearchInput` passa de 14,5 para 14px. No `Input`, a prop `size` passa a ser o tamanho do campo, no lugar do atributo nativo `size` do `<input>`.

  O `Chip` ganha o tamanho `xs`, usado nas opções escolhidas dentro de um campo `sm`.

- 3f1759d: `Textarea`: `resize` passa a aceitar `horizontal` e `both`, além de `vertical` e `none`, com a alça nativa do navegador. A largura fica entre 160px e a área disponível. A barra de rolagem nativa fica fina e usa a cor `--ob-scrollbar-thumb`. Todas as props ganham descrição na tabela de propriedades.
- f45520b: Adiciona o `TimePicker`, campo de horário com digitação por partes (hora, minuto, segundos e AM/PM), setas do teclado e escolha em colunas roláveis (`variant="columns"`) ou num relógio analógico (`variant="clock"`). O valor é texto em 24 horas (`HH:mm`, ou `HH:mm:ss` com `precision="second"`), com `hourCycle` 12 ou 24, `step`, `min`, `max` e `isTimeDisabled`. Com `mode="range"` ele escolhe início e fim num só campo, mostra a duração e não deixa o fim ficar antes do início. O `size` muda só o campo; no celular, a lista e o relógio crescem para o toque.
- 42567b5: `Toast`: nova prop `appearance`. O padrão `outline` mantém o visual atual, com superfície, borda neutra e só o ícone colorido; `soft` preenche o toast com o fundo clarinho do tom. O `ToastStack` ganha `appearance` como padrão da fila, e `toast(..., { appearance })` sobrepõe por toast.
- b905c52: `ToggleButton`: aceita `tone="neutral"`, com o estado pressionado em cinza (fundo `--ob-line`, texto e borda `--ob-fg-strong`).
- 41617ed: O arrastar do `TreeView` segue o padrão de arrastar e soltar do sistema: a linha sai do lugar (que fica vazio), sobe 1% com a sombra média em vez de girar e crescer, e ao soltar viaja até o lugar novo e assenta, sem a piscada de antes; com Esc ou fora da árvore, volta ao lugar. Mover pelo teclado (Alt+Shift+setas) também faz a linha viajar. Onde não pode, a linha ganha contorno vermelho e o cursor de proibido. A linha que flutua é uma cópia idêntica, fora da área de rolagem, para não ser cortada.
- 9717835: **Quebra de compatibilidade.** As props visuais passam a seguir um vocabulário único, igual em todos os componentes (veja a página "Vocabulário das props" na documentação): `tone` é a cor, `appearance` é a pintura e `variant` é a forma.

  - Novos tipos públicos `Tone` (`neutral`, `muted`, `primary`, `info`, `success`, `warning`, `danger`) e `Appearance` (`solid`, `soft`, `outline`, `ghost`). Os tipos de tom e de pintura de cada componente são recortes deles.
  - `Badge`: `tone` passa de `blue`, `green`, `orange`, `red`, `grey` para `primary`, `success`, `warning`, `danger`, `neutral`. `variant="subtle" | "solid" | "outline"` vira `appearance="soft" | "solid" | "outline"`, e `variant` passa a ser a forma: `label` (padrão) ou `numeric`. O `numeric` continua `solid` por padrão.
  - `Button`: `countTone` usa os tons novos do `Badge`.
  - `TreeView`: `status` usa os tons novos do `Badge`.
  - `Chip`: nova prop `appearance`, `outline` (padrão, como antes) ou `soft` (fundo clarinho, sem borda). Selecionado, o chip continua cheio.
  - `Kbd`: `variant="key" | "plain"` vira `appearance="outline" | "ghost"`.
  - `Tooltip`: `variant="inverted"` vira `appearance="outline"`; `variant` fica só com `text` e `image`, e `appearance` (`solid`, padrão, ou `outline`) combina com os dois.
  - `Link`: `variant="default" | "subtle" | "quiet"` vira `tone="primary" | "neutral" | "muted"`.
  - `Divider`: `variant="dashed"` vira a prop booleana `dashed`; `variant="solid"` deixa de existir (é o padrão).
  - `ProgressBar`: o tom padrão `info` passa a se chamar `primary`.
  - `ProgressCircle`, `Slider`, `Spinner` e `AlertDialog`: o tom `default` passa a se chamar `primary`.
  - `ListItem`: o tom `accent` passa a se chamar `primary`.

### Patch Changes

- 6f9701d: `Badge`: o texto do tom `warning` fica legível no tema escuro. A cor fixa dá lugar ao token novo `--ob-warning-fg`, que muda com o tema.
- 9717835: `Button`: o botão com texto passa a ter a mesma altura do botão só com ícone no mesmo tamanho (32px no `sm`, 40px no `md` e 48px no `lg`). Antes a altura vinha do padding e da altura de linha, e ficava 1 a 2px maior, então os dois desalinhavam lado a lado. O texto que quebra em mais de uma linha continua crescendo.
- 9717835: `Button` com `count` mostra o contador em linha, depois do rótulo, em vez de sobrepô-lo ao texto; nos botões só com ícone ele continua no canto.
- 4a34945: `Checkbox`: o check e o traço ficam centralizados em qualquer escala da tela e posição na página. A caixa e o glifo passam a ser desenhados juntos, num único SVG, e a diferença entre os lados nunca passa de 1 pixel físico. Antes, em escalas como 90% e 125%, ela chegava a 9.
- 9717835: `Chip` passa a mostrar o anel de foco (`--ob-focus-ring`) quando recebe foco pelo teclado, como o `Button`. O clique do mouse não o mostra.
- 9717835: `Chip` passa a aceitar atributos nativos do elemento e encaminhar `onClick`, permitindo sua composição acessível como gatilho de `Popover` e outros controles.
- 9717835: O botão de remover do `Chip` zera o padding e a margem padrão do navegador, que deslocavam o ícone "x" dentro do círculo.
- 9717835: `CodeInput`: a célula ativa ganha destaque (borda azul, fundo tingido, anel de foco e leve elevação) e os estados `error` e `success` só aparecem depois que o código está completo; com o código incompleto o campo mostra o estado padrão. No erro e no sucesso, o fundo das células também muda de cor.
- 0b06aef: `Drawer`: o painel passa a ter `role="dialog"`, `aria-modal` e o título como nome acessível, e fica oculto quando fechado; antes, os elementos do painel fechado continuavam alcançáveis pelo Tab.
- a9cbba0: Aponta a página do pacote para o endereço oficial da documentação, [design.onblide.com](https://design.onblide.com).
- 9717835: `FileUpload` aceita `indeterminate` para mostrar um spinner acessível durante envios sem medição real de progresso, sem exibir porcentagens fictícias.
- 51e89f2: `Kbd`: a tecla mantém a cor do texto ao redor e fica sem sombra, mesmo quando a página tem um estilo global para `<kbd>`, como o do Docusaurus. No `ghost`, também ficam de fora fundo, borda e espaçamento.
- 1d719bf: O pacote passa a declarar a licença: MIT para o código e SIL Open Font License 1.1 para as fontes em `src/fonts/`, com os textos em `LICENSE` e `src/fonts/OFL.txt`. O nome onblide e o logo não são cobertos por essas licenças.
- 65fa313: `List` com `dividers`: a lista deixa de recortar o próprio conteúdo (`overflow: hidden`), que cortava um `Menu` ou outro painel aberto dentro de um item. O destaque do primeiro e do último item continua acompanhando os cantos arredondados da lista.
- c2959e9: `ListItem`: o item selecionado continua azul com o mouse em cima. Antes, o fundo do hover substituía o da seleção.
- 72b2dad: `Logo` e `LogoMark`: o nome acessível passa a ser "onblide", em minúscula, como a marca é escrita. A descrição do pacote segue a mesma grafia.
- 92787b6: `Navbar` e `Breadcrumbs`: um link sem `href` e sem `onNav`/`onNavigate` não navega mais para "#", que levava a página de volta ao topo. O `Navbar` ocupa a largura do contêiner mesmo dentro de um flex centralizado, e os links não encolhem mais por baixo das ações; em tela estreita, use `compact`.
- 4998a9d: `Pagination`: o campo que abre na reticência cresce conforme a faixa de páginas escondidas, então o placeholder (ex.: "502–999") aparece inteiro, sem corte.
- 9717835: Mantém o painel pai aberto durante a interação com popovers aninhados, incluindo o calendário do `Datepicker`.
- 03b427e: `Popover` não emite mais o aviso de `useLayoutEffect` quando é renderizado no servidor (SSR); o posicionamento continua igual no navegador.
- 81f5068: O pacote passa a ser publicado no npm como `@onblide/ui`, com acesso público.
- 8d75ad8: `SearchInput`: o carregamento passa a usar o `Spinner` no lugar do ícone `circle-notch` girando, que rodava fora do eixo. O `Spinner` ocupa o mesmo espaço do botão de limpar, e o texto não muda de largura quando a busca começa ou termina.
- 9717835: Novos tokens semânticos `--ob-selection-bg` e `--ob-selection-fg` para a seleção de texto, e a regra `::selection` passa a usá-los. No tema escuro a seleção deixa de ser `--ob-blue-100` (`#1a2a52`, quase invisível sobre `#121212`) e passa a ser um azul `#3a6ee0` com texto branco (contraste 4,7:1). O tema claro não muda.
- 9717835: `Select` de seleção única deixa de quebrar a linha em larguras estreitas (a seta caía para uma segunda linha e o campo dobrava de altura), e o rótulo passa a ter 12px, como o do `Input`.
- 00bf480: `SideNav`: o nome e o detalhe da conta no rodapé usam a fonte do design system, sem depender de um reset global de fonte para botões.
- 9717835: Corrige o menu da conta do `SideNav` recolhido, que abria encostado na borda inferior da janela e tinha a borda e a sombra cortadas. O painel agora se alinha à base do botão da conta, com o recuo do rodapé.
- 15a6244: `Table`: depois de ordenar, a divisória entre as linhas sumia de uma linha do meio e aparecia embaixo da última, porque a última linha era identificada pela ordem original dos dados e não pela ordem exibida. Agora vale a ordem exibida, e o rótulo de acessibilidade do checkbox de cada linha também segue a posição na tela. A tabela também passa a definir as próprias bordas e fundos de `table`, `thead`, `tr`, `th` e `td`, sem herdar o CSS global de tabelas da página (como o do Docusaurus, que engrossava a linha do cabeçalho e desenhava bordas extras entre as linhas).
- 9717835: `Tooltip` passa a renderizar o balão em portal no `body`, posicionado a partir do gatilho, então não é mais cortado por ancestrais com `overflow` nem coberto por irmãos. O lado inverte quando falta espaço, a seta acompanha o deslocamento e o gatilho recebe `aria-describedby` enquanto o balão está aberto.
- 25e73b4: `Tooltip`: o balão some quando o gatilho sai da tela e volta quando ele reaparece. Antes, ficava preso na borda da janela.
- 9717835: `Tooltip` passa a quebrar linha quando o texto passa de `maxWidth`, em vez de vazar para fora do fundo do balão. Textos curtos continuam em uma linha.

## 0.17.0

### Numeração corrigida

A versão deste código, antes numerada 6.1.0, passa a ser 0.17.0. Nenhuma linha de código mudou: apenas o rótulo de versão. As versões 1.0.0 a 6.1.0 foram arquivadas (tags `arquivo/vX.Y.Z` e `arquivo/onblide-ui@X.Y.Z`; GitHub Releases marcados como `[arquivada]`) e seu conteúdo continua no `CHANGELOG.md` do pacote como histórico. Motivo e detalhes: `docs/decisions/0009-corrigir-a-numeracao-para-a-serie-0x.md`.

## 6.1.0 (arquivada)

### Minor Changes

- ca5f047: Calendar com destaque ao passar o mouse e faixa visível em meses e anos.

  - Dias, meses e anos ganham destaque sob o mouse desde o primeiro clique, nos modos `single` e `range`.
  - No modo `range`, as vistas de meses e de anos mostram o intervalo selecionado (início e fim marcados, meses ou anos entre eles com a cor de faixa), mesmo quando o intervalo atravessa anos.
  - Com só o início escolhido, passar o mouse sobre um mês ou ano mostra a faixa até ele, como já acontecia nos dias.

## 6.0.0 (arquivada)

### Major Changes

- Kbd e Stepper corrigidos.

  Quebra de compatibilidade: a prop `inverse` do `Kbd` foi removida. Ela pintava a tecla com as cores da superfície da página, então ficava invisível em qualquer fundo que não fosse o do Tooltip. Agora o `Kbd` desenha texto, contorno e fundo a partir da cor do texto ao redor (`currentColor`) e fica legível em qualquer fundo, claro, escuro ou colorido.

  Correções:

  - `Stepper`: os marcadores passam a ter sempre o mesmo tamanho (`box-sizing: border-box`). Antes, o marcador atual (borda de 2px) e o futuro (borda de 1px) ficavam maiores que o concluído, e nos layouts horizontal, barra e vertical as linhas de ligação e os rótulos ficavam deslocados em degraus.
  - `Stepper`, `Timeline`, `Breadcrumbs` e `TreeView`: os itens de lista zeram a margem, para que um CSS de lista do aplicativo (como `li + li` com margem superior) não os desloque.
  - Documentação: o resultado das demos fica isolado do estilo de listas do tema do site, que também deslocava as etapas.

## 5.0.0 (arquivada)

### Major Changes

- Toast que dá para disparar, escolher a posição e testar de verdade.

  Quebra de compatibilidade: o global `window.obToast` e o evento `ob-toast` foram removidos. Use a função exportada `toast`: `toast({ tone, title, body, action, onAction, icon, duration })` e os atalhos `toast.success`, `toast.info`, `toast.warning` e `toast.danger`; `toast.dismiss(id)` fecha um toast (ou todos, sem id). O módulo não escreve mais em `window` ao ser importado.

  Correções e novidades no `ToastStack`:

  - Cada toast agora vai para uma fila só. Antes, todo `ToastStack` na página recebia o mesmo toast e ele aparecia duplicado em várias posições; a nova prop `name` (com `stack` no toast) permite ter várias filas.
  - Novas props `duration` (0 mantém até fechar) e `limit`. A duração padrão passou de 4,8 s para 5 s.
  - Passar o mouse sobre a fila pausa a contagem, como o guia já prometia.
  - A fila ganha `role="region"` e nome acessível, e o `id` fixo virou classe, para poder haver mais de uma na página.

## 4.2.0 (arquivada)

### Minor Changes

- FileUpload com foto de perfil de verdade: na variante `image`, a área toda (foto, botão e texto) aceita arrastar e soltar, com destaque e "Solte aqui", e a foto vazia convida a adicionar. As novas props `shape="circle"` e `size` deixam a prévia redonda e do tamanho que você precisar. Com foto, as ações viram botões só com ícone e tooltip (trocar e remover), passar o mouse na foto mostra "Trocar", e o envio mostra um progresso circular sobre a imagem. O botão de escolher imagem ganha ícone, a variante `button` avisa que dá para arrastar, e a lista de arquivos mostra miniatura das imagens.

## 4.1.0 (arquivada)

### Minor Changes

- Navegação ampla no Calendar e no Datepicker: clicar no mês do cabeçalho abre a grade dos 12 meses, e clicar no ano abre um bloco de 12 anos, com setas que passam de ano em ano e de 12 em 12 anos. A escolha desce de nível (ano, mês, dia) e Esc volta um nível. Meses e anos inteiros fora de `min` e `max` ficam desabilitados, e a nova prop `openTo` define a vista inicial (`days`, `months` ou `years`).

## 4.0.1 (arquivada)

### Patch Changes

- No Calendar e no Datepicker em modo intervalo, cada dia do intervalo volta a ser um quadrado arredondado próprio, com espaço entre eles, em vez de uma faixa contínua.

## 4.0.0 (arquivada)

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

## 3.1.1 (arquivada)

### Patch Changes

- Componentes alinhados às regras do design system. Alert, Toast, Modal, Drawer e Popover usam o `Button` (neutral, iconOnly) no botão de fechar, e o Drawer passa a usar o ícone do Phosphor no lugar do caractere de texto. As ações de Alert e Toast também usam `Button`. O contador de SideNav e Tabs usa o `Badge`, e o botão de remover do Chip usa o ícone do Phosphor. Cores e sombras fixas viraram tokens: `--ob-fg-on-color`, `--ob-scrim` (o fundo de Modal e Drawer agora acompanha o tema escuro), `--ob-shadow-xs`, `--ob-shadow-md`, `--ob-shadow-pop` e `color-mix` sobre os tokens de tom no Slider. Corrige o rótulo do ProgressBar, que mostrava valores acima de 100% ou abaixo de 0%. Remove os comentários do código dos componentes.

## 3.1.0 (arquivada)

### Minor Changes

- Gerenciador de aparência: `themeManager` (init, get, set, subscribe), hook `useTheme()` e `themeInitScript` (também em `@onblide/ui/theme-init`) para evitar o flash no carregamento. Escolha entre claro, escuro e sistema, persistida em `localStorage` e sincronizada entre abas. O tema claro agora também existe em `[data-theme="light"]`, então uma região clara dentro de uma página escura volta aos tokens claros.

## 3.0.0 (arquivada)

### Major Changes

- Navbar: removido `NavbarIconButton`, que duplicava o Button. Use `<Button kind="neutral" iconOnly aria-label="..." icon={<Icons.bell size={20} />} count={3} />` nas `actions`; o botão de menu da Navbar (`onMenuToggle`) também passa a ser um Button.

## 2.4.0 (arquivada)

### Minor Changes

- Button: novo estilo `neutral` (transparente, com fundo sutil no hover), props `pressed` (marca `aria-pressed` e destaca o fundo no `neutral`) e `count` (contador em badge no canto) e anel de foco visível ao navegar pelo teclado.

## 2.3.0 (arquivada)

### Minor Changes

- SideNav: o rodapé de conta usa o componente Avatar e aceita foto (`accountImage` e `accountImageAlt`, com volta às iniciais se a imagem falhar), os botões de recolher e abrir usam o Button com `iconOnly`, e o nome e o detalhe da conta ficam alinhados à esquerda.

## 2.2.0 (arquivada)

### Minor Changes

- Button: nova prop `iconOnly` para botão só com ícone, quadrado (32, 40 ou 48px conforme `size`), sem texto; exige `aria-label`.

## 2.1.0 (arquivada)

### Minor Changes

- Avatar: as iniciais passam a ser a primeira letra da primeira e da última palavra do nome ("Mateus Silva" vira "MS", antes saía "MA"; com uma palavra só continuam as duas primeiras letras) e a nova prop `initials` substitui as iniciais geradas.

## 2.0.0 (arquivada)

### Major Changes

- SideNav: a marca deixa de ser texto. Removido `brandName`; `brand` agora é a logo horizontal (padrão: logo da Onblide) e o novo `brandMark` é o símbolo exibido recolhida. Removido `workspaceName`; o rodapé usa `accountName` (padrão "Conta"), o novo `accountDetail` (linha secundária) e iniciais derivadas do nome quando `userInitials` é omitido. O botão de abrir a barra recolhida existe mesmo com `hideBrand` (ícone `caret-right`), e o botão sobre a logo ganha contorno ao passar o mouse. O rótulo de acessibilidade do rodapé passa a ser `Abrir menu de` + o nome da conta.

## 1.6.4 (arquivada)

### Patch Changes

- SideNav: os botões de recolher e abrir ficam com aparência fixa e só trocam de ícone ao passar o mouse (`caret-left` → `caret-line-left` na borda; logo → `caret-line-right` quando recolhida).

## 1.6.3 (arquivada)

### Patch Changes

- SideNav: os botões de recolher e abrir têm o mesmo formato (quadrado arredondado) e o mesmo par de ícones (`caret-line-left`/`caret-line-right`), com efeito de hover que desloca o ícone e destaca a borda; sobre a logo, ela se dissolve no ícone.

## 1.6.2 (arquivada)

### Patch Changes

- SideNav: a barra de rolagem da lista fica fina e só aparece quando o mouse está sobre a lista, sem setas.

## 1.6.1 (arquivada)

### Patch Changes

- SideNav: os botões de recolher e abrir usam o mesmo glifo (`caret-left`/`caret-right`), só espelhado.

## 1.6.0 (arquivada)

### Minor Changes

- SideNav: botão circular de recolher na borda da barra (com `onToggle`), logo que vira o botão de abrir ao passar o mouse quando recolhida, largura fixa de 72px recolhida mesmo com `flush`, lista rolável separada do rodapé e menu de conta que não é mais cortado. Menu ganha `placement` `right`/`right-end` e `block`. Tooltip passa a ter texto legível no tema escuro.

## 1.5.1 (arquivada)

### Patch Changes

- `Table`: o tamanho da fonte do conteúdo passa de 14px fixo para `var(--ob-fs-xs)` (12px), acompanhando o token tipográfico em vez de um número solto.

## 1.5.0 (arquivada)

### Minor Changes

- `SideNav`: o nome da marca no cabeçalho (`brandName`, ou `brand` pra substituir o bloco inteiro) e o nome da conta no rodapé (`accountName`) agora são configuráveis, em vez de "Onblide" fixo no código. O rodapé de conta virou um gatilho de `Menu` (Perfil/Configurações/Sair por padrão, customizável via `accountMenu`/`onProfile`/`onSettings`/`onSignOut`), em vez de um bloco estático.

  `Menu`: nova prop `placement` (`'bottom' | 'top' | 'auto'`, padrão `'auto'`). Com `auto`, mede o espaço abaixo do gatilho e abre o painel para cima quando necessário — usado pelo rodapé de conta da `SideNav`, mas disponível em qualquer `Menu`.

## 1.4.0 (arquivada)

### Minor Changes

- Implementa de verdade a prop `maxBookingDays` do `Datepicker`, antes aceita mas sem nenhum efeito. Com ela definida, dias além do limite (contado a partir da data inicial) ficam desabilitados no calendário e a digitação manual de uma data final além do limite mostra erro.

## 1.3.0 (arquivada)

### Minor Changes

- Adiciona suporte a imagem no `Avatar` (`src`/`alt`), com fallback automático pras iniciais quando a imagem não é informada ou falha ao carregar.

## 1.2.0 (arquivada)

### Minor Changes

- Adiciona `LogoMark`, o símbolo isolado da marca Onblide (sem o wordmark), e passa a usá-lo como marca
  padrão do `Navbar` e no cabeçalho da `SideNav`. No modo recolhido da `SideNav`, o botão de expandir some por
  trás do símbolo e só aparece no hover/foco, em vez de disputar espaço com ele o tempo todo.
- Adiciona o componente `Navbar`: barra de navegação superior com três layouts (`links`, `search`, `context`), segundo nível opcional (`secondary`), modo compacto e responsivo, e os subcomponentes `NavbarLink`, `NavbarIconButton` e `NavbarAccount`.

## 1.1.2 (arquivada)

### Patch Changes

- `Avatar` passa a aceitar imagem por `src`, com `alt` opcional e fallback para as iniciais quando não houver imagem.

## 1.1.1 (arquivada)

### Patch Changes

- Corrige um vão de 1-2px que podia aparecer nas linhas conectoras do `Stepper` (variante `horizontal`), em
  telas com `devicePixelRatio` 1. Cada conector é desenhado em duas metades, uma de cada célula vizinha, que
  arredondavam a largura fracionária pra baixo de forma independente.

## 1.1.0 (arquivada)

### Minor Changes

- Adiciona `ToggleButton` (botão com dois estados, pressionado e não pressionado, com `aria-pressed`) e
  `ButtonGroup` (agrupa `Button`/`ToggleButton` relacionados, anexados ou espaçados, com split button via
  `Menu` e seleção única ou múltipla via `ToggleButton`).

## 1.0.1 (arquivada)

### Patch Changes

- `CodeInput` passa a usar `--ob-font-mono` (JetBrains Mono) nos dígitos, alinhado à
  convenção do design system para números e código — antes usava `--ob-font` (Poppins)
  por descuido.

## 1.0.0 (arquivada)

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
