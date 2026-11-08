---
"@onblide/ui": minor
---

`Table` ganha `rowKey`, `selectedKeys` e `defaultSelectedKeys` (a seleção segue a linha ao paginar, filtrar, ordenar ou excluir, e pode ser controlada e limpa por fora; `onSelect` recebe também os identificadores), `align` por coluna, tamanhos `sm`, `md` (padrão) e `lg`, cabeçalho fixo com `maxHeight`, `onRowClick` (linha clicável, também pelo teclado), linhas expansíveis com `renderExpanded`, `expandedKeys`, `defaultExpandedKeys` e `onExpandedChange`, e `caption` e `ariaLabel`. O cabeçalho ordenável vira um botão, acessível pelo teclado e com `aria-sort`, e as setas passam a ser ícones Phosphor. O carregamento usa o `Skeleton`, com larguras estáveis. No tamanho padrão, o texto das células passa de 12 para 14px. Novos tipos `TableSize`, `TableAlign` e `TableRowKey`.
