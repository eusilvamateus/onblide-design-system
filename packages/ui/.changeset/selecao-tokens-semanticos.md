---
"@onblide/ui": patch
---

Novos tokens semânticos `--ob-selection-bg` e `--ob-selection-fg` para a seleção de texto, e a regra `::selection` passa a usá-los. No tema escuro a seleção deixa de ser `--ob-blue-100` (`#1a2a52`, quase invisível sobre `#121212`) e passa a ser um azul `#3a6ee0` com texto branco (contraste 4,7:1). O tema claro não muda.
