# Deploy do `docs-site`

Projeto Vercel: `onblide-design-system` (produção em `https://onblide-design-system.vercel.app`). Deploy
manual a partir de `docs-site/`:

```bash
cd docs-site
npm run gerar
vercel build --prod --scope onblide
vercel deploy --prebuilt --prod --scope onblide
```

**O build do pacote (`@onblide/ui`) e o build do `docs-site` são publicados separadamente.** Uma mudança em
`packages/ui/src/` só chega ao site em produção depois de: `npm run build` no pacote (regenera `dist/`)
e, então, o deploy do `docs-site` acima — o `npm run gerar` do `docs-site` lê do `dist/` já construído do
pacote. Esquecer o segundo passo deixa o site em produção servindo um build antigo mesmo com o pacote
corrigido no repositório.

## Verificar antes de publicar

```bash
cd docs-site
npm run build && npm run verificar
# ou, contra produção depois do deploy:
VERIFICAR_URL=https://onblide-design-system.vercel.app npm run verificar
```

Abre todas as páginas num Chromium de testes (Playwright via `npm run verificar`) e falha se alguma tiver
erro no console, sobreposição aberta ao carregar, aba de demo que não esconde o painel inativo, demo sem o
botão "Restaurar", ou demo/exemplo vazio ou espremido.

## Escopo do Vercel

Só o projeto `onblide-design-system` é tocado a partir deste repositório — nunca outros projetos da mesma
conta Vercel (`onblide-connect`, `blidelyrics` etc.).
