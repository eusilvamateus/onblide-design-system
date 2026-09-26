import { themes as prismThemes } from 'prism-react-renderer';
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
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [
    // O pacote é linkado de ../project/package e tem o próprio node_modules: força uma única cópia do React.
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
        docs: { routeBasePath: '/', sidebarPath: './sidebars.ts' },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
    navbar: {
      title: 'Onblide Design System',
      logo: { alt: 'Onblide', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'principal', position: 'left', label: 'Documentação' },
        { href: 'https://github.com/eusilvamateus/onblide-design-system', label: 'GitHub', position: 'right' },
      ],
    },
    footer: { style: 'dark', copyright: 'Onblide · Design System' },
    liveCodeBlock: { playgroundPosition: 'bottom' },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
