-- Persistent auth + classroom storage for cross-device usage.

create extension if not exists pgcrypto;

create or replace function public.generate_class_code()
returns text
language plpgsql
as $$
declare
  letters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  generated text;
begin
  loop
    generated :=
      substr(letters, floor(random() * length(letters) + 1)::int, 1) ||
      substr(letters, floor(random() * length(letters) + 1)::int, 1) ||
      substr(letters, floor(random() * length(letters) + 1)::int, 1) ||
      '-' ||
      lpad((floor(random() * 900) + 100)::int::text, 3, '0');

    exit when not exists (select 1 from public.classrooms where code = generated);
  end loop;

  return generated;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'teacher')),
  nickname text not null default 'New User',
  school text not null default 'Unknown School',
  grade text not null default 'Unknown',
  subject text null,
  email text not null unique,
  phone text null,
  avatar text null,
  stack_count integer not null default 0,
  max_stack integer not null default 0,
  on_time_rate integer not null default 100,
  backlog_count integer not null default 0,
  class_code text null,
  status text not null default 'none' check (status in ('pending', 'approved', 'none')),
  is_anonymous boolean not null default false,
  managed_class_codes text[] null,
  assigned_class_codes text[] null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.classrooms (
  code text primary key default public.generate_class_code(),
  grade_room text not null,
  school text not null,
  owner_teacher_id uuid not null references public.profiles(id) on delete cascade,
  owner_teacher_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.classroom_teachers (
  class_code text not null references public.classrooms(code) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (class_code, teacher_id)
);

create table if not exists public.classroom_students (
  class_code text not null references public.classrooms(code) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (class_code, student_id)
);

create or replace function public.is_class_teacher(target_class_code text, target_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.classrooms c
    left join public.classroom_teachers ct on ct.class_code = c.code
    where c.code = target_class_code
      and (c.owner_teacher_id = target_user_id or ct.teacher_id = target_user_id)
  );
$$;

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_teachers enable row level security;
alter table public.classroom_students enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "classrooms_select_authenticated" on public.classrooms;
create policy "classrooms_select_authenticated"
on public.classrooms
for select
to authenticated
using (true);

drop policy if exists "classrooms_insert_owner" on public.classrooms;
create policy "classrooms_insert_owner"
on public.classrooms
for insert
to authenticated
with check (owner_teacher_id = auth.uid());

drop policy if exists "classrooms_update_owner" on public.classrooms;
create policy "classrooms_update_owner"
on public.classrooms
for update
to authenticated
using (owner_teacher_id = auth.uid())
with check (owner_teacher_id = auth.uid());

drop policy if exists "classroom_teachers_select_authenticated" on public.classroom_teachers;
create policy "classroom_teachers_select_authenticated"
on public.classroom_teachers
for select
to authenticated
using (true);

drop policy if exists "classroom_teachers_insert_teacher_manager" on public.classroom_teachers;
create policy "classroom_teachers_insert_teacher_manager"
on public.classroom_teachers
for insert
to authenticated
with check (
  teacher_id = auth.uid()
  or public.is_class_teacher(class_code, auth.uid())
);

drop policy if exists "classroom_teachers_delete_teacher_manager" on public.classroom_teachers;
create policy "classroom_teachers_delete_teacher_manager"
on public.classroom_teachers
for delete
to authenticated
using (
  teacher_id = auth.uid()
  or public.is_class_teacher(class_code, auth.uid())
);

drop policy if exists "classroom_students_select_authenticated" on public.classroom_students;
create policy "classroom_students_select_authenticated"
on public.classroom_students
for select
to authenticated
using (true);

drop policy if exists "classroom_students_insert_self" on public.classroom_students;
create policy "classroom_students_insert_self"
on public.classroom_students
for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "classroom_students_delete_self_or_teacher" on public.classroom_students;
create policy "classroom_students_delete_self_or_teacher"
on public.classroom_students
for delete
to authenticated
using (
  student_id = auth.uid()
  or public.is_class_teacher(class_code, auth.uid())
);
