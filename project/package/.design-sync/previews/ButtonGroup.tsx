import { ButtonGroup, Button, ToggleButton, Menu, Ph } from '@onblide/ui';

export const Anexado = () => (
  <div style={{ padding: 16 }}>
    <ButtonGroup kind="secondary" ariaLabel="Navegar no calendário">
      <Button icon={<Ph n="caret-left" size={16} />} aria-label="Anterior" style={{ padding: 10 }} />
      <Button>Hoje</Button>
      <Button icon={<Ph n="caret-right" size={16} />} aria-label="Próximo" style={{ padding: 10 }} />
    </ButtonGroup>
  </div>
);

export const Espacado = () => (
  <div style={{ padding: 16 }}>
    <ButtonGroup attached={false} justify="end" ariaLabel="Confirmação">
      <Button kind="secondary">Cancelar</Button>
      <Button kind="primary">Salvar</Button>
    </ButtonGroup>
  </div>
);

export const SelecaoUnica = () => (
  <div style={{ padding: 16 }}>
    <ButtonGroup selection="single" defaultValue="quadro" ariaLabel="Visualização">
      <ToggleButton value="lista" icon="list-bullets">Lista</ToggleButton>
      <ToggleButton value="quadro" icon="kanban">Quadro</ToggleButton>
      <ToggleButton value="calendario" icon="calendar-blank">Calendário</ToggleButton>
    </ButtonGroup>
  </div>
);

export const SelecaoMultipla = () => (
  <div style={{ padding: 16 }}>
    <ButtonGroup selection="multiple" defaultValue={['b', 'i']} ariaLabel="Formatação">
      <ToggleButton value="b" icon="text-b" ariaLabel="Negrito" />
      <ToggleButton value="i" icon="text-italic" ariaLabel="Itálico" />
      <ToggleButton value="u" icon="text-underline" ariaLabel="Sublinhado" />
    </ButtonGroup>
  </div>
);

export const SplitButton = () => (
  <div style={{ padding: 16 }}>
    <ButtonGroup kind="primary" ariaLabel="Publicar">
      <Button>Publicar</Button>
      <Menu
        align="right"
        items={[{ label: 'Agendar publicação' }, { label: 'Salvar como rascunho' }]}
        trigger={<Button icon={<Ph n="caret-down" size={16} />} aria-label="Mais opções de publicação" style={{ padding: '10px 12px' }} />}
      />
    </ButtonGroup>
  </div>
);

export const ComCor = () => (
  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <ButtonGroup selection="single" defaultValue="ativos" tone="success" ariaLabel="Situação">
      <ToggleButton value="ativos">Ativos</ToggleButton>
      <ToggleButton value="arquivados">Arquivados</ToggleButton>
    </ButtonGroup>
    <ButtonGroup selection="single" defaultValue="lista" appearance="ghost" tone="primary" ariaLabel="Visualização sem borda">
      <ToggleButton value="lista" icon="list-bullets">Lista</ToggleButton>
      <ToggleButton value="quadro" icon="kanban">Quadro</ToggleButton>
    </ButtonGroup>
    <ButtonGroup kind="quiet" tone="danger" ariaLabel="Ações">
      <Button icon={<Ph n="pencil-simple" size={16} />}>Editar</Button>
      <Button icon={<Ph n="trash" size={16} />}>Excluir</Button>
    </ButtonGroup>
  </div>
);
