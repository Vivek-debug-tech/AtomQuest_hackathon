-- Add workflow tables needed for approvals, quarterly check-ins, shared goals, and escalations.
-- Migration: 003_add_portal_workflow_tables.sql

create table if not exists public.goal_approvals (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals (id) on delete cascade,
  requester_id text not null,
  approver_id text,
  approver_role text,
  status text not null default 'Pending',
  comments text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists idx_goal_approvals_goal_id on public.goal_approvals (goal_id);
create index if not exists idx_goal_approvals_status on public.goal_approvals (status);

create table if not exists public.goal_checkins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals (id) on delete cascade,
  quarter_key text not null,
  actual_achievement numeric not null default 0,
  planned_target numeric not null default 0,
  progress numeric not null default 0,
  status text not null default 'Not Started',
  comments text not null,
  manager_comments text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_goal_checkins_goal_id on public.goal_checkins (goal_id);
create index if not exists idx_goal_checkins_quarter_key on public.goal_checkins (quarter_key);

create table if not exists public.shared_goals (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals (id) on delete cascade,
  shared_by_id text not null,
  shared_with_ids jsonb not null default '[]'::jsonb,
  permission text not null default 'view',
  shared_at timestamptz not null default now(),
  expires_at timestamptz,
  note text
);

create index if not exists idx_shared_goals_goal_id on public.shared_goals (goal_id);

create table if not exists public.goal_escalations (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals (id) on delete cascade,
  title text not null,
  owner text not null,
  reason text not null,
  severity text not null default 'medium',
  status text not null default 'Open',
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_goal_escalations_goal_id on public.goal_escalations (goal_id);
create index if not exists idx_goal_escalations_status on public.goal_escalations (status);
