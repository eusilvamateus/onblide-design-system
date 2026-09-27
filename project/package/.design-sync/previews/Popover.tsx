import { Popover, Button, Checkbox } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Popover trigger={<Button kind="secondary">Filtrar</Button>} title="Filtrar por status" defaultOpen>
      <Checkbox label="Em andamento" checked onChange={() => {}} />
      <Checkbox label="Concluída" checked={false} onChange={() => {}} />
    </Popover>
  </div>
);

export const ComSeta = () => (
  <div style={{ padding: 32, width: 280 }}>
    <Popover trigger={<Button kind="secondary">Ajuda</Button>} arrow width={220} defaultOpen>
      Clique em qualquer card para ver os detalhes da tarefa.
    </Popover>
  </div>
);

export const Hover = () => (
  <div style={{ padding: 32, width: 280 }}>
    <Popover trigger={<Button kind="ghost">Passe o mouse</Button>} interaction="hover" defaultOpen width={200}>
      Dica rápida sem precisar clicar.
    </Popover>
  </div>
);
