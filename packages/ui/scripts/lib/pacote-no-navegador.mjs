import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

export const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const entrada = `
import * as React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as OnblideUI from './dist/index.js';

Object.assign(window, OnblideUI, { React, ReactDOM: { createRoot, flushSync } });
`;

let codigo;

export const obterChromium = () => {
  try {
    return createRequire(import.meta.url)(path.resolve(pasta, '../../docs-site/node_modules/playwright')).chromium;
  } catch {
    console.log('SKIP: playwright não instalado (rode npm install em docs-site)');
    process.exit(0);
  }
};

export const carregarPacoteNoNavegador = async (pagina) => {
  codigo ??= (
    await build({
      stdin: { contents: entrada, resolveDir: pasta, loader: 'js' },
      bundle: true,
      format: 'iife',
      write: false,
      charset: 'utf8',
      define: { 'process.env.NODE_ENV': '"production"' },
    })
  ).outputFiles[0].text;
  await pagina.addScriptTag({ content: codigo });
};
