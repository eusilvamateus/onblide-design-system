import React from 'react';
import props from '@site/src/data/props.json';

type Prop = { nome: string; tipo: string; obrigatoria: boolean; padrao: string | null; descricao: string };
const dados = props as Record<string, { descricao: string; props: Prop[] }>;

export default function PropsTable({ nome }: { nome: string }) {
  const item = dados[nome];
  if (!item || item.props.length === 0) return <p>Este componente não tem props próprias.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr><th>Prop</th><th>Tipo</th><th>Padrão</th><th>Descrição</th></tr>
        </thead>
        <tbody>
          {item.props.map((p) => (
            <tr key={p.nome}>
              <td><code>{p.nome}</code>{p.obrigatoria ? <sup title="obrigatória"> *</sup> : null}</td>
              <td><code>{p.tipo}</code></td>
              <td>{p.padrao ? <code>{p.padrao}</code> : '—'}</td>
              <td>{p.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
