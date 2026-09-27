import { Button, Icons } from '@onblide/ui';

export const Variantes = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, flexWrap: 'wrap' }}>
    <Button kind="primary">Salvar</Button>
    <Button kind="secondary">Cancelar</Button>
    <Button kind="ghost">Ver detalhes</Button>
    <Button kind="cream">Convidar</Button>
    <Button kind="danger">Excluir</Button>
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Button size="sm">Pequeno</Button>
    <Button size="md">Médio</Button>
    <Button size="lg">Grande</Button>
  </div>
);

export const ComIcone = () => (
  <div style={{ padding: 16 }}>
    <Button kind="primary" icon={<Icons.plus size={16} />}>Nova tarefa</Button>
  </div>
);

export const Desabilitado = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16 }}>
    <Button kind="primary" disabled>Enviar</Button>
    <Button kind="secondary" disabled>Cancelar</Button>
    <Button kind="danger" disabled>Excluir</Button>
  </div>
);

export const LarguraTotal = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, maxWidth: 320 }}>
    <Button kind="primary" size="lg" style={{ width: '100%' }}>Confirmar pedido</Button>
    <Button kind="secondary" size="lg" style={{ width: '100%' }}>Voltar</Button>
  </div>
);
