-- Add admin cycle-management and org hierarchy tables.
-- Migration: 006_add_cycle_management_and_org_hierarchy.sql

create table if not exists public.cycle_management (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  opens_on date not null,
  closes_on date,
  action text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cycle_dates_valid check (closes_on is null or closes_on >= opens_on)
);

create index if not exists idx_cycle_management_opens_on on public.cycle_management (opens_on);
create index if not exists idx_cycle_management_is_active on public.cycle_management (is_active);

create table if not exists public.org_hierarchy (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  user_name text not null,
  role text not null,
  department text not null,
  manager_id text,
  skip_level_manager_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint org_role_valid check (role in ('Employee', 'Manager', 'Admin'))
);

create index if not exists idx_org_hierarchy_user_id on public.org_hierarchy (user_id);
create index if not exists idx_org_hierarchy_manager_id on public.org_hierarchy (manager_id);
create index if not exists idx_org_hierarchy_skip_level on public.org_hierarchy (skip_level_manager_id);
create index if not exists idx_org_hierarchy_department on public.org_hierarchy (department);
