---
"@onblide/ui": minor
---

Adiciona o hook `useDragAndDrop` e a função `applyDragMove`, para arrastar e soltar entre listas verticais no padrão do design system: o próprio item sobe 1% com a sombra média, segue o ponteiro enquanto os vizinhos abrem espaço e uma vaga mostra onde ele vai cair, e ao soltar viaja até a vaga sem quique, tudo com os tokens de movimento (e imediato com `prefers-reduced-motion`). Funciona com mouse (o item inteiro), toque (pela alça) e teclado (Espaço, setas e Esc), avisa o leitor de tela, recusa destinos com `canDrop` e chama `onMove` uma vez, ao assentar. Dentro de um `ScrollArea` ou de outra área com rolagem própria, o hook encontra a área sozinho: rola a área perto da borda, mantém a vaga dentro da lista e, com o ponteiro, faz uma cópia idêntica do item viajar por cima da página, sem ser cortada pela borda.
