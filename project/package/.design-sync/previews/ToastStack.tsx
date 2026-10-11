import { useState } from 'react';
import { Button, Select, ToastStack, toast } from '@onblide/ui';
import type { OBToastPosition } from '@onblide/ui';

const palco = { position: 'relative' as const, height: 340, transform: 'translateZ(0)', overflow: 'hidden', border: '1.5px dashed var(--ob-border)', borderRadius: 'var(--ob-r-surface)', background: 'var(--ob-bg-warm)', padding: 16 };

const posicoes: OBToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export const Disparando = () => (
  <div style={palco}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button kind="secondary" onClick={() => toast.success('Projeto salvo', { stack: 'exemplo-disparando', body: 'As alterações foram publicadas.' })}>Sucesso</Button>
      <Button kind="secondary" onClick={() => toast.info('Sincronizando…', { stack: 'exemplo-disparando', body: 'Buscando dados do Spotify.' })}>Info</Button>
      <Button kind="secondary" onClick={() => toast.warning('Prazo se aproximando', { stack: 'exemplo-disparando', body: 'A entrega vence amanhã.' })}>Aviso</Button>
      <Button kind="secondary" onClick={() => toast.danger('Falha no deploy', { stack: 'exemplo-disparando', body: 'Não foi possível subir a build #482.' })}>Perigo</Button>
    </div>
    <ToastStack name="exemplo-disparando" position="bottom-right" />
  </div>
);

export const Posicoes = () => {
  const [posicao, setPosicao] = useState<OBToastPosition>('top-right');
  return (
    <div style={palco}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select label="Posição" options={posicoes} value={posicao} onChange={(valor: string) => setPosicao(valor as OBToastPosition)} width={200} />
        <Button onClick={() => toast.info('Aviso nesta posição', { stack: 'exemplo-posicoes', body: posicao })}>Mostrar aviso</Button>
      </div>
      <ToastStack name="exemplo-posicoes" position={posicao} />
    </div>
  );
};

export const ComAcao = () => (
  <div style={palco}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button
        kind="secondary"
        onClick={() => toast.success('Tarefa excluída', { stack: 'exemplo-acao', body: 'Você removeu a tarefa Revisar proposta.', action: 'Desfazer', onAction: () => toast.info('Tarefa restaurada', { stack: 'exemplo-acao' }) })}
      >
        Excluir tarefa
      </Button>
    </div>
    <ToastStack name="exemplo-acao" position="bottom-center" />
  </div>
);

export const Persistente = () => (
  <div style={palco}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button kind="secondary" onClick={() => toast.danger('Sem conexão', { stack: 'exemplo-persistente', body: 'Tentando reconectar…', duration: 0 })}>Mostrar aviso fixo</Button>
      <Button kind="neutral" onClick={() => toast.dismiss()}>Fechar todos</Button>
    </div>
    <ToastStack name="exemplo-persistente" position="top-center" />
  </div>
);
