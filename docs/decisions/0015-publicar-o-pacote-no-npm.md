# 0015. Publicar o pacote no npm

Status: aceita (2026-11-05)

## Contexto

`@onblide/ui` era um pacote interno, com `"private": true`, e só podia ser instalado por caminho local. O projeto passou
a ter licença (decisão 0014) e deve poder ser instalado por qualquer pessoa.

## Decisão

- Publicar `@onblide/ui` no registro público do npm, com `publishConfig.access` igual a `public`.
- Usar o escopo da conta de usuário `onblide`, sem criar organização nem converter a conta.
- Publicar a versão que acabou de ser lançada pelo fluxo normal, depois da tag e do GitHub Release.

## Consequências

- `npm install @onblide/ui` passa a funcionar para qualquer projeto.
- Publicar exige 2FA na conta `onblide` ou um token granular autorizado.
- Uma versão publicada não pode ser reaproveitada, e cada correção sai como versão nova.
- Se o projeto ganhar mais pessoas, a conta pode ser convertida em organização, o que exige criar outro usuário.
