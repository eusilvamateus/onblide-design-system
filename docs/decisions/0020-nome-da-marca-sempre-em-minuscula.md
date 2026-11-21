# 0020. Nome da marca sempre em minúscula

## Contexto

O logo da onblide é todo em minúscula, mas os textos do produto, do site de documentação, dos READMEs e das maquetes
escreviam "Onblide", com a inicial maiúscula da regra de nome próprio. A marca aparecia com duas grafias, a depender de
onde a pessoa a encontrava.

## Decisão

1. O nome da marca é escrito sempre em minúscula, **onblide**, em qualquer texto: interface, e-mails, documentação,
   textos alternativos, nomes acessíveis e títulos.
2. A regra vale também no começo de frase ("onblide ajuda você a…"). Quando a minúscula incomodar, a frase é
   reescrita para a marca não abrir o período, mas a grafia não muda.
3. Ficam de fora a razão social, que segue a grafia do registro da empresa em contratos,
   notas e termos, e os identificadores de código, que seguem a convenção de nomes (`OnblideUI`).
4. O histórico já publicado, como o `CHANGELOG.md`, não é reescrito.

## Consequências

- A regra vive em `docs-site/docs/fundacoes/marca.mdx`, na seção "Grafia do nome".
- O `Logo` e o `LogoMark` anunciam "onblide" como nome acessível.
- Texto escrito por terceiros, como a imprensa, pode capitalizar o nome. Isso não depende da onblide.
