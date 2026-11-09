import React, { useMemo } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import { Sidebar, type SidebarGroup, type SidebarItem } from '@onblide/ui';

type ItemDoc = { type: string; label?: string; href?: string; items?: ItemDoc[] };

const links = (itens: ItemDoc[]): SidebarItem[] =>
  itens.filter((i) => i.type === 'link' && i.href).map((l) => ({ id: l.href!, label: l.label, href: l.href }));

function paraGrupos(itens: ItemDoc[]): SidebarGroup[] {
  const grupos: SidebarGroup[] = [];
  const soltos = links(itens);
  if (soltos.length) grupos.push({ items: soltos });
  for (const c of itens.filter((i) => i.type === 'category')) {
    const diretos = links(c.items ?? []);
    if (diretos.length) grupos.push({ label: c.label, items: diretos });
    for (const sub of (c.items ?? []).filter((i) => i.type === 'category')) {
      grupos.push({ label: `${c.label} · ${sub.label}`, items: links(sub.items ?? []) });
    }
  }
  return grupos;
}

export default function Navegacao() {
  const sidebar = useDocsSidebar();
  const { pathname } = useLocation();
  const history = useHistory();
  const grupos = useMemo(() => (sidebar ? paraGrupos(sidebar.items as ItemDoc[]) : []), [sidebar]);
  const ativo = pathname.replace(/\/$/, '') || '/';
  return (
    <Sidebar
      variant="flush"
      ariaLabel="Documentação"
      groups={grupos}
      active={ativo}
      onNav={(id) => history.push(id)}
    />
  );
}
