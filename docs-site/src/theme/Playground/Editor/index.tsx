import React, { type ReactNode } from 'react';
import { LiveEditor } from 'react-live';
import useIsBrowser from '@docusaurus/useIsBrowser';
import PlaygroundHeader from '@theme/Playground/Header';
import ResetButton from '@theme/Playground/Buttons/ResetButton';

export default function PlaygroundEditor(): ReactNode {
  const isBrowser = useIsBrowser();
  return (
    <>
      <PlaygroundHeader buttons={<ResetButton />}>Código (editável)</PlaygroundHeader>
      <LiveEditor key={String(isBrowser)} className="ob-playground__editor" />
    </>
  );
}
