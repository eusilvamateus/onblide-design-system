import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';

// Maps react/react-dom imports to the page's own window.React / window.ReactDOM
// globals (loaded via <script src=unpkg react...> on the preview pages and the
// web app) instead
// of bundling a second private copy of React — required so the IIFE bundle's
// hooks (useState, useEffect, ...) run against the SAME React instance that
// actually renders the page. Two separate React module instances in one page
// is the classic cause of "Cannot read properties of null (reading 'useState')".
// Note: this only intercepts exact bare specifiers ("react", "react-dom").
// A future direct import of a subpath (react/jsx-runtime, react-dom/client,
// ...) is not a regression risk, though: those entry points internally
// require('react')/require('react-dom') with the bare specifier too, which
// this plugin still catches — it would just add a little bundle size, not
// reintroduce a second React instance.
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
    // Browser-global bundle for the ds/components/*.html preview pages and the
    // web app (ui_kits/web_app/). clean:false is required here — tsup runs array entries as
    // separate builds, and a second clean:true would delete the first build's
    // output before this one starts.
    entry: { 'onblide-ui.browser': 'src/browser.ts' },
    format: ['iife'],
    sourcemap: true,
    clean: false,
    minify: true,
    outDir: 'dist',
    // Selects react/jsx-runtime's production build at build time and strips
    // its "process.env.NODE_ENV" check — the browser has no `process` global,
    // so without this the bundle throws "process is not defined" on load.
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    esbuildPlugins: [
      externalGlobalPlugin({ react: 'window.React', 'react-dom': 'window.ReactDOM' }),
    ],
    // tsup/esbuild suffix iife/umd output with ".global.js" by default; the
    // preview pages hardcode the plain "onblide-ui.browser.js" filename, so
    // this keeps the plain extension instead.
    outExtension: () => ({
      js: '.js',
    }),
  },
]);
