// Copia as variantes de arquivo da logo (project/marca/ — fonte única, organizada por formato: svg/, png/,
// png/icones/) para static/img/marca/, de onde a página de Fundações › Marca as referencia. Nada é editado
// à mão em docs-site: mudou a arte, mudou em project/marca/, e este script refaz a cópia no próximo `npm run gerar`.
import fs from 'node:fs';

const raiz = new URL('../../project/marca/', import.meta.url);
const destino = new URL('../static/img/marca/', import.meta.url);
fs.mkdirSync(destino, { recursive: true });

let total = 0;

// SVGs ficam soltos em static/img/marca/ (é o que a página referencia hoje: /img/marca/<arquivo>.svg).
const svgOrigem = new URL('svg/', raiz);
const svgs = fs.readdirSync(svgOrigem).filter((f) => f.endsWith('.svg'));
for (const f of svgs) fs.copyFileSync(new URL(f, svgOrigem), new URL(f, destino));
total += svgs.length;

// PNGs (lockups completos + ícones de favicon em vários tamanhos) mantêm a subpasta png/ na cópia.
const pngDestino = new URL('png/', destino);
const iconesDestino = new URL('icones/', pngDestino);
fs.mkdirSync(iconesDestino, { recursive: true });

const pngOrigem = new URL('png/', raiz);
const pngs = fs.readdirSync(pngOrigem).filter((f) => f.endsWith('.png'));
for (const f of pngs) fs.copyFileSync(new URL(f, pngOrigem), new URL(f, pngDestino));
total += pngs.length;

const iconesOrigem = new URL('png/icones/', raiz);
const icones = fs.readdirSync(iconesOrigem).filter((f) => f.endsWith('.png'));
for (const f of icones) fs.copyFileSync(new URL(f, iconesOrigem), new URL(f, iconesDestino));
total += icones.length;

console.log(`marca: ${total} arquivos copiados para static/img/marca/ (${svgs.length} svg, ${pngs.length} png, ${icones.length} ícones)`);
