# Documentação do Onblide Design System

Site de documentação feito com [Docusaurus](https://docusaurus.io/), publicado no Vercel. Ele é independente do
pacote `@onblide/ui` (em `../project/package`) e do fluxo do Claude Design (`/design-sync`): nada aqui altera o que
é enviado para lá.

## Rodar localmente

```bash
cd project/package && npm install && npm run build   # o site usa o pacote construído
cd ../../docs-site && npm install
npm start                                            # gera os dados e abre em http://localhost:3000
```

## De onde vem o conteúdo

| Conteúdo | Origem |
|---|---|
| Páginas de componentes (`docs/componentes/`) | Geradas por `scripts/gerar-componentes.mjs`, com os exemplos de `project/package/.design-sync/previews/*.tsx` (os mesmos cards do Claude Design) |
| Tabela de props | Geradas dos tipos TypeScript do pacote (`scripts/gerar-props.mjs`) |
| Tabelas de tokens | Geradas de `project/package/src/tokens.css` (`scripts/gerar-tokens.mjs`) |
| Changelog | Cópia do `CHANGELOG.md` do pacote |
| Primeiros passos e fundações | Escritos à mão em `docs/` |
| Guias de uso, conteúdo e design de cada componente | Escritos à mão em `guias/<Componente>.mdx` (frontmatter `resumo` e `criterios`); entram na página gerada |
| Demo interativa | Controles gerados das props; o ponto de partida é `demos/<Componente>.jsx`, escrito à mão (o `<Componente>` do arquivo define os valores iniciais; o que estiver em volta, como o botão que abre uma sobreposição, aparece igual no resultado e no código) |

Os arquivos gerados não são versionados (`docs/componentes/`, `docs/changelog.md`, `src/data/`): `npm run gerar`
os recria, e o `npm run build` já faz isso. Para mudar um exemplo de componente, edite o `.tsx` em `.design-sync/previews/`.

A busca é local (`@easyops-cn/docusaurus-search-local`): o índice nasce no build, então ela só funciona com `npm run build`, não no `npm start`.

## Publicar

O projeto no Vercel se chama `onblide-design-system`. O deploy é feito a partir desta pasta:

```bash
npm run gerar
vercel build --prod
vercel deploy --prebuilt --prod
```

## Verificar

```bash
npm run build && npm run verificar   # ou VERIFICAR_URL=https://onblide-design-system.vercel.app npm run verificar
```

Abre todas as páginas num Chromium de testes (Playwright) e falha se alguma tiver erro, sobreposição aberta ao
carregar, aba da demo que não esconde o painel inativo, demo sem o botão Restaurar, ou demo/exemplo vazio ou espremido.

