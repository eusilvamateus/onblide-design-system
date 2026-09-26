import React, { type ReactNode } from 'react';
import PlaygroundPreview from '@theme/Playground/Preview';
import PlaygroundEditor from '@theme/Playground/Editor';

// Resultado primeiro, código depois: o exemplo é o que importa, o código é a referência.
export default function PlaygroundLayout(): ReactNode {
  return (
    <>
      <PlaygroundPreview />
      <PlaygroundEditor />
    </>
  );
}
