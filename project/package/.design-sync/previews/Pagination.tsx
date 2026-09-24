import { Pagination } from '@onblide/ui';

const box = { padding: 16 };

export const Inicio = () => <div style={box}><Pagination page={1} total={10} /></div>;
export const Meio = () => <div style={box}><Pagination page={5} total={20} siblings={1} /></div>;
export const Fim = () => <div style={box}><Pagination page={12} total={12} /></div>;
