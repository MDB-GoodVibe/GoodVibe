alter table public.knowledge_articles
  add column if not exists resource_url text;

alter table public.knowledge_articles
  drop constraint if exists knowledge_articles_track_check;

alter table public.knowledge_articles
  add constraint knowledge_articles_track_check
  check (track in ('basics', 'level-up', 'tips', 'external'));

create table if not exists public.knowledge_submissions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('basics', 'level-up', 'tips', 'external')),
  title text not null,
  summary text not null,
  resource_url text,
  details text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists knowledge_submissions_status_created_at_idx
  on public.knowledge_submissions (status, created_at desc);

create index if not exists knowledge_submissions_requester_id_idx
  on public.knowledge_submissions (requester_id, created_at desc);

drop trigger if exists knowledge_submissions_set_updated_at on public.knowledge_submissions;
create trigger knowledge_submissions_set_updated_at
before update on public.knowledge_submissions
for each row
execute function public.set_updated_at();

alter table public.knowledge_submissions enable row level security;

drop policy if exists "users read own submissions" on public.knowledge_submissions;
create policy "users read own submissions"
on public.knowledge_submissions
for select
using (auth.uid() = requester_id or public.is_admin());

drop policy if exists "users create own submissions" on public.knowledge_submissions;
create policy "users create own submissions"
on public.knowledge_submissions
for insert
with check (auth.uid() = requester_id);

drop policy if exists "admins update submissions" on public.knowledge_submissions;
create policy "admins update submissions"
on public.knowledge_submissions
for update
using (public.is_admin())
with check (public.is_admin());
