# Notas do design-sync (@onblide/ui)

- Config em `project/package/.design-sync/` (rodar tudo de dentro de `project/package`). Pacote construído com `npm run build`; entrada `./dist/index.js`, `--node-modules ./node_modules`.
- `Brands` é objeto, não componente: excluído via `componentSrcMap`. `Icons` é namespace (`Icons.plus`), aceito como composto.
- CSS: `cssEntry` = `.design-sync/.cache/css/styles.css`, gerado por `.design-sync/build-css.mjs` (parte do `buildCmd`): esbuild resolve os `@import` de `src/styles.css` (tokens + Phosphor) num arquivo só, com as fontes em `fonts/`, e remove a fonte SVG do Phosphor. Não usar `tokensPkg`/`tokensGlob`/`extraFonts` para o Phosphor: isso duplicava o `@font-face` e deixava `url()` quebradas (apontado pelo agente do Claude Design em 2026-09-26).
- Envio: sempre completo (todos os `components/**`, `_preview/**`, fontes e bundle). Envio parcial deixa `.d.ts` de versões antigas ao lado de um bundle novo e o app acusa componentes desatualizados.
- Sem `docsDir`: os guias por componente vivem em `docs-site/guias/*.mdx` (MDX com componentes do site); os `.prompt.md` saem do `.d.ts` (com JSDoc) + previews.
- `Button` não tem prop `disabled`. `Tooltip` só abre com hover: o preview simula `mouseover` ao montar; `Dropdown` clica o gatilho ao montar. `Modal`/`Drawer` ficam contidos com `transform: translateZ(0)`.
- Chromium do playwright instalado em `.ds-sync` (bundled, perfil próprio). NUNCA usar/fechar Edge/Chrome do usuário nem matar processos.

## Known render warns
- `[FONT_MISSING]` "Iowan Old Style"/"Apple Garamond": nomes de fallback da pilha serifada, aceitos.
- `[RENDER_THIN]` Logo, Spinner, Drawer: SVG/animação sem texto e overlay fixo; conferidos nas capturas.

## Re-sync risks
- Previews de Tooltip/Dropdown dependem de eventos simulados; se o componente mudar a forma de abrir, revisar.
- `overrides` de cardMode (column/single) ligados aos nomes das células dos previews.
- Fontes/glifos Phosphor dependem de `@phosphor-icons/web@2.1.2` em node_modules.

## Fluxo com o Claude Design (código é a fonte)
- O sync é só código → Claude Design. Trabalho feito lá volta ao código por portagem manual.
- O agente do Claude Design é orientado (pelo README gerado do `conventions.md`) a não editar as pastas geradas e a criar propostas em `proposals/<Nome>/`. A pasta `proposals/` não está nos globs de escrita/exclusão do sync, então não é apagada.
- Antes de cada sync: `DesignSync(list_files)` e conferir arquivos remotos fora do conjunto enviado (ignorar `_adherence.oxlintrc.json`, `_ds_manifest.json`, `support.js`, gerados pelo app); avisar o usuário do que for novo. Edições dentro das pastas geradas só se detectam baixando os arquivos um a um.
- Para trazer uma proposta: ler `proposals/<Nome>/` (poucos arquivos), portar para `project/package/src/<categoria>/<Nome>/`, exemplo em `.design-sync/previews/`, changeset, `npm run verify`, release e sync.

