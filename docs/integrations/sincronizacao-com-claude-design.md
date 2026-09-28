# Sincronização com o Claude Design

O [Claude Design](https://claude.ai/design) é a ferramenta de design da Claude: um agente projeta telas a
partir de componentes reais. Este projeto converte `@onblide/ui` para o formato que o Claude Design consome
e envia para um projeto próprio em claude.ai/design, para que os designs saiam feitos com os componentes de
verdade do Onblide — não com componentes genéricos.

## Direção do fluxo

**Só código → Claude Design.** Nunca o contrário: o pacote `@onblide/ui` é sempre a fonte de verdade.
Trabalho feito do lado do Claude Design (propostas de novos componentes, ajustes visuais) volta ao código
por portagem manual — nunca é puxado automaticamente de volta.

## Quando roda

Só quando o usuário aciona explicitamente o comando `/design-sync`. Não é uma skill autoacionável nem roda
como parte de nenhum outro fluxo (build, release, CI).

## Como o agente do Claude Design usa o pacote sincronizado

O agente é orientado, pelo README gerado a partir de `project/package/.design-sync/conventions.md`, a nunca
editar as pastas geradas pelo sync e a propor mudanças em `proposals/<Nome>/` dentro do próprio projeto do
Claude Design. Para trazer uma proposta de volta ao código: ler `proposals/<Nome>/`, portar para
`project/package/src/<categoria>/<Nome>/`, criar exemplo em `.design-sync/previews/<Nome>.tsx`, changeset,
`npm run verify`, release, e então rodar `/design-sync` de novo para enviar o componente oficial e (se o
usuário aprovar) remover a proposta correspondente.

## Onde fica o conhecimento operacional detalhado

O passo a passo técnico do sync (config, scripts, diagnóstico de erros, armadilhas conhecidas) muda com
frequência e é consumido diretamente pela skill `/design-sync`, não por um humano lendo este documento — por
isso fica nos próprios arquivos que a skill lê, não duplicado aqui:

- [`project/package/.design-sync/config.json`](../../project/package/.design-sync/config.json) — configuração do sync (projeto alvo, mapeamento de componentes, overrides de layout).
- [`project/package/.design-sync/conventions.md`](../../project/package/.design-sync/conventions.md) — convenções de uso do pacote, injetadas no agente do Claude Design.
- [`project/package/.design-sync/NOTES.md`](../../project/package/.design-sync/NOTES.md) — histórico de execuções, armadilhas conhecidas e lições de cada sync.
