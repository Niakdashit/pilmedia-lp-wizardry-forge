export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  created_at: string | null;
  // Joined data
  profiles?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface UserWithOrganization {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  is_platform_owner: boolean;
  organization?: Organization;
  organization_role?: OrganizationRole;
}
