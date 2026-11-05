---
"@onblide/ui": minor
---

Novo componente `ScrollArea`: área com rolagem nativa e uma barra fina e discreta, desenhada com os tokens do tema (`--ob-scrollbar-thumb`, `--ob-scrollbar-thumb-hover` e `--ob-scrollbar-track`). Rola na vertical, na horizontal ou nos dois eixos, mostra a barra ao rolar, ao passar o mouse e ao focar (`visibility="hover"`, o padrão) e entra na ordem de tabulação quando há o que rolar. O corpo do `Modal`, o `Drawer`, a lista do `SideNav`, a `Table` e a `Timeline` (horizontal), a lista do `Autocomplete` e o painel do `Select` passam a rolar por ele, e o `SideNav` deixa de ter uma barra própria.
