create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden')),
  upvote_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.idea_votes (
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (idea_id, user_id)
);

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  content_md text not null,
  track text not null check (track in ('basics', 'level-up')),
  topic text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  platform_tags text[] not null default '{}',
  tool_tags text[] not null default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.helper_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_idea_id uuid references public.ideas(id) on delete set null,
  title text not null,
  idea text not null,
  service_type_id text not null,
  service_type_label text not null,
  options_json jsonb not null default '{}'::jsonb,
  architecture_json jsonb not null default '{}'::jsonb,
  prompt_stages_json jsonb not null default '[]'::jsonb,
  checklist_json jsonb not null default '[]'::jsonb,
  key_needs_json jsonb not null default '[]'::jsonb,
  next_questions_json jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'ready', 'mock-live')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ideas_status_created_at_idx
  on public.ideas (status, created_at desc);

create index if not exists ideas_upvote_count_idx
  on public.ideas (upvote_count desc, created_at desc);

create index if not exists knowledge_articles_track_status_idx
  on public.knowledge_articles (track, status, published_at desc nulls last);

create index if not exists helper_projects_user_id_idx
  on public.helper_projects (user_id, updated_at desc);

create index if not exists helper_projects_source_idea_id_idx
  on public.helper_projects (source_idea_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists ideas_set_updated_at on public.ideas;
create trigger ideas_set_updated_at
before update on public.ideas
for each row
execute function public.set_updated_at();

drop trigger if exists knowledge_articles_set_updated_at on public.knowledge_articles;
create trigger knowledge_articles_set_updated_at
before update on public.knowledge_articles
for each row
execute function public.set_updated_at();

drop trigger if exists helper_projects_set_updated_at on public.helper_projects;
create trigger helper_projects_set_updated_at
before update on public.helper_projects
for each row
execute function public.set_updated_at();

create or replace function public.sync_idea_upvote_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.ideas
    set upvote_count = upvote_count + 1
    where id = new.idea_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.ideas
    set upvote_count = greatest(upvote_count - 1, 0)
    where id = old.idea_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists idea_votes_sync_upvote_count_insert on public.idea_votes;
create trigger idea_votes_sync_upvote_count_insert
after insert on public.idea_votes
for each row
execute function public.sync_idea_upvote_count();

drop trigger if exists idea_votes_sync_upvote_count_delete on public.idea_votes;
create trigger idea_votes_sync_upvote_count_delete
after delete on public.idea_votes
for each row
execute function public.sync_idea_upvote_count();

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.helper_projects enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
on public.profiles
for select
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "published ideas are public" on public.ideas;
create policy "published ideas are public"
on public.ideas
for select
using (status = 'published' or auth.uid() = author_id or public.is_admin());

drop policy if exists "users can create own ideas" on public.ideas;
create policy "users can create own ideas"
on public.ideas
for insert
with check (auth.uid() = author_id);

drop policy if exists "users can update own ideas" on public.ideas;
create policy "users can update own ideas"
on public.ideas
for update
using (auth.uid() = author_id or public.is_admin())
with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "users can read own votes" on public.idea_votes;
create policy "users can read own votes"
on public.idea_votes
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "users can create own votes" on public.idea_votes;
create policy "users can create own votes"
on public.idea_votes
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can delete own votes" on public.idea_votes;
create policy "users can delete own votes"
on public.idea_votes
for delete
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "published knowledge is public" on public.knowledge_articles;
create policy "published knowledge is public"
on public.knowledge_articles
for select
using (status = 'published' or public.is_admin());

drop policy if exists "admins manage knowledge" on public.knowledge_articles;
create policy "admins manage knowledge"
on public.knowledge_articles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users read own helper projects" on public.helper_projects;
create policy "users read own helper projects"
on public.helper_projects
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "users create own helper projects" on public.helper_projects;
create policy "users create own helper projects"
on public.helper_projects
for insert
with check (auth.uid() = user_id);

drop policy if exists "users update own helper projects" on public.helper_projects;
create policy "users update own helper projects"
on public.helper_projects
for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users delete own helper projects" on public.helper_projects;
create policy "users delete own helper projects"
on public.helper_projects
for delete
using (auth.uid() = user_id or public.is_admin());
