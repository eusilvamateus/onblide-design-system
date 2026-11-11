---
"@onblide/ui": patch
---

`Popover` não emite mais o aviso de `useLayoutEffect` quando é renderizado no servidor (SSR); o posicionamento continua igual no navegador.
