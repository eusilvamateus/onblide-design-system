import React, { type ReactNode } from 'react';
import { LiveError, LivePreview } from 'react-live';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function PlaygroundPreview(): ReactNode {
  return (
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
  );
}
