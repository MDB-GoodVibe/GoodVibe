create or replace function public.sync_idea_upvote_count()
returns trigger
language plpgsql
security definer
set search_path = public
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

update public.ideas
set upvote_count = coalesce(vote_totals.total_votes, 0)
from (
  select idea_id, count(*)::integer as total_votes
  from public.idea_votes
  group by idea_id
) as vote_totals
where public.ideas.id = vote_totals.idea_id;

update public.ideas
set upvote_count = 0
where id not in (
  select distinct idea_id
  from public.idea_votes
);
