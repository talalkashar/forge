-- Durable API rate-limit counters (service_role only).
-- Used when Upstash is not configured; shared across Vercel serverless instances.

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  hit_count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists rate_limit_buckets_reset_at_idx
  on public.rate_limit_buckets (reset_at);

alter table public.rate_limit_buckets enable row level security;

-- No public policies: anon/authenticated cannot read or write.
revoke all on public.rate_limit_buckets from anon, authenticated;
grant all on public.rate_limit_buckets to service_role;

comment on table public.rate_limit_buckets is
  'Server-only sliding window counters for checkout/search/admin rate limits.';
