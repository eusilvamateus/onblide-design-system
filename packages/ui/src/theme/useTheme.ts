import { useEffect, useSyncExternalStore } from 'react';
import { THEME_SERVER_STATE } from './themeConstants';
import { themeManager } from './themeManager';
import type { ResolvedTheme, ThemePreference } from './themeManager';

const obterEstadoDoServidor = () => THEME_SERVER_STATE;

/**
 * Liga um componente React ao `themeManager`, sem Provider. Devolve a preferência escolhida, o tema resolvido
 * e `setTheme` para trocar a preferência. No servidor e na hidratação o estado é `system`/`light`.
 */
export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (preference: ThemePreference) => void;
} {
  const estado = useSyncExternalStore(themeManager.subscribe, themeManager.get, obterEstadoDoServidor);
  useEffect(() => {
    themeManager.init();
  }, []);
  return { preference: estado.preference, resolved: estado.resolved, setTheme: themeManager.set };
}
