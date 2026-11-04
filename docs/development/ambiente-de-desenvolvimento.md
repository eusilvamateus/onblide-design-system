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

## Formatação e lint (raiz do repositório)

Prettier e ESLint ficam na raiz e valem para os dois pacotes, com uma configuração só de cada um:

```bash
npm install            # na raiz; instala só as ferramentas de formatação e lint
npm run format:check   # lista os arquivos fora da formatação, sem alterar nada
npm run format         # formata
npm run lint           # aponta problemas de código
npm run lint:fix       # corrige o que o ESLint sabe corrigir sozinho
```

- **Prettier** (`.prettierrc.json`) cuida só da forma: aspas simples, ponto e vírgula, linhas de até 120 caracteres
  e o fim de linha que cada arquivo já tem (o repositório usa `core.autocrlf`). Markdown, MDX e as páginas HTML de
  preview ficam fora (`.prettierignore`), assim como os arquivos gerados.
- **ESLint** (`eslint.config.mjs`) cuida da qualidade: regras recomendadas de JavaScript, de TypeScript
  (`typescript-eslint`) e de hooks do React (`eslint-plugin-react-hooks`). O `eslint-config-prettier` desliga as
  regras de estilo, então os dois nunca discordam; `npx eslint-config-prettier <arquivo>` confirma.
- **VS Code**: `.vscode/extensions.json` recomenda as extensões Prettier e ESLint, e `.vscode/settings.json` formata
  ao salvar e aplica as correções do ESLint. O `prettier.prettierPath` aponta para a cópia da raiz porque
  `project/package/node_modules` traz o Prettier 2 como dependência do `@changesets/cli`.
- O `typescript` da raiz fica na linha 6.0 porque o `typescript-eslint` ainda não aceita o TypeScript 7.

## Convenções de código

- **camelCase** para variáveis, funções, props e handlers (`focadoNoMouseDown`, `handleDayClick`).
- **PascalCase** para componentes React, tipos e interfaces (`Datepicker`, `ButtonProps`).
- **UPPER_SNAKE_CASE** para constantes de módulo (`BADGE_TONES`).
- Pastas/arquivos de componente com o mesmo nome do componente (`Datepicker/Datepicker.tsx`).
- Nunca snake_case nem kebab-case em identificadores.
- Ícones: só [Phosphor](https://phosphoricons.com/), nunca outra biblioteca nem SVG desenhado à mão — ver
  [`0002-phosphor-como-unica-biblioteca-de-icones.md`](../decisions/0002-phosphor-como-unica-biblioteca-de-icones.md).
- **Nenhum comentário explicativo** (`//`, `/* */`), em nenhuma circunstância — regra obrigatória, pedido
  explícito do usuário em 2026-10-01. Exceção: os JSDoc `/** ... */` de documentação de prop pública, que
  continuam (alimentam a geração do `.prompt.md` do design-sync e as tabelas de props do `docs-site`).
- **Nunca criar versão, variante ou cópia de um componente que já existe** — regra obrigatória, pedido
  explícito do usuário em 2026-10-10. Se o catálogo (`src/index.ts`) já tem o componente (avatar, botão,
  tooltip, menu, badge…), o código o usa; desenhar à mão o mesmo conceito dentro de outro componente é
  violação, mesmo sem nome novo, no pacote, no `docs-site`, nas demos e nos previews. Procurar no catálogo
  antes de criar qualquer elemento visual. Se falta uma variação explicitamente necessária, ela entra no
  componente original antes: estender, cobrir com smoke/preview/demo/docs, versionar e publicar (changeset
  próprio) e só então o consumidor passa a usar. A extensão descreve a capacidade do componente (`src`,
  `initials`), nunca o consumidor. "Explicitamente necessário" é exigência real, não conveniência. Helpers que
  não são componentes visuais (`injectStyleOnce`) ficam fora da regra.

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
