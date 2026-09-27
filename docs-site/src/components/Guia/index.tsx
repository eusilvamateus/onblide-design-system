import React, { type ReactNode } from 'react';
import { Alert, Card, Ph } from '@onblide/ui';

// Blocos dos guias de componente, com a mesma linguagem de ds/foundations/doc.css:
// "faça / evite" lado a lado, nota em destaque e a matriz de critérios.

export function FacaEvite({ children }: { children: ReactNode }) {
  return <div className="ob-faca-evite">{children}</div>;
}

function Lado({ tom, rotulo, icone, children }: { tom: string; rotulo: string; icone: string; children: ReactNode }) {
  return (
    <Card padding={16}>
      <span className="ob-faca-evite__tag" style={{ color: tom }}>
        <Ph n={icone} size={12} /> {rotulo}
      </span>
      <div className="ob-faca-evite__texto">{children}</div>
    </Card>
  );
}

export function Faca({ children }: { children: ReactNode }) {
  return <Lado tom="var(--ob-green-700)" rotulo="Faça" icone="check">{children}</Lado>;
}

export function Evite({ children }: { children: ReactNode }) {
  return <Lado tom="var(--ob-danger)" rotulo="Evite" icone="x">{children}</Lado>;
}

export function Nota({ children }: { children: ReactNode }) {
  return <div className="ob-nota"><Alert tone="info">{children}</Alert></div>;
}

export function Criterios({ itens }: { itens: [string, boolean][] }) {
  if (!itens?.length) return null;
  return (
    <div className="ob-criterios">
      {itens.map(([texto, ok]) => (
        <div key={texto} className={ok ? 'ob-criterio' : 'ob-criterio ob-criterio--nao'}>
          <span className={ok ? 'ob-criterio__marca ob-criterio__marca--sim' : 'ob-criterio__marca'}>
            <Ph n={ok ? 'check' : 'minus'} size={12} />
          </span>
          {texto}
        </div>
      ))}
    </div>
  );
}
