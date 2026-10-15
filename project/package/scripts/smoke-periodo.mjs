import { formatarPeriodo } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const igual = (a, b, msg) => {
  if (a !== b) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
};
const d = (a, m, dia) => new Date(a, m - 1, dia);
const hoje = d(2026, 10, 14);
const f = (i, e) => formatarPeriodo(i, e, { hoje });

igual(f(d(2026, 8, 1), d(2026, 10, 31)), 'Agosto - Outubro', 'meses fechados no ano atual omitem o ano');
igual(f(d(2026, 9, 1), d(2027, 1, 31)), 'Setembro, 2026 - Janeiro, 2027', 'meses fechados entre anos mostram o ano nas duas pontas');
igual(f(d(2026, 8, 5), d(2026, 10, 14)), '05 Agosto - 14 Outubro', 'período quebrado no ano atual mostra dia e mês');
igual(f(d(2026, 9, 2), d(2027, 1, 31)), '02 Setembro, 2026 - 31 Janeiro, 2027', 'período quebrado entre anos mostra dia, mês e ano');
igual(f(d(2025, 8, 1), d(2025, 10, 31)), 'Agosto, 2025 - Outubro, 2025', 'mesmo ano que não é o atual mostra o ano nas duas pontas');
igual(f(d(2025, 8, 5), d(2025, 10, 14)), '05 Agosto, 2025 - 14 Outubro, 2025', 'período quebrado em ano passado mostra o ano nas duas pontas');
igual(f(d(2026, 8, 1), d(2026, 8, 31)), 'Agosto', 'um único mês fechado aparece uma vez');
igual(f(d(2025, 8, 1), d(2025, 8, 31)), 'Agosto, 2025', 'um único mês fechado de outro ano leva o ano');
igual(f(d(2026, 8, 5), d(2026, 8, 5)), '05 Agosto', 'um único dia aparece uma vez');
igual(f(d(2026, 2, 1), d(2026, 2, 28)), 'Fevereiro', 'fevereiro fecha no dia 28');
igual(f(d(2028, 2, 1), d(2028, 2, 29)), 'Fevereiro, 2028', 'fevereiro bissexto fecha no dia 29');
igual(f(d(2026, 8, 1), d(2026, 10, 30)), '01 Agosto - 30 Outubro', 'termina um dia antes do fim do mês: não é fechado');
igual(f(d(2026, 8, 2), d(2026, 10, 31)), '02 Agosto - 31 Outubro', 'começa depois do dia 1: não é fechado');
igual(f(d(2026, 10, 31), d(2026, 8, 1)), 'Agosto - Outubro', 'pontas invertidas são ordenadas');
igual(f(null, d(2026, 8, 1)), '', 'sem início devolve texto vazio');
igual(f(d(2026, 8, 1), null), '', 'sem fim devolve texto vazio');
igual(formatarPeriodo(new Date(), new Date()) === formatarPeriodo(new Date(), new Date(), { hoje: new Date() }), true, 'hoje padrão é a data atual');

console.log('smoke-periodo ok');
