// project/package/scripts/lib/injected-styles.mjs
//
// Coleta, EM ORDEM, todos os <style> que os módulos da biblioteca injetam ao
// serem importados, usando um `document` falso mínimo. Devolve um array
// [{ id, css }] com UMA entrada por `appendChild` (sem deduplicar): assim o
// golden trava também a ordem de inserção e injeções duplicadas do mesmo id.
// Precisa rodar num processo Node limpo: o import de dist/index.js é cacheado.
export async function collectInjectedStyles(distIndexUrl) {
  const ids = new Set();
  const log = [];
  globalThis.document = {
    getElementById: (id) => (ids.has(id) ? { id } : null),
    createElement: () => ({ id: '', textContent: '' }),
    head: {
      appendChild: (el) => {
        ids.add(el.id);
        log.push({ id: el.id, css: el.textContent });
      },
    },
  };
  try {
    await import(distIndexUrl.href);
  } finally {
    delete globalThis.document;
  }
  return log;
}
