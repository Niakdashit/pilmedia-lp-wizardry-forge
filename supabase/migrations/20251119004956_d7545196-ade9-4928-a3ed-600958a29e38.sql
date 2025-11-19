-- Create organizations table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.organizations enable row level security;

-- Create organization roles enum
create type public.organization_role as enum ('owner', 'admin', 'member', 'viewer');

-- Create organization_members table (relation users <-> organizations)
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  role organization_role not null default 'member',
  created_at timestamptz default now(),
  unique(user_id, organization_id)
);

alter table public.organization_members enable row level security;

-- Add organization_id to profiles
alter table public.profiles add column organization_id uuid references public.organizations(id);

-- Add is_platform_owner to profiles to distinguish platform owner
alter table public.profiles add column is_platform_owner boolean default false;

-- Update campaigns to be shared within organization
-- Campaigns are already linked to created_by (user), organization comes from user's profile

-- RLS Policies for organizations
create policy "Users can view their organization"
  on public.organizations
  for select
  to authenticated
  using (
    id in (
      select organization_id 
      from public.organization_members 
      where user_id = auth.uid()
    )
  );

create policy "Organization owners can update their organization"
  on public.organizations
  for update
  to authenticated
  using (
    id in (
      select organization_id 
      from public.organization_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- RLS Policies for organization_members
create policy "Users can view members of their organization"
  on public.organization_members
  for select
  to authenticated
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = auth.uid()
    )
  );

create policy "Organization owners can manage members"
  on public.organization_members
  for all
  to authenticated
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Update campaigns RLS to share within organization
drop policy if exists "Users can view their own campaigns" on public.campaigns;

create policy "Users can view their organization campaigns"
  on public.campaigns
  for select
  to authenticated
  using (
    created_by in (
      select p.id 
      from public.profiles p
      inner join public.profiles my_profile on my_profile.id = auth.uid()
      where p.organization_id = my_profile.organization_id
    )
    or created_by = auth.uid()
  );

-- Update trigger to set updated_at on organizations
create or replace function public.update_organization_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organization_updated_at
  before update on public.organizations
  for each row
  execute function public.update_organization_updated_at();

-- Function to get user's organization role
create or replace function public.get_user_org_role(user_id uuid)
returns organization_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.organization_members
  where organization_members.user_id = get_user_org_role.user_id
  limit 1;
$$;