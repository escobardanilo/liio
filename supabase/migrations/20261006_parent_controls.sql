create or replace function public.liio_set_language(
  p_family_id uuid,
  p_owner_secret text,
  p_language text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.liio_owner_matches(p_family_id, p_owner_secret) then
    raise exception 'unauthorized';
  end if;

  if p_language not in ('pt','en','es','de') then
    raise exception 'invalid language';
  end if;

  insert into public.liio_preferences(family_id, language, updated_at)
  values (p_family_id, p_language, now())
  on conflict (family_id)
  do update set
    language = excluded.language,
    updated_at = now();

  return true;
end;
$$;

create or replace function public.liio_get_time_limits(
  p_family_id uuid,
  p_owner_secret text,
  p_child_id uuid
)
returns table(
  daily_minutes integer,
  quiet_start time,
  quiet_end time,
  homework_enabled boolean,
  voice_enabled boolean,
  create_world_enabled boolean,
  paused boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.liio_owner_matches(p_family_id, p_owner_secret) then
    raise exception 'unauthorized';
  end if;

  if not exists (
    select 1
    from public.liio_children c
    where c.id = p_child_id
      and c.family_id = p_family_id
  ) then
    raise exception 'child not found';
  end if;

  insert into public.liio_time_limits(child_id)
  values (p_child_id)
  on conflict do nothing;

  return query
  select
    tl.daily_minutes,
    tl.quiet_start,
    tl.quiet_end,
    tl.homework_enabled,
    tl.voice_enabled,
    tl.create_world_enabled,
    tl.paused
  from public.liio_time_limits tl
  where tl.child_id = p_child_id;
end;
$$;

create or replace function public.liio_update_time_limits(
  p_family_id uuid,
  p_owner_secret text,
  p_child_id uuid,
  p_daily_minutes integer,
  p_quiet_start time,
  p_quiet_end time,
  p_homework_enabled boolean,
  p_voice_enabled boolean,
  p_create_world_enabled boolean,
  p_paused boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.liio_owner_matches(p_family_id, p_owner_secret) then
    raise exception 'unauthorized';
  end if;

  if not exists (
    select 1
    from public.liio_children c
    where c.id = p_child_id
      and c.family_id = p_family_id
  ) then
    raise exception 'child not found';
  end if;

  insert into public.liio_time_limits(
    child_id,
    daily_minutes,
    quiet_start,
    quiet_end,
    homework_enabled,
    voice_enabled,
    create_world_enabled,
    paused,
    updated_at
  )
  values (
    p_child_id,
    p_daily_minutes,
    p_quiet_start,
    p_quiet_end,
    p_homework_enabled,
    p_voice_enabled,
    p_create_world_enabled,
    p_paused,
    now()
  )
  on conflict (child_id)
  do update set
    daily_minutes = excluded.daily_minutes,
    quiet_start = excluded.quiet_start,
    quiet_end = excluded.quiet_end,
    homework_enabled = excluded.homework_enabled,
    voice_enabled = excluded.voice_enabled,
    create_world_enabled = excluded.create_world_enabled,
    paused = excluded.paused,
    updated_at = now();

  return true;
end;
$$;

create or replace function public.liio_list_activity_owner(
  p_family_id uuid,
  p_owner_secret text,
  p_child_id uuid,
  p_limit integer default 50
)
returns table(
  id bigint,
  event_type text,
  behavior text,
  duration_ms integer,
  success boolean,
  prompt_version text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.liio_owner_matches(p_family_id, p_owner_secret) then
    raise exception 'unauthorized';
  end if;

  if not exists (
    select 1
    from public.liio_children c
    where c.id = p_child_id
      and c.family_id = p_family_id
  ) then
    raise exception 'child not found';
  end if;

  return query
  select
    ae.id,
    ae.event_type,
    ae.behavior,
    ae.duration_ms,
    ae.success,
    ae.prompt_version,
    ae.metadata,
    ae.created_at
  from public.liio_activity_events ae
  where ae.child_id = p_child_id
  order by ae.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
end;
$$;

grant execute on function public.liio_set_language(uuid, text, text) to anon, authenticated;
grant execute on function public.liio_get_time_limits(uuid, text, uuid) to anon, authenticated;
grant execute on function public.liio_update_time_limits(uuid, text, uuid, integer, time, time, boolean, boolean, boolean, boolean) to anon, authenticated;
grant execute on function public.liio_list_activity_owner(uuid, text, uuid, integer) to anon, authenticated;
