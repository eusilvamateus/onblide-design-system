// project/package/scripts/run-smokes.mjs
//
// Roda todos os scripts/smoke-*.mjs, um processo por script, e falha se
// qualquer um falhar. Uso: `npm run build && npm run smoke` (os smokes leem
// dist/, então o build vem antes).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const arquivos = readdirSync(dir).filter((f) => /^smoke-.+\.mjs$/.test(f)).sort();

let falhas = 0;
for (const arquivo of arquivos) {
  const r = spawnSync(process.execPath, [join(dir, arquivo)], { stdio: 'inherit' });
  if (r.status !== 0) {
    falhas++;
    console.error(`FAIL: ${arquivo} (exit ${r.status})`);
  }
}
console.log(`${arquivos.length - falhas}/${arquivos.length} smokes ok`);
process.exit(falhas ? 1 : 0);
