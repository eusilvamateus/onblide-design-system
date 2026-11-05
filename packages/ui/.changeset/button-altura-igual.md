---
"@onblide/ui": patch
---

`Button`: o botão com texto passa a ter a mesma altura do botão só com ícone no mesmo tamanho (32px no `sm`, 40px no `md` e 48px no `lg`). Antes a altura vinha do padding e da altura de linha, e ficava 1 a 2px maior, então os dois desalinhavam lado a lado. O texto que quebra em mais de uma linha continua crescendo.
