# Visão geral da arquitetura

O repositório reúne três subsistemas independentes que compartilham a mesma fonte de verdade visual
(`project/package/src/tokens.css`), mas têm ciclos de build, deploy e versionamento próprios.

```text
onblide-design-system/
├── project/
│   ├── package/        # @onblide/ui — o design system em si (React + TypeScript)
│   ├── marca/           # arte da marca (svg/, png/, png/icones/), fonte única para logo e favicon
│   ├── ds/               # páginas HTML legadas de preview de componentes (pré-Docusaurus)
│   ├── CLAUDE.md         # instruções de agente para este repositório
│   └── README.md         # contexto de marca e fundações visuais do projeto
├── docs-site/            # site Docusaurus publicado (documentação do produto)
└── docs/                 # esta pasta — memória canônica e persistente do projeto
```

## `project/package` — `@onblide/ui`

Biblioteca React/TypeScript com todos os componentes, organizados por papel na interface
(`actions/`, `brand/`, `data-display/`, `feedback/`, `forms/`, `iconography/`, `internal/`, `navigation/`,
`overlays/`). `tsup` gera três saídas: ESM/CJS (`dist/index.js`/`.cjs`, o pacote publicável) e um bundle IIFE
de navegador (`dist/onblide-ui.browser.js`) usado pelas páginas de preview em `project/ds/components/`.

Versionamento via [Changesets](https://github.com/changesets/changesets): cada mudança ganha um arquivo em
`.changeset/`, `npx changeset version` consome esses arquivos e atualiza `package.json` + `CHANGELOG.md`.
Detalhe de comandos: [`development/ambiente-de-desenvolvimento.md`](../development/ambiente-de-desenvolvimento.md).

## `docs-site` — documentação publicada

Site Docusaurus, independente do pacote e do sync com o Claude Design. Gera páginas de componente a partir
dos tipos TypeScript e dos previews do pacote; primeiros passos e fundações são escritos à mão. Deploy próprio
no Vercel (projeto `onblide-design-system`). Detalhes: [`docs-site/README.md`](../../docs-site/README.md).

## Sincronização com o Claude Design

O pacote `@onblide/ui` é convertido para o formato que o Claude Design consome e enviado para um projeto
próprio em claude.ai/design, acionado pelo comando `/design-sync` (nunca automático). Ver
[`integrations/sincronizacao-com-claude-design.md`](../integrations/sincronizacao-com-claude-design.md).

## `project/ds/`

Páginas HTML de preview por componente, anteriores à existência do `docs-site`. Continuam servindo como
harness leve para depuração visual rápida (carregam `project/package/dist/onblide-ui.browser.js` direto),
mas não são a documentação canônica de uso — essa é o `docs-site`.
