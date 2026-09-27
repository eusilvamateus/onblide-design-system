import React, { type ReactNode } from 'react';
import { LiveEditor } from 'react-live';
import useIsBrowser from '@docusaurus/useIsBrowser';

export default function PlaygroundEditor(): ReactNode {
  const isBrowser = useIsBrowser();
  return <LiveEditor key={String(isBrowser)} className="ob-playground__editor" />;
}
