import { defineConfig } from 'tsup';

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
    outExtension: () => ({
      js: '.js',
    }),
  },
]);
