import { FieldShell, Icons } from '@onblide/ui';

const Conteudo = ({ t }: { t: string }) => <span style={{ fontSize: 14 }}>{t}</span>;

export const Padrao = () => (
  <div style={{ padding: 16, width: 320 }}>
    <FieldShell><Conteudo t="mateus@onblide.com" /></FieldShell>
  </div>
);

export const Estados = () => (
  <div style={{ padding: 16, width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <FieldShell focused><Conteudo t="Campo em foco" /></FieldShell>
    <FieldShell error><Conteudo t="Campo com erro" /></FieldShell>
    <FieldShell disabled><Conteudo t="Campo desabilitado" /></FieldShell>
  </div>
);
