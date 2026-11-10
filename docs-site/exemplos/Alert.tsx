import { Alert } from '@onblide/ui';

export const Tons = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, maxWidth: 520 }}>
    <Alert tone="info" title="Nova versão disponível">Atualize para receber as melhorias do painel.</Alert>
    <Alert tone="success" title="Projeto salvo">As alterações foram publicadas com sucesso.</Alert>
    <Alert tone="warning" title="Prazo próximo">A entrega vence amanhã às 18h.</Alert>
    <Alert tone="danger" title="Falha no envio">Não foi possível enviar o relatório.</Alert>
  </div>
);

export const Aparencias = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, maxWidth: 520 }}>
    <Alert tone="danger" title="Falha no envio">Não foi possível enviar o relatório.</Alert>
    <Alert tone="danger" appearance="outline" title="Falha no envio">Não foi possível enviar o relatório.</Alert>
    <Alert tone="danger" appearance="soft" title="Falha no envio">Não foi possível enviar o relatório.</Alert>
  </div>
);

export const ComAcao = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Alert tone="warning" title="Pagamento pendente" action="Regularizar" onAction={() => {}}>
      A fatura de setembro ainda não foi paga.
    </Alert>
  </div>
);

export const Dispensavel = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Alert tone="info" dismissible onClose={() => {}}>Você foi adicionado à equipe de Design.</Alert>
  </div>
);

export const Compacto = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Alert tone="info">Versão compacta, apenas texto e tom.</Alert>
  </div>
);
