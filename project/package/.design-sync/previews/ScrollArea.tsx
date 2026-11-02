import { ScrollArea } from '@onblide/ui';

const itens = Array.from({ length: 14 }, (_, i) => `Promoção ${i + 1}`);

export const Vertical = () => (
  <div style={{ padding: 16, width: 280 }}>
    <ScrollArea maxHeight={180} ariaLabel="Promoções" style={{ border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-md)' }}>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {itens.map((item) => <span key={item}>{item}</span>)}
      </div>
    </ScrollArea>
  </div>
);

export const Horizontal = () => (
  <div style={{ padding: 16, width: 320 }}>
    <ScrollArea orientation="horizontal" ariaLabel="Etapas" style={{ border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-md)' }}>
      <div style={{ display: 'flex', gap: 24, padding: '12px 12px 20px', width: 'max-content' }}>
        {itens.slice(0, 8).map((item) => <span key={item}>{item}</span>)}
      </div>
    </ScrollArea>
  </div>
);

export const SempreVisivel = () => (
  <div style={{ padding: 16, width: 280 }}>
    <ScrollArea maxHeight={180} visibility="always" ariaLabel="Promoções" style={{ border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-md)' }}>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {itens.map((item) => <span key={item}>{item}</span>)}
      </div>
    </ScrollArea>
  </div>
);

export const DoisEixos = () => (
  <div style={{ padding: 16, width: 280 }}>
    <ScrollArea orientation="both" height={160} ariaLabel="Grade" style={{ border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-md)' }}>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, width: 520 }}>
        {itens.slice(0, 10).map((item) => <span key={item}>{item} com um texto bem longo para estourar a largura da área</span>)}
      </div>
    </ScrollArea>
  </div>
);
