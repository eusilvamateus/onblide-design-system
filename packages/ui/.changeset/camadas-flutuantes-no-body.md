---
"@onblide/ui": minor
---

Painéis flutuantes deixam de ser cortados ou escondidos por Modal, Drawer, Accordion, Table e áreas com rolagem.

- A lista do `Select` e do `Autocomplete` e o painel do `Menu`, do `ContextMenu` e do `Menubar` abrem no `body`, presos ao gatilho, e vão para o lado oposto quando falta espaço.
- O `Modal` e o `AlertDialog` abrem no `body` e ficam acima do `Drawer`: uma confirmação aberta de dentro de um drawer aparece na frente dele.
- Nova ordem das camadas: `--ob-z-dropdown` 500, `--ob-z-toast` 600, `--ob-z-tooltip` 700 e `--ob-z-drag` 800, acima de `--ob-z-overlay` (Drawer, 300) e `--ob-z-modal` (Modal, 400). `Popover`, `Datepicker` e `Tooltip` passam a aparecer dentro de Modal e Drawer.
- O Esc fecha só a lista ou o menu aberto, sem fechar o Modal ou o Drawer em volta.
