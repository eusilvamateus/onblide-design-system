# Visão geral da arquitetura

O repositório reúne dois subsistemas independentes que compartilham a mesma fonte de verdade visual
(`project/package/src/tokens.css`), mas têm ciclos de build, deploy e versionamento próprios.

```text
onblide-design-system/
├── project/
│   ├── package/        # @onblide/ui — o design system em si (React + TypeScript)
│   ├── marca/           # arte da marca (svg/, png/, png/icones/), fonte única para logo e favicon
│   ├── CLAUDE.md         # instruções de agente para este repositório
│   └── README.md         # contexto de marca e fundações visuais do projeto
├── docs-site/            # site Docusaurus publicado (documentação do produto)
└── docs/                 # esta pasta — memória canônica e persistente do projeto
```

## `project/package` — `@onblide/ui`

Biblioteca React/TypeScript com todos os componentes, organizados por papel na interface
(`actions/`, `brand/`, `data-display/`, `feedback/`, `forms/`, `iconography/`, `internal/`, `navigation/`,
`overlays/`). `tsup` gera três saídas: ESM/CJS (`dist/index.js`/`.cjs`, o pacote publicável) e um bundle IIFE
de navegador (`dist/onblide-ui.browser.js`), para páginas sem bundler e para os testes em navegador do pacote.

Versionamento via [Changesets](https://github.com/changesets/changesets): cada mudança ganha um arquivo em
`.changeset/`, `npx changeset version` consome esses arquivos e atualiza `package.json` + `CHANGELOG.md`.
Detalhe de comandos: [`development/ambiente-de-desenvolvimento.md`](../development/ambiente-de-desenvolvimento.md).

## `docs-site` — documentação publicada

Site Docusaurus, independente do pacote. Gera páginas de componente a partir
dos tipos TypeScript do pacote e dos exemplos em `docs-site/exemplos/`; primeiros passos e fundações são escritos à mão. Deploy próprio
no Vercel (projeto `onblide-design-system`). Detalhes: [`docs-site/README.md`](../../docs-site/README.md).

