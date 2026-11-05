import React, { type ReactNode } from 'react';
import { useHistory } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
import SearchBar from '@theme/SearchBar';
import { Button, Logo, Ph, Tooltip } from '@onblide/ui';

const REPOSITORIO = 'https://github.com/eusilvamateus/onblide-design-system';

const TEMAS = {
  claro: { escolha: 'light', icone: 'sun', dica: 'Claro', proximo: 'escuro' },
  escuro: { escolha: 'dark', icone: 'moon', dica: 'Escuro', proximo: 'sistema' },
  sistema: { escolha: null, icone: 'monitor', dica: 'Sistema', proximo: 'claro' },
} as const;

export default function Navbar(): ReactNode {
  const { colorModeChoice, setColorMode } = useColorMode();
  const history = useHistory();
  const tema = colorModeChoice === 'light' ? TEMAS.claro : colorModeChoice === 'dark' ? TEMAS.escuro : TEMAS.sistema;
  return (
    <header className="ob-topbar navbar">
      <div className="ob-topbar__inner">
        <div className="ob-topbar__brand">
          <span className="ob-topbar__menu">
            <Button
              kind="ghost"
              size="sm"
              aria-label="Abrir navegação"
              onClick={() => window.dispatchEvent(new CustomEvent('ob-abrir-navegacao'))}
              icon={<Ph n="list" size={18} />}
            />
          </span>
          <a href="/" onClick={(e) => { e.preventDefault(); history.push('/'); }} aria-label="Onblide Design System" style={{ display: 'inline-flex' }}>
            <Logo size={26} />
          </a>
          <span className="ob-eyebrow ob-topbar__label">Design System</span>
        </div>
        <div className="ob-topbar__actions">
          <SearchBar />
          <span className="ob-topbar__icones">
            <span className="ob-topbar__github">
              <Tooltip label="Ver no GitHub" placement="bottom">
                <Button
                  kind="neutral"
                  size="sm"
                  iconOnly
                  aria-label="Ver no GitHub"
                  onClick={() => window.open(REPOSITORIO, '_blank', 'noopener')}
                  icon={<Ph n="github-logo" size={18} />}
                />
              </Tooltip>
            </span>
            <Tooltip label={tema.dica} placement="bottom">
              <Button
                kind="neutral"
                size="sm"
                iconOnly
                aria-label={`Tema: ${tema.dica}`}
                onClick={() => setColorMode(TEMAS[tema.proximo].escolha)}
                icon={<Ph n={tema.icone} size={18} />}
              />
            </Tooltip>
          </span>
        </div>
      </div>
    </header>
  );
}
