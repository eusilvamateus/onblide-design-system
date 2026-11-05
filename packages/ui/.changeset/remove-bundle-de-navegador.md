---
"@onblide/ui": minor
---

Remove o bundle de navegador `dist/onblide-ui.browser.js`. O pacote passa a gerar só ESM e CJS, como o Material UI, e fica pronto para o React 19, que não tem mais a versão UMD da qual esse bundle dependia.
