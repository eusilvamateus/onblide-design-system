---
"@onblide/ui": major
---

Nova pintura `plain` no vocabulário de `appearance` (tipo `Appearance`): superfície e borda neutras, com a cor do tom só no ícone.

- `Alert`: aceita `plain` (padrão), `outline` e `soft`. O padrão continua com o visual de antes (superfície, borda neutra e ícone na cor do tom), agora com o nome `plain`. `appearance="outline"` passa a usar o fundo clarinho do tom (`--ob-*-050`) com uma borda de 1px na cor do tom, na mesma receita do `Badge` (35%, 45% no `warning` e 40% no `danger`).
- **`Toast`, `toast()` e `ToastStack`: o antigo `appearance="outline"` passa a se chamar `plain`**, sem mudar o visual, e `plain` é o novo padrão. **`outline` passa a ser o fundo clarinho com a borda na cor do tom** (o visual do antigo `soft`, agora na receita de borda do `Alert`), e **`soft` perde a borda**, ficando só com o fundo clarinho do tom.
