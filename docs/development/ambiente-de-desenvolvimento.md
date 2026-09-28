# Ambiente de desenvolvimento

## `@onblide/ui` (`project/package/`)

```bash
cd project/package
npm install
npm run build    # gera dist/: ESM, CJS, .d.ts e o bundle de navegador
npm run verify   # typecheck + build + teste de tipos (contra o .d.ts) + smokes
```

Estrutura do código-fonte, convenções de composição e uso de ícones: [`project/package/README.md`](../../project/package/README.md).

## `docs-site/`

```bash
cd project/package && npm install && npm run build   # o site usa o pacote construído
cd ../../docs-site && npm install
npm start                                             # gera os dados e abre em http://localhost:3000
```

Detalhes de onde vem cada parte do conteúdo gerado: [`docs-site/README.md`](../../docs-site/README.md).

## Convenções de código

- **camelCase** para variáveis, funções, props e handlers (`focadoNoMouseDown`, `handleDayClick`).
- **PascalCase** para componentes React, tipos e interfaces (`Datepicker`, `ButtonProps`).
- **UPPER_SNAKE_CASE** para constantes de módulo (`BADGE_TONES`).
- Pastas/arquivos de componente com o mesmo nome do componente (`Datepicker/Datepicker.tsx`).
- Nunca snake_case nem kebab-case em identificadores.
- Ícones: só [Phosphor](https://phosphoricons.com/), nunca outra biblioteca nem SVG desenhado à mão — ver
  [`0002-phosphor-como-unica-biblioteca-de-icones.md`](../decisions/0002-phosphor-como-unica-biblioteca-de-icones.md).

## Versionamento e release do pacote

O pacote usa [Changesets](https://github.com/changesets/changesets): cada mudança relevante ganha um arquivo
em `project/package/.changeset/` (`changeset add` ou escrito à mão), descrevendo o tipo de bump (patch/minor/major)
e o changelog em português. Publicar uma versão:

```bash
cd project/package
npx changeset version              # consome os arquivos em .changeset/, atualiza package.json e CHANGELOG.md
npm install --package-lock-only    # sincroniza o lockfile com a nova versão
npm run build
```

Depois, seguir o fluxo de release em [`fluxo-git-releases`](../decisions/0006-adotar-tag-e-github-release-por-versao.md):
mesclar `dev` em `main` por fast-forward, criar a tag `vX.Y.Z` (e, por compatibilidade com o histórico
anterior, também `onblide-ui@X.Y.Z`) e publicar um GitHub Release.

**Antes de comitar a release, rode `npm run build` em `docs-site/`.** `docs-site/package.json` referencia o
pacote via `"@onblide/ui": "file:../project/package"`, que o npm resolve como *symlink*
(`docs-site/node_modules/@onblide/ui` aponta direto pra `project/package`). O `docs-site/package-lock.json`
grava a versão resolvida desse link; se o build do docs-site rodar só depois do commit da release, o npm
corrige esse campo sozinho no build seguinte e deixa um diff de uma linha sem dono. Rodar o build do
docs-site como parte da mesma sequência que gera a release evita esse resto solto.
