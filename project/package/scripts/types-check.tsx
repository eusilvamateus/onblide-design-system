// project/package/scripts/types-check.tsx
//
// Verificação de TIPOS (só compila, nunca executa), do ponto de vista do
// CONSUMIDOR: importa de '@onblide/ui', que o tsconfig.types.json mapeia para o
// `dist/index.d.ts` PUBLICADO (não para `src`). Roda com `npm run typecheck:dist`,
// depois do build. Cada `@ts-expect-error` abaixo DEVE continuar errando — se o
// erro sumir, o tsc reclama de diretiva não usada.
import React, { useState } from 'react';
import { Table, Select, Icons, BrandTile, Link, Modal, Pagination } from '@onblide/ui';
import type {
  BadgeTone, OBTone, OBToastPosition,
  IconName, IconProps, IconComponent,
  Brand, BrandKey, BrandTileProps,
  LinkProps, LinkVariant, ModalProps, ModalSize, PaginationProps,
  SelectOption, SelectBaseProps, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps, TableColumn, TableSort,
} from '@onblide/ui';

// Todo tipo usado em prop pública precisa estar exportado por src/index.ts
// (lição de BadgeTone / OBTone / OBToastPosition): importar acima já prova isso.
export type TiposExportados = [
  BadgeTone, OBTone, OBToastPosition,
  IconName, IconProps, IconComponent,
  Brand, BrandKey, BrandTileProps,
  LinkProps, LinkVariant, ModalProps, ModalSize, PaginationProps,
  SelectOption, SelectBaseProps, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps<object>, TableColumn<object>, TableSort,
];

interface Linha { id: number; nome: string } // interface: sem index signature
type LinhaAlias = { id: number };

export function Verificacoes({ linhas, aliases }: { linhas: Linha[]; aliases: LinhaAlias[] }) {
  const [texto, setTexto] = useState<string>('');
  const [textoOuNulo, setTextoOuNulo] = useState<string | null>(null);
  const [lista, setLista] = useState<string[]>([]);
  const dinamico = Math.random() > 0.5;

  return (
    <>
      {/* Table aceita interface e type alias como tipo de linha */}
      <Table rows={linhas} />
      <Table<Linha> rows={linhas} columns={[{ key: 'nome', label: 'Nome', render: (valor, linha) => `${String(valor)}-${linha.id}` }]} />
      <Table rows={aliases} />
      <Table />

      {/* Select: setState direto como onChange, nos dois modos */}
      <Select value={texto} onChange={setTexto} />
      <Select value={textoOuNulo} onChange={setTextoOuNulo} />
      <Select multi value={lista} onChange={setLista} />
      <Select options={['a', { label: 'b' }]} placeholder="x" />
      {/* @ts-expect-error multi com onChange de string */}
      <Select multi value={lista} onChange={setTexto} />
      {/* @ts-expect-error modo simples com value array */}
      <Select value={lista} />
      {/* @ts-expect-error multi vindo de variável boolean não discrimina a união */}
      <Select multi={dinamico} value={lista} onChange={setLista} />

      {/* Icons / BrandTile / Link / Pagination / Modal */}
      <Icons.check size={12} style={{ color: '#fff' }} />
      {Icons.house({ size: 18 })}
      {(['search', 'x'] as IconName[]).map((n) => <React.Fragment key={n}>{Icons[n]()}</React.Fragment>)}
      <BrandTile brand="github" size={32} />
      <Link href="#" variant="quiet" external onClick={(e) => e.preventDefault()}>x</Link>
      <Pagination page={2} total={9} onChange={(p) => void p.toFixed()} />
      <Modal open size="lg" title="t" footer={<b>f</b>}>c</Modal>
      {/* @ts-expect-error variante inexistente */}
      <Link variant="loud">x</Link>
      {/* @ts-expect-error tamanho inexistente */}
      <Modal open size="xl" />
      {/* @ts-expect-error marca inexistente */}
      <BrandTile brand="myspace" />
      {/* @ts-expect-error ícone inexistente */}
      <Icons.nope />
    </>
  );
}

// Migração 0.3.x → 0.4.0+: SelectProps virou uma união (por `multi`). Os padrões
// abaixo deixaram de compilar (cada um travado por um @ts-expect-error); os `Ok*`
// são as alternativas que funcionam, usando os tipos exportados.
// @ts-expect-error uma interface não pode estender uma união
interface QuebradoExtends extends SelectProps { extra?: string }

interface OkExtendsBase extends SelectBaseProps { extra?: string }    // estender a base
interface OkExtendsRamo extends SingleSelectProps { extra?: string }  // ou um ramo da união
type OkOmitBase = Omit<SelectBaseProps, 'label'>;                     // Omit na base
export type UsosMigrados = [OkExtendsBase, OkExtendsRamo, OkOmitBase, QuebradoExtends];

export function Wrapper(p: OkOmitBase) {
  return <Select {...p} />;
}
export function WrapperQuebrado(p: Omit<SelectProps, 'label'>) {
  // @ts-expect-error Omit sobre a união perde a discriminação de `multi`
  return <Select {...p} />;
}
// @ts-expect-error `v` fica implicitamente any ao indexar a união
export const handlerImplicito: SelectProps['onChange'] = (v) => v;
