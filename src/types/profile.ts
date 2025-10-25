// User profile types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserWithProfile extends Profile {
  // Additional computed fields
  full_name: string;
  is_admin: boolean;
  is_moderator: boolean;
  is_media: boolean;
}
