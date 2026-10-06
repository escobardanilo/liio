create or replace function public.liio_start_learning_session(
  p_device_token text,
  p_language text,
  p_prompt_version text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device public.liio_device_sessions%rowtype;
  v_session_id uuid;
begin
  if p_language not in ('pt','en','es','de') then
    raise exception 'invalid language';
  end if;

  select *
  into v_device
  from public.liio_device_sessions ds
  where ds.token_hash = public.liio_hash(p_device_token)
    and ds.expires_at > now()
  limit 1;

  if v_device.id is null then
    raise exception 'invalid device session';
  end if;

  insert into public.liio_learning_sessions(
    child_id,
    device_session_id,
    mode,
    language,
    prompt_version
  )
  values (
    v_device.child_id,
    v_device.id,
    'homework',
    p_language,
    p_prompt_version
  )
  returning id into v_session_id;

  return v_session_id;
end;
$$;

create or replace function public.liio_log_activity(
  p_device_token text,
  p_learning_session_id uuid,
  p_event_type text,
  p_behavior text,
  p_duration_ms integer,
  p_success boolean,
  p_prompt_version text,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_child_id uuid;
begin
  select ds.child_id
  into v_child_id
  from public.liio_device_sessions ds
  where ds.token_hash = public.liio_hash(p_device_token)
    and ds.expires_at > now()
  limit 1;

  if v_child_id is null then
    raise exception 'invalid device session';
  end if;

  if p_learning_session_id is not null and not exists (
    select 1
    from public.liio_learning_sessions ls
    where ls.id = p_learning_session_id
      and ls.child_id = v_child_id
  ) then
    raise exception 'invalid learning session';
  end if;

  insert into public.liio_activity_events(
    child_id,
    learning_session_id,
    event_type,
    behavior,
    duration_ms,
    success,
    prompt_version,
    metadata
  )
  values (
    v_child_id,
    p_learning_session_id,
    p_event_type,
    p_behavior,
    p_duration_ms,
    p_success,
    p_prompt_version,
    coalesce(p_metadata, '{}'::jsonb)
  );

  return true;
end;
$$;

grant execute on function public.liio_start_learning_session(text, text, text) to anon, authenticated;
grant execute on function public.liio_log_activity(text, uuid, text, text, integer, boolean, text, jsonb) to anon, authenticated;
