# Fontes

As três famílias vêm nesta pasta (`fonts/`), em `woff2`, sem depender de CDN.

| Família | Token | Papel | Pesos |
|---|---|---|---|
| **Poppins** | `--ob-font` | Interface, títulos e corpo | 100–900, com itálicos |
| **Playfair Display** | `--ob-font-serif` | Acento editorial, em itálico | 400–900, com itálicos |
| **JetBrains Mono** | `--ob-font-mono` | Código, tokens, rótulos técnicos e números alinhados | 100–800, com itálicos |

## @font-face

O `tokens.css` declara cada peso e itálico com `@font-face`, apontando para `fonts/*.woff2`, com `font-display: swap`.
Cada arquivo só é baixado quando a página usa aquele peso.

## Uso offline

Como as fontes são locais, o design system funciona sem rede.

## Licença

Todas as fontes desta pasta usam a SIL Open Font License 1.1. O texto da licença e os avisos de copyright de cada família
estão em [`OFL.txt`](OFL.txt).
