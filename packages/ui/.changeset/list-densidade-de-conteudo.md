---
"@onblide/ui": minor
---

`List` separa a densidade pelo tipo de lista. O padrão (`md`) passa a ser a densidade de conteúdo, para pessoas, arquivos e registros: 12px em cima e embaixo, 16px nas laterais, 48px de altura mínima, 4px entre o título e a descrição e a descrição em 13px. A densidade anterior do `md` vira `sm` (opções e navegação), e a anterior do `sm` vira o novo `xs` (painéis densos). `Menu`, `Autocomplete` e `TreeView` pedem as densidades de opção e não mudam de aparência. O `FileUpload` deixa de sobrescrever o espaçamento da lista de arquivos e usa o padrão novo. Quem usava `List` ou `ListItem` sem `size` ganha mais respiro; quem usava `size="sm"` e quer a aparência de antes passa a usar `size="xs"`.
