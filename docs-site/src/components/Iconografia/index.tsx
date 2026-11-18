import React, { useMemo, useState } from 'react';
import { Input, Ph, Slider, Tabs, type IconWeight } from '@onblide/ui';
import icones from '@site/src/data/icones.json';

const PESOS: { id: IconWeight; label: string; papel: string }[] = [
  { id: 'regular', label: 'Regular', papel: 'Padrão da interface' },
  { id: 'fill', label: 'Fill', papel: 'Estado ligado' },
  { id: 'bold', label: 'Bold', papel: 'Até 14px ou fundo sólido' },
  { id: 'light', label: 'Light', papel: 'Ícones grandes, 32–48px' },
  { id: 'thin', label: 'Thin', papel: 'Editorial, 64px+' },
  { id: 'duotone', label: 'Duotone', papel: 'Destaque ilustrativo' },
];

const todos = icones as string[];

/** Um ícone nos seis pesos, lado a lado, no tamanho escolhido. */
export function ComparadorPesos() {
  const [nome, setNome] = useState('house');
  const [tamanho, setTamanho] = useState(32);
  const valido = todos.includes(nome);
  return (
    <div className="ob-icones">
      <div className="ob-icones__controles">
        <Input label="Ícone" value={nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value.trim())}
          error={valido ? undefined : 'Não existe no Phosphor'} />
        <Slider label={`Tamanho: ${tamanho}px`} min={12} max={96} step={4} value={tamanho} onChange={(v: number) => setTamanho(v)} />
      </div>
      <div className="ob-icones__pesos">
        {PESOS.map((p) => (
          <div key={p.id} className="ob-icones__peso">
            <div className="ob-icones__amostra">{valido && <Ph n={nome} size={tamanho} weight={p.id} />}</div>
            <strong>{p.label}</strong>
            <span>{p.papel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Todos os ícones do Phosphor, com busca, troca de peso e o código pronto para usar. */
export function NavegadorIcones() {
  const [busca, setBusca] = useState('');
  const [peso, setPeso] = useState<IconWeight>('regular');
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const achados = useMemo(() => {
    const termos = busca.toLowerCase().split(/\s+/).filter(Boolean);
    return todos.filter((n) => termos.every((t) => n.includes(t)));
  }, [busca]);
  const codigo = escolhido ? `<Ph n="${escolhido}"${peso === 'regular' ? '' : ` weight="${peso}"`} />` : '';
  return (
    <div className="ob-icones">
      <div className="ob-icones__controles">
        <Input label="Buscar (em inglês)" placeholder="ex.: arrow, user, calendar" value={busca}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
          hint={`${achados.length} de ${todos.length} ícones`} />
      </div>
      <Tabs variant="pill" size="sm" ariaLabel="Peso dos ícones" active={peso} onChange={(id: string) => setPeso(id as IconWeight)} tabs={PESOS.map((p) => ({ id: p.id, label: p.label }))} />
      {escolhido && (
        <div className="ob-icones__escolhido">
          <Ph n={escolhido} size={40} weight={peso} />
          <div>
            <strong>{escolhido}</strong>
            <code>{codigo}</code>
          </div>
        </div>
      )}
      <div className="ob-icones__grade">
        {achados.map((n) => (
          <button type="button" key={n} title={n} onClick={() => setEscolhido(n)}
            className={n === escolhido ? 'ob-icones__item ob-icones__item--ativo' : 'ob-icones__item'}>
            <Ph n={n} size={24} weight={peso} />
            <span>{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
