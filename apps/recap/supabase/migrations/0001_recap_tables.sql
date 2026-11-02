-- Month-end recap: idempotency log + report storage.
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- One row per recap period. `cutoff` is assigned by the database on first insert and never changes:
-- it is THE snapshot boundary for that month, shared by every run, retry and duplicate cron delivery.

create schema workflow

GRANT USAGE ON SCHEMA workflow TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA workflow TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA workflow TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA workflow TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA workflow GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA workflow GRANT ALL ON ROUTINES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA workflow GRANT ALL ON SEQUENCES TO service_role;

create table if not exists workflow.recap_periods (
  period_key text primary key check (period_key ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  cutoff     timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- One row per (period, user): the exactly-once guard for the email.
create table if not exists workflow.recap_deliveries (
  period_key       text not null references workflow.recap_periods (period_key) on delete cascade,
  user_id          uuid not null,
  status           text not null check (status in ('sending', 'sent', 'skipped_empty', 'failed')),
  lease_expires_at timestamptz,
  attempts         integer not null default 0,
  ledger_outcomes  jsonb not null default '[]'::jsonb,
  error            text,
  sent_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (period_key, user_id)
);

-- Only the service role (which bypasses RLS) touches these tables.
alter table workflow.recap_periods    enable row level security;
alter table workflow.recap_deliveries enable row level security;

-- Atomically claim a delivery. Returns:
--   'claimed'     the caller owns it (new row, a previous 'failed', or an expired lease)
--   'done'        already 'sent' / 'skipped_empty'
--   'in_progress' another run holds an unexpired lease
create or replace function workflow.recap_claim_delivery(
  p_period_key text, p_user_id uuid, p_lease_seconds integer
) returns text
language plpgsql
security definer
set search_path = workflow
as $$
declare
  v_status text;
begin
  insert into recap_deliveries as d (period_key, user_id, status, lease_expires_at, attempts)
  values (p_period_key, p_user_id, 'sending', now() + make_interval(secs => p_lease_seconds), 1)
  on conflict (period_key, user_id) do update
    set status = 'sending',
        lease_expires_at = now() + make_interval(secs => p_lease_seconds),
        attempts = d.attempts + 1,
        updated_at = now()
    where d.status = 'failed'
       or (d.status = 'sending' and d.lease_expires_at < now())
  returning d.status into v_status;

  if v_status is not null then
    return 'claimed';
  end if;

  select status into v_status from recap_deliveries
   where period_key = p_period_key and user_id = p_user_id;
  return case when v_status = 'sending' then 'in_progress' else 'done' end;
end;
$$;

revoke all on function workflow.recap_claim_delivery(text, uuid, integer) from public, anon, authenticated;
grant execute on function workflow.recap_claim_delivery(text, uuid, integer) to service_role;

-- Private bucket for the generated PDFs (service role only; no storage policies are created).
insert into storage.buckets (id, name, public)
values ('recap-reports', 'recap-reports', false)
on conflict (id) do nothing;
