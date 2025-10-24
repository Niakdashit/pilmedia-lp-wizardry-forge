// Types pour le système de partenariats médias

export interface MediaPartner {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  category: 'blog' | 'magazine' | 'influencer' | 'website' | 'other';
  audience_size: number | null;
  monthly_visitors: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface PartnershipRequest {
  id: string;
  campaign_id: string;
  media_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  response_message: string | null;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  campaign?: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  requester?: {
    email: string;
    full_name: string;
  };
}

export interface MediaCampaign {
  id: string;
  campaign_id: string;
  media_id: string;
  partnership_request_id: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  created_at: string;
  updated_at: string;
  // Relations
  campaign?: {
    id: string;
    name: string;
    type: string;
    description: string;
    thumbnail_url: string | null;
  };
}

export interface PartnershipStats {
  total_requests: number;
  pending_requests: number;
  accepted_requests: number;
  rejected_requests: number;
  active_campaigns: number;
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
}
