import { Kbd } from '@onblide/ui';

const linha = { display: 'flex', gap: 8, padding: 16, alignItems: 'center', flexWrap: 'wrap' as const };

export const Teclas = () => (
  <div style={linha}>
    <Kbd>Ctrl</Kbd>
    <span>+</span>
    <Kbd>K</Kbd>
    <Kbd>Esc</Kbd>
    <Kbd>⌘</Kbd>
    <Kbd>Enter</Kbd>
  </div>
);

export const Tamanhos = () => (
  <div style={linha}>
    <Kbd size="sm">Shift</Kbd>
    <Kbd size="md">Shift</Kbd>
  </div>
);

export const SemCaixa = () => (
  <div style={linha}>
    <Kbd variant="plain" size="sm">⌘N</Kbd>
    <Kbd variant="plain">Ctrl+Shift+P</Kbd>
  </div>
);

export const Invertido = () => (
  <div style={{ ...linha, background: 'var(--ob-fg-strong)', borderRadius: 12 }}>
    <Kbd inverse>Ctrl</Kbd>
    <Kbd inverse>K</Kbd>
  </div>
);
