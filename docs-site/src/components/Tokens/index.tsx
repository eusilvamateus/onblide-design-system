import React from 'react';
import tokens from '@site/src/data/tokens.json';

type Token = { nome: string; valor: string; escuro: string | null };
type Tipo = 'cor' | 'raio' | 'sombra' | 'espaco' | 'texto' | 'nenhuma';

const todos = tokens as Token[];
const filtrar = (prefixos: string[]) =>
  todos.filter((t) => prefixos.some((p) => t.nome === p || t.nome.startsWith(`${p}-`)));

const celula: React.CSSProperties = { verticalAlign: 'middle' };

function Amostra({ nome, tipo }: { nome: string; tipo: Tipo }) {
  const v = `var(${nome})`;
  const base: React.CSSProperties = { width: 44, height: 28, border: '1px solid var(--ob-border)' };
  if (tipo === 'cor') return <div style={{ ...base, borderRadius: 6, background: v }} />;
  if (tipo === 'raio') return <div style={{ ...base, borderRadius: v, background: 'var(--ob-blue-100)' }} />;
  if (tipo === 'sombra') return <div style={{ ...base, border: 'none', borderRadius: 6, background: 'var(--ob-surface)', boxShadow: v }} />;
  if (tipo === 'espaco') return <div style={{ height: 12, width: v, minWidth: 2, background: 'var(--ob-blue)', borderRadius: 2 }} />;
  if (tipo === 'texto') return <span style={{ fontSize: v, lineHeight: 1 }}>Aa</span>;
  return null;
}

export function TokenTable({ prefixos, tipo = 'nenhuma' }: { prefixos: string[]; tipo?: Tipo }) {
  const linhas = filtrar(prefixos);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {tipo !== 'nenhuma' && <th>Amostra</th>}
            <th>Token</th>
            <th>Valor (claro)</th>
            <th>Valor (escuro)</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((t) => (
            <tr key={t.nome}>
              {tipo !== 'nenhuma' && <td style={celula}><Amostra nome={t.nome} tipo={tipo} /></td>}
              <td style={celula}><code>{t.nome}</code></td>
              <td style={celula}><code>{t.valor}</code></td>
              <td style={celula}>{t.escuro ? <code>{t.escuro}</code> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
