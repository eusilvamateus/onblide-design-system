---
"@onblide/ui": minor
---

`Tabs`: a aba ativa ganha um indicador único (o traço na `line`, a pílula na `pill`) que desliza até a aba escolhida e ajusta a largura, junto com a cor e a sombra do `tone` e da `appearance`, em `--ob-dur-base` com `--ob-ease-out`. O indicador mede a aba ativa e acompanha mudanças de largura; com `prefers-reduced-motion` a troca é imediata. Sem JavaScript (renderização no servidor), a aba ativa pinta o próprio destaque como antes, e o indicador assume ao medir.
