---
"@onblide/ui": minor
---

**Quebra de compatibilidade.** As props visuais passam a seguir um vocabulário único, igual em todos os componentes (veja a página "Vocabulário das props" na documentação): `tone` é a cor, `appearance` é a pintura e `variant` é a forma.

- Novos tipos públicos `Tone` (`neutral`, `muted`, `primary`, `info`, `success`, `warning`, `danger`) e `Appearance` (`solid`, `soft`, `outline`, `ghost`). Os tipos de tom e de pintura de cada componente são recortes deles.
- `Badge`: `tone` passa de `blue`, `green`, `orange`, `red`, `grey` para `primary`, `success`, `warning`, `danger`, `neutral`. `variant="subtle" | "solid" | "outline"` vira `appearance="soft" | "solid" | "outline"`, e `variant` passa a ser a forma: `label` (padrão) ou `numeric`. O `numeric` continua `solid` por padrão.
- `Button`: `countTone` usa os tons novos do `Badge`.
- `TreeView`: `status` usa os tons novos do `Badge`.
- `Chip`: nova prop `appearance`, `outline` (padrão, como antes) ou `soft` (fundo clarinho, sem borda). Selecionado, o chip continua cheio.
- `Kbd`: `variant="key" | "plain"` vira `appearance="outline" | "ghost"`.
- `Tooltip`: `variant="inverted"` vira `appearance="outline"`; `variant` fica só com `text` e `image`, e `appearance` (`solid`, padrão, ou `outline`) combina com os dois.
- `Link`: `variant="default" | "subtle" | "quiet"` vira `tone="primary" | "neutral" | "muted"`.
- `Divider`: `variant="dashed"` vira a prop booleana `dashed`; `variant="solid"` deixa de existir (é o padrão).
- `ProgressBar`: o tom padrão `info` passa a se chamar `primary`.
- `ProgressCircle`, `Slider`, `Spinner` e `AlertDialog`: o tom `default` passa a se chamar `primary`.
- `ListItem`: o tom `accent` passa a se chamar `primary`.
