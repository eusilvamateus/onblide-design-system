---
"@onblide/ui": patch
---

`SearchInput`: o carregamento passa a usar o `Spinner` no lugar do ícone `circle-notch` girando, que rodava fora do eixo. O `Spinner` ocupa o mesmo espaço do botão de limpar, e o texto não muda de largura quando a busca começa ou termina.
