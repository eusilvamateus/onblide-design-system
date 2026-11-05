import { THEME_ATTRIBUTE, THEME_DARK_QUERY, THEME_STORAGE_KEY } from './themeConstants';

const chave = JSON.stringify(THEME_STORAGE_KEY);
const atributo = JSON.stringify(THEME_ATTRIBUTE);
const consulta = JSON.stringify(THEME_DARK_QUERY);

/**
 * Script mínimo e sem dependências que aplica `data-theme` no `<html>` a partir da preferência salva.
 * Deve rodar de forma síncrona no `<head>`, antes da primeira pintura, para a página não piscar no tema errado.
 * Use o texto inline (com `nonce` se houver CSP) ou o arquivo `@onblide/ui/theme-init`.
 */
export const themeInitScript = `(function(){try{var c=null;try{c=window.localStorage.getItem(${chave})}catch(e){}var d=c==="dark"||(c!=="light"&&!!window.matchMedia&&window.matchMedia(${consulta}).matches);document.documentElement.setAttribute(${atributo},d?"dark":"light")}catch(e){}})();`;
