import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Brands, BrandTile } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

// Dados e marcas congelados em scripts/fixtures/brands.json (gerado na Fase 4,
// antes da remoção do UI kit antigo, renderizando o original em Node).
const esperado = JSON.parse(fs.readFileSync(new URL('./fixtures/brands.json', import.meta.url), 'utf8'));
if (Object.keys(esperado).length !== 7) fail('a fixture deveria ter 7 marcas', Object.keys(esperado));

if (Object.keys(Brands).sort().join(',') !== Object.keys(esperado).sort().join(',')) {
  fail('conjunto de marcas difere da fixture', Object.keys(Brands));
}

for (const [chave, d] of Object.entries(esperado)) {
  const b = Brands[chave];
  if (b.name !== d.name || b.hex !== d.hex || b.cat !== d.cat || b.desc !== d.desc) fail(`dados de ${chave} divergem`, b);
  if (renderToStaticMarkup(b.mark(24)) !== d.mark24) fail(`mark(24) de ${chave} diverge da fixture`);
  if (renderToStaticMarkup(b.mark(40)) !== d.mark40) fail(`mark(40) de ${chave} diverge da fixture`);
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
