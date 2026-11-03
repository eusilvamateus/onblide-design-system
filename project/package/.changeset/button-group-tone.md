---
"@onblide/ui": minor
---

`ButtonGroup`: nova prop `tone` (`neutral`, `primary`, `success`, `warning`, `danger`), repassada a todo filho que não define o próprio `tone`. Nos `ToggleButton` colore o estado pressionado; nos `Button` vale no estilo `quiet`. O `tone` do filho prevalece. `ToggleButton`: o valor padrão do `tone` passa a ser resolvido internamente (continua azul), para o grupo saber quando o filho não o definiu.
