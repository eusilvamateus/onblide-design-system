import React, { useId, useState, type ReactNode } from 'react';
import PlaygroundPreview from '@theme/Playground/Preview';
import PlaygroundEditor from '@theme/Playground/Editor';
import ResetButton from '@theme/Playground/Buttons/ResetButton';
import { Tabs } from '@onblide/ui';

// Resultado e código em abas (Tabs do design system). Os dois ficam montados, então o que for editado no
// código continua valendo ao voltar para o resultado.
export default function PlaygroundLayout(): ReactNode {
  const [aba, setAba] = useState('resultado');
  const paineis = useId();
  const abas = [
    { id: 'resultado', label: 'Resultado', icon: 'eye', panelId: `${paineis}-resultado` },
    { id: 'codigo', label: 'Código', icon: 'code', panelId: `${paineis}-codigo` },
  ];
  return (
    <>
      <div className="ob-playground__tabs">
        <Tabs ariaLabel="Exemplo" tabs={abas} active={aba} onChange={setAba} size="sm" />
        {aba === 'codigo' && <ResetButton />}
      </div>
      <div id={`${paineis}-resultado`} role="tabpanel" aria-label="Resultado" hidden={aba !== 'resultado'}><PlaygroundPreview /></div>
      <div id={`${paineis}-codigo`} role="tabpanel" aria-label="Código" hidden={aba !== 'codigo'}><PlaygroundEditor /></div>
    </>
  );
}
