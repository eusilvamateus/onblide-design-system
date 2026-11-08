---
"@onblide/ui": patch
---

`Navbar` e `Breadcrumbs`: um link sem `href` e sem `onNav`/`onNavigate` não navega mais para "#", que levava a página de volta ao topo. O `Navbar` ocupa a largura do contêiner mesmo dentro de um flex centralizado, e os links não encolhem mais por baixo das ações; em tela estreita, use `compact`.
