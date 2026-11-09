# 0016. Tipografia completa: pesos, escala numérica, papéis e mono sem caixa-alta

## Contexto

As três famílias (Poppins, Playfair Display e JetBrains Mono) estavam instaladas com todos os pesos e itálicos, mas a
tipografia não chegava aos componentes:

- os tokens de peso iam só de 300 a 800, e `--ob-w-black` valia 800, embora Black seja 900;
- cerca de 50 pesos e 55 tamanhos estavam escritos com número nos componentes, vários fora da escala (9, 10, 11, 13,
  15, 17 e 26px), e nenhum teste recusava isso;
- não havia papéis de texto prontos (rótulo, legenda, corpo pequeno), então cada componente inventava a sua combinação;
- a JetBrains Mono aparecia sempre em caixa-alta com espaçamento entre letras escrito à mão (cabeçalho da `Table`,
  seções da `SideNav`, eyebrow do site), e o h2 do site também era caixa-alta;
- `font-variant-numeric: tabular-nums` era usado para alinhar números, mas a Poppins não tem algarismos de largura fixa,
  então não fazia efeito;
- o corpo ligava `ss01` e `cv11`, recursos da Inter que a Poppins não tem ou usa para outra coisa;
- as fontes eram `.ttf` (13 MB), e havia 3,3 MB de uma variante da JetBrains Mono sem ligaduras que nada usava.

## Decisão

1. **Pesos de 100 a 900 com os nomes da indústria:** `--ob-w-thin`, `extralight`, `light`, `regular`, `medium`,
   `semibold`, `bold`, `extrabold` (800) e `black` (900).
2. **Escala de tamanhos com o nome igual ao valor**, como no espaçamento: `--ob-fs-10` a `--ob-fs-88` (10, 11, 12, 13, 14,
   15, 16, 18, 20, 22, 28, 36, 48, 64, 88). Saem os nomes `xs` a `5xl`. Valor fora da escala vai para o passo mais
   próximo (9 → 10, 17 → 18, 26 → 28).
3. **Entrelinha e espaçamento entre letras completos:** `--ob-lh-none`, `--ob-lh-display`, `tight`, `snug`, `normal`,
   `relaxed`; `--ob-tracking-tighter`, `tight`, `snug`, `normal`. Sai `--ob-tracking-wide`, que só servia à caixa-alta.
4. **Papéis de texto** no `tokens.css`: `.ob-display`, `h1` a `h6`, `.ob-body-lg`, `.ob-body`, `.ob-body-sm`, `.ob-label`,
   `.ob-caption`, `.ob-eyebrow`, `.ob-numeric`, `code` e os de serifa. Sai `.ob-lead`, substituído por `.ob-body-lg`.
5. **Nenhuma caixa-alta.** A JetBrains Mono se diferencia pela família, pelo tamanho, pelo peso e pela cor.
6. **Números alinhados usam a fonte mono.** Colunas `numeric` da `Table`, botões da `Pagination` e contadores passam a
   JetBrains Mono; `tabular-nums` sai.
7. **Fontes em `woff2`**, com `font-display: swap`; a variante sem ligaduras sai, e `ss01`/`cv11` também.
8. **A regra é verificada:** o `smoke-fundacoes` recusa, em `src/`, tamanho, peso, espaçamento entre letras e família
   escritos à mão, `uppercase` e `tabular-nums`.

## Consequências

- Renomear `--ob-fs-*`, mudar o valor de `--ob-w-black` e remover `--ob-tracking-wide` e `.ob-lead` quebra quem os usava;
  entra como quebra de compatibilidade no changeset `tipografia-completa`.
- O cabeçalho da `Table` e as seções da `SideNav` mudam de aparência (sem caixa-alta, 12px, peso médio); os números da
  `Pagination` passam a ser monoespaçados.
- As fontes publicadas caem de 13 MB para 3,2 MB.
