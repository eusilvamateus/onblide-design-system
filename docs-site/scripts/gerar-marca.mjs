// Copia as variantes de arquivo da logo (project/assets/*.svg — fonte única) para static/img/marca/,
// de onde a página de Fundações › Marca as referencia. Nada é editado à mão em docs-site: mudou a arte,
// mudou em project/assets/, e este script refaz a cópia no próximo `npm run gerar`.
import fs from 'node:fs';

const origem = new URL('../../project/assets/', import.meta.url);
const destino = new URL('../static/img/marca/', import.meta.url);
fs.mkdirSync(destino, { recursive: true });

const arquivos = fs.readdirSync(origem).filter((f) => f.endsWith('.svg'));
for (const f of arquivos) fs.copyFileSync(new URL(f, origem), new URL(f, destino));
console.log(`marca: ${arquivos.length} variantes copiadas para static/img/marca/`);
