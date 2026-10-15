export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const MESES_ABREVIADOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const DIAS_DA_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const INICIAIS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const inicioDoDia = (data: Date): Date => new Date(data.getFullYear(), data.getMonth(), data.getDate());

export const inicioDoMes = (data: Date): Date => new Date(data.getFullYear(), data.getMonth(), 1);

export const mesmoDia = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const mesmoMes = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const compararDias = (a: Date, b: Date): number => inicioDoDia(a).getTime() - inicioDoDia(b).getTime();

export const diasNoMes = (ano: number, mes: number): number => new Date(ano, mes + 1, 0).getDate();

export const somarDias = (data: Date, dias: number): Date => new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);

export const somarMeses = (data: Date, meses: number): Date => {
  const alvo = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  return new Date(alvo.getFullYear(), alvo.getMonth(), Math.min(data.getDate(), diasNoMes(alvo.getFullYear(), alvo.getMonth())));
};

export const paraIso = (data: Date | null): string | null =>
  data
    ? `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
    : null;

export const deIso = (iso: string): Date => {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};

export const formatarData = (data: Date | null): string =>
  data ? `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}` : '';

export const interpretarData = (texto: string): Date | null => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return null;
  const [dia, mes, ano] = texto.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getDate() === dia && data.getMonth() === mes - 1 && data.getFullYear() === ano ? data : null;
};

export const mascararData = (texto: string): string => {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
};

export type PrecisaoDaData = 'day' | 'month' | 'year';

export const TAMANHO_DO_TEXTO: Record<PrecisaoDaData, number> = { day: 10, month: 7, year: 4 };

export const PLACEHOLDER_DA_DATA: Record<PrecisaoDaData, string> = { day: 'dd/mm/aaaa', month: 'mm/aaaa', year: 'aaaa' };

export const normalizarPorPrecisao = (data: Date, precisao: PrecisaoDaData): Date =>
  precisao === 'year' ? new Date(data.getFullYear(), 0, 1) : precisao === 'month' ? inicioDoMes(data) : inicioDoDia(data);

export const fimPorPrecisao = (data: Date, precisao: PrecisaoDaData): Date =>
  precisao === 'year' ? new Date(data.getFullYear(), 11, 31)
    : precisao === 'month' ? new Date(data.getFullYear(), data.getMonth(), diasNoMes(data.getFullYear(), data.getMonth()))
      : inicioDoDia(data);

export const formatarPorPrecisao = (data: Date | null, precisao: PrecisaoDaData): string => {
  if (!data) return '';
  if (precisao === 'day') return formatarData(data);
  if (precisao === 'year') return String(data.getFullYear());
  return `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
};

export const mascararPorPrecisao = (texto: string, precisao: PrecisaoDaData): string => {
  if (precisao === 'day') return mascararData(texto);
  const digitos = texto.replace(/\D/g, '').slice(0, precisao === 'year' ? 4 : 6);
  if (precisao === 'year' || digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
};

export const interpretarPorPrecisao = (texto: string, precisao: PrecisaoDaData): Date | null => {
  if (precisao === 'day') return interpretarData(texto);
  if (precisao === 'year') return /^\d{4}$/.test(texto) ? new Date(Number(texto), 0, 1) : null;
  if (!/^\d{2}\/\d{4}$/.test(texto)) return null;
  const [mes, ano] = texto.split('/').map(Number);
  return mes >= 1 && mes <= 12 ? new Date(ano, mes - 1, 1) : null;
};

export const rotuloDoDia = (data: Date): string => `${data.getDate()} de ${MESES[data.getMonth()].toLowerCase()} de ${data.getFullYear()}`;
