import React, { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Drawer } from '@onblide/ui';
import Navegacao from '@site/src/components/Navegacao';

function GavetaDeNavegacao(): ReactNode {
  const [aberta, setAberta] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const abrir = () => setAberta(true);
    window.addEventListener('ob-abrir-navegacao', abrir);
    return () => window.removeEventListener('ob-abrir-navegacao', abrir);
  }, []);
  useEffect(() => setAberta(false), [pathname]);
  return (
    <Drawer open={aberta} onClose={() => setAberta(false)} side="left" width={300} title="Navegação">
      <div style={{ margin: -20, height: 'calc(100% + 40px)' }}>
        <Navegacao />
      </div>
    </Drawer>
  );
}

export default function DocRootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="ob-shell">
      <div className="ob-shell__nav">
        <Navegacao />
      </div>
      <main className="ob-shell__main ob-wrap">{children}</main>
      <BrowserOnly>{() => <GavetaDeNavegacao />}</BrowserOnly>
    </div>
  );
}
