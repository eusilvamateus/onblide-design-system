import React, { useMemo } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import { SideNav, type SideNavItem } from '@onblide/ui';

type ItemDoc = { type: string; label?: string; href?: string; items?: ItemDoc[]; docId?: string };

// Achata a árvore de navegação do Docusaurus no formato do SideNav do design system:
// cada categoria vira um título de seção e cada página vira um item.
function paraItens(itens: ItemDoc[], titulo?: string): SideNavItem[] {
  const saida: SideNavItem[] = [];
  const links = itens.filter((i) => i.type === 'link' || (i.type === 'category' && !i.items?.length && i.href));
  const categorias = itens.filter((i) => i.type === 'category' && i.items?.length);
  if (links.length || (titulo && !categorias.length)) {
    if (titulo) saida.push({ section: titulo });
    for (const l of links) saida.push({ id: l.href, label: l.label });
  }
  for (const c of categorias) {
    const proprios = c.items!.filter((i) => i.type === 'link');
    if (c.href && c.items!.some((i) => i.type === 'category')) {
      saida.push({ section: c.label }, { id: c.href, label: 'Todos os componentes' });
      for (const sub of c.items!.filter((i) => i.type === 'category')) saida.push(...paraItens(sub.items ?? [], sub.label));
    } else {
      saida.push({ section: c.label });
      for (const l of proprios) saida.push({ id: l.href, label: l.label });
    }
  }
  return saida;
}

export default function Navegacao() {
  const sidebar = useDocsSidebar();
  const { pathname } = useLocation();
  const history = useHistory();
  const itens = useMemo(() => (sidebar ? paraItens(sidebar.items as ItemDoc[]) : []), [sidebar]);
  const ativo = pathname.replace(/\/$/, '') || '/';
  return (
    <SideNav
      flush
      hideBrand
      hideAccount
      menuLabel={null}
      items={itens}
      active={ativo}
      onNav={(id) => id && history.push(id)}
    />
  );
}
