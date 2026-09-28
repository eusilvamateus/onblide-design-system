# 0005. Adotar `/docs` como memória canônica e versionada do projeto

> Substitui [0004](0004-nao-versionar-pasta-docs.md).

## Contexto

O repositório tem instruções de agente (`project/CLAUDE.md`) carregando conhecimento operacional e de
produto misturado com regras de comportamento do agente, e nenhuma fonte central para decisões
arquiteturais e históricas do projeto — o que existe está espalhado entre `project/README.md`,
`project/package/README.md`, `docs-site/README.md` e a memória de sessões de trabalho.

Ao adotar a skill `governanca-documentacao` (2026-09-28), o projeto ganhou um padrão explícito para essa
lacuna: `/docs` como memória canônica, e arquivos de agente (`CLAUDE.md`) apontando para ela em vez de
concentrar o conhecimento.

## Decisão

- `docs/` volta a ser versionada, com a estrutura `architecture/`, `development/`, `operations/`,
  `integrations/`, `decisions/`, `reference/` (categorias criadas só quando têm conteúdo real).
- `docs-site/` continua sendo a fonte canônica da documentação **de produto** (como usar `@onblide/ui`) —
  `/docs` não a duplica; aponta para ela quando relevante.
- `project/CLAUDE.md` deixa de repetir conhecimento que já vive em `/docs` e passa a referenciá-lo.
- Planos e specs de sessões de trabalho não entram mais em `docs/` (função que a pasta tinha antes desta
  decisão) — ver [0004](0004-nao-versionar-pasta-docs.md).

## Consequências

- Toda mudança relevante de arquitetura, decisão de produto ou processo de release passa a exigir
  atualização da fonte canônica correspondente em `/docs`, na mesma alteração que a motivou.
- `docs/README.md` é o mapa de entrada; um agente sem contexto consegue descobrir onde procurar sem ler
  a pasta inteira.
