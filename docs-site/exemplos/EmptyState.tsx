import { Button, EmptyState, Ph } from '@onblide/ui';

export const Padrao = () => (
  <EmptyState icon="folder-open" title="Nenhum projeto ainda" description="Crie o primeiro projeto para organizar tarefas e prazos da sua equipe." />
);

export const ComAcao = () => (
  <EmptyState
    icon="folder-open"
    title="Nenhum projeto ainda"
    description="Crie o primeiro projeto para organizar tarefas e prazos da sua equipe."
    action={<Button icon={<Ph n="plus" size={16} />}>Novo projeto</Button>}
  />
);

export const Busca = () => (
  <EmptyState icon="magnifying-glass" title="Nada encontrado" description="Tente outros termos ou remova os filtros aplicados." size="sm" />
);

export const SemIcone = () => (
  <EmptyState title="Sem notificações" description="Você está em dia." />
);
