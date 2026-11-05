import { Autocomplete } from '@onblide/ui';

const pessoas = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Alves', 'Elisa Prado'];

export const Padrao = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Autocomplete options={pessoas} label="Responsável" placeholder="Digite para buscar…" />
  </div>
);

export const Multipla = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Autocomplete options={pessoas} multiple label="Participantes" value={['Ana Souza', 'Bruno Lima']} />
  </div>
);

export const Aberta = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Autocomplete options={pessoas} label="Responsável" open defaultInputValue="an" />
  </div>
);

export const Criavel = () => (
  <div style={{ padding: 16, width: 280 }}>
    <Autocomplete options={['Design', 'Engenharia']} mode="creatable" label="Categoria" open defaultInputValue="Marketing" />
  </div>
);
