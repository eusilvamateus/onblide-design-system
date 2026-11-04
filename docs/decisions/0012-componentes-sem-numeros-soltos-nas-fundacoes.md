# 0012. Componentes sem números soltos nas fundações

## Contexto

As fundações de espaçamento, raio, sombra, camada, opacidade e movimento tinham tokens, mas os componentes muitas
vezes não os usavam:

- 203 espaçamentos escritos com número contra 26 por token, 87 deles fora da escala de 4 em 4 (2, 6, 10, 14, 20px…);
- 22 durações fixas, a mais comum (160ms) fora da escala de 120/200/400ms;
- 23 raios fixos, entre eles `999` repetido em vez de `--ob-r-pill`;
- desabilitado em 0.45, 0.5 ou 0.6 conforme o componente, e nenhum uso dos tokens de opacidade;
- anéis de foco de 2, 3 ou 4px, alguns translúcidos e outros em contorno azul sólido;
- só o `Modal` e o `ScrollArea` respeitavam `prefers-reduced-motion`.

As páginas de Fundações do site eram só tabelas de tokens, e as de Cores e Sombras saíam vazias por um defeito do
gerador.

## Decisão

1. **Espaçamento em quinze passos com o nome igual ao valor:** `--ob-space-2` a `--ob-space-128` (2, 4, 6, 8, 10, 12, 16,
   20, 24, 32, 40, 48, 64, 96, 128). Os meios-passos 2, 6, 10 e 20 entram porque o interior dos componentes precisa
   deles, e o 40 porque estados vazios já o usavam. Os antigos `--ob-s-1…10` saem, para que nenhum nome valha um número
   diferente do que diz.
2. **Valor fora da escala vai para o passo mais próximo; no empate, para o maior.** 14px vira 16, 18 vira 20, 22 vira
   24, e 1, 3, 5, 7 e 9px andam 1px. Os mapas de tamanho internos seguem a mesma regra (o recuo do `TreeView` pequeno vai
   de 14 para 12px, para continuar menor que o médio).
3. **Tokens novos onde faltava um papel:** `--ob-r-2xs` (2px) e `--ob-r-circle` (50%); `--ob-z-drag` (600);
   `--ob-opacity-muted` (0.4); `--ob-focus-ring-width` (3px); `--ob-ease-in-out`, `--ob-dur-spin` (800ms) e `--ob-dur-loop`
   (1400ms).
4. **Menos movimento nos tokens:** com `prefers-reduced-motion: reduce`, o `tokens.css` zera `--ob-dur-fast`, `--ob-dur-base`
   e `--ob-dur-slow`. Spinner e esqueleto continuam, porque comunicam carregamento.
5. **A regra é verificada:** o `smoke-fundacoes` recusa, em `src/`, espaçamento, raio, duração, curva, `z-index` de 3 para
   cima, opacidade diferente de 0 e 1, sombra com desfoque ou cor e anel de foco com largura escritos com número. As
   exceções são `0`, as compensações de borda de 1 e 1,5px e a geometria calculada a partir de props ou de outros
   tamanhos.

## Consequências

- Renomear `--ob-s-*` quebra quem os usava; entra como quebra de compatibilidade no changeset `espacamento-com-nome-de-valor`.
- Vários componentes mudam 1 a 2px de padding, e o estado desabilitado fica um pouco mais claro onde era 0.5 ou 0.6.
- Componentes novos já nascem respeitando tema, escala e `prefers-reduced-motion`, porque o teste não aceita outra forma.
- As regras de cada fundação vivem nas páginas de `docs-site/docs/fundacoes/`.
