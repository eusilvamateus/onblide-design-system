import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';

function externalGlobalPlugin(mapping: Record<string, string>): Plugin {
  return {
    name: 'external-global',
    setup(build) {
      for (const mod of Object.keys(mapping)) {
        const filter = new RegExp(`^${mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
        build.onResolve({ filter }, (args) => ({ path: args.path, namespace: 'external-global' }));
      }
      build.onLoad({ filter: /.*/, namespace: 'external-global' }, (args) => ({
        contents: `module.exports = ${mapping[args.path]};`,
        loader: 'js',
      }));
    },
  };
}

export default defineConfig([
  {
    entry: { index: 'src/index.ts', periodo: 'src/internal/periodo.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    noExternal: [/^@phosphor-icons\/core/],
    loader: { '.svg': 'text' },
  },
  {
    entry: { 'onblide-ui.browser': 'src/browser.ts' },
    format: ['iife'],
    sourcemap: true,
    clean: false,
    minify: true,
    outDir: 'dist',
    loader: { '.svg': 'text' },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    esbuildPlugins: [
      externalGlobalPlugin({ react: 'window.React', 'react-dom': 'window.ReactDOM' }),
    ],
    outExtension: () => ({
      js: '.js',
    }),
  },
]);
