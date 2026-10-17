import React, { useMemo, useState } from 'react';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import BrowserOnly from '@docusaurus/BrowserOnly';
import * as OnblideUI from '@onblide/ui';
import { Button, Checkbox, Input, Ph, Select, Tabs } from '@onblide/ui';
import props from '@site/src/data/props.json';
import { Highlight } from 'prism-react-renderer';
import temaCodigo from '@site/src/prism/tema';

type Prop = { nome: string; tipo: string; obrigatoria: boolean; padrao: string | null; descricao: string };
type Valor = string | number | boolean | undefined;
type Controle = { prop: Prop; tipo: 'booleano' | 'opcoes' | 'texto' | 'numero'; opcoes?: string[] };

const dados = props as Record<string, { descricao: string; props: Prop[] }>;

const CONDICIONAIS: Record<string, Record<string, { prop: string; valor: string }>> = {
  Button: { tone: { prop: 'kind', valor: 'quiet' }, fill: { prop: 'kind', valor: 'quiet' } },
};

const LIGADAS = ['open', 'onClose', 'onChange', 'checked', 'value', 'values'];

function controlesDe(nome: string, brutos: Record<string, string>): Controle[] {
  const lista: Controle[] = [];
  for (const p of dados[nome]?.props ?? []) {
    if (p.nome in brutos || p.nome === 'style' || p.tipo.includes('=>')) continue;
    if (p.nome === 'onClose' || p.nome === 'onChange') continue;
    const opcoes = p.tipo.match(/^"[^"]*"(\s*\|\s*"[^"]*")+$/) ? [...p.tipo.matchAll(/"([^"]*)"/g)].map((m) => m[1]) : null;
    if (p.tipo === 'boolean') lista.push({ prop: p, tipo: 'booleano' });
    else if (opcoes) lista.push({ prop: p, tipo: 'opcoes', opcoes });
    else if (['number', 'string | number', 'number | string'].includes(p.tipo)) lista.push({ prop: p, tipo: 'numero' });
    else if (['string', 'ReactNode'].includes(p.tipo)) lista.push({ prop: p, tipo: 'texto' });
  }
  return lista;
}

const padraoDe = (c: Controle): Valor => {
  const v = c.prop.padrao?.replace(/^['"]|['"]$/g, '');
  if (v == null) return undefined;
  if (c.tipo === 'booleano') return v === 'true';
  if (c.tipo === 'numero') return Number.isFinite(Number(v)) ? Number(v) : v;
  return v;
};

function atributo(c: Controle, v: Valor): string | null {
  const nome = c.prop.nome;
  if (v === undefined || v === '') return c.prop.obrigatoria && c.tipo !== 'booleano' ? `${nome}=""` : null;
  if (v === true) return nome;
  if (v === false) return `${nome}={false}`;
  if (typeof v === 'number') return `${nome}={${v}}`;
  return v.includes('"') ? `${nome}={${JSON.stringify(v)}}` : `${nome}="${v}"`;
}

const LARGOS = ['Table', 'Tabs', 'Spinner', 'SideNav'];

const recuar = (t: string, n = 2) => t.split('\n').join('\n' + ' '.repeat(n));

export default function Playground({
  nome,
  literais = {},
  brutos = {},
  filhos = null,
  auxiliares = '',
  moldura = null,
}: {
  nome: string;
  literais?: Record<string, Valor>;
  brutos?: Record<string, string>;
  filhos?: string | null;
  auxiliares?: string;
  /** JSX em volta do componente (ex.: botão que abre a sobreposição), com `__DEMO__` no lugar dele. */
  moldura?: string | null;
}) {
  const controles = useMemo(() => controlesDe(nome, brutos), [nome, brutos]);
  const temProp = (p: string) => (dados[nome]?.props ?? []).some((x) => x.nome === p);
  const inicial = () => {
    const ini: Record<string, Valor> = {};
    for (const c of controles) ini[c.prop.nome] = c.prop.nome in literais ? literais[c.prop.nome] : padraoDe(c);
    if (filhos && !/[<{]/.test(filhos) && controles.some((c) => c.prop.nome === 'children')) ini.children = filhos;
    if (temProp('open') && !('open' in ini)) ini.open = false;
    return ini;
  };
  const [valores, setValores] = useState<Record<string, Valor>>(inicial);
  const visiveis = controles.filter((c) => {
    const condicao = CONDICIONAIS[nome]?.[c.prop.nome];
    return !condicao || valores[condicao.prop] === condicao.valor;
  });
  const [versao, setVersao] = useState(0);
  const [aba, setAba] = useState('resultado');
  const definir = (p: string, v: Valor) => setValores((a) => ({ ...a, [p]: v }));
  const restaurar = () => {
    setValores(inicial());
    setVersao((n) => n + 1);
  };

  const controlado = temProp('onChange') && (temProp('checked') || temProp('value'));
  const alvoLigado = temProp('checked') ? 'checked' : 'value';

  const ligacoes: string[] = [];
  if (temProp('onClose') && temProp('open')) ligacoes.push('onClose={fechar}');
  if (controlado) {
    ligacoes.push(`${alvoLigado}={valor}`);
    ligacoes.push('onChange={alterar}');
  }

  const attrs = [
    ...visiveis
      .filter((c) => c.prop.nome !== 'children' && !(controlado && c.prop.nome === alvoLigado))
      .map((c) => atributo(c, valores[c.prop.nome])),
    ...Object.entries(brutos).filter(([k, v]) => !LIGADAS.includes(k) && v !== 'undefined').map(([k, v]) => `${k}={${v}}`),
    ...ligacoes,
  ].filter(Boolean) as string[];
  const abre = attrs.length > 2 ? `<${nome}\n  ${attrs.join('\n  ')}\n` : `<${nome}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  const controleFilhos = controles.some((c) => c.prop.nome === 'children');
  const textoFilhos = typeof valores.children === 'string' && valores.children !== '' ? valores.children : null;
  const conteudo = !controleFilhos ? filhos : textoFilhos ?? (/[<{]/.test(filhos ?? '') ? filhos : null);
  const elemento = conteudo ? `${abre}>\n  ${recuar(conteudo)}\n</${nome}>` : `${abre}${attrs.length > 2 ? '' : ' '}/>`;
  const jsx = moldura ? moldura.replace('__DEMO__', recuar(elemento, (moldura.split('__DEMO__')[0].match(/[ \t]*$/)?.[0].length ?? 0))) : elemento;
  const usaNoInline = controlado || !!auxiliares;
  let codigo: string;
  if (controlado) {
    const declaracaoEstado = `const [valor, setValor] = useState(${JSON.stringify(valores[alvoLigado])});\n  const alterar = (v) => setValor(v && v.target ? v.target.value : v);`;
    const corpoFuncao = `function Demo() {\n  ${declaracaoEstado}\n  return (\n${recuar(jsx, 4)}\n  );\n}`;
    codigo = `${auxiliares ? `${auxiliares}\n\n` : ''}${corpoFuncao}\n\nrender(<Demo />);`;
  } else {
    codigo = auxiliares ? `${auxiliares}\n\nrender(\n  ${recuar(jsx)}\n);` : jsx;
  }

  const scope = {
    ...OnblideUI,
    React,
    useState,
    abrir: () => definir('open', true),
    fechar: () => definir('open', false),
  };

  const erroDe = (c: Controle) => (c.prop.obrigatoria && (valores[c.prop.nome] === undefined || valores[c.prop.nome] === '') ? 'Obrigatória' : undefined);

  return (
    <div className="ob-demo">
      <div className="ob-demo__controles">
        {visiveis.filter((c) => c.tipo !== 'booleano').map((c) => {
          const v = valores[c.prop.nome];
          const rotulo = c.prop.nome;
          if (c.tipo === 'opcoes') {
            return (
              <Select key={rotulo} label={rotulo} options={c.opcoes} value={(v as string) ?? null} onChange={(x: string) => definir(rotulo, x)} />
            );
          }
          return (
            <Input
              key={rotulo}
              label={rotulo}
              type={c.tipo === 'numero' ? 'number' : 'text'}
              value={v === undefined ? '' : String(v)}
              error={erroDe(c)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                definir(rotulo, c.tipo === 'numero' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)}
            />
          );
        })}
      </div>
      {visiveis.some((c) => c.tipo === 'booleano') && (
        <div className="ob-demo__opcoes">
          {visiveis.filter((c) => c.tipo === 'booleano').map((c) => (
            <Checkbox key={c.prop.nome} label={c.prop.nome} checked={!!valores[c.prop.nome]} onChange={(x: boolean) => definir(c.prop.nome, x)} />
          ))}
        </div>
      )}
      <div className="ob-playground">
        <div className="ob-playground__tabs">
          <Tabs tabs={[{ id: 'resultado', label: 'Resultado', icon: 'eye' }, { id: 'codigo', label: 'Código', icon: 'code' }]} active={aba} onChange={setAba} size="sm" />
          <Button kind="ghost" size="sm" onClick={restaurar} icon={<Ph n="arrow-counter-clockwise" size={14} />}>Restaurar</Button>
        </div>
        <BrowserOnly fallback={<div className="ob-playground__preview" />}>
          {() => (
            <LiveProvider key={versao} code={codigo} scope={scope} noInline={usaNoInline} theme={temaCodigo}>
              <div hidden={aba !== 'resultado'}>
                <div className="ob-playground__preview ob-demo__resultado">
                  <div className={`ob-demo__palco${LARGOS.includes(nome) ? ' ob-demo__palco--largo' : ''}`}>
                    <LivePreview />
                  </div>
                  <LiveError className="ob-playground__error" />
                </div>
              </div>
              <div hidden={aba !== 'codigo'}>
                <Highlight code={codigo} language="jsx" theme={temaCodigo}>
                  {({ tokens, getLineProps, getTokenProps }) => (
                    <pre className="ob-demo__codigo">
                      {tokens.map((linha, i) => (
                        <div key={i} {...getLineProps({ line: linha })}>
                          {linha.map((t, j) => <span key={j} {...getTokenProps({ token: t })} />)}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </LiveProvider>
          )}
        </BrowserOnly>
      </div>
    </div>
  );
}
