import React, { type ReactNode } from 'react';
import { usePlayground } from '@docusaurus/theme-live-codeblock/client';
import { Button, Ph } from '@onblide/ui';

export default function ResetButton(): ReactNode {
  const { reset } = usePlayground();
  return (
    <Button kind="ghost" size="sm" onClick={reset} icon={<Ph n="arrow-counter-clockwise" size={14} />}>
      Restaurar
    </Button>
  );
}
