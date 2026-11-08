import { Select } from '@onblide/ui';

const equipes = ['Design', 'Engenharia', 'Marketing', 'Financeiro'];

export const Padrao = () => (
  <div style={{ padding: 16 }}>
    <Select label="Equipe" placeholder="Selecione uma equipe" options={equipes} width={300} />
  </div>
);

export const ComValor = () => (
  <div style={{ padding: 16 }}>
    <Select label="Equipe" defaultValue="Engenharia" options={equipes} width={300} />
  </div>
);

export const Multipla = () => (
  <div style={{ padding: 16 }}>
    <Select multi label="Responsáveis" defaultValue={['Design', 'Marketing']} options={equipes} width={340} />
  </div>
);

export const Erro = () => (
  <div style={{ padding: 16 }}>
    <Select label="Equipe" placeholder="Selecione uma equipe" options={equipes} error="Escolha uma equipe para continuar" width={300} />
  </div>
);

export const Desabilitado = () => (
  <div style={{ padding: 16 }}>
    <Select label="Equipe" value="Financeiro" options={equipes} disabled width={300} />
  </div>
);

export const MultiplaVazia = () => (
  <div style={{ padding: 16 }}>
    <Select multi label="Times" placeholder="Selecione os times…" options={['Design', 'Engenharia', 'Marketing', 'Produto', 'Dados']} width={340} />
  </div>
);

export const OpcoesComObjeto = () => (
  <div style={{ padding: 16 }}>
    <Select
      label="País"
      placeholder="Selecione um país…"
      defaultValue="Brasil"
      options={[
        { label: 'Brasil', sigla: 'BR' },
        { label: 'Portugal', sigla: 'PT' },
        { label: 'Espanha', sigla: 'ES' },
        { label: 'França', sigla: 'FR' },
      ]}
      width={280}
    />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, padding: 16, width: 300 }}>
    <Select size="sm" ariaLabel="Equipe pequena" defaultValue="Design" options={equipes} />
    <Select size="md" ariaLabel="Equipe média" defaultValue="Engenharia" options={equipes} />
    <Select size="lg" ariaLabel="Equipe grande" defaultValue="Marketing" options={equipes} />
  </div>
);
