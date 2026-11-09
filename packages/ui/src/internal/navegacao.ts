import type React from 'react';

const cliqueSimples = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function navegarPeloLink(e: React.MouseEvent<HTMLAnchorElement>, id: string, onNav?: (id: string) => void): void {
  if (!onNav || !cliqueSimples(e)) return;
  e.preventDefault();
  onNav(id);
}
