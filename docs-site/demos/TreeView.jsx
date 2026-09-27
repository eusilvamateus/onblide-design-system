// Ponto de partida da demo interativa do TreeView: o elemento <TreeView> abaixo define os valores iniciais dos controles.

const arquivos = [
  { id: 'campanhas', label: 'Campanhas', icon: 'folder', iconOpen: 'folder-open', children: [
    { id: 'fim-de-ano', label: 'Fim de ano', icon: 'folder', iconOpen: 'folder-open', children: [
      { id: 'briefing', label: 'Briefing.pdf', icon: 'file-pdf' },
      { id: 'artes', label: 'Artes finais.zip', icon: 'file-zip' },
    ] },
    { id: 'lancamento', label: 'Lançamento', icon: 'folder', children: [] },
  ] },
  { id: 'relatorios', label: 'Relatórios', icon: 'folder', iconOpen: 'folder-open', children: [
    { id: 'trimestral', label: 'Trimestral.pdf', icon: 'file-pdf' },
  ] },
];

<TreeView
  defaultItems={arquivos}
  defaultExpanded={['campanhas', 'fim-de-ano']}
  selection="single"
/>
