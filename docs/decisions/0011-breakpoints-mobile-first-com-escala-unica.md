# 0011. Breakpoints mobile-first com escala única

## Contexto

Os breakpoints existiam só como referência. Os tokens `--ob-bp-*` (480, 768, 1024, 1280 e 1440px) não eram usados por
nenhum componente, e cada lugar escolhia o próprio número:

- o `ToastStack` mudava de layout em 600px, valor fora da escala;
- o site e as páginas de preview usavam 640, 680, 720, 760 e 767px, misturando `min-width` e `max-width`;
- a grade usava os nomes `mobile/tablet/desktop` sem dizer qual breakpoint era o "tablet", e a página de preview
  dizia que o tablet começava em 480px enquanto o código usava 768px;
- `--ob-max-w-md` valia 768px e `--ob-bp-md` valia 1024px: o mesmo nome com dois valores;
- não havia como usar a escala em JavaScript, e quem precisava escrevia 768 à mão.

## Decisão

1. **Escala única, com os valores de hoje:** `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px. Abaixo de `sm` é a
   faixa `base`. O `xs` (480px) sai, porque nada o usava.
2. **Mobile-first, sem exceção:** o estilo base é o do celular, e cada `@media` usa só `min-width` com um valor da
   escala. Nada de `max-width` nem de número inventado.
3. **Um nome, um valor:** os tokens de grade usam os nomes da escala (sem sufixo na faixa `base`, `-sm`, `-md`), e os
   containers (`--ob-container-*`, antes `--ob-max-w-*`) valem o mesmo que o breakpoint de mesmo nome.
4. **A escala também no JavaScript:** o pacote exporta `BREAKPOINTS`, `BREAKPOINT_ORDER`, `mediaQuery()` e o hook
   `useBreakpoint()`, no mesmo padrão do `useMediaQuery`/`useBreakpointValue` do MUI, do Chakra e do Mantine. No
   servidor o hook devolve `base`, coerente com o CSS mobile-first.
5. **Os componentes usam a escala:** o `ToastStack` passa a mudar de layout em `sm`, e o `Modal` ocupa a tela inteira
   abaixo de `sm` (menos o `size="sm"`, que continua cartão). O CSS injetado monta as consultas com `mediaQuery()`,
   então o número vem da mesma fonte.
6. **A regra é verificada:** o `smoke-breakpoints` confere que `BREAKPOINTS` e `--ob-bp-*` têm os mesmos valores, que
   os containers acompanham a escala, que os nomes antigos não voltaram e que nenhum `@media` do pacote e das páginas
   de preview foge da regra. O `verificar` do site faz o mesmo no CSS do site e testa o `useBreakpoint` num navegador
   de testes em cinco larguras.

## Consequências

- Renomear os tokens de grade e de container quebra quem os usava; a mudança entra como quebra de compatibilidade no
  changeset `breakpoints-mobile-first`.
- Entre 600 e 767px, o `ToastStack` passa a usar o modo celular; entre 641 e 767px, algumas grades do site e das
  páginas de preview passam a ter uma coluna.
- A regra completa, para pessoas e agentes, vive em `docs-site/docs/fundacoes/breakpoints.mdx`.
