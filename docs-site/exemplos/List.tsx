import { List, ListItem, ListSubheader, ListDivider, Ph } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 16, width: 280 }}>
    <List dividers>
      <ListItem leading={<Ph n="user" size={16} />} title="Ana Souza" description="ana@onblide.com" />
      <ListItem leading={<Ph n="user" size={16} />} title="Bruno Lima" description="bruno@onblide.com" />
      <ListItem leading={<Ph n="user" size={16} />} title="Carla Dias" description="carla@onblide.com" selected />
    </List>
  </div>
);

export const ComGrupos = () => (
  <div style={{ padding: 16, width: 280 }}>
    <List>
      <ListSubheader>Design</ListSubheader>
      <ListItem title="Ana Souza" />
      <ListItem title="Bruno Lima" />
      <ListDivider />
      <ListSubheader>Dev</ListSubheader>
      <ListItem title="Carla Dias" />
    </List>
  </div>
);

export const Densidade = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16, width: 320 }}>
    <List dividers ariaLabel="Conteúdo (md)">
      <ListItem leading={<Ph n="file-pdf" size={20} />} title="contrato.pdf" description="200 KB · enviado hoje" />
      <ListItem leading={<Ph n="file-xls" size={20} />} title="vendas.xlsx" description="48 KB · enviado ontem" />
    </List>
    <List size="sm" dividers ariaLabel="Opções (sm)">
      <ListItem title="Item de opção" trailing={<Ph n="caret-right" size={14} />} />
      <ListItem title="Outro item" disabled trailing={<Ph n="caret-right" size={14} />} />
    </List>
    <List size="xs" dividers ariaLabel="Denso (xs)">
      <ListItem title="Item denso" trailing={<Ph n="caret-right" size={14} />} />
      <ListItem title="Outro item" trailing={<Ph n="caret-right" size={14} />} />
    </List>
  </div>
);
