import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { themeInitScript } from '../dist/index.js';

const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'theme-init.js');
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, `${themeInitScript}\n`);
console.log(`theme-init.js gerado (${themeInitScript.length} caracteres)`);
