import React, { type ReactNode } from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import DocItemContent from '@theme/DocItem/Content';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';

export default function DocItemLayout({ children }: { children: ReactNode }): ReactNode {
  const { frontMatter, toc } = useDoc();
  const comSumario = !frontMatter.hide_table_of_contents && toc.length > 0;
  return (
    <div className="ob-doc">
      <article className="ob-doc__artigo">
        {comSumario && (
          <div className="ob-doc__sumario-compacto">
            <DocItemTOCMobile />
          </div>
        )}
        <DocItemContent>{children}</DocItemContent>
      </article>
      {comSumario && (
        <aside className="ob-doc__sumario" aria-label="Nesta página">
          <DocItemTOCDesktop />
        </aside>
      )}
    </div>
  );
}
