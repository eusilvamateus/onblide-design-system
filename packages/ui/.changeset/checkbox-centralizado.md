---
"@onblide/ui": patch
---

`Checkbox`: o check e o traço ficam centralizados em qualquer escala da tela e posição na página. A caixa e o glifo passam a ser desenhados juntos, num único SVG, e a diferença entre os lados nunca passa de 1 pixel físico. Antes, em escalas como 90% e 125%, ela chegava a 9.
