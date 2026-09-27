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

// Prop obrigatória nunca some do código: vazia, vira string vazia (e o controle mostra o erro).
function atributo(c: Controle, v: Valor): string | null {
  const nome = c.prop.nome;
  if (v === undefined || v === '') return c.prop.obrigatoria && c.tipo !== 'booleano' ? `${nome}=""` : null;
  if (v === true) return nome;
  if (v === false) return `${nome}={false}`;
  if (typeof v === 'number') return `${nome}={${v}}`;
  return v.includes('"') ? `${nome}={${JSON.stringify(v)}}` : `${nome}="${v}"`;
}

// Componentes que ocupam a largura da página (tabela, abas) ou passam de 480px: o palco deles não é limitado.
const LARGOS = ['Table', 'Tabs', 'Spinner'];

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
    // Conteúdo interno em texto puro vira o valor inicial do controle `children`.
    if (filhos && !/[<{]/.test(filhos) && controles.some((c) => c.prop.nome === 'children')) ini.children = filhos;
    if (temProp('open') && !('open' in ini)) ini.open = false;
    return ini;
  };
  const [valores, setValores] = useState<Record<string, Valor>>(inicial);
  const [versao, setVersao] = useState(0);
  const [aba, setAba] = useState('resultado');
  const definir = (p: string, v: Valor) => setValores((a) => ({ ...a, [p]: v }));
  const restaurar = () => {
    setValores(inicial());
    setVersao((n) => n + 1);
  };

  // `value`/`checked` + `onChange`: o valor ao vivo (o que o usuário digita/marca dentro do preview) precisa
  // viver DENTRO do código avaliado pelo react-live (um `useState` local), nunca no estado do próprio
  // Playground. O `LiveProvider` do react-live re-executa `generateElement` a cada mudança de `scope`
  // (efeito com `scope` na lista de dependências) e essa função sempre cria uma classe de error boundary
  // nova — ou seja, qualquer mudança no objeto `scope` do Playground remonta a árvore inteira e derruba o
  // foco. Se o valor ficasse em `scope.valor`/estado do Playground, cada tecla digitada trocaria a
  // identidade de `scope` e remontaria o campo a cada caractere (bug observado no CodeInput: o input
  // nunca avançava para a próxima célula porque a célula era recriada antes do focus() ter efeito).
  const controlado = temProp('onChange') && (temProp('checked') || temProp('value'));
  const alvoLigado = temProp('checked') ? 'checked' : 'value';

  // Liga o estado da demo: fechar (onClose) atualiza o controle correspondente.
  const ligacoes: string[] = [];
  if (temProp('onClose') && temProp('open')) ligacoes.push('onClose={fechar}');
  if (controlado) {
    ligacoes.push(`${alvoLigado}={valor}`);
    ligacoes.push('onChange={alterar}');
  }

  const attrs = [
    ...controles
      .filter((c) => c.prop.nome !== 'children' && !(controlado && c.prop.nome === alvoLigado))
      .map((c) => atributo(c, valores[c.prop.nome])),
    ...Object.entries(brutos).filter(([k]) => !LIGADAS.includes(k)).map(([k, v]) => `${k}={${v}}`),
    ...ligacoes,
  ].filter(Boolean) as string[];
  const abre = attrs.length > 2 ? `<${nome}\n  ${attrs.join('\n  ')}\n` : `<${nome}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  // `children` editável substitui o conteúdo em texto; conteúdo com JSX continua o da demo.
  const controleFilhos = controles.some((c) => c.prop.nome === 'children');
  const textoFilhos = typeof valores.children === 'string' && valores.children !== '' ? valores.children : null;
  const conteudo = !controleFilhos ? filhos : textoFilhos ?? (/[<{]/.test(filhos ?? '') ? filhos : null);
  const elemento = conteudo ? `${abre}>\n  ${recuar(conteudo)}\n</${nome}>` : `${abre}${attrs.length > 2 ? '' : ' '}/>`;
  const jsx = moldura ? moldura.replace('__DEMO__', recuar(elemento, (moldura.split('__DEMO__')[0].match(/[ \t]*$/)?.[0].length ?? 0))) : elemento;
  // `valor`/`alterar` do estado ao vivo viram um `useState` local — mas hooks só podem ser chamados dentro
  // do corpo de um componente de verdade, nunca soltos no topo do código avaliado (o react-live roda o
  // `useState` de fora de qualquer render caso não esteja dentro de uma função componente). Por isso, quando
  // `controlado`, a demo inteira é envolvida num `function Demo() { ... }` que o `render(<Demo />)` final
  // efetivamente monta através do ciclo normal do React.
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
              error={erroDe(c)}
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
          <Button kind="ghost" size="sm" onClick={restaurar} icon={<Ph n="arrow-counter-clockwise" size={14} />}>Restaurar</Button>
        </div>
        <BrowserOnly fallback={<div className="ob-playground__preview" />}>
          {() => (
            <LiveProvider key={versao} code={codigo} scope={scope} noInline={usaNoInline} theme={temaCodigo}>
              {/* O atributo hidden fica num invólucro sem classe: nenhuma regra de CSS consegue anulá-lo. */}
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
