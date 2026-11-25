-- PAHSSION anonymous click tracking. Run once in the Supabase SQL editor.
-- Stores no IPs, names, emails, or user agents: users are minors.

create table if not exists public.click_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event       text not null check (event in ('linkedin_click', 'program_click', 'guide_open')),
  target      text check (char_length(target) <= 300),
  profession  text check (char_length(profession) <= 300),
  program     text check (char_length(program) <= 300),
  page        text check (char_length(page) <= 300),
  session_id  text check (char_length(session_id) <= 300)
);

create index if not exists click_events_created_at_idx on public.click_events (created_at);

-- RLS on with no policies: the anon and authenticated roles can do nothing.
-- Only the server (service role key) can insert or read.
alter table public.click_events enable row level security;

-- Belt and braces: remove the default table grants from the public API roles.
revoke all on table public.click_events from anon, authenticated;
