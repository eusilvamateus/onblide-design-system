# Onblide Design System

Biblioteca de componentes React do Onblide, com tokens, ícones Phosphor e documentação própria.

| Pasta | O que é |
|---|---|
| `packages/ui/` | `@onblide/ui`: componentes, tokens e testes |
| `docs-site/` | Site de documentação (Docusaurus), publicado em <https://onblide-design-system.vercel.app> |
| `docs/` | Arquitetura, decisões e como desenvolver |

## Começar

```bash
npm install                                    # ferramentas de formatação e lint
cd packages/ui && npm install && npm run build
cd ../../docs-site && npm install && npm start  # site em http://localhost:3000
```

Para verificar o pacote, rode `npm run verify` em `packages/ui/`. O restante está em
[`docs/development/ambiente-de-desenvolvimento.md`](docs/development/ambiente-de-desenvolvimento.md).

## Licença

O código é distribuído sob a [licença MIT](LICENSE). As fontes em `packages/ui/src/fonts/` têm licença própria, a
[SIL Open Font License 1.1](packages/ui/src/fonts/OFL.txt). Nenhuma das duas autoriza usar o nome Onblide e o logo como
marca: eles continuam reservados ao autor.
