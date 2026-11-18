export interface Horario { h: number; m: number; s: number }
export type Periodo = 'AM' | 'PM';
export type CicloDeHora = 12 | 24;

export interface LimitesDeHorario {
  min?: string;
  max?: string;
  depoisDe?: string | null;
  isTimeDisabled?: (time: string) => boolean;
}

export const dois = (n: number) => String(n).padStart(2, '0');

export const lerHorario = (texto: string | null | undefined): Horario | null => {
  const m = String(texto ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [h, min, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  if (h > 23 || min > 59 || s > 59) return null;
  return { h, m: min, s };
};

export const escreverHorario = (t: Horario, comSegundos: boolean) => (comSegundos ? `${dois(t.h)}:${dois(t.m)}:${dois(t.s)}` : `${dois(t.h)}:${dois(t.m)}`);

export const emSegundos = (t: Horario | null) => (t ? t.h * 3600 + t.m * 60 + t.s : null);
export const periodoDe = (h: number): Periodo => (h >= 12 ? 'PM' : 'AM');
export const doze = (h: number) => h % 12 || 12;
export const para24 = (h12: number, p: Periodo) => (h12 % 12) + (p === 'PM' ? 12 : 0);

export const exibirHorario = (texto: string | null | undefined, ciclo: CicloDeHora = 24, comSegundos = false) => {
  const t = lerHorario(texto);
  if (!t) return null;
  const base = `${dois(ciclo === 12 ? doze(t.h) : t.h)}:${dois(t.m)}${comSegundos ? `:${dois(t.s)}` : ''}`;
  return ciclo === 12 ? `${base} ${periodoDe(t.h)}` : base;
};

export const duracao = (inicio: string | null | undefined, fim: string | null | undefined) => {
  const a = emSegundos(lerHorario(inicio));
  const b = emSegundos(lerHorario(fim));
  if (a == null || b == null || b <= a) return null;
  const total = Math.round((b - a) / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}h${dois(m)}`;
  return h ? `${h}h` : `${m} min`;
};

export const foraDoLimite = (t: Horario, limites: LimitesDeHorario, comSegundos: boolean) => {
  const x = emSegundos(t)!;
  const minimo = emSegundos(lerHorario(limites.min));
  const maximo = emSegundos(lerHorario(limites.max));
  const depois = emSegundos(lerHorario(limites.depoisDe));
  if (minimo != null && x < minimo) return true;
  if (maximo != null && x > maximo) return true;
  if (depois != null && x <= depois) return true;
  return !!limites.isTimeDisabled?.(escreverHorario(t, comSegundos));
};

export const agora = (passo: number, data = new Date()): Horario => {
  const m = Math.round(data.getMinutes() / passo) * passo;
  return m >= 60 ? { h: (data.getHours() + 1) % 24, m: 0, s: 0 } : { h: data.getHours(), m, s: data.getSeconds() };
};

export const regrasDe = (limites: LimitesDeHorario, passo: number, comSegundos: boolean) => {
  const minutos = Array.from({ length: Math.ceil(60 / passo) }, (_, i) => i * passo);
  const segundos = Array.from({ length: 60 }, (_, i) => i);
  const fora = (h: number, m: number, s: number) => foraDoLimite({ h, m, s }, limites, comSegundos);
  const minutoLivre = (h: number, m: number) => !fora(h, m, 0) || (comSegundos && segundos.some((s) => !fora(h, m, s)));
  const horaLivre = (h: number) => minutos.some((m) => minutoLivre(h, m));
  const periodoLivre = (p: Periodo) => Array.from({ length: 12 }, (_, i) => i + (p === 'PM' ? 12 : 0)).some(horaLivre);
  const ajustar = (h: number, m: number, s: number): Horario => {
    const mm = minutoLivre(h, m) ? m : minutos.find((x) => minutoLivre(h, x)) ?? m;
    const ss = comSegundos ? (!fora(h, mm, s) ? s : segundos.find((x) => !fora(h, mm, x)) ?? s) : 0;
    return { h, m: mm, s: ss };
  };
  return { minutos, segundos, fora, minutoLivre, horaLivre, periodoLivre, ajustar };
};
