# 0017. Sidebar e Navbar no modelo de mercado

## Contexto

A `SideNav` e a `Navbar` cumpriam um papel comum nos design systems (shadcn, Atlassian, Carbon, Ant, Polaris), mas com
partes inventadas e falhas:

- a conta da pessoa vinha embutida: 11 props na `SideNav` e o `NavbarAccount`, com o menu "Perfil / Configurações / Sair"
  fixo e, na `Navbar`, nome e e-mail fictícios como padrão;
- os itens da `SideNav` eram botões, sem `<nav>` e sem `aria-current`, então não abriam em outra aba nem se integravam ao
  roteador; a `Navbar` usava links, mas com `onNav` bloqueava também o Ctrl+clique e o botão do meio;
- seções eram itens com `section` na mesma lista dos links, e um rótulo "Menu" aparecia por padrão;
- recolhida, a `SideNav` escondia os subitens sem outro caminho até eles e mostrava o rótulo pelo `title` do navegador;
- o botão de recolher ficava pendurado na borda com posição escrita à mão, trocava de ícone por JavaScript, tinha ajustes de
  frações de pixel e só aparecia no hover, sem caminho em telas de toque;
- nenhuma das duas tinha caminho para telas estreitas, e as marcas padrão eram a da Onblide, inclusive um link falso
  (`href="#"`) na `Navbar`.

## Decisão

1. **`SideNav` vira `Sidebar`**, o nome mais comum no ecossistema React e o par natural da `Navbar`. O nome antigo sai,
   sem apelido.
2. **Itens são links de verdade** (`href`), dentro de `<nav>`, com `aria-current="page"` no ativo. `onNav` intercepta só o
   clique simples; Ctrl, Cmd, Shift, Alt e o botão do meio seguem para o navegador. Item sem `href` vira botão. A regra é
   a mesma nas duas barras (`src/internal/navegacao.ts`).
3. **Grupos** (`groups: { label?, items }[]`) substituem as seções na lista, e o rótulo "Menu" sai.
4. **Cabeçalho e rodapé livres** (`header`, `footer`, que aceitam uma função de `{ collapsed }`) substituem a marca e a
   conta embutidas. A `Navbar` perde o `NavbarAccount` e a marca padrão. A conta é montada pela aplicação com `Menu`,
   `Button` e `Avatar`, sem componente novo, porque menu de conta não é peça de catálogo nos design systems de referência.
5. **Recolher** (`collapsible`, com `collapsed`, `defaultCollapsed` e `onCollapsedChange`) mantém os dois padrões de
   mercado que a barra antiga já usava, agora sem medidas soltas e sem JavaScript no hover: aberta, um botão com o
   ícone de barra lateral, centrado sobre a borda direita (padrão do Atlassian) aparece no hover da barra e no foco; recolhida, o cabeçalho vira o
   botão de expandir e a marca dá lugar ao ícone no hover e no foco (padrão do ChatGPT e do Claude). Em telas sem hover,
   os dois ficam sempre visíveis. `toggleShortcut` liga um atalho com Ctrl ou ⌘, mostrado no `Tooltip`. Recolhida, cada
   item mostra o rótulo no `Tooltip` e os subitens abrem num `Menu` ao lado.
6. **Telas estreitas:** com `onMobileOpenChange`, abaixo de `sm` a `Sidebar` abre num `Drawer` controlado por
   `mobileOpen`; o botão de menu da `Navbar` (`onMenuToggle`, `menuOpen`) a abre.
7. **Contadores** são neutros por padrão, com `badgeTone` nas duas barras.

## Consequências

- Quebra de compatibilidade: `SideNav`, `SideNavItem`, `SideNavProps`, `NavbarAccount`, `NavbarAccountProps` e `NavbarLink`
  saem; entra como major no changeset `sidebar-e-navbar`.
- O `Drawer` passa a ter `role="dialog"` e a esconder o painel fechado, que antes continuava alcançável pelo Tab.
- A navegação do site usa a `Sidebar` com links reais.
