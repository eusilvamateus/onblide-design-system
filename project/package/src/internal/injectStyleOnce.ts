// Injeta um <style id=...> uma única vez no <head>. É exatamente o bloco que
// antes se repetia em cada componente com keyframes:
//   if (typeof document !== 'undefined' && !document.getElementById(id)) { ... }
// Módulo interno: NÃO é reexportado em src/index.ts.
export function injectStyleOnce(id: string, css: string): void {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const st = document.createElement('style');
  st.id = id;
  st.textContent = css;
  document.head.appendChild(st);
}
