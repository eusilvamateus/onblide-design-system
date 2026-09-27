import React, { useMemo } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import { SideNav, type SideNavItem } from '@onblide/ui';

type ItemDoc = { type: string; label?: string; href?: string; items?: ItemDoc[] };

const links = (itens: ItemDoc[]): SideNavItem[] =>
  itens.filter((i) => i.type === 'link').map((l) => ({ id: l.href, label: l.label }));

// Converte a árvore do Docusaurus para o SideNav do design system: categorias de primeiro nível viram títulos
// de seção; subcategorias (as categorias de componentes) viram grupos que abrem e fecham.
function paraItens(itens: ItemDoc[]): SideNavItem[] {
  const saida: SideNavItem[] = [...links(itens)];
  for (const c of itens.filter((i) => i.type === 'category')) {
    saida.push({ section: c.label });
    saida.push(...links(c.items ?? []));
    for (const sub of (c.items ?? []).filter((i) => i.type === 'category')) {
      saida.push({ id: `grupo:${sub.label}`, label: sub.label, children: links(sub.items ?? []) });
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
