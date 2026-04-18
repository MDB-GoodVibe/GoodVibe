alter table public.knowledge_articles
  add column if not exists external_provider text,
  add column if not exists external_source_id text,
  add column if not exists external_source_label text,
  add column if not exists external_item_id text;

create unique index if not exists knowledge_articles_external_provider_item_id_uidx
  on public.knowledge_articles (external_provider, external_item_id)
  where external_provider is not null and external_item_id is not null;

create index if not exists knowledge_articles_external_provider_idx
  on public.knowledge_articles (external_provider);

create index if not exists knowledge_articles_external_source_id_idx
  on public.knowledge_articles (external_source_id);

create table if not exists public.youtube_channels (
  id uuid primary key default gen_random_uuid(),
  youtube_channel_id text not null unique,
  title text not null,
  handle text,
  channel_url text not null,
  thumbnail_url text,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_video_published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists youtube_channels_active_idx
  on public.youtube_channels (is_active, updated_at desc);

create table if not exists public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.youtube_channels(id) on delete cascade,
  youtube_video_id text not null unique,
  title text not null,
  description text not null default '',
  published_at timestamptz not null,
  watch_url text not null,
  thumbnail_url text,
  transcript_mode text not null default 'metadata'
    check (transcript_mode in ('captions', 'metadata')),
  knowledge_article_id uuid references public.knowledge_articles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists youtube_videos_channel_published_idx
  on public.youtube_videos (channel_id, published_at desc);

create index if not exists youtube_videos_knowledge_article_id_idx
  on public.youtube_videos (knowledge_article_id);

create table if not exists public.youtube_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('backfill', 'daily')),
  status text not null default 'pending'
    check (status in ('pending', 'running', 'retrying', 'completed', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  error text,
  scheduled_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists youtube_sync_jobs_status_scheduled_idx
  on public.youtube_sync_jobs (status, scheduled_at asc);

drop trigger if exists youtube_channels_set_updated_at on public.youtube_channels;
create trigger youtube_channels_set_updated_at
before update on public.youtube_channels
for each row
execute function public.set_updated_at();

drop trigger if exists youtube_videos_set_updated_at on public.youtube_videos;
create trigger youtube_videos_set_updated_at
before update on public.youtube_videos
for each row
execute function public.set_updated_at();

drop trigger if exists youtube_sync_jobs_set_updated_at on public.youtube_sync_jobs;
create trigger youtube_sync_jobs_set_updated_at
before update on public.youtube_sync_jobs
for each row
execute function public.set_updated_at();

alter table public.youtube_channels enable row level security;
alter table public.youtube_videos enable row level security;
alter table public.youtube_sync_jobs enable row level security;

drop policy if exists "admins manage youtube channels" on public.youtube_channels;
create policy "admins manage youtube channels"
on public.youtube_channels
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage youtube videos" on public.youtube_videos;
create policy "admins manage youtube videos"
on public.youtube_videos
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage youtube sync jobs" on public.youtube_sync_jobs;
create policy "admins manage youtube sync jobs"
on public.youtube_sync_jobs
for all
using (public.is_admin())
with check (public.is_admin());

