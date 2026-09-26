import React, { type ReactNode } from 'react';
import { useHistory } from '@docusaurus/router';
import { useCurrentSidebarCategory } from '@docusaurus/plugin-content-docs/client';
import { Card, Link } from '@onblide/ui';

type Props = { categoryGeneratedIndex: { title: string; description?: string } };
type Item = { type: string; label: string; href?: string; items?: Item[]; description?: string };

// Índice de uma categoria: lista as páginas em cartões do design system.
function Indice({ categoryGeneratedIndex }: Props): ReactNode {
  const categoria = useCurrentSidebarCategory() as unknown as { items: Item[] };
  const history = useHistory();
  const ir = (href?: string) => (e: React.MouseEvent) => { e.preventDefault(); if (href) history.push(href); };
  const itens = categoria.items.filter((i) => i.href);
  return (
    <>
      <p className="ob-eyebrow">Documentação</p>
      <h1>{categoryGeneratedIndex.title}</h1>
      {categoryGeneratedIndex.description && <p className="ob-lede">{categoryGeneratedIndex.description}</p>}
      <div className="ob-cards">
        {itens.map((i) => (
          <Card key={i.href} padding={16}>
            <Link href={i.href} onClick={ir(i.href)}>{i.label}</Link>
            {i.description && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ob-fg-soft)' }}>{i.description}</p>}
          </Card>
        ))}
      </div>
    </>
  );
}

export default function DocCategoryGeneratedIndexPage(props: Props): ReactNode {
  return <Indice {...props} />;
}
