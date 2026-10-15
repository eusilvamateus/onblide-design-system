---
"@onblide/ui": minor
---

`Datepicker` de data única aceita `↑` e `↓` no campo (dia), `Shift` com as setas (mês) e `PageUp` e `PageDown` (ano) para navegar sem abrir o calendário, respeitando `min`, `max` e `isDateDisabled`. A nova prop `stepper` (`day`, `month` ou `year`) mostra botões de seta ao lado do campo. Em `month` e `year` o campo mostra só `mm/aaaa` ou `aaaa`, e o botão de calendário abre a grade de meses ou de anos, onde escolher um item seleciona o período. Para isso o `Calendar` de data única ganhou a prop `precision` (`day`, `month` ou `year`). O texto dos campos de data, únicos e de intervalo, passa a ser centralizado.
