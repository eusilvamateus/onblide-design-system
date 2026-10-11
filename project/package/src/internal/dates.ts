export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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

export const rotuloDoDia = (data: Date): string => `${data.getDate()} de ${MESES[data.getMonth()].toLowerCase()} de ${data.getFullYear()}`;
