-- Add cycle management and org hierarchy tables.
-- Migration: 006_add_cycle_and_hierarchy_tables.sql

create table if not exists public.cycle_windows (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null unique,
  label text not null,
  opens_on date not null,
  closes_on date,
  action text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.org_hierarchy (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  user_name text not null,
  role text not null,
  department text not null,
  manager_id text,
  manager_name text,
  skip_level_id text,
  skip_level_name text,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create index if not exists idx_cycle_windows_cycle_key on public.cycle_windows (cycle_key);
create index if not exists idx_org_hierarchy_manager_id on public.org_hierarchy (manager_id);
