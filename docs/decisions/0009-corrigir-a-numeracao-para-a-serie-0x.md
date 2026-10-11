# 0009. Corrigir a numeração para a série 0.x

## Contexto

Entre 2026-09-28 e 2026-10-11 o `@onblide/ui` saltou de `1.0.0` para `6.1.0` em 29 releases, uma por alteração. A numeração não
representava a maturidade do projeto, e o controle de quando uma versão sobe é do dono do projeto, não do agente. A última tag da
série anterior ao `1.0.0` era `onblide-ui@0.16.0`.

## Decisão

- O código que estava em `6.1.0` passou a ser a versão `0.17.0`, continuando a série `0.x` sem alterar nenhum arquivo funcional.
- As 58 tags `vX.Y.Z` e `onblide-ui@X.Y.Z` de `1.0.0` a `6.1.0` foram preservadas como `arquivo/<nome-original>`, apontando
  para os mesmos objetos de tag, e os nomes antigos foram removidos.
- Os 29 GitHub Releases dessas versões foram apontados para as tags de arquivo, marcados como pre-release e intitulados
  `[arquivada] vX.Y.Z`, com o corpo original preservado.
- As seções `1.0.0` a `6.1.0` do `CHANGELOG.md` permanecem, marcadas como arquivadas.
- As tags `onblide-ui@0.1.0` a `onblide-ui@0.16.0` continuam como estavam.

## Consequências

- Para localizar um commit antigo pela versão, usar a tag `arquivo/vX.Y.Z`. As referências a versões `1.x` a `6.x` em documentos
  históricos (por exemplo `.design-sync/NOTES.md`) correspondem a essas tags.
- A decisão de `0006` sobre tag `vX.Y.Z` + GitHub Release por versão continua valendo a partir da `0.17.0`.
