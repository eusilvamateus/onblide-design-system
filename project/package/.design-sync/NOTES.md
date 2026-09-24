# Notas do design-sync (@onblide/ui)

- Config em `project/package/.design-sync/` (rodar tudo de dentro de `project/package`). Pacote construído com `npm run build`; entrada `./dist/index.js`, `--node-modules ./node_modules`.
- `Brands` é objeto, não componente: excluído via `componentSrcMap`. `Icons` é namespace (`Icons.plus`), aceito como composto.
- Tokens/fontes: `cssEntry` = `src/tokens.css`. Phosphor (glifos) entra por `tokensPkg`+`tokensGlob` (só `style.css`) e as fontes por `extraFonts` (o `tokensGlob` não copia binários).
- Sem `docsDir`: as docs em `ds/docs` são HTML, não `.md`; os `.prompt.md` saem do `.d.ts` + previews.
- `Button` não tem prop `disabled`. `Tooltip` só abre com hover: o preview simula `mouseover` ao montar; `Dropdown` clica o gatilho ao montar. `Modal`/`Drawer` ficam contidos com `transform: translateZ(0)`.
- Chromium do playwright instalado em `.ds-sync` (bundled, perfil próprio). NUNCA usar/fechar Edge/Chrome do usuário nem matar processos.

## Known render warns
- `[FONT_MISSING]` "Iowan Old Style"/"Apple Garamond": nomes de fallback da pilha serifada, aceitos.
- `[RENDER_THIN]` Logo, Spinner, Drawer: SVG/animação sem texto e overlay fixo; conferidos nas capturas.

## Re-sync risks
- Previews de Tooltip/Dropdown dependem de eventos simulados; se o componente mudar a forma de abrir, revisar.
- `overrides` de cardMode (column/single) ligados aos nomes das células dos previews.
- Fontes/glifos Phosphor dependem de `@phosphor-icons/web@2.1.2` em node_modules.
