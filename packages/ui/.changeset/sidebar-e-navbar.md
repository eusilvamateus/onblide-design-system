---
"@onblide/ui": major
---

**`SideNav` passa a se chamar `Sidebar`** (`SideNavItem` → `SidebarItem`, `SideNavProps` → `SidebarProps`), com uma API no modelo de mercado:

- itens são links de verdade (`href`) dentro de `<nav aria-label>`, com `aria-current="page"` no ativo; `onNav` intercepta só o clique simples, e Ctrl+clique e o botão do meio abrem em outra aba; item sem `href` vira botão;
- **`items` com `section` dá lugar a `groups`** (`{ label?, items }[]`); o rótulo "Menu" (`menuLabel`) sai;
- **marca e conta embutidas saem** (`brand`, `brandMark`, `hideBrand`, `hideAccount`, `accountName`, `accountDetail`, `userInitials`, `accountImage`, `accountImageAlt`, `accountMenu`, `onProfile`, `onSettings`, `onSignOut`); no lugar, `header` e `footer` livres, que aceitam uma função de `{ collapsed }`;
- **`onToggle` dá lugar a `collapsible`, `collapsed`, `defaultCollapsed` e `onCollapsedChange`**: aberta, um botão com o ícone de barra lateral (`sidebar-simple`) sobre a borda direita aparece no hover da barra e no foco; recolhida, o cabeçalho vira o botão de expandir, com o ícone no lugar da marca no hover e no foco; em telas de toque, os dois ficam sempre visíveis; `toggleShortcut` liga um atalho com Ctrl ou ⌘ (como Ctrl+B), mostrado no `Tooltip`; recolhida, cada item mostra o rótulo no `Tooltip`, o contador vira ponto, os títulos de grupo viram divisórias e os subitens abrem num `Menu` ao lado;
- **`flush` dá lugar a `variant="floating" | "flush"`**;
- com `onMobileOpenChange`, abaixo de `sm` (768px) a barra abre num `Drawer` controlado por `mobileOpen`;
- o contador é neutro por padrão, com `badgeTone`.

Na `Navbar`, **`NavbarAccount`, `NavbarAccountProps` e `NavbarLink` saem**: a conta é montada com `Menu`, `Button` e `Avatar`. **A marca padrão sai** (`brand` vazio não mostra marca, sem o link falso `href="#"`). Com `onNav`, só o clique simples é interceptado; item sem `href` vira botão; novos `badgeTone` (contador neutro por padrão) e `menuOpen` (marca `aria-expanded` no botão de menu). Novos tipos `SidebarGroup`, `SidebarVariant`, `SidebarState` e `SidebarSlot`.
