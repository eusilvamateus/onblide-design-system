import { Button, Drawer } from '@onblide/ui';

const frame = { position: 'relative' as const, height: 420, transform: 'translateZ(0)', overflow: 'hidden' };

export const Direita = () => (
  <div style={frame}>
    <Drawer open onClose={() => {}} title="Detalhes da tarefa"
      footer={<><Button kind="secondary">Cancelar</Button><Button kind="primary">Salvar</Button></>}>
      <p style={{ margin: 0 }}>Revisar o layout da página inicial e enviar para aprovação do cliente até sexta-feira.</p>
    </Drawer>
  </div>
);

export const Esquerda = () => (
  <div style={frame}>
    <Drawer open side="left" width={320} onClose={() => {}} title="Filtros">
      <p style={{ margin: 0 }}>Selecione o período, o responsável e o status dos projetos.</p>
    </Drawer>
  </div>
);
