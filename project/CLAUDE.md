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
   exported snapshots and `README.md`.
   Regenerate standalone bundles so they match the live source.
3. Grep the whole project for stale references (old filenames, old values, renamed folders,
   replaced libraries) and fix or remove every hit.
4. Keep `README.md` and this file factually accurate — no dead paths, no
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

## Comentários no código: proibidos

**Regra obrigatória, pedido explícito do usuário em 2026-10-01: nenhum comentário explicativo (`//`, `/* */`)
em código novo ou editado, em nenhuma circunstância.** Não vale "só quando o porquê não é óbvio" — é zero,
sempre. Única exceção: os JSDoc `/** ... */` que documentam cada prop pública de componente (ex.: `/** Rótulo
exibido acima do campo. */`), que continuam — são parte da API pública e alimentam as tabelas de props do `docs-site`.

## Componentes: nunca duplicar

**Regra obrigatória, pedido explícito do usuário em 2026-10-10: jamais criar versão, variante ou cópia de um
componente que já existe no design system.** Se o catálogo (`src/index.ts`) já tem o componente, o código o usa;
desenhar à mão o mesmo conceito dentro de outro componente (um círculo com iniciais, um botão próprio) é violação,
mesmo sem nome novo — vale para o pacote, o `docs-site`, as demos e os exemplos. Procurar no catálogo **antes** de
criar qualquer elemento visual. Se falta uma variação explicitamente necessária, ela entra no componente original
primeiro, em ordem: estender o original, cobrir com smoke/exemplo/demo/docs, versionar e publicar (changeset
próprio) e só então o consumidor passa a usá-lo. A extensão descreve a capacidade do componente (`src`,
`initials`), nunca o consumidor (`sidenavAvatar`). "Explicitamente necessário" é exigência real, não
conveniência: se dá para usar o componente como ele é, usa-se como ele é. Helpers que não são componentes visuais
(`injectStyleOnce`) ficam fora da regra.

## Vocabulário das props visuais

Regra e tabela completa: [`docs-site/docs/fundacoes/vocabulario-das-props.mdx`](../docs-site/docs/fundacoes/vocabulario-das-props.mdx)
(decisão em [`docs/decisions/0010`](../docs/decisions/0010-vocabulario-unico-para-tone-appearance-e-variant.md)).
Resumo para o agente: `tone` é a cor, `appearance` é a pintura (`solid`, `soft`, `outline`, `ghost`), `variant` é a forma.
Nunca reaproveitar uma palavra do vocabulário com outro sentido nem criar sinônimo; os tipos de cada componente são
`Extract` de `Tone` e `Appearance` (`src/internal/tone.ts`, `src/internal/appearance.ts`). Se nenhuma palavra serve,
o vocabulário cresce para todos antes de o componente ganhar a prop.

## Breakpoints

Regra e tabela completa: [`docs-site/docs/fundacoes/breakpoints.mdx`](../docs-site/docs/fundacoes/breakpoints.mdx)
(decisão em [`docs/decisions/0011`](../docs/decisions/0011-breakpoints-mobile-first-com-escala-unica.md)).
Resumo para o agente: escala `sm` 768, `md` 1024, `lg` 1280, `xl` 1440 (abaixo de `sm` é `base`), mobile-first, só
`min-width` com esses valores; nunca `max-width` nem número inventado. No CSS injetado do pacote a consulta vem de
`mediaQuery()` (`src/layout/breakpoints.ts`); em React, `useBreakpoint()`. Grade e containers usam os mesmos nomes
(`--ob-grid-*-sm|md`, `--ob-container-*`). O `smoke-breakpoints` recusa qualquer `@media` fora da regra.

## Fundações: nenhum número solto

Regras completas nas páginas de Fundações do site (`docs-site/docs/fundacoes/`), decisão em
[`docs/decisions/0012`](../docs/decisions/0012-componentes-sem-numeros-soltos-nas-fundacoes.md).
Resumo para o agente: nos componentes, espaçamento é `--ob-space-<px>` (2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64,
96, 128) ou os apelidos `--ob-gap-*`/`--ob-pad-*`/`--ob-stack-*`; raio é `--ob-r-*` (de preferência `control`, `surface`,
`overlay`, `pill`, `circle`); duração e curva são `--ob-dur-*` e `--ob-ease-*`; camada é `--ob-z-*` (0, 1 e 2 só para a
ordem local de um componente); opacidade é `--ob-opacity-*` (desabilitado é sempre `--ob-opacity-disabled`); foco é
`0 0 0 var(--ob-focus-ring-width) var(--ob-focus-ring)`. Valor fora da escala vai para o passo mais próximo; se nenhum
serve, a escala cresce para todos antes. O `smoke-fundacoes` recusa números soltos em `src/`.

## Site de documentação (`docs-site/`)

Docusaurus publicado no Vercel (projeto próprio `onblide-design-system`, <https://onblide-design-system.vercel.app>),
independente do pacote. Páginas de componentes, tabelas de props e de tokens são **geradas**
(`npm run gerar`) do pacote e dos exemplos em `docs-site/exemplos/`; primeiros passos e
fundações são escritos à mão em `docs-site/docs/`, os guias em `docs-site/guias/` e o ponto de partida de cada
demo interativa em `docs-site/demos/`. Não editar os arquivos gerados. Antes de publicar: `npm run build && npm run
verificar`. Deploy: ver `docs-site/README.md`.
**O site segue o design system, não o tema padrão do Docusaurus:** cores, tipografia, raios e espaçamentos vêm dos
tokens `--ob-*`; a barra superior, a navegação (`SideNav`), o Drawer mobile, o interruptor de tema (`Switch`), os
links e os botões são componentes do `@onblide/ui`; os breakpoints seguem a escala do pacote (o site usa `sm` 768px, `md` 1024px e `lg` 1280px).
O site pode ter recursos próprios de leitura que não são componentes do pacote, como o sumário da página e a busca, sempre feitos com
os tokens. Sem cores fora dos tokens.

## Catálogo: só o que é comum no mercado

**Regra obrigatória, pedido explícito do usuário em 2026-10-11: o pacote só tem componentes que existem de forma
recorrente nos design systems conhecidos (Material UI, Ant, Chakra/Mantine, Radix/shadcn, Carbon, Polaris,
Atlassian).** Não se inventa componente para um caso de uma tela só nem se cria uma peça sem a base que a
sustente (o `Datepicker` usa o `Calendar`, o `Popover` e o `FieldShell`; nada nasce "em cima de uma base que não
existe"). Antes de criar, procurar no catálogo (`src/index.ts`) e nos design systems públicos; se a peça não é comum,
a aplicação monta com o que já existe. Peças de apoio não são API pública e ficam em `src/internal/`.

## Idioma da documentação

Toda documentação (`docs/`, `docs-site/`), e a memória persistente do agente relacionada a este projeto
devem ser escritas inteiramente em português — pedido explícito do usuário em 2026-09-22. Vale para
conteúdo novo a partir dessa data; conteúdo já escrito em inglês (este arquivo incluído) não foi traduzido
retroativamente ainda.

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
  destruiu o trabalho manual dele. A conferência visual é do usuário.

## Implementation notes

**UI icons** are loaded via `@phosphor-icons/web@2.1.2` (CSS webfont, all six weights: `@onblide/ui/styles.css` imports them; each font only downloads when a glyph of that weight is used).
This covers all interface icons (`ph-house`, `ph-gear`, `ph-check`, etc.).

**Brand logos** (`ph-spotify-logo`, `ph-slack-logo`, etc.) are included in the `@phosphor-icons/web`
webfont and render through `Ph`. The package has no component for third-party brand logos (removed in
4.0.0): an app that needs one uses the glyph via `Ph`. A brand with no Phosphor glyph is simply not
implemented — never draw a lookalike SVG.
