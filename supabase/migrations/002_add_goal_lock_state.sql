-- Add goal lock state columns for manager approval and admin unlock flows.
-- Migration: 002_add_goal_lock_state.sql

alter table if exists public.goals
  add column if not exists is_locked boolean not null default false,
  add column if not exists approval_status text;

create index if not exists idx_goals_is_locked on public.goals (is_locked);
create index if not exists idx_goals_approval_status on public.goals (approval_status);
