# Visão geral da arquitetura

O repositório reúne dois subsistemas independentes que compartilham a mesma fonte de verdade visual
(`packages/ui/src/tokens.css`), mas têm ciclos de build, deploy e versionamento próprios.

```text
onblide-design-system/
├── packages/
│   └── ui/               # @onblide/ui — o design system em si (React + TypeScript)
├── docs-site/            # site Docusaurus publicado (documentação do produto)
│   └── marca/            # arte da marca (svg/, png/, png/icones/), fonte única para logo e favicon
├── docs/                 # esta pasta — memória canônica e persistente do projeto
└── CLAUDE.md             # instruções de agente para este repositório
```

## `packages/ui` — `@onblide/ui`

Biblioteca React/TypeScript com todos os componentes, organizados por papel na interface
(`actions/`, `brand/`, `data-display/`, `feedback/`, `forms/`, `iconography/`, `internal/`, `navigation/`,
`overlays/`). `tsup` gera ESM e CJS (`dist/index.js` e `dist/index.cjs`) com os tipos.

Versionamento via [Changesets](https://github.com/changesets/changesets): cada mudança ganha um arquivo em
`.changeset/`, `npx changeset version` consome esses arquivos e atualiza `package.json` + `CHANGELOG.md`.
Detalhe de comandos: [`development/ambiente-de-desenvolvimento.md`](../development/ambiente-de-desenvolvimento.md).

## `docs-site` — documentação publicada

Site Docusaurus, independente do pacote. Gera páginas de componente a partir
dos tipos TypeScript do pacote e dos exemplos em `docs-site/exemplos/`; primeiros passos e fundações são escritos à mão. Deploy próprio
no Vercel (projeto `onblide-design-system`). Detalhes: [`docs-site/README.md`](../../docs-site/README.md).

