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
