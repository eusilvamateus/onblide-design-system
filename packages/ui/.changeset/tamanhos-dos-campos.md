---
"@onblide/ui": minor
---

Os campos de formulário ganham a escala de tamanho `sm`, `md` (padrão) e `lg`, com 32, 40 e 48px de altura, as mesmas do `Button`, para campo e botão alinharem lado a lado: `Input`, `Select`, `SearchInput`, `NumberField`, `Datepicker`, `Autocomplete` e o `FieldShell`. O texto acompanha em 13, 14 e 15px, junto com recuo, ícones, botões internos, chips da seleção múltipla e opções da lista. O `Textarea` ganha a mesma escala de texto, altura da linha e recuo, e o `CodeInput` ganha células de 40×48, 48×56 e 56×64px. Novos tipos `FieldShellSize`, `InputSize`, `SelectSize`, `SearchInputSize`, `NumberFieldSize`, `DatepickerSize`, `AutocompleteSize`, `TextareaSize` e `CodeInputSize`.

Mudanças visíveis no tamanho padrão: os campos passam de 44 para 40px de altura; o recuo lateral do `Select`, do `Autocomplete`, do `NumberField` e do `Textarea` passa para 16px, igual ao do `Input`; o texto do `SearchInput` passa de 14,5 para 14px. No `Input`, a prop `size` passa a ser o tamanho do campo, no lugar do atributo nativo `size` do `<input>`.

O `Chip` ganha o tamanho `xs`, usado nas opções escolhidas dentro de um campo `sm`.
