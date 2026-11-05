import temaCodigo from './src/prism/tema';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'node:path';

const config: Config = {
  title: 'Onblide Design System',
  tagline: 'Componentes, fundações e diretrizes para construir produtos Onblide.',
  favicon: 'img/favicon.ico',
  url: 'https://onblide-design-system.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  i18n: { defaultLocale: 'pt-BR', locales: ['pt-BR'] },
  themes: [
    '@docusaurus/theme-live-codeblock',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['pt'],
        docsRouteBasePath: '/',
        indexBlog: false,
        indexPages: false,
        searchBarShortcutHint: false,
        explicitSearchResultPath: true,
      },
    ],
  ],
  plugins: [
    // O pacote é linkado de ../packages/ui e tem o próprio node_modules: força uma única cópia do React.
    () => ({
      name: 'react-unico',
      configureWebpack: () => ({
        resolve: {
          alias: {
            react: path.resolve('node_modules/react'),
            'react-dom': path.resolve('node_modules/react-dom'),
          },
        },
      }),
    }),
  ],
  presets: [
    [
      'classic',
      {
        docs: { routeBasePath: '/', sidebarPath: './sidebars.ts', breadcrumbs: false },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
    docs: { sidebar: { hideable: false } },
    liveCodeBlock: { playgroundPosition: 'bottom' },
    prism: { theme: temaCodigo, darkTheme: temaCodigo },
  } satisfies Preset.ThemeConfig,
};

export default config;
