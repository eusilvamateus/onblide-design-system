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
- **SEMPRE buscar `_ds_sync.json` remoto de novo antes de rodar `resync.mjs`** (`DesignSync(get_file, path: "_ds_sync.json")` → sobrescrever `.design-sync/.cache/remote-sync.json`). Em 2026-09-27 usei o cache local de uma sessão anterior sem atualizar, e o diff comparou contra um anchor de antes da reorganização em categorias (`primitives`/`general`), gerando um `deletePaths` gigante e errado. Nunca reusar `remote-sync.json` de sessão para sessão sem refazer o fetch.
- Remoto tinha `ds/`, `package/` e `assets/` na raiz — upload manual de antes do formato atual do sync, fora dos globs (`ds/docs` nem existe mais localmente, virou docs-site). Removidos em 2026-09-27 com aprovação do usuário. Se voltar a aparecer algo assim fora do conjunto do sync, avisar antes de mexer.

## Portagem de propostas (2026-09-27)

13 propostas do Claude Design portadas de uma vez para `src/`: `Divider`, `List` (+ `ListItem`, `ListSubheader`,
`ListDivider`), `Breadcrumbs`, `Textarea`, `NumberField`, `FileUpload`, `Autocomplete`, `Menu` (+ `ContextMenu`,
`MenuPanel`), `Menubar` (+ `KeyList`), `Popover`, `Stepper`, `Timeline`, `TreeView`. Cada um já tem preview em
`.design-sync/previews/<Nome>.tsx` (2-4 exemplos, seguindo a receita do skill), pronto pro próximo sync — nenhum
sync foi rodado ainda para eles, então `_ds_sync.json` remoto não tem esses nomes e o próximo `resync.mjs` vai
tratá-los como `added`, não `changed`.

Sync feito em 2026-09-27 (58 componentes no ar). O que apareceu de verdade, pra próxima vez:

- **`[BUNDLE_EXPORT] 58/58 not a component`** — todos falharam igual, incluindo componentes intocados. Causa
  real: `Autocomplete.tsx` e `TreeView.tsx` tinham um regex de diacríticos (`normalize().replace(/[̀-ͯ]/g, '')`)
  salvo com os CARACTERES UNICODE LITERAIS em vez do escape `\u`. Em algum ponto do pipeline (leitura/gravação
  com encoding diferente de UTF-8) os bytes viravam mojibake e o regex quebrava (`Range out of order in
  character class`) — um erro síncrono na avaliação do bundle que impedia `window.OnblideUI` de ser criado.
  O render check por componente passava normal (mascarava o problema); só o smoke `[BUNDLE_EXPORT]`, que carrega
  o bundle sozinho numa página em branco, pegou. Corrigido trocando por `/\p{Diacritic}/gu` — zero caractere
  não-ASCII na fonte. **Se esse erro voltar (falha uniforme em 100% dos componentes), suspeitar primeiro de
  regex/string com caractere Unicode literal em algum `.tsx`, não do pipeline.**
- `Menu` não tinha nenhuma prop pra abrir o painel sem clique — toda captura/exemplo mostrava só o gatilho
  fechado (reprovava "Completo" na rubrica). Adicionada `defaultOpen` (mesmo padrão do `Popover`).
- `Timeline`, `FileUpload`, `Breadcrumbs`, `Stepper` precisaram de `cardMode: "column"`; `Popover`, de
  `cardMode: "single"` (painel sai por portal, nenhum grid comporta) — todos já em `config.json`.
- `ContextMenu`, `KeyList`, `ListDivider`, `ListItem`, `ListSubheader`, `MenuPanel` caem no grupo "general" no
  catálogo remoto — são exports secundários de `Menu.tsx`/`List.tsx`/`Menubar.tsx`, e a heurística de grupo do
  conversor só acerta quando o arquivo se chama igual ao componente. Cosmético (não afeta bundle/props/docs);
  não vale a complexidade de forçar via `componentSrcMap` (o `dirname` apontaria pro arquivo errado). Se incomodar,
  a correção de verdade é o conversor aceitar um override de grupo explícito por nome — não existe hoje.
- `List`/`Menu` reexportam peças que não viram card próprio no site (`ListItem` etc.) nem devem virar
  `proposals/` novas — já são parte oficial do `List`/`Menu`.
- `TreeView`: preview `Editavel` usa `draggable`; a alça e o "fantasma" que segue o cursor só aparecem em
  interação real (pointer down), então a captura estática mostra só a árvore parada — normal, não é bug.

## Fluxo com o Claude Design (código é a fonte)
- O sync é só código → Claude Design. Trabalho feito lá volta ao código por portagem manual.
- O agente do Claude Design é orientado (pelo README gerado do `conventions.md`) a não editar as pastas geradas e a criar propostas em `proposals/<Nome>/`. A pasta `proposals/` não está nos globs de escrita/exclusão do sync, então não é apagada.
- Antes de cada sync: `DesignSync(list_files)` e conferir arquivos remotos fora do conjunto enviado (ignorar `_adherence.oxlintrc.json`, `_ds_manifest.json`, `support.js`, gerados pelo app); avisar o usuário do que for novo. Edições dentro das pastas geradas só se detectam baixando os arquivos um a um.
- Para trazer uma proposta: ler `proposals/<Nome>/` (poucos arquivos), portar para `project/package/src/<categoria>/<Nome>/`, exemplo em `.design-sync/previews/`, changeset, `npm run verify`, release e sync.
- Ícones: os seis pesos do Phosphor entram pelo `src/styles.css` (build-css.mjs empacota todos; `fonts/` leva Phosphor, Phosphor-Bold, -Fill, -Light, -Thin e -Duotone). Papel de cada peso: ver CLAUDE.md e docs-site › Fundações › Iconografia.
