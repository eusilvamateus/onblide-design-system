import { useState } from 'react';
import { Pagination } from '@onblide/ui';

const box = { padding: 16 };

export const Inicio = () => {
  const [pagina, setPagina] = useState(1);
  return <div style={box}><Pagination page={pagina} total={10} onChange={setPagina} /></div>;
};

export const Meio = () => {
  const [pagina, setPagina] = useState(10);
  return <div style={box}><Pagination page={pagina} total={20} onChange={setPagina} /></div>;
};

export const Fim = () => {
  const [pagina, setPagina] = useState(12);
  return <div style={box}><Pagination page={pagina} total={12} onChange={setPagina} /></div>;
};

export const NaoControlado = () => <div style={box}><Pagination defaultPage={3} total={50} /></div>;

export const Tamanhos = () => (
  <div style={{ ...box, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Pagination size="sm" defaultPage={4} total={12} />
    <Pagination size="md" defaultPage={4} total={12} />
    <Pagination size="lg" defaultPage={4} total={12} />
  </div>
);

export const PrimeiraEUltima = () => <div style={box}><Pagination defaultPage={8} total={40} showEdges /></div>;

export const IrPara = () => <div style={box}><Pagination defaultPage={8} total={40} showJumper /></div>;

export const ItensPorPagina = () => (
  <div style={box}><Pagination totalItems={487} pageSizeOptions={[10, 20, 50]} /></div>
);

export const Compacta = () => <div style={box}><Pagination variant="compact" defaultPage={3} total={20} showEdges /></div>;
