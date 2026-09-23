// project/package/scripts/lib/injected-styles.mjs
//
// Coleta todos os <style> que os módulos da biblioteca injetam ao serem
// importados, usando um `document` falso mínimo. Precisa rodar num processo
// Node limpo: o import de dist/index.js é cacheado por processo.
export async function collectInjectedStyles(distIndexUrl) {
  const injected = new Map();
  globalThis.document = {
    getElementById: (id) => (injected.has(id) ? { id } : null),
    createElement: () => ({ id: '', textContent: '' }),
    head: { appendChild: (el) => { injected.set(el.id, el.textContent); } },
  };
  try {
    await import(distIndexUrl.href);
  } finally {
    delete globalThis.document;
  }
  return Object.fromEntries([...injected.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
