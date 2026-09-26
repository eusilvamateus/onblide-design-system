import React, { type ReactNode } from 'react';
import DocItemContent from '@theme/DocItem/Content';

// Sem breadcrumbs, sumário lateral, rodapé de página ou paginação: o design system não tem esses elementos.
export default function DocItemLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <article>
      <DocItemContent>{children}</DocItemContent>
    </article>
  );
}
