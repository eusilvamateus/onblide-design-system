# 0019. Camadas flutuantes no `body`

## Contexto

A lista do `Select` e do `Autocomplete` e o painel do `Menu`, do `ContextMenu` e do `Menubar` abriam dentro do próprio
contêiner, com `position: absolute`. Qualquer ancestral com `overflow` cortava o painel: o corpo do `Modal`, o
`Accordion`, a `Table` e o `ScrollArea`. Dentro de um `Modal`, a lista ainda fazia o corpo ganhar rolagem.

O `Popover` e o `Tooltip` já abriam no `body`, mas nas camadas `--ob-z-dropdown` (100) e `--ob-z-tooltip` (200), abaixo
do fundo e do painel do `Modal` e do `Drawer` (300 e 400). Dentro deles, ficavam escondidos atrás. O `Modal` abria no
lugar em que foi escrito, na camada do fundo (300), e o painel do `Drawer` ficava em 400. Por isso um `AlertDialog`
aberto a partir de um `Drawer` aparecia atrás dele.

## Decisão

1. Tudo que flutua abre no `body`: `Modal` e `AlertDialog`, `Drawer`, `Popover`, `Tooltip`, e o painel do `Select`, do
   `Autocomplete`, do `Menu`, do `ContextMenu` e do `Menubar`. Os painéis presos a um gatilho usam uma peça interna,
   `Ancorado` (`src/internal/camada.tsx`), que mede o gatilho, escolhe o lado com espaço e acompanha a rolagem.
2. A ordem das camadas passa a seguir o que abre por cima do quê:

   | Token | Antes | Agora | O que fica nela |
   |---|---|---|---|
   | `--ob-z-overlay` | 300 | 300 | Drawer, com o fundo |
   | `--ob-z-modal` | 400 | 400 | Modal e AlertDialog, com o fundo |
   | `--ob-z-dropdown` | 100 | 500 | Listas, Menu, Popover, Datepicker |
   | `--ob-z-toast` | 500 | 600 | Toast |
   | `--ob-z-tooltip` | 200 | 700 | Tooltip |
   | `--ob-z-drag` | 600 | 800 | Prévia de arrastar |

3. Um painel aberto dentro de outro conta como parte dele: um `Select` dentro de um `Popover` ou de um `Menu` não os
   fecha ao ser usado. O `Ancorado` e o `Popover` marcam o painel com a cadeia de camadas de que fazem parte.
4. O Esc fecha só o painel aberto. Ele não chega ao `Modal` ou ao `Drawer` em volta.

## Consequências

- Os testes que liam a posição do painel no HTML do servidor passam a medir no navegador (`verificar-camadas.mjs`).
- Os exemplos do site não podem mais mostrar um `Modal` aberto dentro de uma moldura. Como já acontecia com o `Drawer`,
  o `Modal` e o `AlertDialog` aparecem atrás de um botão que os abre.
- Quem usa os tokens `--ob-z-*` no próprio código recebe os valores novos. Um componente próprio na camada
  `--ob-z-dropdown` passa a ficar acima de um modal aberto, que é o comportamento esperado de uma lista.
