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
          thumbnail_url: string | null
          total_participants: number | null
          total_views: number | null
          type: Database["public"]["Enums"]["game_type"]
          updated_at: string | null
        }
        Insert: {
          article_config?: Json | null
          banner_url?: string | null
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
          thumbnail_url?: string | null
          total_participants?: number | null
          total_views?: number | null
          type?: Database["public"]["Enums"]["game_type"]
          updated_at?: string | null
        }
        Update: {
          article_config?: Json | null
          banner_url?: string | null
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
          thumbnail_url?: string | null
          total_participants?: number | null
          total_views?: number | null
          type?: Database["public"]["Enums"]["game_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
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
          role?: string | null
          updated_at?: string | null
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
    },
  },
} as const
