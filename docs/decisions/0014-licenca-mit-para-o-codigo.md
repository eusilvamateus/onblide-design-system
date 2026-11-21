# 0014. Licença MIT para o código

Status: aceita (2026-11-05)

## Contexto

O repositório era privado e não tinha licença, o que não permite que outras pessoas usem o código. O projeto vai se
tornar público e pretende ser adotado por terceiros. O pacote também distribui fontes de outros autores em `src/fonts/`,
todas sob a SIL Open Font License 1.1, que exige manter o aviso de copyright e o texto da licença junto das fontes.

## Decisão

- O código é distribuído sob a licença MIT, em nome de Mateus Neres Silva: `LICENSE` na raiz e uma cópia em
  `packages/ui/`, para acompanhar o pacote.
- As fontes continuam sob a SIL Open Font License 1.1, com os avisos em `packages/ui/src/fonts/OFL.txt`.
- O campo `license` do pacote é `MIT AND OFL-1.1`.
- O nome onblide e o logo não são licenciados como marca, conforme a seção de licença dos READMEs.

## Consequências

- Qualquer pessoa pode usar, alterar e vender o código, desde que mantenha o aviso de copyright.
- Uma fonte nova só entra no pacote com a licença conferida e o aviso acrescentado a `OFL.txt` ou a um arquivo próprio.
- `LICENSE` existe em dois lugares porque o GitHub lê o da raiz e o pacote só distribui o que está em `packages/ui/`.
