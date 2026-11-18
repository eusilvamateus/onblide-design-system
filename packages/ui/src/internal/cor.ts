export interface Rgba { r: number; g: number; b: number; a: number }
export interface Hsva { h: number; s: number; v: number; a: number }
interface Rgb { r: number; g: number; b: number }
interface Hsl { h: number; s: number; l: number }

export const limitar = (n: number, minimo: number, maximo: number) => Math.min(maximo, Math.max(minimo, n));
const hex2 = (n: number) => Math.round(limitar(n, 0, 255)).toString(16).padStart(2, '0');

export const lerCor = (texto: string | null | undefined): Rgba | null => {
  let s = String(texto ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3,4}$/i.test(s)) s = s.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(s)) return null;
  const n = (i: number) => parseInt(s.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: s.length === 8 ? Math.round((n(6) / 255) * 100) / 100 : 1 };
};

export const escreverCor = ({ r, g, b, a = 1 }: Rgb & { a?: number }) => `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ''}`;

export const opacaDe = (texto: string) => {
  const c = lerCor(texto);
  return c ? escreverCor({ ...c, a: 1 }) : null;
};

const matiz = (r: number, g: number, b: number, max: number, d: number) => {
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

export const hsvParaRgb = ({ h, s, v }: { h: number; s: number; v: number }): Rgb => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v / 100) * (1 - (s / 100) * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return { r: f(5), g: f(3), b: f(1) };
};

export const rgbParaHsv = ({ r, g, b }: Rgb) => {
  const [x, y, z] = [r / 255, g / 255, b / 255];
  const max = Math.max(x, y, z);
  const d = max - Math.min(x, y, z);
  return { h: matiz(x, y, z, max, d), s: max ? (d / max) * 100 : 0, v: max * 100 };
};

export const rgbParaHsl = ({ r, g, b }: Rgb): Hsl => {
  const [x, y, z] = [r / 255, g / 255, b / 255];
  const max = Math.max(x, y, z);
  const min = Math.min(x, y, z);
  const d = max - min;
  const l = (max + min) / 2;
  return { h: matiz(x, y, z, max, d), s: d ? (d / (1 - Math.abs(2 * l - 1))) * 100 : 0, l: l * 100 };
};

export const hslParaRgb = ({ h, s, l }: Hsl): Rgb => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return { r: f(0), g: f(8), b: f(4) };
};

export const interpretarCor = (texto: string | null | undefined): Rgba | null => {
  const t = String(texto ?? '').trim().toLowerCase();
  const hex = lerCor(t);
  if (hex) return hex;
  const m = t.match(/^(rgba?|hsla?)\s*\(([^)]*)\)$/);
  if (!m) return null;
  const partes = m[2].split(/[\s,/]+/).filter(Boolean);
  if (partes.length < 3 || partes.length > 4) return null;
  const alfa = partes[3] == null ? 1 : partes[3].endsWith('%') ? parseFloat(partes[3]) / 100 : parseFloat(partes[3]);
  if (!Number.isFinite(alfa) || alfa < 0 || alfa > 1) return null;
  if (m[1].startsWith('rgb')) {
    const [r, g, b] = partes.slice(0, 3).map((p) => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p)));
    if (![r, g, b].every((n) => Number.isFinite(n) && n >= 0 && n <= 255)) return null;
    return { r, g, b, a: alfa };
  }
  const [h, s, l] = partes.slice(0, 3).map((p) => parseFloat(p));
  if (![h, s, l].every(Number.isFinite) || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return { ...hslParaRgb({ h: ((h % 360) + 360) % 360, s, l }), a: alfa };
};

export const nomeDaCor = (texto: string | null | undefined) => {
  const c = lerCor(texto);
  if (!c) return 'sem cor';
  const { h, s, l } = rgbParaHsl(c);
  if (l >= 96) return 'branco';
  if (l <= 6) return 'preto';
  if (s < 12) return l > 80 ? 'cinza muito claro' : l > 62 ? 'cinza claro' : l > 38 ? 'cinza' : l > 20 ? 'cinza escuro' : 'cinza muito escuro';
  const base = h < 12 || h >= 345 ? 'vermelho' : h < 40 ? 'laranja' : h < 65 ? 'amarelo' : h < 90 ? 'verde-limão' : h < 160 ? 'verde'
    : h < 185 ? 'verde-água' : h < 200 ? 'ciano' : h < 250 ? 'azul' : h < 280 ? 'violeta' : h < 315 ? 'roxo' : 'rosa';
  if ((base === 'laranja' || base === 'amarelo') && l < 38) return l < 20 ? 'marrom escuro' : 'marrom';
  const tom = l < 22 ? ' muito escuro' : l < 38 ? ' escuro' : l > 85 ? ' muito claro' : l > 68 ? ' claro' : '';
  return base + tom;
};

const luminancia = ({ r, g, b }: Rgb) => {
  const c = (x: number) => {
    const v = x / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};

export const contraste = (a: string, b: string) => {
  const x = lerCor(a);
  const y = lerCor(b);
  if (!x || !y) return null;
  const [la, lb] = [luminancia(x), luminancia(y)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

export const textoEscuroSobre = (fundo: string) => (contraste(fundo, '#ffffff') ?? 0) < (contraste(fundo, '#1f1f1f') ?? 0);

export const hsvaDe = (valor: string | null | undefined, anterior?: Hsva): Hsva => {
  const c = lerCor(valor);
  if (!c) return anterior ?? { h: 220, s: 0, v: 100, a: 1 };
  const hsv = rgbParaHsv(c);
  return { ...hsv, h: hsv.s === 0 && anterior ? anterior.h : hsv.h, a: c.a };
};

export const saturacaoDe = (valor: string | null | undefined, anterior = 100) => {
  const c = lerCor(valor);
  if (!c) return anterior;
  const { s, l } = rgbParaHsl(c);
  return l > 1 && l < 99 ? s : anterior;
};

export const hsvaParaTexto = (hsva: Hsva) => escreverCor({ ...hsvParaRgb(hsva), a: hsva.a });

const MATIZES_DA_GRADE = [0, 25, 45, 58, 85, 130, 165, 195, 215, 240, 275, 320];
const LUZES_DA_GRADE = [22, 30, 38, 46, 54, 63, 72, 81, 89];
export const COLUNAS_DA_GRADE = MATIZES_DA_GRADE.length;
export const CORES_DA_GRADE = [
  ...Array.from({ length: COLUNAS_DA_GRADE }, (_, i) => escreverCor({ ...hslParaRgb({ h: 0, s: 0, l: 100 - (i * 100) / (COLUNAS_DA_GRADE - 1) }) })),
  ...LUZES_DA_GRADE.flatMap((l) => MATIZES_DA_GRADE.map((h) => escreverCor(hslParaRgb({ h, s: l > 80 ? 70 : 85, l })))),
];
export const LINHAS_DA_GRADE = CORES_DA_GRADE.length / COLUNAS_DA_GRADE;
