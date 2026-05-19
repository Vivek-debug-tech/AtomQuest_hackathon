-- Add metadata to support shared goal copies and recipient edit restrictions.
-- Migration: 004_add_shared_goal_metadata.sql

alter table if exists public.goals
  add column if not exists shared_source_goal_id text,
  add column if not exists shared_edit_mode text default 'full';

create index if not exists idx_goals_shared_source_goal_id on public.goals (shared_source_goal_id);
