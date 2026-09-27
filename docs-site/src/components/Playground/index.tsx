import React, { useMemo, useState } from 'react';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import BrowserOnly from '@docusaurus/BrowserOnly';
import * as OnblideUI from '@onblide/ui';
import { Checkbox, Input, Select, Tabs } from '@onblide/ui';
import props from '@site/src/data/props.json';
import { Highlight } from 'prism-react-renderer';
import temaCodigo from '@site/src/prism/tema';

type Prop = { nome: string; tipo: string; obrigatoria: boolean; padrao: string | null; descricao: string };
type Valor = string | number | boolean | undefined;
type Controle = { prop: Prop; tipo: 'booleano' | 'opcoes' | 'texto' | 'numero'; opcoes?: string[] };

const dados = props as Record<string, { descricao: string; props: Prop[] }>;

// Props que a própria demo controla (estado aberto/fechado e valor), ligadas aos controles.
const LIGADAS = ['open', 'onClose', 'onChange', 'checked', 'value', 'values'];

function controlesDe(nome: string, brutos: Record<string, string>): Controle[] {
  const lista: Controle[] = [];
  for (const p of dados[nome]?.props ?? []) {
    if (p.nome in brutos || p.nome === 'style' || p.tipo.includes('=>')) continue;
    if (p.nome === 'onClose' || p.nome === 'onChange') continue;
    const opcoes = p.tipo.match(/^"[^"]*"(\s*\|\s*"[^"]*")+$/) ? [...p.tipo.matchAll(/"([^"]*)"/g)].map((m) => m[1]) : null;
    if (p.tipo === 'boolean') lista.push({ prop: p, tipo: 'booleano' });
    else if (opcoes) lista.push({ prop: p, tipo: 'opcoes', opcoes });
    else if (p.tipo === 'number') lista.push({ prop: p, tipo: 'numero' });
    else if (['string', 'ReactNode', 'string | number', 'number | string'].includes(p.tipo)) lista.push({ prop: p, tipo: 'texto' });
  }
  return lista;
}

const padraoDe = (c: Controle): Valor => {
  const v = c.prop.padrao?.replace(/^['"]|['"]$/g, '');
  if (v == null) return undefined;
  if (c.tipo === 'booleano') return v === 'true';
  if (c.tipo === 'numero') return Number(v);
  return v;
};

function atributo(nome: string, v: Valor): string | null {
  if (v === undefined || v === '') return null;
  if (v === true) return nome;
  if (v === false) return `${nome}={false}`;
  if (typeof v === 'number') return `${nome}={${v}}`;
  return v.includes('"') ? `${nome}={${JSON.stringify(v)}}` : `${nome}="${v}"`;
}

export default function Playground({
  nome,
  literais = {},
  brutos = {},
  filhos = null,
  auxiliares = '',
}: {
  nome: string;
  literais?: Record<string, Valor>;
  brutos?: Record<string, string>;
  filhos?: string | null;
  auxiliares?: string;
}) {
  const controles = useMemo(() => controlesDe(nome, brutos), [nome, brutos]);
  const temProp = (p: string) => (dados[nome]?.props ?? []).some((x) => x.nome === p);
  const [valores, setValores] = useState<Record<string, Valor>>(() => {
    const ini: Record<string, Valor> = {};
    for (const c of controles) ini[c.prop.nome] = c.prop.nome in literais ? literais[c.prop.nome] : padraoDe(c);
    if (temProp('open') && !('open' in ini)) ini.open = false;
    return ini;
  });
  const [valorVivo, setValorVivo] = useState<unknown>(() => literais.value ?? literais.checked);
  const [aba, setAba] = useState('resultado');
  const definir = (p: string, v: Valor) => setValores((a) => ({ ...a, [p]: v }));

  // Liga o estado da demo: fechar (onClose) e mudar valor (onChange) atualizam os controles.
  const ligacoes: string[] = [];
  if (temProp('onClose') && temProp('open')) ligacoes.push('onClose={fechar}');
  if (temProp('onChange') && (temProp('checked') || temProp('value'))) {
    const alvo = temProp('checked') ? 'checked' : 'value';
    if (!controles.some((c) => c.prop.nome === alvo)) ligacoes.push(`${alvo}={valor}`);
    ligacoes.push('onChange={alterar}');
  }

  const attrs = [
    ...controles.map((c) => atributo(c.prop.nome, valores[c.prop.nome])),
    ...Object.entries(brutos).filter(([k]) => !LIGADAS.includes(k)).map(([k, v]) => `${k}={${v}}`),
    ...ligacoes,
  ].filter(Boolean) as string[];
  const abre = attrs.length > 2 ? `<${nome}\n  ${attrs.join('\n  ')}\n` : `<${nome}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  const jsx = filhos ? `${abre}>\n  ${filhos.split('\n').join('\n  ')}\n</${nome}>` : `${abre}${attrs.length > 2 ? '' : ' '}/>`;
  const codigo = auxiliares ? `${auxiliares}\n\nrender(\n  ${jsx.split('\n').join('\n  ')}\n);` : jsx;

  const scope = {
    ...OnblideUI,
    React,
    useState,
    fechar: () => definir('open', false),
    valor: valorVivo,
    alterar: (v: unknown) => {
      const novo = v && typeof v === 'object' && 'target' in (v as object) ? (v as { target: { value: unknown } }).target.value : v;
      setValorVivo(novo);
      if (controles.some((c) => c.prop.nome === 'checked')) definir('checked', novo as boolean);
      if (controles.some((c) => c.prop.nome === 'value')) definir('value', novo as string);
    },
  };

  return (
    <div className="ob-demo">
      <div className="ob-demo__controles">
        {controles.filter((c) => c.tipo !== 'booleano').map((c) => {
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                definir(rotulo, c.tipo === 'numero' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)}
            />
          );
        })}
      </div>
      {controles.some((c) => c.tipo === 'booleano') && (
        <div className="ob-demo__opcoes">
          {controles.filter((c) => c.tipo === 'booleano').map((c) => (
            <Checkbox key={c.prop.nome} label={c.prop.nome} checked={!!valores[c.prop.nome]} onChange={(x: boolean) => definir(c.prop.nome, x)} />
          ))}
        </div>
      )}
      <div className="ob-playground">
        <div className="ob-playground__tabs">
          <Tabs tabs={[{ id: 'resultado', label: 'Resultado', icon: 'eye' }, { id: 'codigo', label: 'Código', icon: 'code' }]} active={aba} onChange={setAba} size="sm" />
        </div>
        <BrowserOnly fallback={<div className="ob-playground__preview" />}>
          {() => (
            <LiveProvider code={codigo} scope={scope} noInline={!!auxiliares} theme={temaCodigo}>
              <div hidden={aba !== 'resultado'} className="ob-playground__preview ob-demo__resultado">
                <LivePreview />
                <LiveError className="ob-playground__error" />
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
