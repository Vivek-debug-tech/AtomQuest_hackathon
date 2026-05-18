-- Create audit_logs table for tracking system events
-- Migration: 001_create_audit_logs.sql

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id text,
  performed_by_id text,
  performed_by_name text,
  performed_by_role text,
  timestamp timestamptz default now(),
  details jsonb default '{}'::jsonb
);

create index if not exists idx_audit_logs_timestamp on public.audit_logs (timestamp desc);
create index if not exists idx_audit_logs_entity on public.audit_logs (entity_id);

-- grant minimal read access to anon (optional)
-- grant select on public.audit_logs to anon;
