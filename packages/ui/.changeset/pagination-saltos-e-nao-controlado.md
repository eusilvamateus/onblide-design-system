---
"@onblide/ui": minor
---

`Pagination`: as reticências viram botões que avançam ou voltam 5 páginas, com seta dupla no hover e no foco, para alcançar os intervalos escondidos. Uma reticência nunca esconde uma página só (a página aparece no lugar dela). Sem `page`, a Pagination guarda a própria página, com a nova prop `defaultPage`. As setas não perdem mais o foco ao avançar pelo teclado, todo botão tem `type="button"`, cada página tem nome acessível ("Página 3") e `page` fora do intervalo é limitado entre 1 e `total`.
