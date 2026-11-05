import { TreeView } from '@onblide/ui';

const arquivos = [
  {
    id: 'campanhas', label: 'Campanhas', icon: 'folder', iconOpen: 'folder-open', children: [
      { id: 'fim-de-ano', label: 'Fim de ano', icon: 'folder', iconOpen: 'folder-open', children: [
        { id: 'briefing', label: 'Briefing.pdf', icon: 'file-pdf' },
        { id: 'artes', label: 'Artes finais.zip', icon: 'file-zip' },
      ] },
      { id: 'lancamento', label: 'Lançamento', icon: 'folder', children: [] },
    ],
  },
  { id: 'relatorios', label: 'Relatórios', icon: 'folder', iconOpen: 'folder-open', children: [{ id: 'trimestral', label: 'Trimestral.pdf', icon: 'file-pdf' }] },
];

export const Padrao = () => (
  <div style={{ padding: 16, width: 280 }}>
    <TreeView defaultItems={arquivos} defaultExpanded={['campanhas', 'fim-de-ano']} />
  </div>
);

export const SelecaoUnica = () => (
  <div style={{ padding: 16, width: 280 }}>
    <TreeView defaultItems={arquivos} defaultExpanded={['campanhas', 'fim-de-ano']} selection="single" defaultSelected="briefing" />
  </div>
);

export const SelecaoMultipla = () => (
  <div style={{ padding: 16, width: 280 }}>
    <TreeView defaultItems={arquivos} defaultExpanded={['campanhas', 'fim-de-ano']} selection="multiple" defaultSelected={['briefing']} />
  </div>
);

export const Editavel = () => (
  <div style={{ padding: 16, width: 280 }}>
    <TreeView defaultItems={arquivos} defaultExpanded={['campanhas']} editable draggable />
  </div>
);
