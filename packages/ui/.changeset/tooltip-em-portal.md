---
"@onblide/ui": patch
---

`Tooltip` passa a renderizar o balão em portal no `body`, posicionado a partir do gatilho, então não é mais cortado por ancestrais com `overflow` nem coberto por irmãos. O lado inverte quando falta espaço, a seta acompanha o deslocamento e o gatilho recebe `aria-describedby` enquanto o balão está aberto.
