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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      commune_types_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          general_circle: string | null
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          general_circle?: string | null
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          general_circle?: string | null
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          actor_type: string
          created_at: string
          created_by: string | null
          default_language: string
          display_name: string
          group_name: string | null
          id: string
          internal_notes: string | null
          long_description: string | null
          name: string
          positioning: string | null
          short_description: string | null
          slug: string
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          actor_type?: string
          created_at?: string
          created_by?: string | null
          default_language?: string
          display_name: string
          group_name?: string | null
          id?: string
          internal_notes?: string | null
          long_description?: string | null
          name: string
          positioning?: string | null
          short_description?: string | null
          slug: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          actor_type?: string
          created_at?: string
          created_by?: string | null
          default_language?: string
          display_name?: string
          group_name?: string | null
          id?: string
          internal_notes?: string | null
          long_description?: string | null
          name?: string
          positioning?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_activity_families: {
        Row: {
          activity_code: string
          activity_label: string
          company_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          activity_code: string
          activity_label: string
          company_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          activity_code?: string
          activity_label?: string
          company_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_activity_families_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_branding: {
        Row: {
          accent_color: string | null
          background_color: string | null
          brand_style: string | null
          company_id: string
          created_at: string
          id: string
          logo_primary_url: string | null
          primary_color: string
          secondary_color: string | null
          text_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          brand_style?: string | null
          company_id: string
          created_at?: string
          id?: string
          logo_primary_url?: string | null
          primary_color?: string
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          brand_style?: string | null
          company_id?: string
          created_at?: string
          id?: string
          logo_primary_url?: string | null
          primary_color?: string
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_branding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_study_presets: {
        Row: {
          analysis_axes: Json | null
          brief_overrides: Json | null
          company_id: string
          created_at: string
          default_activity_families: Json
          default_commune_types: Json
          default_kpis: Json
          default_reference_years: Json
          default_risks: Json
          default_study_type: string | null
          default_target_publics: Json
          default_zone_focus: Json
          guidance: Json
          id: string
          is_active: boolean
          justification_note: string | null
          preferred_tools: Json | null
          study_category_code: string | null
          study_subtype_code: string | null
          updated_at: string
        }
        Insert: {
          analysis_axes?: Json | null
          brief_overrides?: Json | null
          company_id: string
          created_at?: string
          default_activity_families?: Json
          default_commune_types?: Json
          default_kpis?: Json
          default_reference_years?: Json
          default_risks?: Json
          default_study_type?: string | null
          default_target_publics?: Json
          default_zone_focus?: Json
          guidance?: Json
          id?: string
          is_active?: boolean
          justification_note?: string | null
          preferred_tools?: Json | null
          study_category_code?: string | null
          study_subtype_code?: string | null
          updated_at?: string
        }
        Update: {
          analysis_axes?: Json | null
          brief_overrides?: Json | null
          company_id?: string
          created_at?: string
          default_activity_families?: Json
          default_commune_types?: Json
          default_kpis?: Json
          default_reference_years?: Json
          default_risks?: Json
          default_study_type?: string | null
          default_target_publics?: Json
          default_zone_focus?: Json
          guidance?: Json
          id?: string
          is_active?: boolean
          justification_note?: string | null
          preferred_tools?: Json | null
          study_category_code?: string | null
          study_subtype_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_study_presets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_target_publics: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          public_code: string
          public_label: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          public_code: string
          public_label: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          public_code?: string
          public_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_target_publics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_crm_logs: {
        Row: {
          category: string
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          resolved_at: string | null
          severity: string
          status: string
          study_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          study_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          study_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_crm_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_crm_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_crm_logs_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          kpi_group: string | null
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          kpi_group?: string | null
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          kpi_group?: string | null
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      risks_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      sap_activities_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_modes_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      studies: {
        Row: {
          city_name: string | null
          commune_types: Json
          company_id: string | null
          competition_kpis: Json
          country_code: string | null
          created_at: string
          created_by: string | null
          deliverable_format: string | null
          demographic_segments: Json
          generation_completed_at: string | null
          generation_error_message: string | null
          generation_started_at: string | null
          generation_status: string
          hr_kpis: Json
          id: string
          included_activity_families: Json
          main_target_public: Json
          market_kpis: Json
          palette_key: string | null
          parent_study_id: string | null
          postal_code: string | null
          reference_years: Json
          risks: Json
          road_axes: Json
          status: string
          study_category_code: string | null
          study_objective: string | null
          study_subtype_code: string | null
          study_type: string | null
          synthesis_kpis: Json
          title: string | null
          transport_kpis: Json
          updated_at: string
          user_id: string
          version_number: number
          zone_focus: Json
        }
        Insert: {
          city_name?: string | null
          commune_types?: Json
          company_id?: string | null
          competition_kpis?: Json
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_format?: string | null
          demographic_segments?: Json
          generation_completed_at?: string | null
          generation_error_message?: string | null
          generation_started_at?: string | null
          generation_status?: string
          hr_kpis?: Json
          id?: string
          included_activity_families?: Json
          main_target_public?: Json
          market_kpis?: Json
          palette_key?: string | null
          parent_study_id?: string | null
          postal_code?: string | null
          reference_years?: Json
          risks?: Json
          road_axes?: Json
          status?: string
          study_category_code?: string | null
          study_objective?: string | null
          study_subtype_code?: string | null
          study_type?: string | null
          synthesis_kpis?: Json
          title?: string | null
          transport_kpis?: Json
          updated_at?: string
          user_id: string
          version_number?: number
          zone_focus?: Json
        }
        Update: {
          city_name?: string | null
          commune_types?: Json
          company_id?: string | null
          competition_kpis?: Json
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_format?: string | null
          demographic_segments?: Json
          generation_completed_at?: string | null
          generation_error_message?: string | null
          generation_started_at?: string | null
          generation_status?: string
          hr_kpis?: Json
          id?: string
          included_activity_families?: Json
          main_target_public?: Json
          market_kpis?: Json
          palette_key?: string | null
          parent_study_id?: string | null
          postal_code?: string | null
          reference_years?: Json
          risks?: Json
          road_axes?: Json
          status?: string
          study_category_code?: string | null
          study_objective?: string | null
          study_subtype_code?: string | null
          study_type?: string | null
          synthesis_kpis?: Json
          title?: string | null
          transport_kpis?: Json
          updated_at?: string
          user_id?: string
          version_number?: number
          zone_focus?: Json
        }
        Relationships: [
          {
            foreignKeyName: "studies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studies_parent_study_id_fkey"
            columns: ["parent_study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_categories_master: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_name: string
          icon_emoji: string | null
          id: string
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_name: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_name?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      study_subtypes_master: {
        Row: {
          backend_prompt_id: string | null
          category_code: string
          code: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          is_recommended: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          backend_prompt_id?: string | null
          category_code: string
          code: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          backend_prompt_id?: string | null
          category_code?: string
          code?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      study_types_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      target_publics_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      territory_modes_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_company_permissions: {
        Row: {
          company_id: string
          created_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      zone_focus_master: {
        Row: {
          code: string
          created_at: string
          display_order: number
          general_circle: string | null
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          general_circle?: string | null
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          general_circle?: string | null
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
