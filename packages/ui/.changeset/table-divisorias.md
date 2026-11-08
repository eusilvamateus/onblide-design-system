---
"@onblide/ui": patch
---

`Table`: depois de ordenar, a divisória entre as linhas sumia de uma linha do meio e aparecia embaixo da última, porque a última linha era identificada pela ordem original dos dados e não pela ordem exibida. Agora vale a ordem exibida, e o rótulo de acessibilidade do checkbox de cada linha também segue a posição na tela. A tabela também passa a definir as próprias bordas e fundos de `table`, `thead`, `tr`, `th` e `td`, sem herdar o CSS global de tabelas da página (como o do Docusaurus, que engrossava a linha do cabeçalho e desenhava bordas extras entre as linhas).
