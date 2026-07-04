-- Course access codes for code-based enrollment.
-- Admin generates codes, students redeem on /courses/[slug] to get enrolled
-- and see lessons. No more "free vs premium" — every course is gated by a code.

create table public.course_access_codes (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  code        text not null unique,
  description text,
  max_uses    integer,
  uses_count  integer not null default 0,
  expires_at  timestamptz,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index course_access_codes_course_id_idx on public.course_access_codes(course_id);

alter table public.course_access_codes enable row level security;

create policy "course_access_codes admin all" on public.course_access_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- Atomic, security-definer redemption function. Students don't need direct
-- table access — they call this RPC via supabase.rpc('redeem_course_access_code', ...)
-- which validates the code and creates an enrollment in one transaction.
create or replace function public.redeem_course_access_code(
  p_code      text,
  p_course_id uuid
)
returns table(success boolean, error text, enrollment_id uuid)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id       uuid := auth.uid();
  v_code          public.course_access_codes;
  v_enrollment_id uuid;
begin
  if v_user_id is null then
    return query select false, 'auth_required'::text, null::uuid;
    return;
  end if;

  select * into v_code from public.course_access_codes
    where code = p_code and course_id = p_course_id
    for update;

  if not found then
    return query select false, 'invalid_code'::text, null::uuid;
    return;
  end if;

  if v_code.expires_at is not null and v_code.expires_at < now() then
    return query select false, 'expired'::text, null::uuid;
    return;
  end if;

  if v_code.max_uses is not null and v_code.uses_count >= v_code.max_uses then
    return query select false, 'max_uses_reached'::text, null::uuid;
    return;
  end if;

  select id into v_enrollment_id from public.enrollments
    where user_id = v_user_id and course_id = p_course_id;

  if v_enrollment_id is not null then
    return query select true, 'already_enrolled'::text, v_enrollment_id;
    return;
  end if;

  insert into public.enrollments (user_id, course_id) values (v_user_id, p_course_id)
    returning id into v_enrollment_id;
  update public.course_access_codes set uses_count = uses_count + 1 where id = v_code.id;

  return query select true, ''::text, v_enrollment_id;
end;
$$;

grant execute on function public.redeem_course_access_code(text, uuid) to authenticated;
revoke execute on function public.redeem_course_access_code(text, uuid) from anon;
revoke execute on function public.redeem_course_access_code(text, uuid) from public;
