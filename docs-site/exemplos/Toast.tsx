import { Button, Toast, ToastStack, toast } from '@onblide/ui';

const box = { padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 12, width: 420 };

export const Tons = () => (
  <div style={box}>
    <Toast tone="info" title="Nova versão disponível" body="Atualize para receber as melhorias." />
    <Toast tone="success" title="Tarefa concluída" body="A revisão foi enviada para aprovação." />
    <Toast tone="warning" title="Prazo se aproximando" body="O projeto vence em 2 dias." />
    <Toast tone="danger" title="Falha ao salvar" body="Verifique sua conexão e tente novamente." />
  </div>
);

export const Suave = () => (
  <div style={box}>
    <Toast appearance="soft" tone="info" title="Nova versão disponível" body="Atualize para receber as melhorias." />
    <Toast appearance="soft" tone="success" title="Tarefa concluída" body="A revisão foi enviada para aprovação." action="Ver revisão" onAction={() => {}} onClose={() => {}} />
    <Toast appearance="soft" tone="warning" title="Prazo se aproximando" body="O projeto vence em 2 dias." />
    <Toast appearance="soft" tone="danger" title="Falha ao salvar" body="Verifique sua conexão e tente novamente." />
  </div>
);

export const ComAcao = () => (
  <div style={box}>
    <Toast tone="success" title="Tarefa excluída" body="Você removeu a tarefa Revisar proposta." action="Desfazer" onAction={() => {}} onClose={() => {}} />
  </div>
);

export const SemIcone = () => (
  <div style={box}>
    <Toast tone="info" title="Sincronizando…" body="Buscando dados do Spotify." icon={false} onClose={() => {}} />
  </div>
);

export const SoTitulo = () => (
  <div style={box}>
    <Toast tone="warning" title="Cota quase no limite" onClose={() => {}} />
  </div>
);

export const Disparando = () => (
  <div style={{ padding: 16 }}>
    <Button kind="secondary" onClick={() => toast.success('Projeto salvo', { stack: 'exemplo-toast', body: 'As alterações foram publicadas.' })}>Disparar um toast</Button>
    <ToastStack name="exemplo-toast" position="bottom-right" />
  </div>
);
