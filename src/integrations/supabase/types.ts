export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attribution_history: {
        Row: {
          campaign_id: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          participant_email: string | null
          participant_id: string | null
          prize_id: string
          result: Json
          user_agent: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          participant_email?: string | null
          participant_id?: string | null
          prize_id: string
          result: Json
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          participant_email?: string | null
          participant_id?: string | null
          prize_id?: string
          result?: Json
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attribution_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          animations: Json
          assets: Json
          buttons: Json
          colors: Json
          created_at: string | null
          description: string | null
          id: string
          industry: string
          metadata: Json
          name: string
          organization_id: string | null
          shadows: Json
          spacing: Json
          typography: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          animations?: Json
          assets?: Json
          buttons?: Json
          colors?: Json
          created_at?: string | null
          description?: string | null
          id: string
          industry: string
          metadata?: Json
          name: string
          organization_id?: string | null
          shadows?: Json
          spacing?: Json
          typography?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          animations?: Json
          assets?: Json
          buttons?: Json
          colors?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string
          metadata?: Json
          name?: string
          organization_id?: string | null
          shadows?: Json
          spacing?: Json
          typography?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          campaign_id: string
          changes: Json | null
          created_at: string
          description: string | null
          id: string
          ip_address: unknown
          revision_after: number | null
          revision_before: number | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          campaign_id: string
          changes?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          revision_after?: number | null
          revision_before?: number | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          campaign_id?: string
          changes?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          revision_after?: number | null
          revision_before?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_audit_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_backups: {
        Row: {
          backup_name: string
          campaign_id: string
          created_at: string
          created_by: string | null
          description: string | null
          full_snapshot: Json
          id: string
          metadata: Json | null
        }
        Insert: {
          backup_name: string
          campaign_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          full_snapshot: Json
          id?: string
          metadata?: Json | null
        }
        Update: {
          backup_name?: string
          campaign_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          full_snapshot?: Json
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_backups_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_integrations: {
        Row: {
          campaign_id: string
          config: Json | null
          created_at: string | null
          deployment_url: string
          embed_code: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          config?: Json | null
          created_at?: string | null
          deployment_url: string
          embed_code?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          config?: Json | null
          created_at?: string | null
          deployment_url?: string
          embed_code?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_integrations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_settings: {
        Row: {
          advanced: Json | null
          campaign_id: string
          campaign_url: string | null
          created_at: string | null
          data_push: Json | null
          dotation: Json | null
          email_verification: Json | null
          end_date: string | null
          end_time: string | null
          id: string
          integration_html: string | null
          integration_javascript: string | null
          integration_oembed: string | null
          integration_smart_url: string | null
          integration_webview: string | null
          legal: Json | null
          limits: Json | null
          opt_in: Json | null
          output: Json | null
          publication: Json | null
          soft_gate: Json | null
          start_date: string | null
          start_time: string | null
          tags: string[] | null
          updated_at: string | null
          winners: Json | null
        }
        Insert: {
          advanced?: Json | null
          campaign_id: string
          campaign_url?: string | null
          created_at?: string | null
          data_push?: Json | null
          dotation?: Json | null
          email_verification?: Json | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          integration_html?: string | null
          integration_javascript?: string | null
          integration_oembed?: string | null
          integration_smart_url?: string | null
          integration_webview?: string | null
          legal?: Json | null
          limits?: Json | null
          opt_in?: Json | null
          output?: Json | null
          publication?: Json | null
          soft_gate?: Json | null
          start_date?: string | null
          start_time?: string | null
          tags?: string[] | null
          updated_at?: string | null
          winners?: Json | null
        }
        Update: {
          advanced?: Json | null
          campaign_id?: string
          campaign_url?: string | null
          created_at?: string | null
          data_push?: Json | null
          dotation?: Json | null
          email_verification?: Json | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          integration_html?: string | null
          integration_javascript?: string | null
          integration_oembed?: string | null
          integration_smart_url?: string | null
          integration_webview?: string | null
          legal?: Json | null
          limits?: Json | null
          opt_in?: Json | null
          output?: Json | null
          publication?: Json | null
          soft_gate?: Json | null
          start_date?: string | null
          start_time?: string | null
          tags?: string[] | null
          updated_at?: string | null
          winners?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_settings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_snapshots: {
        Row: {
          article_config: Json | null
          campaign_id: string
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          design: Json | null
          form_fields: Json | null
          game_config: Json | null
          id: string
          payload_size_bytes: number | null
          revision: number
          snapshot_type: string
        }
        Insert: {
          article_config?: Json | null
          campaign_id: string
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          design?: Json | null
          form_fields?: Json | null
          game_config?: Json | null
          id?: string
          payload_size_bytes?: number | null
          revision: number
          snapshot_type?: string
        }
        Update: {
          article_config?: Json | null
          campaign_id?: string
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          design?: Json | null
          form_fields?: Json | null
          game_config?: Json | null
          id?: string
          payload_size_bytes?: number | null
          revision?: number
          snapshot_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_snapshots_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_stats: {
        Row: {
          campaign_id: string
          completion_rate: number | null
          date: string
          id: string
          participations: number | null
          unique_views: number | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          campaign_id: string
          completion_rate?: number | null
          date: string
          id?: string
          participations?: number | null
          unique_views?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          campaign_id?: string
          completion_rate?: number | null
          date?: string
          id?: string
          participations?: number | null
          unique_views?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_stats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_views: {
        Row: {
          campaign_id: string
          id: string
          ip_address: unknown
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewed_at: string | null
        }
        Insert: {
          campaign_id: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewed_at?: string | null
        }
        Update: {
          campaign_id?: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_views_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          article_config: Json | null
          banner_url: string | null
          brand_kit_id: string | null
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          design: Json
          editor_mode: string | null
          end_date: string | null
          form_fields: Json
          game_config: Json
          id: string
          name: string
          published_at: string | null
          revision: number
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          thumbnail_url: string | null
          total_participants: number | null
          total_views: number | null
          type: Database["public"]["Enums"]["game_type"]
          updated_at: string | null
        }
        Insert: {
          article_config?: Json | null
          banner_url?: string | null
          brand_kit_id?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          design?: Json
          editor_mode?: string | null
          end_date?: string | null
          form_fields?: Json
          game_config?: Json
          id?: string
          name: string
          published_at?: string | null
          revision?: number
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          thumbnail_url?: string | null
          total_participants?: number | null
          total_views?: number | null
          type?: Database["public"]["Enums"]["game_type"]
          updated_at?: string | null
        }
        Update: {
          article_config?: Json | null
          banner_url?: string | null
          brand_kit_id?: string | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          design?: Json
          editor_mode?: string | null
          end_date?: string | null
          form_fields?: Json
          game_config?: Json
          id?: string
          name?: string
          published_at?: string | null
          revision?: number
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          thumbnail_url?: string | null
          total_participants?: number | null
          total_views?: number | null
          type?: Database["public"]["Enums"]["game_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      data_processing_log: {
        Row: {
          action_description: string | null
          action_type: string
          created_at: string
          data_after: Json | null
          data_before: Json | null
          id: string
          ip_address: unknown
          performed_by: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          created_at?: string
          data_after?: Json | null
          data_before?: Json | null
          id?: string
          ip_address?: unknown
          performed_by?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          created_at?: string
          data_after?: Json | null
          data_before?: Json | null
          id?: string
          ip_address?: unknown
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dotation_configs: {
        Row: {
          anti_fraud: Json | null
          campaign_id: string
          created_at: string
          global_strategy: Json | null
          id: string
          notifications: Json | null
          prizes: Json
          updated_at: string
        }
        Insert: {
          anti_fraud?: Json | null
          campaign_id: string
          created_at?: string
          global_strategy?: Json | null
          id?: string
          notifications?: Json | null
          prizes?: Json
          updated_at?: string
        }
        Update: {
          anti_fraud?: Json | null
          campaign_id?: string
          created_at?: string
          global_strategy?: Json | null
          id?: string
          notifications?: Json | null
          prizes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dotation_configs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      dotation_stats: {
        Row: {
          attribution_rate: number
          campaign_id: string
          id: string
          last_updated: string
          prize_stats: Json
          total_awarded: number
          total_participants: number
          total_prizes: number
          total_quantity: number
          total_remaining: number
          total_winners: number
          win_rate: number
        }
        Insert: {
          attribution_rate?: number
          campaign_id: string
          id?: string
          last_updated?: string
          prize_stats?: Json
          total_awarded?: number
          total_participants?: number
          total_prizes?: number
          total_quantity?: number
          total_remaining?: number
          total_winners?: number
          win_rate?: number
        }
        Update: {
          attribution_rate?: number
          campaign_id?: string
          id?: string
          last_updated?: string
          prize_stats?: Json
          total_awarded?: number
          total_participants?: number
          total_prizes?: number
          total_quantity?: number
          total_remaining?: number
          total_winners?: number
          win_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "dotation_stats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          campaign_id: string
          created_at: string | null
          duration: number | null
          game_type: string
          id: string
          is_winner: boolean | null
          result: Json
          score: number | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          duration?: number | null
          game_type: string
          id?: string
          is_winner?: boolean | null
          result?: Json
          score?: number | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          duration?: number | null
          game_type?: string
          id?: string
          is_winner?: boolean | null
          result?: Json
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      gdpr_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          export_expires_at: string | null
          export_url: string | null
          id: string
          ip_address: unknown
          processed_at: string | null
          request_type: string
          requested_at: string
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_expires_at?: string | null
          export_url?: string | null
          id?: string
          ip_address?: unknown
          processed_at?: string | null
          request_type: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_expires_at?: string | null
          export_url?: string | null
          id?: string
          ip_address?: unknown
          processed_at?: string | null
          request_type?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      media_ad_placements: {
        Row: {
          available_slots: number | null
          created_at: string | null
          description: string | null
          estimated_visibility: number | null
          format: string | null
          id: string
          media_id: string | null
          name: string
          position: string | null
          updated_at: string | null
        }
        Insert: {
          available_slots?: number | null
          created_at?: string | null
          description?: string | null
          estimated_visibility?: number | null
          format?: string | null
          id?: string
          media_id?: string | null
          name: string
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          available_slots?: number | null
          created_at?: string | null
          description?: string | null
          estimated_visibility?: number | null
          format?: string | null
          id?: string
          media_id?: string | null
          name?: string
          position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_ad_placements_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      media_campaigns: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          end_date: string | null
          id: string
          media_id: string | null
          partnership_request_id: string | null
          revenue: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          media_id?: string | null
          partnership_request_id?: string | null
          revenue?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          media_id?: string | null
          partnership_request_id?: string | null
          revenue?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_campaigns_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_campaigns_partnership_request_id_fkey"
            columns: ["partnership_request_id"]
            isOneToOne: false
            referencedRelation: "partnership_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      media_partners: {
        Row: {
          age_range: string | null
          audience_size: number | null
          category: string | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          gender_distribution: Json | null
          id: string
          interests: Json | null
          location: string | null
          logo_url: string | null
          member_since: string | null
          monthly_visitors: number | null
          name: string
          partnerships_count: number | null
          rating: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          age_range?: string | null
          audience_size?: number | null
          category?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          gender_distribution?: Json | null
          id?: string
          interests?: Json | null
          location?: string | null
          logo_url?: string | null
          member_since?: string | null
          monthly_visitors?: number | null
          name: string
          partnerships_count?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          age_range?: string | null
          audience_size?: number | null
          category?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          gender_distribution?: Json | null
          id?: string
          interests?: Json | null
          location?: string | null
          logo_url?: string | null
          member_since?: string | null
          monthly_visitors?: number | null
          name?: string
          partnerships_count?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      media_partnership_conditions: {
        Row: {
          created_at: string | null
          dotation_types: Json | null
          duration_max: number | null
          duration_min: number | null
          id: string
          max_dotation_value: number | null
          media_id: string | null
          min_dotation_value: number | null
          specific_conditions: Json | null
          updated_at: string | null
          validation_delay: number | null
        }
        Insert: {
          created_at?: string | null
          dotation_types?: Json | null
          duration_max?: number | null
          duration_min?: number | null
          id?: string
          max_dotation_value?: number | null
          media_id?: string | null
          min_dotation_value?: number | null
          specific_conditions?: Json | null
          updated_at?: string | null
          validation_delay?: number | null
        }
        Update: {
          created_at?: string | null
          dotation_types?: Json | null
          duration_max?: number | null
          duration_min?: number | null
          id?: string
          max_dotation_value?: number | null
          media_id?: string | null
          min_dotation_value?: number | null
          specific_conditions?: Json | null
          updated_at?: string | null
          validation_delay?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_partnership_conditions_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      participations: {
        Row: {
          campaign_id: string
          created_at: string | null
          form_data: Json
          game_result: Json | null
          id: string
          ip_address: unknown
          is_winner: boolean | null
          user_agent: string | null
          user_email: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          form_data?: Json
          game_result?: Json | null
          id?: string
          ip_address?: unknown
          is_winner?: boolean | null
          user_agent?: string | null
          user_email: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          form_data?: Json
          game_result?: Json | null
          id?: string
          ip_address?: unknown
          is_winner?: boolean | null
          user_agent?: string | null
          user_email?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_requests: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          media_id: string | null
          message: string | null
          requested_at: string | null
          requester_id: string | null
          responded_at: string | null
          response_message: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          media_id?: string | null
          message?: string | null
          requested_at?: string | null
          requester_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          media_id?: string | null
          message?: string | null
          requested_at?: string | null
          requester_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_requests_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_platform_owner: boolean | null
          organization_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_platform_owner?: boolean | null
          organization_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_platform_owner?: boolean | null
          organization_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      template_collections: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          industry: string | null
          metadata: Json
          name: string
          template_ids: string[] | null
          thumbnail: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id: string
          industry?: string | null
          metadata?: Json
          name: string
          template_ids?: string[] | null
          thumbnail?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          industry?: string | null
          metadata?: Json
          name?: string
          template_ids?: string[] | null
          thumbnail?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          background: Json
          brand_kit_id: string | null
          category: string
          complexity: string
          created_at: string | null
          default_colors: Json
          description: string
          elements: Json
          game_config: Json
          game_type: string
          id: string
          industry: string
          long_description: string | null
          metadata: Json
          name: string
          organization_id: string | null
          preview: Json
          recommended_brand_kit: Json | null
          stats: Json
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          background?: Json
          brand_kit_id?: string | null
          category: string
          complexity?: string
          created_at?: string | null
          default_colors?: Json
          description: string
          elements?: Json
          game_config?: Json
          game_type: string
          id: string
          industry: string
          long_description?: string | null
          metadata?: Json
          name: string
          organization_id?: string | null
          preview?: Json
          recommended_brand_kit?: Json | null
          stats?: Json
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          background?: Json
          brand_kit_id?: string | null
          category?: string
          complexity?: string
          created_at?: string | null
          default_colors?: Json
          description?: string
          elements?: Json
          game_config?: Json
          game_type?: string
          id?: string
          industry?: string
          long_description?: string | null
          metadata?: Json
          name?: string
          organization_id?: string | null
          preview?: Json
          recommended_brand_kit?: Json | null
          stats?: Json
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          analytics_consent: boolean | null
          consent_date: string
          consent_method: string
          consent_version: string
          created_at: string
          functional_consent: boolean | null
          id: string
          ip_address: unknown
          marketing_consent: boolean | null
          personalization_consent: boolean | null
          session_id: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics_consent?: boolean | null
          consent_date?: string
          consent_method: string
          consent_version?: string
          created_at?: string
          functional_consent?: boolean | null
          id?: string
          ip_address?: unknown
          marketing_consent?: boolean | null
          personalization_consent?: boolean | null
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics_consent?: boolean | null
          consent_date?: string
          consent_method?: string
          consent_version?: string
          created_at?: string
          functional_consent?: boolean | null
          id?: string
          ip_address?: unknown
          marketing_consent?: boolean | null
          personalization_consent?: boolean | null
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_user_data: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      cleanup_old_snapshots: {
        Args: { p_keep_count?: number; p_keep_days?: number }
        Returns: number
      }
      generate_campaign_slug: {
        Args: { campaign_name: string }
        Returns: string
      }
      generate_integration_url: {
        Args: { _campaign_id: string; _integration_type: string }
        Returns: string
      }
      get_user_data_export: { Args: { target_user_id: string }; Returns: Json }
      get_user_org_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["organization_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_campaign_action: {
        Args: {
          p_action: string
          p_campaign_id: string
          p_changes?: Json
          p_description?: string
          p_revision_after?: number
          p_revision_before?: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "viewer"
      campaign_status:
        | "draft"
        | "scheduled"
        | "active"
        | "paused"
        | "ended"
        | "archived"
      game_type:
        | "wheel"
        | "quiz"
        | "contest"
        | "survey"
        | "jackpot"
        | "dice"
        | "scratch"
        | "form"
      organization_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "viewer"],
      campaign_status: [
        "draft",
        "scheduled",
        "active",
        "paused",
        "ended",
        "archived",
      ],
      game_type: [
        "wheel",
        "quiz",
        "contest",
        "survey",
        "jackpot",
        "dice",
        "scratch",
        "form",
      ],
      organization_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
