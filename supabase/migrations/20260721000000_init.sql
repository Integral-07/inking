-- articles
create table articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  url text,
  title text not null,
  source_domain text,
  category text not null default 'other' check (category in ('news', 'docs', 'other')),
  content text not null,
  added_at timestamptz not null default now()
);

alter table articles enable row level security;

create policy "articles_select_own" on articles for select using (user_id = auth.uid());
create policy "articles_insert_own" on articles for insert with check (user_id = auth.uid());
create policy "articles_update_own" on articles for update using (user_id = auth.uid());
create policy "articles_delete_own" on articles for delete using (user_id = auth.uid());

-- RLS decides *which rows*; PostgREST's anon/authenticated roles still need
-- table-level privileges to touch the table at all (Supabase's default
-- privileges for objects created by `postgres` deliberately omit these).
grant select, insert, update, delete on articles to anon, authenticated;

-- vocab_entries
create table vocab_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  article_id uuid references articles(id) on delete set null,
  term text not null,
  definition text,
  notes text,
  context_quote text,
  review_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- case-insensitive uniqueness per user, so the same word from different
-- articles merges into one entry instead of creating duplicates
create unique index vocab_entries_user_term_ci_idx on vocab_entries (user_id, lower(term));

alter table vocab_entries enable row level security;

create policy "vocab_entries_select_own" on vocab_entries for select using (user_id = auth.uid());
create policy "vocab_entries_insert_own" on vocab_entries for insert with check (user_id = auth.uid());
create policy "vocab_entries_update_own" on vocab_entries for update using (user_id = auth.uid());
create policy "vocab_entries_delete_own" on vocab_entries for delete using (user_id = auth.uid());

grant select, insert, update, delete on vocab_entries to anon, authenticated;

-- writings
create table writings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  article_id uuid references articles(id) on delete cascade not null,
  content_markdown text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table writings enable row level security;

create policy "writings_select_own" on writings for select using (user_id = auth.uid());
create policy "writings_insert_own" on writings for insert with check (user_id = auth.uid());
create policy "writings_update_own" on writings for update using (user_id = auth.uid());
create policy "writings_delete_own" on writings for delete using (user_id = auth.uid());

grant select, insert, update, delete on writings to anon, authenticated;
