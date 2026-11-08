---
"@onblide/ui": minor
---

`Accordion` ganha `attached` (padrão `true`, igual ao visual atual; com `false`, cada item fica solto com 8px entre eles), `appearance` (`outline`, padrão, ou `ghost`, sem borda externa nem fundo), tamanhos `sm`, `md` (padrão) e `lg`, e `headingLevel` (`2` a `6`, padrão `3`) para o título de cada cabeçalho seguir a hierarquia da página. Ao abrir e fechar, o conteúdo agora anima a altura com `--ob-dur-base` e respeita o movimento reduzido; fechado, continua fora do alcance do Tab e do leitor de tela. Novos tipos `AccordionAppearance`, `AccordionSize` e `AccordionHeadingLevel`.
