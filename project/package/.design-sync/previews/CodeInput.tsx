import { CodeInput } from '@onblide/ui';

const box = { padding: 16 };

export const Padrao = () => (
  <div style={box}><CodeInput length={6} value="482" /></div>
);

export const Sucesso = () => (
  <div style={box}><CodeInput length={6} value="482915" status="success" /></div>
);

export const Erro = () => (
  <div style={box}><CodeInput length={6} value="482916" status="error" /></div>
);
