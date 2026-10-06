create or replace function public.liio_delete_family(
  p_family_id uuid,
  p_owner_secret text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.liio_owner_matches(
    p_family_id,
    p_owner_secret
  ) then
    raise exception 'unauthorized';
  end if;

  delete from public.liio_families
  where id = p_family_id;

  return found;
end;
$$;

revoke all on function public.liio_delete_family(uuid, text) from public;
grant execute on function public.liio_delete_family(uuid, text) to anon, authenticated;
