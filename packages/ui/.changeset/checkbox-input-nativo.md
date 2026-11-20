---
"@onblide/ui": minor
---

`Checkbox` passa a ter um `<input type="checkbox">` nativo por baixo da caixa desenhada, como nos design systems do mercado. Ganha `name`, `value` e `required` para formulários e `error`, que mostra a mensagem no lugar da descrição e deixa a borda vermelha. O Espaço marca e desmarca; o Enter deixa de alternar a caixa e fica livre para enviar o formulário. Ganha hover, anel de foco ao navegar pelo teclado e um leve encolhimento ao pressionar. A borda passa a ter 1px em `--ob-fg-mute`, mais visível quando desmarcada, e o check passa a ser o `check` bold do Phosphor, com a mesma espessura do traço do indeterminado. O nome acessível vem só do `label`, e a descrição fica ligada por `aria-describedby`.
