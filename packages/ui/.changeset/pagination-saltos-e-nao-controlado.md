---
"@onblide/ui": minor
---

`Pagination`: as reticências viram botões que abrem um painel "Página [ ] de 40" para ir a qualquer página: o campo já recebe o foco e mostra as páginas escondidas como exemplo; Enter ou "Ir" navega, Esc ou clicar fora fecha sem navegar. Uma reticência nunca esconde uma página só (a página aparece no lugar dela). Sem `page`, a Pagination guarda a própria página, com a nova prop `defaultPage`. As setas não perdem mais o foco ao avançar pelo teclado, todo botão tem `type="button"`, cada página tem nome acessível ("Página 3") e `page` fora do intervalo é limitado entre 1 e `total`.
