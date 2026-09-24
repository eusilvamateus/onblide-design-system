import * as React from 'react';
import { StatusDot } from '@onblide/ui';

const Linha = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>{children}{t}</div>
);

export const Tons = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
    <Linha t="Ativo"><StatusDot tone="green" /></Linha>
    <Linha t="Em revisão"><StatusDot tone="blue" /></Linha>
    <Linha t="Pendente"><StatusDot tone="orange" /></Linha>
    <Linha t="Atrasado"><StatusDot tone="red" /></Linha>
    <Linha t="Arquivado"><StatusDot tone="grey" /></Linha>
  </div>
);
