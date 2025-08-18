-- Create saved forms table for reusable contact form presets
create table if not exists public.saved_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_forms enable row level security;

-- Policy: users can manage their own saved forms
create policy "Saved forms are selectable by owner"
  on public.saved_forms for select
  using (auth.uid() = user_id);

create policy "Saved forms are insertable by owner"
  on public.saved_forms for insert
  with check (auth.uid() = user_id);

create policy "Saved forms are updatable by owner"
  on public.saved_forms for update
  using (auth.uid() = user_id);

create policy "Saved forms are deletable by owner"
  on public.saved_forms for delete
  using (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_saved_forms_updated_at
before update on public.saved_forms
for each row
execute function public.set_updated_at();
