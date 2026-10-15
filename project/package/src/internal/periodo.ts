import { MESES, diasNoMes, mesmoDia } from './dates';

export interface OpcoesDoPeriodo {
  hoje?: Date;
}

const fechaOMes = (inicio: Date, fim: Date): boolean =>
  inicio.getDate() === 1 && fim.getDate() === diasNoMes(fim.getFullYear(), fim.getMonth());

const ponta = (data: Date, comDia: boolean, comAno: boolean): string => {
  const dia = comDia ? `${String(data.getDate()).padStart(2, '0')} ` : '';
  const ano = comAno ? `, ${data.getFullYear()}` : '';
  return `${dia}${MESES[data.getMonth()]}${ano}`;
};

export const formatarPeriodo = (inicio: Date | null, fim: Date | null, { hoje = new Date() }: OpcoesDoPeriodo = {}): string => {
  if (!inicio || !fim) return '';
  const [de, ate] = inicio.getTime() <= fim.getTime() ? [inicio, fim] : [fim, inicio];
  const comAno = de.getFullYear() !== hoje.getFullYear() || ate.getFullYear() !== hoje.getFullYear();
  const fechado = fechaOMes(de, ate);
  const comDia = !fechado;
  if (mesmoDia(de, ate) || (fechado && de.getFullYear() === ate.getFullYear() && de.getMonth() === ate.getMonth())) {
    return ponta(de, comDia, comAno);
  }
  return `${ponta(de, comDia, comAno)} - ${ponta(ate, comDia, comAno)}`;
};
