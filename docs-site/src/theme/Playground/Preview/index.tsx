import React, { type ReactNode } from 'react';
import { LiveError, LivePreview } from 'react-live';
import BrowserOnly from '@docusaurus/BrowserOnly';
import PlaygroundHeader from '@theme/Playground/Header';

export default function PlaygroundPreview(): ReactNode {
  return (
    <>
      <PlaygroundHeader>Resultado</PlaygroundHeader>
      <div className="ob-playground__preview">
        <BrowserOnly fallback={<span className="ob-eyebrow">Carregando…</span>}>
          {() => (
            <>
              <LivePreview />
              <LiveError className="ob-playground__error" />
            </>
          )}
        </BrowserOnly>
      </div>
    </>
  );
}
