import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function carregarTs(caminhoRelativo) {
  const resultado = await build({
    entryPoints: [join(raiz, caminhoRelativo)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const codigo = resultado.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`);
}
