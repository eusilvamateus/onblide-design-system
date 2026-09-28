# 0001. Renomear `Toggle` para `Switch`

## Contexto

O componente de liga/desliga do design system se chamava `Toggle`. O elemento interno usa
`role="switch"` (padrão ARIA para esse tipo de controle), e o nome de mercado consolidado para esse
componente — em toda a indústria de design systems — é "switch", não "toggle" (que descreve a ação, não
o componente).

## Decisão

Renomear `Toggle` para `Switch` em todo o pacote: componente, arquivo, tipos, testes, previews do
design-sync e documentação. Mudança breaking, sem período de transição ou alias — versão major
(`feat(switch)!:`).

## Consequências

- Quem usava `<Toggle>` precisa migrar para `<Switch>` na próxima major.
- O nome do componente agora corresponde ao `role` ARIA que ele já emitia, reduzindo a distância entre
  a API e a semântica de acessibilidade.
