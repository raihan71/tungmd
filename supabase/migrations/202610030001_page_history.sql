create table public.page_history (
  user_id text not null default (auth.jwt()->>'sub'),
  url text not null,
  title text not null,
  at text not null,
  assets integer not null check (assets >= 0),
  updated_at timestamptz not null,
  primary key (user_id, url)
);

alter table public.page_history enable row level security;
revoke all on public.page_history from anon;
grant select, insert, update on public.page_history to authenticated;

create policy "Read own history" on public.page_history for select to authenticated
  using (user_id = (select auth.jwt()->>'sub'));
create policy "Insert own history" on public.page_history for insert to authenticated
  with check (user_id = (select auth.jwt()->>'sub'));
create policy "Update own history" on public.page_history for update to authenticated
  using (user_id = (select auth.jwt()->>'sub'))
  with check (user_id = (select auth.jwt()->>'sub'));

-- Merge on the server so older browser caches cannot overwrite newer visits.
-- JSON aggregation avoids the Data API row limit truncating a user's history.
create function public.sync_page_history(entries jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  result jsonb;
begin
  if auth.jwt()->>'sub' is null then
    raise exception 'Authentication required';
  end if;

  insert into public.page_history (user_id, url, title, at, assets, updated_at)
  select auth.jwt()->>'sub', e.url, e.title, e.at, e.assets, e."updatedAt"
  from jsonb_to_recordset(entries) as e(
    url text, title text, at text, assets integer, "updatedAt" timestamptz
  )
  on conflict (user_id, url) do update
    set title = excluded.title, at = excluded.at, assets = excluded.assets,
        updated_at = excluded.updated_at
    where excluded.updated_at > public.page_history.updated_at;

  select coalesce(jsonb_agg(jsonb_build_object(
    'url', url, 'title', title, 'at', at, 'assets', assets, 'updatedAt', updated_at
  ) order by updated_at desc), '[]'::jsonb) into result
  from public.page_history where user_id = auth.jwt()->>'sub';
  return result;
end;
$$;

revoke all on function public.sync_page_history(jsonb) from public, anon;
grant execute on function public.sync_page_history(jsonb) to authenticated;
