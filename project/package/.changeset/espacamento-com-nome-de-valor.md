---
"@onblide/ui": minor
---

**Quebra de compatibilidade.** A escala de espaçamento passa a ter quinze passos, e o nome de cada token é o valor dele: `--ob-space-2`, `-4`, `-6`, `-8`, `-10`, `-12`, `-16`, `-20`, `-24`, `-32`, `-40`, `-48`, `-64`, `-96` e `-128`. Os componentes usam esses tokens em todo `gap`, `padding` e `margin`.

- Os tokens `--ob-s-1` a `--ob-s-10` foram removidos. Troque `--ob-s-1` por `--ob-space-4`, `-2` por `-8`, `-3` por `-12`, `-4` por `-16`, `-5` por `-24`, `-6` por `-32`, `-7` por `-48`, `-8` por `-64`, `-9` por `-96` e `-10` por `-128`. Os apelidos `--ob-gap-*`, `--ob-pad-*` e `--ob-stack-*` continuam com os mesmos valores.
- Espaçamentos dos componentes que estavam fora da escala foram para o passo mais próximo (no empate, o maior). Os mais visíveis: padding horizontal do `Button` `md` de 18 para 20px e `lg` de 22 para 24px; padding de campos, células da `Table`, `Alert`, `Toast` e itens do `Select`/`Autocomplete` de 14 para 16px; `Chip` `md` de 7×14 para 8×16px; cabeçalho do `Drawer` de 18 para 20px; recuo do `SideNav` por nível de 14 para 16px. Outros ajustes são de 1px.
- `Card`, `Popover` e o painel flutuante usam tokens como padrão de `padding`; o `padding` do `Popover` passa a aceitar string além de número.
