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

export const QuatroDigitos = () => (
  <div style={box}><CodeInput length={4} value="42" /></div>
);

export const ErroComMensagem = () => (
  <div style={{ padding: 16 }}>
    <CodeInput length={6} value="903124" status="error" />
    <p style={{ fontSize: 12, color: 'var(--ob-danger)', marginTop: 10 }}>
      Código incorreto ou expirado. Tente de novo ou reenvie.
    </p>
  </div>
);

export const SucessoComAjuda = () => (
  <div style={{ padding: 16 }}>
    <CodeInput length={6} value="847291" status="success" />
    <p style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 10 }}>
      Enviamos um código de 6 dígitos para ••••@empresa.com
    </p>
  </div>
);

export const Tamanhos = () => (
  <div style={{ ...box, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <CodeInput size="sm" length={4} value="12" />
    <CodeInput size="md" length={4} value="12" />
    <CodeInput size="lg" length={4} value="12" />
  </div>
);
