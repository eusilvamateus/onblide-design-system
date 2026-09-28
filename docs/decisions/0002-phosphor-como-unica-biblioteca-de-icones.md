# 0002. Phosphor como única biblioteca de ícones

## Contexto

Um design system com ícones de múltiplas bibliotecas (Lucide, Feather, Material, Heroicons, Font Awesome,
SVGs desenhados à mão) perde consistência de traço, peso e grade visual entre telas.

## Decisão

Usar exclusivamente [Phosphor Icons](https://phosphoricons.com/), em todos os seis pesos disponíveis
(regular, fill, bold, light, thin, duotone), cada um com um papel fixo:

- **regular** — padrão da interface (navegação, botões, campos, ícones junto de texto).
- **fill** — estado "ligado", sempre em par com o regular do estado desligado.
- **bold** — legibilidade em tamanho pequeno (≤14px) ou sobre fundo sólido.
- **light** — ícones grandes e calmos, 32–48px (estados vazios, ilustrações).
- **thin** — momentos editoriais, a partir de 64px (hero, capas, peças de marca).
- **duotone** — destaque ilustrativo apenas (onboarding, cards de funcionalidade); nunca em interfaces
  densas ou dentro de componentes do pacote.

Todo acesso passa pelo registro central `Icons`/`Ph` (`@onblide/ui`), nunca ícone solto renderizado à mão.
Marcas de terceiros (Spotify, Slack, GitHub etc.) usam os glifos `ph-<marca>-logo` do próprio Phosphor; uma
marca sem glifo no Phosphor simplesmente não é implementada.

## Consequências

- Nenhuma dependência de outra biblioteca de ícones é aceita no pacote.
- Adicionar um ícone que o Phosphor não tem exige esperar a biblioteca cobrir o caso, não desenhar um
  substituto.
- Regra completa e exceções documentadas: `docs-site` › Fundações › Iconografia, e `project/CLAUDE.md`.
