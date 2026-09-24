// Bundle IIFE de navegador (ver tsup.config.ts). Reexporta tudo de `index` e
// atribui a `window`, para que as páginas de preview (ds/components/*.html) usem
// `Button`, `Modal`, `Icons`, `Logo`... como globais nos seus scripts text/babel.
import * as OnblideUI from './index';

Object.assign(window, OnblideUI);
