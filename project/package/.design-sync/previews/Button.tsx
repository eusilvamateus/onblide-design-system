import { Button, Icons, Ph, Tooltip } from '@onblide/ui';

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

export const SoIcone = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Button iconOnly size="sm" kind="secondary" aria-label="Adicionar" icon={<Icons.plus size={16} />} />
    <Button iconOnly size="md" kind="primary" aria-label="Adicionar" icon={<Icons.plus size={18} />} />
    <Button iconOnly size="lg" kind="cream" aria-label="Adicionar" icon={<Icons.plus size={20} />} />
  </div>
);

export const NeutroComContador = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
    <Button kind="neutral" iconOnly aria-label="Notificações" icon={<Icons.bell size={20} />} count={3} />
    <Button kind="neutral" iconOnly pressed aria-label="Notificações" icon={<Icons.bell size={20} />} />
    <Button kind="neutral" icon={<Icons.plus size={16} />}>Adicionar</Button>
  </div>
);

export const AcoesEmIcone = () => (
  <div style={{ display: 'flex', gap: 8, padding: 16, alignItems: 'center' }}>
    <Tooltip label="Aprovar"><Button kind="quiet" tone="success" iconOnly aria-label="Aprovar" icon={<Ph n="check" size={18} />} /></Tooltip>
    <Tooltip label="Editar"><Button kind="quiet" tone="primary" iconOnly aria-label="Editar" icon={<Ph n="pencil-simple" size={18} />} /></Tooltip>
    <Tooltip label="Sinalizar"><Button kind="quiet" tone="warning" iconOnly aria-label="Sinalizar" icon={<Ph n="flag" size={18} />} /></Tooltip>
    <Tooltip label="Excluir"><Button kind="quiet" tone="danger" iconOnly aria-label="Excluir" icon={<Ph n="trash" size={18} />} /></Tooltip>
    <Button kind="quiet" tone="primary" fill={false} iconOnly aria-label="Recolher painel" icon={<Ph n="caret-down" size={16} />} />
  </div>
);

export const AcaoSilenciosaComTexto = () => (
  <div style={{ display: 'flex', gap: 8, padding: 16, alignItems: 'center' }}>
    <Button kind="quiet" tone="primary" size="sm" icon={<Ph n="pencil-simple" size={14} />}>Editar</Button>
    <Button kind="quiet" tone="danger" size="sm" icon={<Ph n="trash" size={14} />}>Excluir</Button>
  </div>
);

export const ContadorEmLinha = () => (
  <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
    <Button kind="secondary" size="sm" count={3} icon={<Ph n="funnel-simple" size={16} />}>Filtros</Button>
    <Button kind="secondary" size="sm" count={3} countTone="blue" icon={<Ph n="funnel-simple" size={16} />}>Filtros</Button>
    <Button kind="primary" count={5}>Salvar alterações</Button>
    <Button kind="danger" count={2}>Excluir</Button>
    <Button kind="neutral" iconOnly count={4} aria-label="Avisos" icon={<Ph n="bell" size={18} />} />
  </div>
);
