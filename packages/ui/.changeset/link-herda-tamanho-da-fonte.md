---
"@onblide/ui": minor
---

`Link`: o tamanho da fonte deixa de ser fixo em 14px e passa a ser herdado do texto ao redor (a fonte e o peso continuam como antes). Quem usa o link sozinho, fora de um texto com tamanho definido, passa a ver o tamanho do contêiner; para manter os 14px, defina `font-size: 14px` no contêiner. Permite usar o `Link` em texto menor ou maior, como um código numa tabela, sem sobrescrever o estilo do componente.
