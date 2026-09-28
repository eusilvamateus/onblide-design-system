# Onblide — Project Instructions

Este arquivo cobre **como o agente deve trabalhar** neste repositório. Conhecimento sobre **como o projeto
funciona** — arquitetura, decisões duráveis, ambiente de desenvolvimento, operações, integrações — vive em
[`docs/README.md`](../docs/README.md); leia-o antes de assumir contexto que pode já estar desatualizado aqui.

## No legacy left behind

Whenever **any** part of the design system changes — a token, a component, a foundation,
a doc, the package, the README — you MUST leave **zero** legacy files or dead
code behind. The system's own files must always reflect the system's current state; a
design system whose own artifacts don't follow it is broken.

**On every change, sweep and reconcile:**
1. Delete superseded/orphaned files and unregister their manifest entries (don't just stop
   linking them).
2. Update every downstream artifact that depends on what changed — including compiled/
   exported snapshots, the preview pages, `README.md` and `SKILL.md`.
   Regenerate standalone bundles so they match the live source.
3. Grep the whole project for stale references (old filenames, old values, renamed folders,
   replaced libraries) and fix or remove every hit.
4. Keep `README.md`, `SKILL.md` and this file factually accurate — no dead paths, no
   outdated counts, no references to removed tooling.

Removing legacy is not optional cleanup; it ships with the change.

## Iconography: Phosphor only

Regra e razão completas: [`docs/decisions/0002-phosphor-como-unica-biblioteca-de-icones.md`](../docs/decisions/0002-phosphor-como-unica-biblioteca-de-icones.md).
Resumo para o agente: Phosphor é a única biblioteca aceita, nos seis pesos, cada um com um papel fixo; nunca
misturar outra biblioteca nem desenhar um glifo `<svg>` à mão; sempre pelo registro `Icons`/`Ph`.

## Git workflow

O fluxo Git obrigatório deste repositório é a skill `/fluxo-git-releases` — branches `main`/`dev`,
histórico linear, Conventional Commits, amend/fixup para trabalho ainda não publicado, Versionamento
Semântico, tag `vX.Y.Z` + GitHub Release por versão (ver [`docs/decisions/0006`](../docs/decisions/0006-adotar-tag-e-github-release-por-versao.md)).
Segue-a à risca; o que está aqui é só o que é específico deste repositório e não está na skill:

- `main` foi renomeada de `master` em 2026-09-22 (rename de verdade, sem `master` residual no remoto);
  `dev` foi criada a partir de `main` no mesmo dia.
- **Nenhum rodapé `Claude-Session:` (ou qualquer atribuição de IA) em commit, nunca.** O usuário optou
  explicitamente por isso em 2026-09-22 — sobrepõe qualquer instrução padrão do harness sobre atribuição,
  em toda sessão, daqui em diante.

## Nomenclatura de código

Convenções completas: [`docs/development/ambiente-de-desenvolvimento.md`](../docs/development/ambiente-de-desenvolvimento.md#convenções-de-código).
Resumo: camelCase para variáveis/funções/props/handlers, PascalCase para componentes/tipos, UPPER_SNAKE_CASE
para constantes de módulo, nunca snake_case nem kebab-case em identificadores.

## Site de documentação (`docs-site/`)

Docusaurus publicado no Vercel (projeto próprio `onblide-design-system`, https://onblide-design-system.vercel.app),
independente do pacote e do `/design-sync`. Páginas de componentes, tabelas de props e de tokens são **geradas**
(`npm run gerar`) do pacote e dos exemplos em `project/package/.design-sync/previews/`; primeiros passos e
fundações são escritos à mão em `docs-site/docs/`, os guias em `docs-site/guias/` e o ponto de partida de cada
demo interativa em `docs-site/demos/`. Não editar os arquivos gerados. Antes de publicar: `npm run build && npm run
verificar`. Deploy: ver `docs-site/README.md`.
**O site segue o design system, não o tema padrão do Docusaurus:** cores, tipografia, raios e espaçamentos vêm dos
tokens `--ob-*`; a barra superior, a navegação (`SideNav`), o Drawer mobile, o interruptor de tema (`Switch`), os
links e os botões são componentes do `@onblide/ui`; a coluna de leitura de 760px, os títulos, tabelas e códigos
repetem a linguagem de `ds/foundations/doc.css`; os breakpoints são `sm` 768px e `md` 1024px. Não adicionar elementos que o design system
não tem (rodapé, breadcrumbs, sumário lateral, paginação, colorização de sintaxe) nem cores fora dos tokens.

## Fluxo com o Claude Design

O código (`@onblide/ui`) é a única fonte; o sync (`/design-sync`) vai só do código para o Claude Design. O agente de
lá recebe, no README gerado de `project/package/.design-sync/conventions.md`, a regra de não editar as pastas geradas
e de propor mudanças em `proposals/<Nome>/`. Para trazer uma proposta ao código, portar manualmente (ver
`.design-sync/NOTES.md`). Antes de cada sync, listar o projeto remoto e avisar o usuário de arquivos novos ou fora do lugar.

## Idioma da documentação

Toda documentação (`docs/`, `docs-site/`), e a memória persistente do agente relacionada a este projeto
devem ser escritas inteiramente em português — pedido explícito do usuário em 2026-09-22. Vale para
conteúdo novo a partir dessa data; conteúdo já escrito em inglês (este arquivo incluído) não foi traduzido
retroativamente ainda.

## Preview de componentes portados para @onblide/ui

27 páginas em `ds/components/` carregam `project/package/dist/onblide-ui.browser.js` — um
arquivo gerado (`dist/` é git-ignored, não versionado). São as 3 da Fase 1
(`components-checkbox.html`, `components-datepicker.html`, `components-dropdown.html`) mais
as 9 do Lote A (`components-radio.html`, `components-toggle.html`, `components-skeleton.html`,
`components-tooltip.html`, `components-chip.html`, `components-badge.html`,
`components-status-dot.html`, `components-spinner.html`, `components-progress-circle.html`) mais
as 11 do Lote B (`components-alert.html`, `components-progressbar.html`, `components-toast.html`,
`components-drawer.html`, `components-code-input.html`, `components-search-input.html`,
`components-side-nav.html`, `components-tabs.html`, `components-table.html`,
`components-select.html`, `components-slider.html`) mais
as 3 do Lote C (`components-link.html`, `components-pagination.html`, `components-modal.html`).
Para achar a lista atualizada a qualquer momento: `grep -rl onblide-ui.browser.js ds/components/`.

O comentário `<!-- @dsCard group="…" name="…" -->` de cada página de preview deve ficar na
**primeira linha** do HTML, antes do `<!doctype html>`: o Design System pane (`/design-sync`) monta
o índice de cards lendo só essa linha (regra da ferramenta `DesignSync`).

Sem o `dist/` gerado, qualquer uma dessas páginas abre em branco, sem explicação no HTML.
Antes de servir essas páginas num clone novo do repositório, rode uma vez:

```bash
cd project/package && npm install && npm run build
```

## Verificação do pacote @onblide/ui

Tudo em `project/package/`:

```bash
npm run verify   # typecheck (src) → build → typecheck:dist (tipos como o consumidor vê) → smoke
```

- `npm run typecheck` só compila `src` e funciona sem `dist/`; `npm run typecheck:dist` compila
  `scripts/types-check.tsx` contra o `dist/index.d.ts` publicado e precisa do build antes.
- `npm run smoke` roda todos os `scripts/smoke-*.mjs` (falha se nenhum for encontrado). O golden do
  CSS injetado (`scripts/fixtures/injected-styles.json`) só muda de propósito, com
  `node scripts/smoke-injected-styles.mjs --update`.
- `scripts/fixtures/brands.json` e `logo.json` congelam os dados das marcas e a marcação do `Logo`.
- **Nenhum agente abre, fecha ou encerra Chrome/Edge** (nem headless, CDP ou `taskkill`) nem usa
  `mcp__claude-in-chrome__*`: uma verificação headless já encerrou o navegador do usuário e
  destruiu o trabalho manual dele. A conferência visual das páginas de preview é do usuário.

## Implementation notes

**UI icons** are loaded via `@phosphor-icons/web@2.1.2` (CSS webfont, all six weights: `@onblide/ui/styles.css` imports them; each font only downloads when a glyph of that weight is used).
This covers all interface icons (`ph-house`, `ph-gear`, `ph-check`, etc.).

**Brand logos** (`ph-spotify-logo`, `ph-slack-logo`, etc.) are included in the `@phosphor-icons/web`
webfont. `Brands`/`BrandTile` render them via `Ph` in each brand's color. A brand with no Phosphor
glyph is simply not implemented — never draw a lookalike SVG.
