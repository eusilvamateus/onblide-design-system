//
// Verificação de TIPOS (só compila, nunca executa), do ponto de vista do
// CONSUMIDOR: importa de '@onblide/ui', que o tsconfig.types.json mapeia para o
// `dist/index.d.ts` PUBLICADO (não para `src`). Roda com `npm run typecheck:dist`,
// depois do build. Cada `@ts-expect-error` abaixo DEVE continuar errando — se o
// erro sumir, o tsc reclama de diretiva não usada.
import React, { useState } from 'react';
import { Table, Select, Slider, Icons, Link, Modal, Pagination, Logo, Calendar, Datepicker, toast, BREAKPOINTS, mediaQuery, useBreakpoint } from '@onblide/ui';
import type {
  BadgeTone, OBTone, OBToastPosition,
  IconName, IconProps, IconComponent,
  LogoProps,
  LinkProps, LinkTone, ModalProps, ModalSize, PaginationProps,
  SelectOption, SelectBaseProps, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps, TableColumn, TableSort,
  SliderBaseProps, SingleSliderProps, RangeSliderProps, SliderProps, SliderValue, SliderTone,
  CalendarProps, SingleCalendarProps, RangeCalendarProps, CalendarRange,
  DatepickerProps, SingleDatepickerProps, RangeDatepickerProps,
  ToastOptions, ToastShortcutOptions,
  Breakpoint, BreakpointName,
  CheckboxSize, RadioSize, SwitchSize,
  FieldShellSize, InputSize, SelectSize, SearchInputSize, NumberFieldSize, DatepickerSize, AutocompleteSize, TextareaSize, CodeInputSize,
  TabsSize, BadgeSize,
  AccordionAppearance, AccordionSize, AccordionHeadingLevel,
} from '@onblide/ui';

// Todo tipo usado em prop pública precisa estar exportado por src/index.ts
// (lição de BadgeTone / OBTone / OBToastPosition): importar acima já prova isso.
export type TiposExportados = [
  BadgeTone, OBTone, OBToastPosition,
  IconName, IconProps, IconComponent,
  LogoProps,
  LinkProps, LinkTone, ModalProps, ModalSize, PaginationProps,
  SelectOption, SelectBaseProps, SelectProps, SingleSelectProps, MultiSelectProps,
  TableProps<object>, TableColumn<object>, TableSort,
  SliderBaseProps, SingleSliderProps, RangeSliderProps, SliderProps, SliderValue, SliderTone,
  CalendarProps, SingleCalendarProps, RangeCalendarProps, CalendarRange,
  DatepickerProps, SingleDatepickerProps, RangeDatepickerProps,
  ToastOptions, ToastShortcutOptions,
  Breakpoint, BreakpointName,
  CheckboxSize, RadioSize, SwitchSize,
  FieldShellSize, InputSize, SelectSize, SearchInputSize, NumberFieldSize, DatepickerSize, AutocompleteSize, TextareaSize, CodeInputSize,
  TabsSize, BadgeSize,
  AccordionAppearance, AccordionSize, AccordionHeadingLevel,
];

interface Linha { id: number; nome: string } // interface: sem index signature
type LinhaAlias = { id: number };

export function Verificacoes({ linhas, aliases }: { linhas: Linha[]; aliases: LinhaAlias[] }) {
  const [texto, setTexto] = useState<string>('');
  const [textoOuNulo, setTextoOuNulo] = useState<string | null>(null);
  const [lista, setLista] = useState<string[]>([]);
  const [num, setNum] = useState<number>(0);
  const [par, setPar] = useState<[number, number]>([10, 20]);
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

      {/* Slider: props discriminadas por `range`.
          Custo de API: deixam de compilar (a) value em par sem `range` literal,
          (b) `range={boolean}` vindo de variável (não discrimina a união) e
          (c) onChange tipado como (v: SliderValue) => void continua aceito, mas
          onChange de número com `range` não. Quem tem um boolean dinâmico deve
          ramificar em <Slider range .../> e <Slider .../>. */}
      <Slider />
      <Slider value={num} onChange={setNum} />
      <Slider value={num} onChange={(v) => void v.toFixed()} />
      <Slider range value={par} onChange={setPar} />
      <Slider range value={par} onChange={(v) => void v[0].toFixed()} />
      <Slider min={0} max={10} step={2} tone="success" marks label="x" />
      {/* @ts-expect-error modo simples com value em par */}
      <Slider value={par} />
      {/* @ts-expect-error range com onChange de número */}
      <Slider range value={par} onChange={setNum} />
      {/* @ts-expect-error range vindo de variável boolean não discrimina a união */}
      <Slider range={dinamico} value={num} onChange={setNum} />

      {/* Icons / Logo / Link / Pagination / Modal */}
      <Icons.check size={12} style={{ color: '#fff' }} />
      {Icons.house({ size: 18 })}
      {(['search', 'x'] as IconName[]).map((n) => <React.Fragment key={n}>{Icons[n]()}</React.Fragment>)}
      <Logo />
      <Logo size={24} />
      <Link href="#" tone="muted" external onClick={(e) => e.preventDefault()}>x</Link>
      <Pagination page={2} total={9} onChange={(p) => void p.toFixed()} />
      <Modal open size="lg" title="t" footer={<b>f</b>}>c</Modal>
      {/* @ts-expect-error variante inexistente */}
      <Link variant="loud">x</Link>
      {/* @ts-expect-error tamanho inexistente */}
      <Modal open size="xl" />
      {/* @ts-expect-error size do Logo é número */}
      <Logo size="24" />
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

export function UsosDeData() {
  const [dia, setDia] = useState<Date | null>(null);
  const [periodo, setPeriodo] = useState<CalendarRange>({ start: null, end: null });
  return (
    <>
      <Calendar value={dia} onChange={setDia} />
      <Calendar mode="range" value={periodo} onChange={setPeriodo} />
      <Datepicker value={dia} onChange={setDia} min={new Date()} />
      <Datepicker mode="range" value={periodo} onChange={(r) => setPeriodo(r)} />
      <Datepicker mode="range" calendarDisplay="inline" value={periodo} onChange={setPeriodo} />
      {/* @ts-expect-error intervalo exige CalendarRange */}
      <Calendar mode="range" value={dia} />
      {/* @ts-expect-error data única não aceita CalendarRange */}
      <Datepicker value={periodo} />
    </>
  );
}

export const usosDeToast: string[] = [
  toast({ title: 'x' }),
  toast({ tone: 'danger', title: 'x', body: 'y', action: 'Tentar', onAction: () => undefined, icon: false, duration: 0, stack: 'painel' }),
  toast.success('x', { body: 'y', duration: 3000 }),
  toast.info('x'),
  toast.warning('x'),
  toast.danger('x', { stack: 'painel' }),
];
toast.dismiss();
toast.dismiss(usosDeToast[0]);
// @ts-expect-error o título é obrigatório
toast({ tone: 'info' });
// @ts-expect-error tom inexistente
toast({ title: 'x', tone: 'loud' });
// @ts-expect-error o atalho já define o tom
toast.success('x', { tone: 'danger' });

export function VerificaBreakpoints() {
  const { current, atLeast } = useBreakpoint();
  const largura: 1024 = BREAKPOINTS.md;
  const faixa: Breakpoint = current;
  const consulta: string = mediaQuery('sm');
  // @ts-expect-error base não é breakpoint com largura mínima
  mediaQuery('base');
  // @ts-expect-error xs saiu da escala
  atLeast('xs');
  return <span>{largura}{faixa}{consulta}{String(atLeast('md'))}</span>;
}
