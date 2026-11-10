# 0018. Pintura `plain` no vocabulário

## Contexto

O `Alert` tinha duas pinturas: `outline`, com superfície, borda neutra e só o ícone na cor do tom, e `soft`, com o fundo
clarinho do tom. O `outline` passou a usar o fundo clarinho e a borda na cor do tom, um visual pedido para dar mais
destaque ao alerta. O visual antigo, mais calmo, continuava útil, mas nenhuma palavra do vocabulário o descrevia:
`outline` já tinha o novo sentido, `soft` não tem borda e `ghost` não tem fundo. O `Toast` chamava de `outline` exatamente
esse visual antigo, então a mesma palavra teria dois sentidos.

## Decisão

1. O vocabulário de `appearance` ganha `plain`: **superfície e borda neutras; a cor do tom aparece só no ícone ou no ponto.**
2. `outline`, em componentes com tom, é a borda na cor do tom. Em componentes sem tom (`Kbd`, `Tooltip`, `Accordion`,
   `ToggleButton`), a borda do `outline` continua neutra, e `plain` não se aplica a eles.
3. O `Alert`, o `Toast`, o `toast()` e o `ToastStack` aceitam as mesmas três pinturas: `plain` (padrão), `outline` e `soft`.
   O antigo `outline` do `Toast` passa a se chamar `plain`, sem mudar o visual. O antigo `soft` do `Toast`, que tinha
   borda na cor do tom, era na prática um `outline`: o visual com borda passa a ser o `outline`, e o `soft` fica sem borda,
   como manda o vocabulário.

## Consequências

- Quem passa `appearance="outline"` no `Toast`, no `toast()` ou no `ToastStack` precisa trocar para `plain` para manter o
  visual neutro; quem passa `soft` e quer a borda precisa trocar para `outline`. Entra como quebra de compatibilidade no
  changeset `pintura-plain`.
- O `Alert` sem `appearance` continua com o visual de antes; `appearance="outline"` passa a ter o fundo e a borda do tom.
- O tipo `Appearance` exportado pelo pacote ganha `plain`.
