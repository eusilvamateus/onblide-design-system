import { compararDias, diasNoMes, inicioDoDia, mesmoDia, somarDias, somarMeses } from './dates';

export interface IntervaloDeDatas {
  start: Date | null;
  end: Date | null;
}

export type SemanaComecaEm = 0 | 1;

export interface LimitesDoCalendario {
  min?: Date;
  max?: Date;
  isDateDisabled?: (data: Date) => boolean;
}

export const diaDesabilitado = (data: Date, { min, max, isDateDisabled }: LimitesDoCalendario): boolean =>
  (!!min && compararDias(data, min) < 0) || (!!max && compararDias(data, max) > 0) || !!isDateDisabled?.(data);

export const posicaoNaSemana = (data: Date, semanaComecaEm: SemanaComecaEm): number => (data.getDay() - semanaComecaEm + 7) % 7;

export const celulasDoMes = (mes: Date, semanaComecaEm: SemanaComecaEm): (Date | null)[] => {
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const vazias = posicaoNaSemana(primeiro, semanaComecaEm);
  const total = diasNoMes(mes.getFullYear(), mes.getMonth());
  return [
    ...Array.from({ length: vazias }, () => null),
    ...Array.from({ length: total }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1)),
  ];
};

export const cliqueNoIntervalo = (atual: IntervaloDeDatas, dia: Date): IntervaloDeDatas => {
  const dia0 = inicioDoDia(dia);
  if (!atual.start || atual.end) return { start: dia0, end: null };
  if (compararDias(dia0, atual.start) < 0) return { start: dia0, end: atual.start };
  return { start: atual.start, end: dia0 };
};

export const dentroDoIntervalo = (dia: Date, intervalo: IntervaloDeDatas, previa: Date | null): boolean => {
  const { start } = intervalo;
  let { end } = intervalo;
  if (!start) return false;
  if (!end) {
    if (!previa) return false;
    end = previa;
  }
  const [de, ate] = compararDias(end, start) < 0 ? [end, start] : [start, end];
  return compararDias(dia, de) > 0 && compararDias(dia, ate) < 0;
};

export const moverFoco = (foco: Date, tecla: string, shift: boolean, semanaComecaEm: SemanaComecaEm): Date | null => {
  switch (tecla) {
    case 'ArrowLeft': return somarDias(foco, -1);
    case 'ArrowRight': return somarDias(foco, 1);
    case 'ArrowUp': return somarDias(foco, -7);
    case 'ArrowDown': return somarDias(foco, 7);
    case 'Home': return somarDias(foco, -posicaoNaSemana(foco, semanaComecaEm));
    case 'End': return somarDias(foco, 6 - posicaoNaSemana(foco, semanaComecaEm));
    case 'PageUp': return somarMeses(foco, shift ? -12 : -1);
    case 'PageDown': return somarMeses(foco, shift ? 12 : 1);
    default: return null;
  }
};

export const diaDoFoco = (mes: Date, foco: Date | null, selecionado: Date | null, hoje: Date): Date => {
  const no = (d: Date | null) => !!d && d.getFullYear() === mes.getFullYear() && d.getMonth() === mes.getMonth();
  if (foco && no(foco)) return foco;
  if (selecionado && no(selecionado)) return selecionado;
  if (no(hoje)) return hoje;
  return new Date(mes.getFullYear(), mes.getMonth(), 1);
};

export const ehHoje = (data: Date, hoje: Date): boolean => mesmoDia(data, hoje);
