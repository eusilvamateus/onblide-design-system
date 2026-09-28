# 0003. Remover o componente `DeadlineCalendar`

## Contexto

`DeadlineCalendar` foi portado ao pacote como uma variante do `Datepicker` desenhada para uma
implementação específica. Não nasceu como um componente pensado para uso geral no design system.

## Decisão

Remover `DeadlineCalendar` por completo: código-fonte, export do pacote, smoke test, preview do
design-sync, página de preview em `project/ds/components/`, demo e guia do `docs-site`, e o arquivo
correspondente no projeto do Claude Design (via `/design-sync`). Sem substituto e sem caminho de migração
— versão major (`feat(deadline-calendar)!:`).

## Consequências

- Quem precisar dessa funcionalidade constrói fora do pacote, compondo `Datepicker` e outros componentes
  existentes.
- `@onblide/ui` foi para a versão `1.0.0` por causa dessa remoção.
