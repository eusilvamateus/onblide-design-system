---
"@onblide/ui": minor
---

`Modal` passa a limitar a altura do painel à janela: o corpo rola e o cabeçalho e o rodapé ficam fixos (antes o conteúdo alto era cortado). Novas props `maxHeight`, `motion="none"` (remove o fade e o pop internos), `backdropRef` e `contentRef`. As animações internas agora respeitam `prefers-reduced-motion`.
