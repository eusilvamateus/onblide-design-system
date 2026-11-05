---
"@onblide/ui": minor
---

`Alert`: novo visual e prop `appearance`. O padrão `outline` usa a superfície, borda neutra e só o ícone colorido; `soft` usa o fundo clarinho do tom. A ação vira um `Button` pequeno com ícone Phosphor à direita do conteúdo. O alerta fica mais baixo (preenchimento de 12px) e o corpo passa a 14px. `info` e `success` passam a `role="status"`; `warning` e `danger` continuam em `role="alert"`. Novas props: `icon`, e o componente repassa atributos como `className`, `style` e `role`. Tokens novos no tema escuro: `--ob-green-050`, `--ob-orange-050` e `--ob-red-050`.
