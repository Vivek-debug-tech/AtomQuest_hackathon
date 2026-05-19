-- Store notification events for simulated email and Teams integrations.
-- Migration: 005_add_notification_events.sql

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  channel text not null,
  recipient text not null,
  subject text not null,
  message text not null,
  deep_link text,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_events_created_at on public.notification_events (created_at desc);
create index if not exists idx_notification_events_channel on public.notification_events (channel);
