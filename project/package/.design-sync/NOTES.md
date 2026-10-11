# Notas do design-sync (@onblide/ui)

- Config em `project/package/.design-sync/` (rodar tudo de dentro de `project/package`). Pacote construído com `npm run build`; entrada `./dist/index.js`, `--node-modules ./node_modules`.
- `Icons` é namespace (`Icons.plus`), aceito como composto.
- CSS: `cssEntry` = `.design-sync/.cache/css/styles.css`, gerado por `.design-sync/build-css.mjs` (parte do `buildCmd`): esbuild resolve os `@import` de `src/styles.css` (tokens + Phosphor) num arquivo só, com as fontes em `fonts/`, e remove a fonte SVG do Phosphor. Não usar `tokensPkg`/`tokensGlob`/`extraFonts` para o Phosphor: isso duplicava o `@font-face` e deixava `url()` quebradas (apontado pelo agente do Claude Design em 2026-09-26).
- Envio: sempre completo (todos os `components/**`, `_preview/**`, fontes e bundle). Envio parcial deixa `.d.ts` de versões antigas ao lado de um bundle novo e o app acusa componentes desatualizados.
- Sem `docsDir`: os guias por componente vivem em `docs-site/guias/*.mdx` (MDX com componentes do site); os `.prompt.md` saem do `.d.ts` (com JSDoc) + previews.
- `Button` não tem prop `disabled`. `Tooltip` só abre com hover: o preview simula `mouseover` ao montar. `Modal`/`Drawer` ficam contidos com `transform: translateZ(0)`.
- Chromium do playwright instalado em `.ds-sync` (bundled, perfil próprio). NUNCA usar/fechar Edge/Chrome do usuário nem matar processos.

## Pausado em 2026-10-08 — não sincronizar nem consultar o Claude Design

**Pedido explícito do usuário: nenhuma chamada à ferramenta `DesignSync` (sync, `get_file`, `list_files` etc.)
até segunda ordem.** Motivo: autorização de escrita (`/design-login`) pendente. Ficaram acumuladas sem subir:
`maxBookingDays` do Datepicker (v1.4.0), marca/conta configuráveis da SideNav + `placement` do Menu (v1.5.0),
e o tamanho de fonte do conteúdo da Table (v1.5.1). Releases, docs-site e GitHub seguem normalmente; só o
Claude Design fica de fora até o usuário liberar.

## Known render warns
- `[FONT_MISSING]` "Iowan Old Style"/"Apple Garamond": nomes de fallback da pilha serifada, aceitos.
- `[RENDER_THIN]` Logo, Spinner, Drawer: SVG/animação sem texto e overlay fixo; conferidos nas capturas.

## Re-sync risks
- Previews de Tooltip dependem de eventos simulados; se o componente mudar a forma de abrir, revisar.
- `overrides` de cardMode (column/single) ligados aos nomes das células dos previews.
- Fontes/glifos Phosphor dependem de `@phosphor-icons/web@2.1.2` em node_modules.
- **SEMPRE buscar `_ds_sync.json` remoto de novo antes de rodar `resync.mjs`** (`DesignSync(get_file, path: "_ds_sync.json")` → sobrescrever `.design-sync/.cache/remote-sync.json`). Em 2026-09-27 usei o cache local de uma sessão anterior sem atualizar, e o diff comparou contra um anchor de antes da reorganização em categorias (`primitives`/`general`), gerando um `deletePaths` gigante e errado. Nunca reusar `remote-sync.json` de sessão para sessão sem refazer o fetch.
- Remoto tinha `ds/`, `package/` e `assets/` na raiz — upload manual de antes do formato atual do sync, fora dos globs (`ds/docs` nem existe mais localmente, virou docs-site). Removidos em 2026-09-27 com aprovação do usuário. Se voltar a aparecer algo assim fora do conjunto do sync, avisar antes de mexer.

## Portagem de propostas (2026-09-27)

13 propostas do Claude Design portadas de uma vez para `src/`: `Divider`, `List` (+ `ListItem`, `ListSubheader`,
`ListDivider`), `Breadcrumbs`, `Textarea`, `NumberField`, `FileUpload`, `Autocomplete`, `Menu` (+ `ContextMenu`,
`MenuPanel`), `Menubar`, `Popover`, `Stepper`, `Timeline`, `TreeView`. Cada um já tem preview em
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
- `ContextMenu`, `ListDivider`, `ListItem`, `ListSubheader`, `MenuPanel` caem no grupo "general" no
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

## Re-sync de 2026-09-28 (remoção do DeadlineCalendar)

DeadlineCalendar foi removido do pacote (breaking, `@onblide/ui` 1.0.0) numa sessão anterior, mas o sync só
rodou depois — o anchor remoto (`_ds_sync.json`) ainda listava o componente. Resync driver confirmou: 57
componentes `unchanged` (verified-by-upload, sem recaptura), 0 changed, 0 added, 1 `removed`
(`DeadlineCalendar`). `upload.deletePaths` trouxe os 6 arquivos certos; `_preview/DeadlineCalendar.css` não
existia remoto (previews só emitem `.js`) e a deleção seguiu sem esse path, como esperado. Nenhum warning novo
além dos já catalogados em "Known render warns". `list_files` pós-upload confirma zero resquício.

**Resolvido em 2026-09-28:** as 13 pastas de propostas já portadas (`Autocomplete`, `Breadcrumbs`,
`Divider`, `FileUpload`, `List`, `Menu`, `Menubar`, `NumberField`, `Popover`, `Stepper`, `Textarea`,
`Timeline`, `TreeView` — 37 arquivos) foram removidas do remoto a pedido do usuário, via `finalize_plan`/
`delete_files` direto (fora do fluxo normal do sync, já que `proposals/` está fora dos globs de
escrita/exclusão). Mantida a infraestrutura da seção — `proposals/README.md`, `proposals/_shell.jsx`,
`proposals/index.html` — pronta pra próxima proposta. Confirmado com `list_files` pós-deleção: só esses 3
arquivos restam em `proposals/`.

**Lembrete permanente:** `proposals/` nunca é limpa pelo sync normal (`resync.mjs`). Quando uma proposta
for portada oficialmente para `src/`, a pasta correspondente em `proposals/<Nome>/` do remoto fica órfã até
alguém apagar manualmente (como aqui) — vale perguntar ao usuário perto do fim de cada portagem se quer
apagar a proposta de origem, em vez de deixar acumular.

## `proposals/index.html` tem uma lista hardcoded — nunca se autocorrige

`proposals/index.html` (a página-índice da seção) tem um array `items` **escrito à mão dentro do próprio
HTML**, listando nome/grupo/descrição de cada proposta com link pra `<Nome>/index.html`. Apagar a pasta de
uma proposta (`proposals/<Nome>/`) NÃO atualiza esse array — descoberto em 2026-09-28, quando as 13
propostas portadas foram removidas mas `index.html` continuou linkando pra todas, com 13 links quebrados.
**Toda vez que uma pasta é adicionada ou removida de `proposals/`, `proposals/index.html` precisa ser
reescrito à mão junto** (é infraestrutura, não é gerado por nada — ver `proposals/_shell.jsx` e
`proposals/README.md`, os outros dois arquivos de infraestrutura da seção).

## Portagem de ButtonGroup e ToggleButton (2026-09-28)

Duas propostas novas do Claude Design (`proposals/ButtonGroup/`, `proposals/ToggleButton/`), portadas para
`src/actions/`. `ButtonGroup` compõe com `Button`/`ToggleButton`/`Tooltip`/`Menu` via introspecção de
`children` (função `leaf()`/`patch()` que desce por `trigger` do Menu e por `children` do Tooltip pra achar
o botão real) — mantida a mesma lógica do protótipo, só tipada. `@onblide/ui` 1.0.1 → 1.1.0 (minor).

Sync: os dois pegaram `[GRID_OVERFLOW]` na primeira validação (`SelecaoUnica` do ButtonGroup e `Tamanhos` do
ToggleButton mais largos que a célula do grid) — resolvido com `cardMode: "column"` nos dois em
`config.json`, igual a outros componentes largos. Depois do rebuild direcionado, as duas sheets (5 células
cada) grades `good` em tudo — sem re-render check pendente.

Como parte da mesma sessão, apaguei as duas pastas de propostas (`proposals/ButtonGroup/`,
`proposals/ToggleButton/`) e reescrevi `proposals/index.html` com a lista vazia (ver seção acima) — os dois
já são componentes oficiais, não precisam mais existir como proposta.

## Portagem de Navbar e LogoMark (2026-09-29)

Proposta nova do Claude Design (`proposals/Navbar/`), portada para `src/navigation/`. A pedido do usuário,
que corrigiu uma escolha minha sem consulta: `Navbar` usa por padrão o símbolo isolado da marca (`LogoMark`,
novo componente em `src/brand/Logo/Logo.tsx`, extraído de `docs-site/static/img/marca/onblide-symbol-primary.svg`)
em vez do lockup completo (`Logo`), e a `SideNav` passou a usar o mesmo símbolo no lugar de um placeholder
("O" desenhado à mão) que existia desde a portagem original. No modo recolhido da `SideNav`, o botão de
expandir agora só aparece no hover/foco do próprio slot da marca — por padrão mostra o símbolo. `@onblide/ui`
1.1.1 → 1.2.0 (minor, novos exports).

Sync: os 4 exports do `Navbar` (`ComLinks`, `BuscaCentral`, `ComAbas`, `Contexto`) pegaram `cardMode: "column"`
preventivamente (barra larga, mesmo padrão de `Breadcrumbs`/`Stepper`/`ButtonGroup`). Grade "good" em todos
depois de conferir os screenshots — o símbolo ficou forte e legível nos quatro layouts.

**Lição nova: `node_modules/@onblide/ui` precisa existir como link para o próprio pacote.**
`.ds-sync/lib/dts.mjs` lê `node_modules/@onblide/ui/package.json` direto do disco (não via resolução do
Node) para montar a lista de exports do `.d.ts`. Sem esse self-link, `resync.mjs` falha com
`ENOENT ... node_modules\@onblide\ui\package.json` na etapa de build. Corrigido criando uma **junction**
(Windows; `ln -s` do Git Bash criou um diretório real corrompido em vez de um link) apontando pro próprio
`project/package`:
```powershell
New-Item -ItemType Junction -Path "project\package\node_modules\@onblide\ui" -Target "project\package"
```
Não é limpo por `npm install` nem versionado (fica dentro de `node_modules/`, git-ignored) — se sumir
(reinstalação limpa do zero), recriar antes do próximo `resync.mjs`.

**Lição nova: componente "unchanged" nem sempre foi recapturado.** O driver classifica por `sourceKey`
(hash do recipe, não pixel a pixel); uma mudança de implementação que não muda a API pública pode não
disparar recaptura automática mesmo alterando o visual (foi o caso da `SideNav`, cujo `SideNavProps` não
mudou ao trocar o placeholder pelo `LogoMark`). O upload ainda leva o bundle/`.jsx` atualizados (envio sempre
completo), então a correção chega ao Claude Design de qualquer forma — só a checagem visual automática não
roda. Vale conferir manualmente o screenshot (`ds-bundle/_screenshots/<grupo>__<Nome>.png`) depois de mudanças
internas em componentes já publicados, em vez de confiar só na lista `unchanged`/`changed` do resync.

`LogoMark`, `NavbarAccount` e `NavbarLink` caíram no grupo "general" no catálogo remoto
pelo mesmo motivo já catalogado (exports secundários de um arquivo com nome diferente) — cosmético, mesma
decisão de não forçar via `componentSrcMap`.
