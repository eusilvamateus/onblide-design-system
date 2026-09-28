# 0004. Não versionar a pasta `docs/` (substituída)

> **Status: substituída por [0005](0005-adotar-docs-canonica-e-versionada.md).**

## Contexto

Em 2026-09-27, a pasta `docs/` na raiz do repositório continha apenas planos e specs de trabalho
(`docs/superpowers/plans/`, `docs/superpowers/specs/`), artefatos de processo de uma sessão de
desenvolvimento, não conhecimento durável sobre o projeto.

## Decisão original

Remover o conteúdo existente, desfazer o rastreamento de `docs/` no Git e adicionar `/docs/` ao
`.gitignore` — a pasta passaria a ser usada só para planos/specs locais, nunca versionada.

## Por que foi substituída

Ao adotar a skill `governanca-documentacao`, `docs/` passou a ter um propósito diferente: memória
canônica e persistente do projeto (arquitetura, decisões, desenvolvimento, operações, integrações),
não mais um depósito de planos de sessão. Esse é um uso genuinamente distinto do que motivou a decisão
original, então `docs/` volta a ser versionada — ver [0005](0005-adotar-docs-canonica-e-versionada.md).

Planos e specs de sessões de trabalho, quando precisarem existir, devem ficar fora de `docs/` (por
exemplo, no diretório de scratch do agente) para não colidir com o novo propósito da pasta.
