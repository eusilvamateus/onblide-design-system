import { THEME_ATTRIBUTE, THEME_DARK_QUERY, THEME_SERVER_STATE, THEME_STORAGE_KEY } from './themeConstants';

/** Escolha do usuário: `system` segue o tema do sistema operacional. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Tema efetivamente aplicado ao documento. */
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeState {
  /** Preferência escolhida pelo usuário. */
  preference: ThemePreference;
  /** Tema aplicado em `<html data-theme>`. */
  resolved: ResolvedTheme;
}

type Ouvinte = (state: ThemeState) => void;

let estado: ThemeState = THEME_SERVER_STATE;
let iniciado = false;
let consultaEscuro: MediaQueryList | null = null;
const ouvintes = new Set<Ouvinte>();

const temAmbiente = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const ehPreferencia = (valor: unknown): valor is ThemePreference =>
  valor === 'light' || valor === 'dark' || valor === 'system';

function lerPreferenciaSalva(): ThemePreference {
  try {
    const salvo = window.localStorage.getItem(THEME_STORAGE_KEY);
    return ehPreferencia(salvo) ? salvo : 'system';
  } catch {
    return 'system';
  }
}

function gravarPreferencia(preferencia: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preferencia);
  } catch {
    return;
  }
}

function resolver(preferencia: ThemePreference): ResolvedTheme {
  if (preferencia === 'system') return consultaEscuro?.matches ? 'dark' : 'light';
  return preferencia;
}

function aplicar(preferencia: ThemePreference) {
  const resolvido = resolver(preferencia);
  document.documentElement.setAttribute(THEME_ATTRIBUTE, resolvido);
  if (estado.preference === preferencia && estado.resolved === resolvido) return;
  estado = { preference: preferencia, resolved: resolvido };
  [...ouvintes].forEach((ouvinte) => ouvinte(estado));
}

function aoMudarSistema() {
  if (estado.preference === 'system') aplicar('system');
}

function aoMudarArmazenamento(evento: StorageEvent) {
  if (evento.key !== null && evento.key !== THEME_STORAGE_KEY) return;
  aplicar(ehPreferencia(evento.newValue) ? evento.newValue : 'system');
}

function init() {
  if (iniciado || !temAmbiente()) return;
  iniciado = true;
  consultaEscuro = typeof window.matchMedia === 'function' ? window.matchMedia(THEME_DARK_QUERY) : null;
  if (consultaEscuro && typeof consultaEscuro.addEventListener === 'function') {
    consultaEscuro.addEventListener('change', aoMudarSistema);
  }
  window.addEventListener('storage', aoMudarArmazenamento);
  aplicar(lerPreferenciaSalva());
}

function get(): ThemeState {
  return estado;
}

function set(preferencia: ThemePreference) {
  if (!ehPreferencia(preferencia) || !temAmbiente()) return;
  init();
  gravarPreferencia(preferencia);
  aplicar(preferencia);
}

function subscribe(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/**
 * Gerenciador global de aparência: guarda a escolha (Claro, Escuro ou Sistema), resolve "Sistema" pelo
 * `prefers-color-scheme`, aplica `data-theme` no `<html>` e avisa os inscritos. Não toca em contêineres:
 * um `data-theme` em qualquer elemento continua valendo só para aquele elemento.
 */
export const themeManager = { init, get, set, subscribe };
