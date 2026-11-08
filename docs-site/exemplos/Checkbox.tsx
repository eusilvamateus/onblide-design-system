import { Checkbox } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 14, padding: 16 };

export const Estados = () => (
  <div style={col}>
    <Checkbox checked={false} label="Receber notificações" />
    <Checkbox checked label="Aceito os termos de uso" />
    <Checkbox checked indeterminate label="Selecionar todas as tarefas" />
  </div>
);

export const ComDescricao = () => (
  <div style={col}>
    <Checkbox checked label="Resumo semanal" description="Enviamos um e-mail toda segunda-feira com o andamento dos projetos." />
  </div>
);

export const Tamanhos = () => (
  <div style={col}>
    <Checkbox checked size="sm" label="Receber notificações" />
    <Checkbox checked size="md" label="Receber notificações" />
    <Checkbox checked size="lg" label="Receber notificações" />
  </div>
);

export const Desabilitado = () => (
  <div style={col}>
    <Checkbox checked={false} disabled label="Autenticação em duas etapas" />
    <Checkbox checked disabled label="Backup automático" />
  </div>
);

export const SelecionarTudo = () => (
  <div style={col}>
    <Checkbox checked={false} indeterminate label="Selecionar tudo" />
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, paddingLeft: 28 }}>
      <Checkbox checked label="Deploy automático" description="Publica ao fazer merge" />
      <Checkbox checked={false} label="Notificar equipe" />
      <Checkbox checked label="Rodar testes" />
    </div>
  </div>
);
