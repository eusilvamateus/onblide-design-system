import React, { useState, type ReactNode } from 'react';
import PlaygroundPreview from '@theme/Playground/Preview';
import PlaygroundEditor from '@theme/Playground/Editor';
import ResetButton from '@theme/Playground/Buttons/ResetButton';
import { Tabs } from '@onblide/ui';

const abas = [
  { id: 'resultado', label: 'Resultado', icon: 'eye' },
  { id: 'codigo', label: 'Código', icon: 'code' },
];

// Resultado e código em abas (Tabs do design system). Os dois ficam montados, então o que for editado no
// código continua valendo ao voltar para o resultado.
export default function PlaygroundLayout(): ReactNode {
  const [aba, setAba] = useState('resultado');
  return (
    <>
      <div className="ob-playground__tabs">
        <Tabs tabs={abas} active={aba} onChange={setAba} size="sm" />
        {aba === 'codigo' && <ResetButton />}
      </div>
      <div hidden={aba !== 'resultado'}><PlaygroundPreview /></div>
      <div hidden={aba !== 'codigo'}><PlaygroundEditor /></div>
    </>
  );
}
