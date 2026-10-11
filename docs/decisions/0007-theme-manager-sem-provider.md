# 0007. Gerenciar a aparência com um `themeManager` global, sem Provider e sem componente de controle

## Contexto

O design system já definia dois temas (`:root` e `[data-theme="dark"]` em `tokens.css`), mas não tinha nenhum
mecanismo para escolher entre eles: persistência, modo "Sistema" e prevenção de flash no carregamento ficavam
para cada aplicação reescrever. Uma região com tema diferente do global (um preview, por exemplo) também não
funcionava para o tema claro, que só existia em `:root`.

## Decisão

- O `@onblide/ui` exporta um **`themeManager`** (`init`, `get`, `set`, `subscribe`) independente de framework, o hook
  **`useTheme()`** e o **`themeInitScript`** (também publicado como `@onblide/ui/theme-init`), que aplica o tema
  antes da primeira pintura.
- **Sem `ThemeProvider`.** O estado é um módulo único; o hook usa `useSyncExternalStore`.
- **Sem componente de controle** (`ThemeSwitcher`). Cada aplicação monta o controle com `ButtonGroup`, `Select`,
  `Switch` ou `Menu`, que já existem.
- **Duas camadas independentes.** O gerenciador controla apenas `data-theme` do `<html>`, sempre `light` ou `dark`
  ("Sistema" é resolvido por `prefers-color-scheme`). Regiões com outro tema usam `data-theme` no próprio elemento,
  só por CSS. Para isso o tema claro passou a existir também em `[data-theme="light"]`.
- Preferência em `localStorage`, chave `ob-theme`, valores `light`, `dark` e `system`; sem armazenamento, o estado
  segue em memória.

## Consequências

- Uma aplicação habilita a aparência com `themeManager.init()` e o script no `<head>`, sem recriar a infraestrutura.
- O módulo não acessa `window` nem `document` na importação, então é seguro em renderização no servidor.
- Uso e exemplos: `docs-site/docs/primeiros-passos/tema.mdx`.
- Fora desta decisão: auditar as cores fixas em componentes (`#fff`, `rgba(...)`) e migrar o `docs-site`, que segue
  com o `colorMode` do Docusaurus.
