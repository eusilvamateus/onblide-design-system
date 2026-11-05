/** Largura mínima, em px, de cada faixa de tela. Abaixo de `sm` é a faixa `base`. Os mesmos valores estão em `--ob-bp-*`. */
export const BREAKPOINTS = { sm: 768, md: 1024, lg: 1280, xl: 1440 } as const;

/** Nome de um breakpoint da escala. */
export type BreakpointName = keyof typeof BREAKPOINTS;

/** Faixa de tela: `base` (abaixo de `sm`) ou o nome do breakpoint em que ela começa. */
export type Breakpoint = 'base' | BreakpointName;

/** As faixas em ordem crescente de largura. */
export const BREAKPOINT_ORDER: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

/** Media query mobile-first do breakpoint, para `matchMedia` ou CSS-in-JS: `mediaQuery('md')` devolve `(min-width: 1024px)`. */
export const mediaQuery = (breakpoint: BreakpointName): string => `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
