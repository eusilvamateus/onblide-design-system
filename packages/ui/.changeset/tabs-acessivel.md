---
"@onblide/ui": minor
---

O `Tabs` passa a ser anunciado como lista de abas: cada aba tem o papel de aba e diz se está selecionada, só a aba ativa entra na ordem do `Tab`, e as setas, `Home` e `End` andam entre as abas já ativando, pulando as desabilitadas. Novas props: `ariaLabel`, que nomeia o grupo, e `panelId` em cada aba, que a liga ao painel que ela mostra (`aria-controls`). As abas também deixam de enviar formulário (`type="button"`).
