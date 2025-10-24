// User profile types
export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile extends Profile {
  // Additional computed fields
  full_name: string;
  is_admin: boolean;
  is_moderator: boolean;
  is_media: boolean;
}
