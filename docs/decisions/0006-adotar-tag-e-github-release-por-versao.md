# 0006. Adotar tag `vX.Y.Z` + GitHub Release por versão publicada

## Contexto

O pacote `@onblide/ui` já usava Versionamento Semântico via Changesets, com tags Git no formato
`onblide-ui@X.Y.Z` até a versão `0.16.0`. Nenhuma versão publicada tinha um GitHub Release correspondente
— só a tag e o `CHANGELOG.md` do pacote registravam a mudança.

Ao adotar a skill `fluxo-git-releases` (2026-09-28), o projeto ganhou um padrão explícito: toda versão
publicada deve existir também como GitHub Release, e a tag deve seguir `vX.Y.Z`.

## Decisão

A partir de `1.0.0`/`1.0.1` (aplicado retroativamente nesta decisão), toda release do `@onblide/ui` ganha:

- a tag `vX.Y.Z` (nova, padrão da skill), **e**
- a tag `onblide-ui@X.Y.Z` (mantida por compatibilidade com o histórico de tags anterior a esta decisão),
- um GitHub Release publicado com `gh release create`, resumindo features/fixes/breaking changes da versão.

## Consequências

- O fluxo de release (`docs/development/ambiente-de-desenvolvimento.md`) passa a incluir a criação de
  ambas as tags e do GitHub Release como etapa obrigatória, não opcional.
- Tags anteriores a `1.0.0` (`onblide-ui@0.2.0` até `onblide-ui@0.16.0`) não ganham `vX.Y.Z`
  retroativamente nem GitHub Release retroativo — a decisão vale a partir do momento em que foi tomada.

Nota: as versões `1.0.0` a `6.1.0` citadas aqui foram renumeradas e arquivadas; ver [0009](0009-corrigir-a-numeracao-para-a-serie-0x.md).
