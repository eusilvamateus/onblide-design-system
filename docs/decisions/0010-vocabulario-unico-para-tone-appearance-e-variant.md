# 0010. Vocabulário único para `tone`, `appearance` e `variant`

> Complementada pela [0018](0018-pintura-plain-no-vocabulario.md), que acrescenta a pintura `plain`.

## Contexto

As props visuais do `@onblide/ui` cresceram componente a componente, e a mesma ideia ganhou nomes diferentes:

- o fundo clarinho sem borda se chamava `variant="subtle"` no `Badge` e `appearance="soft"` nas `Tabs`;
- "só o texto, sem caixa" se chamava `variant="plain"` no `Kbd`, `appearance="text"` nas `Tabs` e `ghost` no `ToggleButton`;
- `variant` ora era forma (`Tabs`, `Stepper`), ora era cor (`Link`), ora era pintura (`Badge`, `Kbd`, `Tooltip`);
- o azul se chamava `primary`, `blue`, `info`, `default` ou `accent` conforme o componente, e o cinza `neutral`, `grey` ou `muted`.

Quem usa o design system (pessoas e agentes) precisava decorar cada componente, e propostas novas reaproveitavam palavras com
outro sentido.

## Decisão

Cada palavra das props visuais tem um único significado em todos os componentes. A fonte canônica do vocabulário, com a tabela
de valores aceitos por componente, é a página [Vocabulário das props](../../docs-site/docs/fundacoes/vocabulario-das-props.mdx)
do site.

- **`tone` é a cor**: `neutral`, `muted`, `primary`, `info`, `success`, `warning`, `danger`. `info` existe só em mensagens
  (`Alert`, `Toast`), e nelas não existe `primary`.
- **`appearance` é a pintura**: `solid` (cheio), `soft` (fundo clarinho, sem borda), `outline` (com borda) e `ghost` (sem borda e
  sem fundo em repouso).
- **`variant` é a forma**: valores próprios de cada componente, nunca cor nem pintura.
- Cada componente aceita um recorte do vocabulário. Os tipos públicos `Tone` e `Appearance` listam as palavras, e os tipos de
  cada componente são `Extract` deles, para o TypeScript recusar qualquer valor de fora.
- Props que descrevem algo exclusivo de um componente ficam fora do vocabulário com nome próprio: `kind` (hierarquia do
  `Button`), `emphasis` e `dashed` (`Divider`), `elevation` (`Card`), `dot` (`Badge` e `Tabs`, com o mesmo sentido).

O `Button` mantém `kind`: ele escolhe o papel da ação (qual botão é o principal), não a pintura, no modelo do Carbon e do
Polaris. Trocá-lo por `appearance` + `tone` mudaria o visual de botões já publicados sem ganho de clareza.

## Migração aplicada

| Componente | Antes | Depois |
|---|---|---|
| `Badge` | `tone`: `blue`, `green`, `orange`, `red`, `grey` | `primary`, `success`, `warning`, `danger`, `neutral` |
| `Badge` | `variant`: `subtle`, `solid`, `outline`, `numeric` | `appearance`: `soft`, `solid`, `outline`; `variant`: `label`, `numeric` |
| `Button` | `countTone` com os tons antigos do `Badge` | tons novos do `Badge` |
| `TreeView` | `status` com os tons antigos do `Badge` | tons novos do `Badge` |
| `Chip` | sem `appearance` | `appearance`: `outline` (padrão), `soft` |
| `Tabs` | `appearance`: `soft`, `text`, `solid`, `dot`; o `tone` só valia com `appearance` | `appearance`: `soft`, `solid`; `dot` virou prop booleana; o `tone` vale sozinho |
| `Kbd` | `variant`: `key`, `plain` | `appearance`: `outline`, `ghost` |
| `Tooltip` | `variant`: `text`, `inverted`, `image` | `variant`: `text`, `image`; `appearance`: `solid`, `outline` |
| `Link` | `variant`: `default`, `subtle`, `quiet` | `tone`: `primary`, `neutral`, `muted` |
| `Divider` | `variant`: `solid`, `dashed` | `dashed` (booleana) |
| `ProgressBar` | `tone`: `info` (padrão) | `primary` |
| `ProgressCircle`, `Slider`, `Spinner`, `AlertDialog` | `tone`: `default` | `primary` |
| `ListItem` | `tone`: `accent` | `primary` |

## Consequências

- A mudança quebra quem usava os nomes antigos; entra num changeset só, na próxima versão da série `0.x`.
- Prop visual nova segue a página do vocabulário: se nenhuma palavra existente descreve a necessidade, o vocabulário cresce
  para todos os componentes antes de o componente ganhar a prop.
