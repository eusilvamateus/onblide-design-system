import * as React from 'react';
import { Icons } from '@onblide/ui';

const Cel = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 72, fontSize: 11 }}>
    {children}<span>{n}</span>
  </div>
);

export const Navegacao = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, flexWrap: 'wrap' }}>
    <Cel n="house"><Icons.house /></Cel>
    <Cel n="search"><Icons.search /></Cel>
    <Cel n="user"><Icons.user /></Cel>
    <Cel n="gear"><Icons.gear /></Cel>
    <Cel n="bell"><Icons.bell /></Cel>
    <Cel n="calendar"><Icons.calendar /></Cel>
    <Cel n="kanban"><Icons.kanban /></Cel>
    <Cel n="chart"><Icons.chart /></Cel>
  </div>
);

export const Acoes = () => (
  <div style={{ display: 'flex', gap: 12, padding: 16, flexWrap: 'wrap' }}>
    <Cel n="plus"><Icons.plus /></Cel>
    <Cel n="check"><Icons.check /></Cel>
    <Cel n="x"><Icons.x /></Cel>
    <Cel n="link"><Icons.link /></Cel>
    <Cel n="sync"><Icons.sync /></Cel>
    <Cel n="star"><Icons.star size={32} /></Cel>
    <Cel n="heart"><Icons.heart size={32} /></Cel>
  </div>
);
