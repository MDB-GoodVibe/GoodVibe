alter table public.ideas
add column if not exists reference_links text not null default '';

delete from public.idea_votes;
delete from public.ideas;
