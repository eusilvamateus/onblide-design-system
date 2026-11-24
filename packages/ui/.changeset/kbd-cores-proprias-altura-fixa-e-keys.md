---
"@onblide/ui": minor
---

`Kbd` ganha a prop `keys` para combinações: `keys={['Ctrl', 'K']}` desenha uma caixa para cada tecla, dentro de um `<kbd>` externo, e substitui `children`. A tecla `outline` passa a ter cores próprias dos tokens (fundo `--ob-surface`, texto `--ob-fg`, contorno `--ob-border` e a base de 2 px um tom mais escura), em vez de derivar fundo e contorno da cor do texto ao redor, que deixava a tecla apagada ao lado de textos claros. Ela fica igual em qualquer fundo, inclusive no balão do `Tooltip`. A altura passa a ser fixa (`md` 24 px, `sm` 20 px, no mínimo quadrada) e o peso do texto passa a ser médio. O `ghost` continua sem caixa e na cor do texto ao redor. O `Tooltip` aceita o atalho em lista (`shortcut={['Ctrl', 'S']}`), uma caixa por tecla, e o atalho de recolher do `Sidebar` passa a usar esse formato.
