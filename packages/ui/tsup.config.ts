import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', periodo: 'src/internal/periodo.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  noExternal: [/^@phosphor-icons\/core/],
  loader: { '.svg': 'text' },
});
