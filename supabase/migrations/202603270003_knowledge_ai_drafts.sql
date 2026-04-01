alter table public.knowledge_articles
  add column if not exists source_submission_id uuid references public.knowledge_submissions(id) on delete set null;

create index if not exists knowledge_articles_source_submission_id_idx
  on public.knowledge_articles (source_submission_id);
