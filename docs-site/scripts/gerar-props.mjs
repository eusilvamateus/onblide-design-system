// Gera src/data/props.json com as props de cada componente, lidas dos tipos TypeScript do pacote.
import fs from 'node:fs';
import path from 'node:path';
import { withCustomConfig } from 'react-docgen-typescript';

const pacote = path.resolve('../packages/ui');
const src = path.join(pacote, 'src');
const categorias = fs.readdirSync(src, { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== 'internal' && e.name !== 'fonts');

const arquivos = [];
for (const c of categorias) {
  for (const comp of fs.readdirSync(path.join(src, c.name), { withFileTypes: true })) {
    if (comp.isDirectory()) arquivos.push(path.join(src, c.name, comp.name, `${comp.name}.tsx`));
  }
}

const parser = withCustomConfig(path.join(pacote, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName),
});

const saida = {};
for (const arq of arquivos.filter(fs.existsSync)) {
  for (const doc of parser.parse(arq)) {
    saida[doc.displayName] = {
      descricao: doc.description || '',
      props: Object.values(doc.props).map((p) => ({
        nome: p.name,
        tipo: p.type.name === 'enum' && Array.isArray(p.type.value) ? p.type.value.map((v) => v.value).join(' | ') : p.type.name,
        obrigatoria: p.required,
        padrao: p.defaultValue?.value ?? null,
        descricao: p.description || '',
      })),
    };
  }
}
fs.writeFileSync(new URL('../src/data/props.json', import.meta.url), JSON.stringify(saida, null, 1));
console.log(`props: ${Object.keys(saida).length} componentes`);
