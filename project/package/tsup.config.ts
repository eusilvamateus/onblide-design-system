import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';

// Maps react/react-dom imports to the page's own window.React / window.ReactDOM
// globals (loaded via <script src=unpkg react...> on the preview pages) instead
// of bundling a second private copy of React — required so the IIFE bundle's
// hooks (useState, useEffect, ...) run against the SAME React instance that
// actually renders the page. Two separate React module instances in one page
// is the classic cause of "Cannot read properties of null (reading 'useState')".
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
    // The real package build: what /design-sync and any future npm consumer use.
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
  },
  {
    // Browser-global compatibility bundle for the existing ds/components/*.html
    // preview pages. clean:false is required here — tsup runs array entries as
    // separate builds, and a second clean:true would delete the first build's
    // output before this one starts.
    entry: { 'onblide-ui.browser': 'src/browser.ts' },
    format: ['iife'],
    sourcemap: true,
    clean: false,
    minify: true,
    outDir: 'dist',
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    esbuildPlugins: [
      externalGlobalPlugin({ react: 'window.React', 'react-dom': 'window.ReactDOM' }),
    ],
    esbuildOptions(options) {
      options.jsx = 'transform';
      options.jsxFactory = 'React.createElement';
      options.jsxFragment = 'React.Fragment';
    },
    outExtension: () => ({
      js: '.js',
    }),
  },
]);
