---
"@onblide/ui": minor
---

O arrastar do `TreeView` segue o padrão de arrastar e soltar do sistema: a linha sai do lugar (que fica vazio), sobe 1% com a sombra média em vez de girar e crescer, e ao soltar viaja até o lugar novo e assenta, sem a piscada de antes; com Esc ou fora da árvore, volta ao lugar. Mover pelo teclado (Alt+Shift+setas) também faz a linha viajar. Onde não pode, a linha ganha contorno vermelho e o cursor de proibido. A linha que flutua é uma cópia idêntica, fora da área de rolagem, para não ser cortada.
