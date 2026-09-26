// Gera a folha de estilos única que o /design-sync envia ao Claude Design (cfg.cssEntry).
// Resolve os @import de src/styles.css (tokens + Phosphor) num só arquivo, com todas as fontes em fonts/:
// assim cada @font-face aparece uma vez e aponta para um arquivo que existe.
// Rode a partir de project/package (faz parte do cfg.buildCmd).
import fs from 'node:fs';
import { build } from 'esbuild';

const saida = '.design-sync/.cache/css/styles.css';
fs.rmSync('.design-sync/.cache/css', { recursive: true, force: true });

await build({
  entryPoints: ['src/styles.css'],
  bundle: true,
  outfile: saida,
  loader: { '.ttf': 'file', '.woff': 'file', '.woff2': 'file', '.svg': 'file' },
  assetNames: 'fonts/[name]',
  logLevel: 'warning',
});

// O Phosphor também declara um SVG font, formato que nenhum navegador atual usa (woff2/woff/ttf cobrem todos)
// e que o sync não copia: sem esta limpeza a declaração ficaria apontando para um arquivo inexistente.
const css = fs.readFileSync(saida, 'utf8').replace(/,\s*url\("[^"]*\.svg#[^"]*"\)\s*format\("svg"\)/g, '');
fs.writeFileSync(saida, css);
fs.rmSync('.design-sync/.cache/css/fonts/Phosphor.svg', { force: true });
console.log(`css: ${saida}`);
