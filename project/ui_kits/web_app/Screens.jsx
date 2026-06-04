/* global React, Card, Badge, Button, Avatar, Icons, Input, Datepicker, Brands, BrandTile,
   Radio, RadioGroup, Toggle, Checkbox, Link, Skeleton, Pagination, Dropdown, Modal, Tooltip,
   Alert, ProgressBar, CodeInput, Tabs, Table */
const { useState, useEffect } = React;

// ============================================================
// Onblide Web App — screen views
// Every design-system component lives natively here, doing real
// product work — no showcase, no labels pointing at itself.
// ============================================================

const Kebab = () => <Icons.more size={18}/>;
const Caret = () => <Icons.caretD size={14}/>;

// ============================================================
// HOME / DASHBOARD
//   · Checkbox  → toggling today's tasks done/undone
//   · Link      → "Ver tudo"
//   · Tooltip   → explaining each metric
//   · Dropdown  → per-task row actions
//   · Modal     → "Nova tarefa" creation form
// ============================================================
const HomeScreen = () => {
  const [tasks, setTasks] = useState([
    { t: 'Revisar deck do trimestre',    done: true,  tone: 'blue',   tag: 'Documento' },
    { t: 'Alinhar com cliente Soluções', done: false, tone: 'orange', tag: 'Reunião' },
    { t: 'Publicar artigo do blog',      done: false, tone: 'green',  tag: 'Conteúdo' },
    { t: 'Atualizar CRM da semana',      done: false, tone: 'grey',   tag: 'Admin' },
  ]);
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [overdueAlert, setOverdueAlert] = useState(true);

  const toggle = (i) => {
    const was = tasks[i].done;
    setTasks(ts => ts.map((t, j) => j === i ? { ...t, done: !t.done } : t));
    if (!was) window.obToast?.({ tone: 'success', title: 'Concluída', body: tasks[i].t });
  };
  const addTask = () => {
    if (!draft.trim()) return;
    setTasks(ts => [...ts, { t: draft.trim(), done: false, tone: 'blue', tag: 'Nova' }]);
    window.obToast?.({ tone: 'success', title: 'Tarefa criada', body: draft.trim() });
    setDraft(''); setNewOpen(false);
  };

  const metrics = [
    { lbl: 'Em andamento', val: '12', delta: '+3', tone: 'blue',   tip: 'Tarefas iniciadas e ainda não concluídas.' },
    { lbl: 'Concluídas',   val: '48', delta: '+8', tone: 'green',  tip: 'Total concluído nos últimos 30 dias.' },
    { lbl: 'Atrasadas',    val: '2',  delta: '−1', tone: 'orange', tip: 'Passaram do prazo definido.' },
    { lbl: 'Foco',         val: '6h', delta: '2h restantes', tone: 'grey', tip: 'Tempo de foco planejado para a semana.' },
  ];

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: 'var(--ob-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>QUI · 8 MAI</div>
          <h2 style={{ margin: '6px 0 0', fontSize: 36, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>
            Bom dia, <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500, color: 'var(--ob-blue)' }}>Onblide</em>.
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--ob-fg-soft)' }}>Você tem {tasks.filter(t => !t.done).length} tarefas pendentes e 2 reuniões.</p>
        </div>
        <Button kind="primary" icon={<Icons.plus size={16}/>} onClick={() => setNewOpen(true)}>Nova tarefa</Button>
      </div>

      {overdueAlert && (
        <Alert tone="warning" title="2 tarefas com prazo hoje" dismissible onClose={() => setOverdueAlert(false)} action="Ver tarefas" onAction={() => setOverdueAlert(false)}>
          "Alinhar com cliente Soluções" e "Atualizar CRM da semana" vencem hoje.
        </Alert>
      )}

      {/* Metric tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {metrics.map((m, i) => (
          <Card key={i} elevation="border" padding={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Tooltip label={m.tip} placement="top" maxWidth={200}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ob-fg-soft)', cursor: 'default' }}>
                  {m.lbl}
                  <Icons.info size={13} style={{ color: 'var(--ob-fg-mute)', display: 'flex' }}/>
                </span>
              </Tooltip>
              <Dropdown align="right" trigger={
                <span style={{ color: 'var(--ob-fg-mute)', cursor: 'pointer', display: 'flex', padding: 2 }}><Kebab/></span>
              } items={[
                { label: 'Ver detalhes', icon: <Icons.chart size={16}/>, onClick: () => {} },
                { label: 'Fixar no topo', icon: <Icons.star size={16}/>, onClick: () => {} },
              ]} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em', lineHeight: 1 }}>{m.val}</div>
              <Badge tone={m.tone}>{m.delta}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Tasks + Agenda */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <Card elevation="border" padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ob-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Tarefas de hoje</h3>
            <Link href="#" onClick={(e) => e.preventDefault()}>Ver tudo →</Link>
          </div>
          {tasks.map((row, i) => (
            <div key={i} style={{
              padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14,
              borderBottom: i < tasks.length - 1 ? '1px solid var(--ob-line-soft)' : 'none',
            }}>
              <Checkbox checked={row.done} onChange={() => toggle(i)} />
              <div style={{ flex: 1, fontSize: 14, color: row.done ? 'var(--ob-fg-mute)' : 'var(--ob-fg-strong)', textDecoration: row.done ? 'line-through' : 'none' }}>{row.t}</div>
              <Badge tone={row.tone}>{row.tag}</Badge>
              <Dropdown align="right" trigger={
                <span style={{ color: 'var(--ob-fg-mute)', cursor: 'pointer', display: 'flex', padding: 2 }}><Kebab/></span>
              } items={[
                { label: 'Editar', icon: <Icons.file size={16}/>, onClick: () => {} },
                { label: 'Adiar 1 dia', icon: <Icons.calendar size={16}/>, onClick: () => {} },
                { divider: true },
                { label: 'Remover', icon: <Icons.x size={16}/>, danger: true, onClick: () => setTasks(ts => ts.filter((_, j) => j !== i)) },
              ]} />
            </div>
          ))}
        </Card>

        <Card elevation="border" padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ob-border)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Agenda</h3>
          </div>
          {[
            { time: '10:00', title: 'Stand-up', dur: '30 min', accent: 'var(--ob-blue)', who: 'Equipe de produto' },
            { time: '13:30', title: 'Cliente Soluções', dur: '1h', accent: 'var(--ob-orange)', who: 'Maria · João' },
            { time: '16:00', title: 'Revisão de design', dur: '45 min', accent: 'var(--ob-green)', who: 'Design + Eng' },
          ].map((e, i) => (
            <Tooltip key={i} label={e.who} placement="left">
              <div style={{ padding: '14px 20px', display: 'flex', gap: 12, borderBottom: i < 2 ? '1px solid var(--ob-line-soft)' : 'none', cursor: 'default', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: 4, borderRadius: 2, background: e.accent, flex: 'none' }}/>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ob-fg-soft)' }}>{e.time} · {e.dur}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', marginTop: 2 }}>{e.title}</div>
                </div>
              </div>
            </Tooltip>
          ))}
        </Card>
      </div>

      {/* Modal — create new task */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Nova tarefa"
        footer={<>
          <Button kind="secondary" onClick={() => setNewOpen(false)}>Cancelar</Button>
          <Button kind="primary" onClick={addTask}>Criar tarefa</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Título da tarefa" placeholder="Ex: Revisar proposta" value={draft}
            onChange={(e) => setDraft(e.target.value)} autoFocus />
          <Input label="Responsável" placeholder="Atribuir a…" defaultValue="Onblide" />
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// TASKS / KANBAN
//   · Datepicker → period filter
//   · Checkbox   → mark card complete
//   · Dropdown   → per-card actions (edit / duplicate / delete)
//   · Modal      → delete confirmation
//   · Tooltip    → assignee name on avatar
// ============================================================
const TasksScreen = () => {
  const [filterDates, setFilterDates] = useState({ startDate: null, endDate: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cols = [
    { id: 'todo',  title: 'A fazer',      accent: 'var(--ob-fg-mute)' },
    { id: 'doing', title: 'Em andamento', accent: 'var(--ob-blue)' },
    { id: 'review',title: 'Revisão',      accent: 'var(--ob-orange)' },
    { id: 'done',  title: 'Concluído',    accent: 'var(--ob-green)' },
  ];
  const initial = {
    todo: [
      { t: 'Mapa de jornada',     tag: 'Pesquisa', tone: 'blue',  who: 'Onblide' },
      { t: 'Checklist de QA',     tag: 'Dev',      tone: 'grey',  who: 'Lucas M.' },
      { t: 'Pauta da newsletter', tag: 'Conteúdo', tone: 'green', who: 'Rita T.' },
      { t: 'Briefing financeiro', tag: 'Admin',    tone: 'orange',who: 'Ana C.' },
    ],
    doing: [
      { t: 'Wireframes do dashboard', tag: 'Design', tone: 'blue',  who: 'Onblide' },
      { t: 'API de pagamentos',       tag: 'Dev',    tone: 'grey',  who: 'Lucas M.' },
      { t: 'Roteiro do vídeo',        tag: 'Conteúdo', tone: 'green',who: 'Rita T.' },
    ],
    review: [
      { t: 'Landing v2',    tag: 'Design', tone: 'blue',   who: 'Onblide' },
      { t: 'Termos de uso', tag: 'Legal',  tone: 'orange', who: 'Ana C.' },
    ],
    done: [
      { t: 'Auditoria de tipografia', tag: 'Design', tone: 'blue',  who: 'Onblide' },
      { t: 'Migração do banco',       tag: 'Dev',    tone: 'grey',  who: 'Lucas M.' },
      { t: 'Onboarding refeito',      tag: 'UX',     tone: 'blue',  who: 'Rita T.' },
      { t: 'Pesquisa com usuários',   tag: 'Pesquisa', tone: 'green',who: 'Ana C.' },
      { t: 'Plano editorial Q3',      tag: 'Conteúdo', tone: 'green',who: 'Rita T.' },
    ],
  };
  const [board, setBoard] = useState(initial);
  const [doneCards, setDoneCards] = useState({});

  const avatarColor = (who) => ({ 'Onblide': 'var(--ob-blue)', 'Lucas M.': 'var(--ob-orange)', 'Rita T.': 'var(--ob-green)', 'Ana C.': 'var(--ob-fg)' }[who] || 'var(--ob-blue)');
  const initials = (who) => who.split(' ').map(w => w[0]).join('').slice(0, 2);

  const removeCard = (colId, idx) => {
    setBoard(b => ({ ...b, [colId]: b[colId].filter((_, j) => j !== idx) }));
    setConfirmDelete(null);
  };
  const duplicateCard = (colId, idx) => {
    setBoard(b => {
      const col = [...b[colId]];
      col.splice(idx + 1, 0, { ...col[idx] });
      return { ...b, [colId]: col };
    });
  };
  const total = Object.values(board).reduce((s, c) => s + c.length, 0);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Tarefas</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--ob-fg-soft)', fontSize: 14 }}>{total} tarefas · 4 colunas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button kind="secondary" icon={<Icons.calendar size={16}/>}>Semana</Button>
          <Button kind="primary" icon={<Icons.plus size={16}/>}>Adicionar</Button>
        </div>
      </div>

      <div style={{ marginBottom: 24, maxWidth: 420 }}>
        <Datepicker
          label="Filtrar por período"
          singleDate={false}
          startDateLabel="de" endDateLabel="até"
          clearLabel="Limpar" submitLabel="Aplicar filtro"
          values={filterDates}
          onChange={setFilterDates}
          onClear={() => setFilterDates({ startDate: null, endDate: null })}
          onSubmit={(start, end) => setFilterDates({ startDate: start, endDate: end })}
        />
        {filterDates.startDate && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge tone="blue">{filterDates.startDate}{filterDates.endDate ? ` → ${filterDates.endDate}` : ' → ?'}</Badge>
            <Link href="#" variant="quiet" onClick={(e) => { e.preventDefault(); setFilterDates({ startDate: null, endDate: null }); }}>Limpar filtro ×</Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {cols.map(c => (
          <div key={c.id} style={{ background: 'var(--ob-bg-warm)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.accent }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{c.title}</span>
              <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)' }}>{board[c.id].length}</span>
            </div>
            {board[c.id].map((card, i) => {
              const key = `${c.id}-${i}-${card.t}`;
              const isDone = doneCards[key];
              return (
                <Card key={key} elevation="border" padding={14}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div style={{ marginTop: 1 }}>
                      <Checkbox checked={!!isDone} onChange={(v) => setDoneCards(s => ({ ...s, [key]: v }))} />
                    </div>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: isDone ? 'var(--ob-fg-mute)' : 'var(--ob-fg-strong)', textDecoration: isDone ? 'line-through' : 'none' }}>{card.t}</div>
                    <Dropdown align="right" trigger={
                      <span style={{ color: 'var(--ob-fg-mute)', cursor: 'pointer', display: 'flex' }}><Kebab/></span>
                    } items={[
                      { label: 'Editar', icon: <Icons.file size={16}/>, onClick: () => {} },
                      { label: 'Duplicar', icon: <Icons.folder size={16}/>, onClick: () => duplicateCard(c.id, i) },
                      { divider: true },
                      { label: 'Excluir', icon: <Icons.x size={16}/>, danger: true, onClick: () => setConfirmDelete({ colId: c.id, idx: i, name: card.t }) },
                    ]} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge tone={card.tone}>{card.tag}</Badge>
                    <Tooltip label={card.who} placement="top">
                      <span style={{ display: 'flex', cursor: 'default' }}><Avatar name={initials(card.who)} size={22} color={avatarColor(card.who)}/></span>
                    </Tooltip>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir tarefa?"
        footer={<>
          <Button kind="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button kind="danger" onClick={() => removeCard(confirmDelete.colId, confirmDelete.idx)}>Excluir</Button>
        </>}>
        A tarefa <strong style={{ color: 'var(--ob-fg-strong)' }}>"{confirmDelete?.name}"</strong> será removida permanentemente. Esta ação não pode ser desfeita.
      </Modal>
    </div>
  );
};

// ============================================================
// METRICS
//   · Datepicker → date-range selector (drives "loading")
//   · Dropdown   → export menu
//   · Skeleton   → loading state while data refreshes
//   · Tooltip    → metric definition
//   · Pagination → "Top páginas" table pager
// ============================================================
const MetricsScreen = () => {
  const [range, setRange] = useState({ startDate: null, endDate: null });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'views', dir: 'desc' });

  // initial load + reload whenever the range is applied
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, [range.startDate, range.endDate]);

  const Sparkline = ({ pts, color }) => {
    const max = Math.max(...pts), min = Math.min(...pts);
    const w = 280, h = 70, pad = 6;
    const path = pts.map((p, i) => {
      const x = pad + (i / (pts.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((p - min) / (max - min || 1)) * (h - 2 * pad);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return (
      <svg width={w} height={h} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={`${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill={color} opacity="0.12"/>
      </svg>
    );
  };
  const Bars = ({ data, color }) => {
    const max = Math.max(...data);
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: color, borderRadius: '6px 6px 0 0', minHeight: 4 }}/>
            <div style={{ fontSize: 10, color: 'var(--ob-fg-mute)' }}>{['S','T','Q','Q','S','S','D'][i]}</div>
          </div>
        ))}
      </div>
    );
  };

  const cards = [
    { lbl: 'Sessões',   val: '2.847',   delta: '↑ 18,2%', tone: 'var(--ob-green)',  pts: [20,22,28,25,30,33,38,42,40,46,52,58], tip: 'Visitas únicas no período selecionado.' },
    { lbl: 'Conversão', val: '4,8%',    delta: '↓ 0,3%',  tone: 'var(--ob-orange)', pts: [5.1,4.9,5,4.8,4.6,4.5,4.7,4.6,4.4,4.5,4.7,4.8], tip: 'Percentual de sessões que viraram cadastro.' },
    { lbl: 'Receita',   val: 'R$ 38,4k',delta: '↑ R$ 5,2k',tone: 'var(--ob-blue)',  pts: [28,30,29,32,31,33,35,34,36,37,38,38.4], tip: 'Receita reconhecida no período.' },
  ];

  const pages = [
    { path: '/', views: '8.241', rate: '62%' },
    { path: '/precos', views: '4.018', rate: '48%' },
    { path: '/blog/design-system', views: '3.527', rate: '71%' },
    { path: '/sobre', views: '2.106', rate: '39%' },
    { path: '/contato', views: '1.842', rate: '55%' },
    { path: '/carreiras', views: '1.330', rate: '44%' },
    { path: '/docs/datepicker', views: '1.205', rate: '68%' },
    { path: '/produto', views: '980', rate: '51%' },
    { path: '/changelog', views: '742', rate: '60%' },
    { path: '/status', views: '512', rate: '33%' },
  ];
  const perPage = 4;
  const totalPages = Math.ceil(pages.length / perPage);
  const pageRows = pages.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Métricas</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--ob-fg-soft)', fontSize: 14 }}>
            {range.startDate ? `${range.startDate}${range.endDate ? ` → ${range.endDate}` : ''}` : 'Últimos 30 dias'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ width: 320 }}>
            <Datepicker singleDate={false} startDateLabel="de" endDateLabel="até"
              clearLabel="Limpar" submitLabel="Aplicar" values={range}
              onChange={setRange}
              onClear={() => setRange({ startDate: null, endDate: null })}
              onSubmit={(s, e) => setRange({ startDate: s, endDate: e })} />
          </div>
          <Dropdown align="right" trigger={<Button kind="secondary" icon={<Caret/>}>Exportar</Button>} items={[
            { label: 'Baixar CSV', icon: <Icons.file size={16}/>, onClick: () => {} },
            { label: 'Baixar PDF', icon: <Icons.file size={16}/>, onClick: () => {} },
            { divider: true },
            { label: 'Agendar relatório', icon: <Icons.calendar size={16}/>, onClick: () => {} },
          ]} />
        </div>
      </div>

      {/* Metric cards — Skeleton while loading, Tooltip on label */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {loading ? [0, 1, 2].map(i => (
          <Card key={i} padding={20}>
            <Skeleton width="40%" height={13} style={{ marginBottom: 12 }} />
            <Skeleton width="55%" height={30} style={{ marginBottom: 10 }} />
            <Skeleton width="35%" height={13} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={70} radius={8} />
          </Card>
        )) : cards.map((c, i) => (
          <Card key={i} padding={20}>
            <Tooltip label={c.tip} placement="top" maxWidth={210}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ob-fg-soft)', marginBottom: 6, cursor: 'default' }}>
                {c.lbl}
                <Icons.info size={13} style={{ color: 'var(--ob-fg-mute)' }}/>
              </span>
            </Tooltip>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>{c.val}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.tone, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{c.delta} vs período anterior</div>
            <div style={{ marginTop: 12 }}><Sparkline pts={c.pts} color={c.tone}/></div>
          </Card>
        ))}
      </div>

      {/* Activity chart */}
      <Card padding={24}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Atividade da semana</h3>
          <Dropdown align="right" trigger={<Button kind="secondary" size="sm" icon={<Caret/>}>Esta semana</Button>} items={[
            { label: 'Esta semana', onClick: () => {} },
            { label: 'Semana anterior', onClick: () => {} },
            { label: 'Últimos 30 dias', onClick: () => {} },
          ]} />
        </div>
        {loading ? <Skeleton width="100%" height={120} radius={8} /> : <Bars data={[42, 58, 72, 65, 88, 35, 24]} color="var(--ob-blue)"/>}
      </Card>

      {/* Weekly goals — ProgressBar */}
      {!loading && (
        <Card padding={24}>
          <h3 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Metas da semana</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Sessões',     current: 2847, goal: 3500, tone: 'info' },
              { label: 'Conversões',  current: 136,  goal: 200,  tone: 'success' },
              { label: 'Receita',     current: 38400, goal: 50000, tone: 'info', fmt: (v) => `R$ ${(v/1000).toFixed(0)}k` },
            ].map((g, i) => {
              const pct = Math.round((g.current / g.goal) * 100);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{g.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)' }}>
                      {g.fmt ? g.fmt(g.current) : g.current.toLocaleString('pt-BR')} / {g.fmt ? g.fmt(g.goal) : g.goal.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <ProgressBar value={pct} tone={g.tone} size="md" showLabel />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Top pages table — Table + Pagination */}
      <Card padding={0}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--ob-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Top páginas</h3>
          <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)' }}>{pages.length} páginas</span>
        </div>
        <div style={{ padding: 0, borderRadius: '0 0 var(--ob-r-lg) var(--ob-r-lg)', overflow: 'hidden' }}>
          <Table
            loading={loading}
            sort={sort}
            onSort={(key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}
            columns={[
              { key: 'path',  label: 'Página',       bold: true },
              { key: 'views', label: 'Visualizações', sortable: true },
              { key: 'rate',  label: 'Conversão',
                render: (v) => <Badge tone={parseInt(v) > 55 ? 'green' : 'grey'}>{v}</Badge> },
            ]}
            rows={pageRows}
            emptyState="Nenhuma página encontrada."
          />
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--ob-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)' }}>Página {page} de {totalPages}</span>
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// SETTINGS
//   Tabs switch real content:
//   · Conta         → Input + Avatar + Link
//   · Notificações  → RadioGroup (frequency) + Checkbox (channels) + Toggle
//   · Cobrança      → RadioGroup (plan) + Modal (confirm change)
//   · Workspace     → Input + Toggle preferences
// ============================================================
const SettingsScreen = () => {
  const [tab, setTab] = useState('account');
  const tabs = [
    { id: 'account',       label: 'Conta' },
    { id: 'workspace',     label: 'Workspace' },
    { id: 'notifications', label: 'Notificações' },
    { id: 'billing',       label: 'Cobrança' },
  ];

  // notifications state
  const [freq, setFreq] = useState('daily');
  const [channels, setChannels] = useState({ email: true, push: false, slack: true });
  const [sounds, setSounds] = useState(true);
  // workspace prefs
  const [prefs, setPrefs] = useState({ dark: false, digest: true, beta: false });
  // billing
  const [plan, setPlan] = useState('pro');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [twoFAStep, setTwoFAStep] = useState('off'); // 'off' | 'verify' | 'active'
  const [twoFACode, setTwoFACode] = useState('');
  const [emailAlertVisible, setEmailAlertVisible] = useState(true);

  const allCh = channels.email && channels.push && channels.slack;
  const someCh = (channels.email || channels.push || channels.slack) && !allCh;

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Ajustes</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--ob-fg-soft)', fontSize: 14 }}>Gerencie sua conta e preferências.</p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} variant="line"/>

      {/* ── CONTA ── */}
      {tab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {emailAlertVisible && (
            <Alert tone="warning" title="E-mail não verificado" dismissible onClose={() => setEmailAlertVisible(false)} action="Reenviar link" onAction={() => { setEmailAlertVisible(false); window.obToast?.({ tone: 'info', title: 'Link reenviado', body: 'Verifique contato@onblide.com.' }); }}>
              Confirme seu e-mail para ativar notificações e recuperação de conta.
            </Alert>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card padding={24}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Perfil</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <Avatar name="OB" size={56} color="#0a4ee4"/>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>Onblide</div>
                <Link href="#" onClick={(e) => e.preventDefault()}>Alterar foto</Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Nome de exibição" defaultValue="Onblide" />
              <Input label="E-mail" defaultValue="contato@onblide.com" hint="Usado para login e recuperação." />
            </div>
          </Card>
          <Card padding={24}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Segurança</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Senha atual" type="password" defaultValue="••••••••" />
              <Input label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" />
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ob-fg-soft)' }}>
              Precisa de ajuda? Leia o <Link href="#" onClick={(e) => e.preventDefault()}>guia de segurança</Link>.
            </div>
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--ob-line-soft)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>Autenticação em 2 fatores</div>
                  <div style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2 }}>
                    {twoFAStep === 'active' ? 'Ativo · via app autenticador' : 'Aumenta a segurança da conta'}
                  </div>
                </div>
                {twoFAStep === 'active'
                  ? <Badge tone="green">Ativo</Badge>
                  : <Button kind="secondary" size="sm" onClick={() => setTwoFAStep('verify')}>Ativar 2FA</Button>}
              </div>
              {twoFAStep === 'verify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Alert tone="info">Abra o autenticador e insira o código de 6 dígitos para confirmar.</Alert>
                  <CodeInput
                    length={6}
                    value={twoFACode}
                    status={twoFACode.length === 6 ? 'success' : 'default'}
                    onChange={(v) => {
                      setTwoFACode(v);
                      if (v.length === 6) setTimeout(() => {
                        setTwoFAStep('active'); setTwoFACode('');
                        window.obToast?.({ tone: 'success', title: '2FA ativado', body: 'Conta mais segura.' });
                      }, 450);
                    }}
                  />
                  <Button kind="secondary" size="sm" onClick={() => { setTwoFAStep('off'); setTwoFACode(''); }}>Cancelar</Button>
                </div>
              )}
            </div>
          </Card>
          </div>
        </div>
      )}

      {/* ── WORKSPACE ── */}
      {tab === 'workspace' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card padding={24}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Workspace</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Nome do workspace" defaultValue="Onblide" />
              <Input label="URL" defaultValue="onblide.app/w/onblide" hint="Identificador público do workspace." />
            </div>
          </Card>
          <Card padding={24}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Preferências</h3>
            {[
              { key: 'dark',   lbl: 'Tema escuro',     desc: 'Reduz brilho à noite' },
              { key: 'digest', lbl: 'Resumo diário',   desc: 'Enviado às 8h' },
              { key: 'beta',   lbl: 'Beta features',   desc: 'Veja recursos antes' },
            ].map((row, i) => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--ob-line-soft)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{row.lbl}</div>
                  <div style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2 }}>{row.desc}</div>
                </div>
                <Toggle checked={prefs[row.key]} onChange={(v) => setPrefs(p => ({ ...p, [row.key]: v }))} />
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── NOTIFICAÇÕES ── */}
      {tab === 'notifications' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card padding={24}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Frequência</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ob-fg-soft)' }}>Com que frequência avisamos você.</p>
            <RadioGroup name="freq" value={freq} onChange={setFreq} options={[
              { value: 'realtime', label: 'Tempo real', description: 'Assim que algo acontece' },
              { value: 'daily',    label: 'Resumo diário', description: 'Uma vez por dia, às 8h' },
              { value: 'weekly',   label: 'Resumo semanal', description: 'Toda segunda de manhã' },
            ]} />
          </Card>
          <Card padding={24}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Canais</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Checkbox checked={allCh} indeterminate={someCh} onChange={(v) => setChannels({ email: v, push: v, slack: v })} label="Todos os canais" />
              <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Checkbox checked={channels.email} onChange={(v) => setChannels(s => ({ ...s, email: v }))} label="E-mail" />
                <Checkbox checked={channels.push}  onChange={(v) => setChannels(s => ({ ...s, push: v }))}  label="Push no navegador" />
                <Checkbox checked={channels.slack} onChange={(v) => setChannels(s => ({ ...s, slack: v }))} label="Slack" />
              </div>
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--ob-line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>Sons do app</div>
                <div style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2 }}>Tocar ao receber notificação</div>
              </div>
              <Toggle checked={sounds} onChange={setSounds} />
            </div>
          </Card>
        </div>
      )}

      {/* ── COBRANÇA ── */}
      {tab === 'billing' && (
        <Card padding={24}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Plano</h3>
            <Badge tone="blue">Atual: {plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Team'}</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { id: 'free', name: 'Free',  price: 'R$ 0',   desc: '1 projeto · recursos básicos' },
              { id: 'pro',  name: 'Pro',   price: 'R$ 49',  desc: 'Projetos ilimitados · suporte' },
              { id: 'team', name: 'Team',  price: 'R$ 129', desc: 'Colaboração · permissões' },
            ].map(p => (
              <label key={p.id} onClick={() => p.id !== plan && setPendingPlan(p.id)} style={{
                border: `1.5px solid ${plan === p.id ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                background: plan === p.id ? 'var(--ob-blue-050)' : 'var(--ob-surface)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Radio name="plan" value={p.id} checked={plan === p.id} onChange={() => p.id !== plan && setPendingPlan(p.id)} label={p.name} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>{p.price}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ob-fg-soft)' }}>/mês</span></div>
                <div style={{ fontSize: 12, color: 'var(--ob-fg-soft)', lineHeight: 1.5 }}>{p.desc}</div>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ob-fg-soft)' }}>
            Veja a comparação completa na <Link href="#" external onClick={(e) => e.preventDefault()}>página de planos</Link>.
          </div>

          {/* Storage quota */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--ob-line-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>Armazenamento</span>
              <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)' }}>
                8,2 GB de {plan === 'free' ? '5 GB' : plan === 'pro' ? '50 GB' : '500 GB'}
              </span>
            </div>
            <ProgressBar
              value={plan === 'free' ? 100 : plan === 'pro' ? 16 : 2}
              tone={plan === 'free' ? 'danger' : 'info'}
              size="md"
              showLabel
            />
            {plan === 'free' && (
              <div style={{ marginTop: 12 }}>
                <Alert tone="danger" title="Limite atingido">Faça upgrade para continuar recebendo arquivos e dados.</Alert>
              </div>
            )}
          </div>

          <Modal open={!!pendingPlan} onClose={() => setPendingPlan(null)} title="Alterar plano?"
            footer={<>
              <Button kind="secondary" onClick={() => setPendingPlan(null)}>Cancelar</Button>
              <Button kind="primary" onClick={() => { setPlan(pendingPlan); setPendingPlan(null); }}>Confirmar</Button>
            </>}>
            Você está mudando para o plano <strong style={{ color: 'var(--ob-fg-strong)' }}>{pendingPlan === 'free' ? 'Free' : pendingPlan === 'pro' ? 'Pro' : 'Team'}</strong>. A cobrança será ajustada no próximo ciclo.
          </Modal>
        </Card>
      )}
    </div>
  );
};

// ============================================================
// INTEGRATIONS HUB
//   Spotify is the featured, already-connected integration.
//   · BrandTile → authentic brand logos
//   · Toggle    → enable/disable a connected service
//   · Badge     → connection status
//   · Dropdown  → per-integration actions (sync / configure / disconnect)
//   · Modal     → connect consent + disconnect confirmation
//   · Tooltip   → last-sync detail
//   · Link      → docs
// ============================================================
const IntegrationsScreen = () => {
  // which services are connected
  const [conn, setConn] = useState({ spotify: true, slack: true, github: false, notion: false, figma: true, dropbox: false, discord: false });
  // enabled toggle per connected service
  const [enabled, setEnabled] = useState({ spotify: true, slack: true, figma: false });
  const [connectTarget, setConnectTarget] = useState(null); // brand key pending connect
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [filter, setFilter] = useState('Todos');

  const order = ['slack', 'notion', 'figma', 'github', 'dropbox', 'discord'];
  const cats = ['Todos', 'Comunicação', 'Produtividade', 'Desenvolvimento', 'Armazenamento', 'Design'];

  const connectedCount = Object.values(conn).filter(Boolean).length;

  const doConnect = (key) => {
    setConn(c => ({ ...c, [key]: true }));
    setEnabled(e => ({ ...e, [key]: true }));
    setConnectTarget(null);
    window.obToast?.({ tone: 'success', title: `${Brands[key].name} conectado`, body: 'Sincronização iniciada.' });
  };
  const doDisconnect = (key) => {
    setConn(c => ({ ...c, [key]: false }));
    setEnabled(e => { const n = { ...e }; delete n[key]; return n; });
    setDisconnectTarget(null);
    window.obToast?.({ tone: 'warning', title: `${Brands[key].name} desconectado` });
  };

  const list = order.filter(k => filter === 'Todos' || Brands[k].cat === filter);

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Integrações</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--ob-fg-soft)', fontSize: 14 }}>
            {connectedCount} conectadas · conecte suas ferramentas favoritas ao Onblide.
          </p>
        </div>
        <Button kind="secondary" icon={<Icons.link size={16}/>}>Solicitar integração</Button>
      </div>

      {/* ── Featured / connected: Spotify ── */}
      <Card padding={0} elevation="shadow" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 24, background: 'linear-gradient(90deg, rgba(29,185,84,0.10), transparent 60%)' }}>
          <BrandTile brand="spotify" size={64}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>Spotify</h3>
              <Badge tone="green">Conectado</Badge>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--ob-fg-soft)' }}>
              {Brands.spotify.desc}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{enabled.spotify ? 'Ativo' : 'Pausado'}</span>
              <Toggle checked={!!enabled.spotify} onChange={(v) => setEnabled(e => ({ ...e, spotify: v }))}/>
            </div>
            <Dropdown align="right" trigger={
              <button style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid var(--ob-border)', background: 'var(--ob-surface)', color: 'var(--ob-fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.more size={18}/>
              </button>
            } items={[
              { label: 'Sincronizar agora', icon: <Icons.sync size={16}/>, onClick: () => {} },
              { label: 'Configurar', icon: <Icons.gear size={16}/>, onClick: () => {} },
              { divider: true },
              { label: 'Desconectar', icon: <Icons.x size={16}/>, danger: true, onClick: () => setDisconnectTarget('spotify') },
            ]}/>
          </div>
        </div>
        {/* connection detail strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '14px 24px', borderTop: '1px solid var(--ob-border)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Avatar name="OB" size={26} color="#1DB954"/>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.2 }}>onblide@spotify.com</div>
              <div style={{ fontSize: 11, color: 'var(--ob-fg-soft)' }}>Conta vinculada</div>
            </div>
          </div>
          <Tooltip label="Última sincronização há 4 minutos" placement="top">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ob-fg-soft)', cursor: 'default' }}>
              <span style={{ color: 'var(--ob-green)', display: 'flex' }}><Icons.sync size={15}/></span>
              42 playlists sincronizadas
            </span>
          </Tooltip>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ob-fg-soft)' }}>
            <span style={{ color: 'var(--ob-blue)', display: 'flex' }}><Icons.check size={15}/></span>
            Permissões: leitura de biblioteca
          </span>
          <Link href="#" variant="quiet" onClick={(e) => e.preventDefault()} style={{ marginLeft: 'auto' }}>Ver documentação →</Link>
        </div>
      </Card>

      {/* ── Category filter ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${filter === c ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
            background: filter === c ? 'var(--ob-blue)' : 'var(--ob-surface)',
            color: filter === c ? '#fff' : 'var(--ob-fg)',
          }}>{c}</button>
        ))}
      </div>

      {/* ── Available integrations grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {list.map(key => {
          const b = Brands[key];
          const isConn = conn[key];
          return (
            <Card key={key} padding={20} elevation="border" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                <BrandTile brand={key} size={46}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{b.name}</span>
                    {isConn && <Badge tone="green">Conectado</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ob-fg-mute)', marginTop: 3 }}>{b.cat}</div>
                </div>
                {isConn && (
                  <Dropdown align="right" trigger={
                    <span style={{ color: 'var(--ob-fg-mute)', cursor: 'pointer', display: 'flex', padding: 2 }}><Icons.more size={18}/></span>
                  } items={[
                    { label: 'Sincronizar agora', icon: <Icons.sync size={16}/>, onClick: () => {} },
                    { label: 'Configurar', icon: <Icons.gear size={16}/>, onClick: () => {} },
                    { divider: true },
                    { label: 'Desconectar', icon: <Icons.x size={16}/>, danger: true, onClick: () => setDisconnectTarget(key) },
                  ]}/>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ob-fg-soft)', lineHeight: 1.5, minHeight: 38 }}>{b.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--ob-line-soft)' }}>
                {isConn ? (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 600, color: enabled[key] ? 'var(--ob-fg-strong)' : 'var(--ob-fg-soft)' }}>
                      {enabled[key] ? 'Ativo' : 'Pausado'}
                    </span>
                    <Toggle checked={!!enabled[key]} onChange={(v) => setEnabled(e => ({ ...e, [key]: v }))}/>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--ob-fg-mute)' }}>Não conectado</span>
                    <Button kind="secondary" size="sm" icon={<Icons.plus size={14}/>} onClick={() => setConnectTarget(key)}>Conectar</Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Connect consent modal */}
      <Modal open={!!connectTarget} onClose={() => setConnectTarget(null)}
        title={connectTarget ? `Conectar ${Brands[connectTarget].name}` : ''}
        footer={<>
          <Button kind="secondary" onClick={() => setConnectTarget(null)}>Cancelar</Button>
          <Button kind="primary" onClick={() => doConnect(connectTarget)}>Autorizar e conectar</Button>
        </>}>
        {connectTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <BrandTile brand={connectTarget} size={48}/>
              <Icons.link size={18}/>
              <Logo size={24}/>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ob-fg)', lineHeight: 1.55 }}>
              O Onblide poderá acessar dados do seu <strong style={{ color: 'var(--ob-fg-strong)' }}>{Brands[connectTarget].name}</strong> para {Brands[connectTarget].desc.toLowerCase()}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--ob-bg-warm)', borderRadius: 10, padding: 14 }}>
              {['Ler informações do seu perfil', 'Acessar conteúdo relacionado', 'Receber atualizações em tempo real'].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ob-fg)' }}>
                  <span style={{ color: 'var(--ob-green)', display: 'flex' }}><Icons.check size={15}/></span>{p}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Disconnect confirmation modal */}
      <Modal open={!!disconnectTarget} onClose={() => setDisconnectTarget(null)}
        title="Desconectar integração?"
        footer={<>
          <Button kind="secondary" onClick={() => setDisconnectTarget(null)}>Cancelar</Button>
          <Button kind="danger" onClick={() => doDisconnect(disconnectTarget)}>Desconectar</Button>
        </>}>
        {disconnectTarget && (
          <span>
            O <strong style={{ color: 'var(--ob-fg-strong)' }}>{Brands[disconnectTarget].name}</strong> será desvinculado e a sincronização de dados será interrompida. Você pode reconectar a qualquer momento.
          </span>
        )}
      </Modal>
    </div>
  );
};

Object.assign(window, { HomeScreen, TasksScreen, MetricsScreen, SettingsScreen, IntegrationsScreen });
