// Gera src/data/icones.json com os nomes de todos os ícones do Phosphor (iguais nos seis pesos).
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../../packages/ui/node_modules/@phosphor-icons/web/src/regular/style.css', import.meta.url), 'utf8');
const nomes = [...new Set([...css.matchAll(/^\.ph\.ph-([a-z0-9-]+):before/gm)].map((m) => m[1]))].sort();
fs.mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../src/data/icones.json', import.meta.url), JSON.stringify(nomes));
console.log(`ícones: ${nomes.length}`);
