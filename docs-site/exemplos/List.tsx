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
  <div style={{ padding: 16, width: 280 }}>
    <List size="sm" dividers>
      <ListItem title="Item pequeno" trailing={<Ph n="caret-right" size={14} />} />
      <ListItem title="Outro item" disabled trailing={<Ph n="caret-right" size={14} />} />
    </List>
  </div>
);
