import type { PrismTheme } from 'prism-react-renderer';

// Realce de sintaxe com os tokens de código do design system (--ob-code-*). As variáveis já mudam no tema
// escuro, então o mesmo tema serve para os dois.
const tema: PrismTheme = {
  plain: { color: 'var(--ob-code-text)', backgroundColor: 'var(--ob-bg-alt)' },
  styles: [
    { types: ['tag', 'class-name', 'builtin', 'function', 'keyword'], style: { color: 'var(--ob-code-tag)' } },
    { types: ['attr-name', 'property'], style: { color: 'var(--ob-code-attr)' } },
    { types: ['string', 'attr-value', 'template-string', 'char'], style: { color: 'var(--ob-code-string)' } },
    { types: ['number', 'boolean', 'constant'], style: { color: 'var(--ob-code-number)' } },
    { types: ['punctuation', 'operator'], style: { color: 'var(--ob-code-punct)' } },
    { types: ['comment', 'prolog', 'doctype'], style: { color: 'var(--ob-code-comment)', fontStyle: 'italic' } },
  ],
};

export default tema;
