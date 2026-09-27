import { Radio } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 14, padding: 16 };

export const Grupo = () => (
  <div style={col}>
    <Radio name="plano" value="gratis" checked={false} label="Gratuito" />
    <Radio name="plano" value="pro" checked label="Profissional" />
    <Radio name="plano" value="equipe" checked={false} label="Equipe" />
  </div>
);

export const ComDescricao = () => (
  <div style={col}>
    <Radio name="freq" value="semanal" checked label="Semanal" description="Receba um resumo toda segunda-feira." />
    <Radio name="freq" value="diario" checked={false} label="Diário" description="Receba um resumo todas as manhãs." />
  </div>
);

export const Desabilitado = () => (
  <div style={col}>
    <Radio name="d" value="a" checked={false} disabled label="Integração SSO" />
    <Radio name="d" value="b" checked disabled label="Login com e-mail" />
  </div>
);

export const TodosOsEstados = () => (
  <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' as const, padding: 16 }}>
    <Radio name="estado-selecionado" value="a" checked label="Selecionado" />
    <Radio name="estado-vazio" value="a" checked={false} label="Vazio" />
    <Radio name="estado-desabilitado" value="a" checked={false} disabled label="Desabilitado" />
    <Radio name="estado-desabilitado-marcado" value="a" checked disabled label="Desab. marcado" />
  </div>
);
