# Documentação do projeto

Este diretório contém a documentação canônica e persistente do Onblide Design System: como o repositório é
organizado, como cada subsistema é desenvolvido e publicado, e as decisões duráveis por trás das escolhas
feitas.

Use este índice para localizar o contexto necessário sem precisar ler toda a pasta `/docs`.

`CLAUDE.md` traz as instruções de como o agente deve trabalhar neste repositório; aqui explica-se
como o projeto funciona. A documentação **de produto** — como instalar e usar `@onblide/ui` — vive no site
publicado em `docs-site/`, não é duplicada aqui.

## Mapa da documentação

### Arquitetura

- [`architecture/visao-geral.md`](architecture/visao-geral.md) — os dois subsistemas do repositório (`packages/ui`, `docs-site`), sem o antigo sync com o Claude Design) e como se relacionam.

### Desenvolvimento

- [`development/ambiente-de-desenvolvimento.md`](development/ambiente-de-desenvolvimento.md) — como rodar e verificar o pacote e o `docs-site` localmente, convenções de código e o fluxo de versionamento/release.

### Operações

- [`operations/deploy-do-docs-site.md`](operations/deploy-do-docs-site.md) — deploy do site de documentação no Vercel.

### Decisões

- [`decisions/0001-renomear-toggle-para-switch.md`](decisions/0001-renomear-toggle-para-switch.md)
- [`decisions/0002-phosphor-como-unica-biblioteca-de-icones.md`](decisions/0002-phosphor-como-unica-biblioteca-de-icones.md)
- [`decisions/0003-remover-deadline-calendar.md`](decisions/0003-remover-deadline-calendar.md)
- [`decisions/0004-nao-versionar-pasta-docs.md`](decisions/0004-nao-versionar-pasta-docs.md) — substituída por 0005
- [`decisions/0005-adotar-docs-canonica-e-versionada.md`](decisions/0005-adotar-docs-canonica-e-versionada.md)
- [`decisions/0006-adotar-tag-e-github-release-por-versao.md`](decisions/0006-adotar-tag-e-github-release-por-versao.md)
- [`decisions/0007-theme-manager-sem-provider.md`](decisions/0007-theme-manager-sem-provider.md)
- [`decisions/0008-enxugar-o-catalogo-e-basear-o-datepicker-no-calendar.md`](decisions/0008-enxugar-o-catalogo-e-basear-o-datepicker-no-calendar.md)
- [`decisions/0009-corrigir-a-numeracao-para-a-serie-0x.md`](decisions/0009-corrigir-a-numeracao-para-a-serie-0x.md)
- [`decisions/0010-vocabulario-unico-para-tone-appearance-e-variant.md`](decisions/0010-vocabulario-unico-para-tone-appearance-e-variant.md) — o vocabulário vive em `docs-site/docs/fundacoes/vocabulario-das-props.mdx`
- [`decisions/0011-breakpoints-mobile-first-com-escala-unica.md`](decisions/0011-breakpoints-mobile-first-com-escala-unica.md) — a regra vive em `docs-site/docs/fundacoes/breakpoints.mdx`
- [`decisions/0012-componentes-sem-numeros-soltos-nas-fundacoes.md`](decisions/0012-componentes-sem-numeros-soltos-nas-fundacoes.md) — as regras vivem nas páginas de `docs-site/docs/fundacoes/`
- [`decisions/0013-repositorio-so-com-o-design-system.md`](decisions/0013-repositorio-so-com-o-design-system.md) — encerra o Claude Design e define a estrutura de pastas

## Como manter esta documentação

- Atualize a fonte canônica junto com a alteração que a tornou desatualizada.
- Evite duplicar explicações completas em mais de um arquivo — se o assunto já tem fonte canônica em
  `docs-site/` ou `packages/ui/README.md`, aponte para lá.
- Use português técnico natural, preservando termos e identificadores que devam permanecer em inglês.
- Atualize este índice sempre que documentos forem criados, removidos, movidos, renomeados, consolidados
  ou arquivados.
