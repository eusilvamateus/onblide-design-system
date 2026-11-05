# 0013. Repositório só com o design system

Status: aceita (2026-11-05)

## Contexto

O repositório nasceu de um pacote exportado do Claude Design, com protótipos em HTML, CSS e JavaScript. Depois que
`@onblide/ui` virou a fonte real, sobraram as páginas de `project/ds/`, o manifesto `project/SKILL.md`, a configuração do
`/design-sync` e a própria pasta `project/`, que só existia por causa desse formato. O projeto não segue mais com o
Claude Design: ele é exclusivamente um design system, como o Material UI.

## Decisão

- Encerrar a sincronização com o Claude Design e remover o que existia só para ela.
- Manter os exemplos de componente, que alimentam o site, em `docs-site/exemplos/`.
- Remover o bundle de navegador: ele servia às páginas removidas e depende do UMD do React, que não existe no React 19. Os testes em navegador do pacote montam o código na hora com o `esbuild`.
- Organizar o repositório em `packages/ui` (o pacote), `docs-site` (o site) e `docs` (memória do projeto), sem `project/`.

## Consequências

- O projeto remoto no Claude Design deixa de receber atualizações e não foi alterado.
- Decisões anteriores e o `CHANGELOG.md` continuam citando os caminhos antigos, porque registram o que valia na época.
- O conteúdo removido continua disponível no histórico do Git.
