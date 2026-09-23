import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Brands, BrandTile } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

// Dados lidos do ORIGINAL (Primitives.jsx), nao do porte.
const src = fs.readFileSync(new URL('../../ui_kits/web_app/Primitives.jsx', import.meta.url), 'utf8');
const bloco = src.slice(src.indexOf('const Brands = {'), src.indexOf('const BrandTile'));
const re = /^  (\w+): \{\s*\n\s*name: '([^']*)', hex: '([^']*)', cat: '([^']*)',\s*\n\s*desc: '([^']*)',/gm;
const esperado = {};
let m;
while ((m = re.exec(bloco))) esperado[m[1]] = { name: m[2], hex: m[3], cat: m[4], desc: m[5] };
if (Object.keys(esperado).length !== 7) fail('parse do original nao achou 7 marcas', Object.keys(esperado));

if (Object.keys(Brands).sort().join(',') !== Object.keys(esperado).sort().join(',')) {
  fail('conjunto de marcas difere do legado', Object.keys(Brands));
}

for (const [chave, d] of Object.entries(esperado)) {
  const b = Brands[chave];
  if (b.name !== d.name || b.hex !== d.hex || b.cat !== d.cat || b.desc !== d.desc) fail(`dados de ${chave} divergem`, b);
  for (const s of [24, 40]) {
    const svg = renderToStaticMarkup(b.mark(s));
    if (!svg.startsWith(`<svg width="${s}" height="${s}" viewBox="0 0 24 24">`)) fail(`mark(${s}) de ${chave} com cabecalho inesperado`, svg);
  }
}

const tile = renderToStaticMarkup(React.createElement(BrandTile, { brand: 'github' }));
if (!tile.includes('width:44px;height:44px') || !tile.includes('background:#ffffff') || !tile.includes(`<svg width="${Math.round(44 * 0.56)}" height="${Math.round(44 * 0.56)}"`)) {
  fail('BrandTile github deveria ter moldura 44px e marca 25px', tile);
}
const tileGrande = renderToStaticMarkup(React.createElement(BrandTile, { brand: 'figma', size: 100 }));
if (!tileGrande.includes('width:100px;height:100px') || !tileGrande.includes('<svg width="56" height="56"')) {
  fail('BrandTile size=100 deveria ter marca 56px', tileGrande);
}

const desconhecida = renderToStaticMarkup(React.createElement(BrandTile, { brand: 'myspace' }));
if (desconhecida !== '') fail('marca desconhecida deveria renderizar vazio', desconhecida);

console.log('OK: 7 marcas + BrandTile');
