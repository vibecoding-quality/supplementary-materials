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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      care_logs: {
        Row: {
          care_type: string
          created_at: string
          id: string
          notes: string | null
          performed_at: string
          user_id: string
          user_plant_id: string
        }
        Insert: {
          care_type: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_at?: string
          user_id: string
          user_plant_id: string
        }
        Update: {
          care_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_at?: string
          user_id?: string
          user_plant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_logs_user_plant_id_fkey"
            columns: ["user_plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_species: {
        Row: {
          care_tips: string | null
          created_at: string
          description: string | null
          fertilizing_frequency_days: number | null
          humidity_preference: string | null
          id: string
          image_url: string | null
          light_requirement: string
          max_temperature: number | null
          min_temperature: number | null
          name: string
          scientific_name: string | null
          toxic_to_cats: boolean | null
          toxic_to_dogs: boolean | null
          watering_frequency_days: number
        }
        Insert: {
          care_tips?: string | null
          created_at?: string
          description?: string | null
          fertilizing_frequency_days?: number | null
          humidity_preference?: string | null
          id?: string
          image_url?: string | null
          light_requirement?: string
          max_temperature?: number | null
          min_temperature?: number | null
          name: string
          scientific_name?: string | null
          toxic_to_cats?: boolean | null
          toxic_to_dogs?: boolean | null
          watering_frequency_days?: number
        }
        Update: {
          care_tips?: string | null
          created_at?: string
          description?: string | null
          fertilizing_frequency_days?: number | null
          humidity_preference?: string | null
          id?: string
          image_url?: string | null
          light_requirement?: string
          max_temperature?: number | null
          min_temperature?: number | null
          name?: string
          scientific_name?: string | null
          toxic_to_cats?: boolean | null
          toxic_to_dogs?: boolean | null
          watering_frequency_days?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plants: {
        Row: {
          acquired_date: string | null
          created_at: string
          custom_name: string | null
          id: string
          image_url: string | null
          is_heated_room: boolean | null
          last_fertilized_at: string | null
          last_repotted_at: string | null
          last_watered_at: string | null
          light_condition: string | null
          location: string | null
          max_room_temperature: number | null
          min_room_temperature: number | null
          nickname: string | null
          notes: string | null
          pets: string[] | null
          room_temperature: number | null
          species_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquired_date?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          image_url?: string | null
          is_heated_room?: boolean | null
          last_fertilized_at?: string | null
          last_repotted_at?: string | null
          last_watered_at?: string | null
          light_condition?: string | null
          location?: string | null
          max_room_temperature?: number | null
          min_room_temperature?: number | null
          nickname?: string | null
          notes?: string | null
          pets?: string[] | null
          room_temperature?: number | null
          species_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acquired_date?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          image_url?: string | null
          is_heated_room?: boolean | null
          last_fertilized_at?: string | null
          last_repotted_at?: string | null
          last_watered_at?: string | null
          light_condition?: string | null
          location?: string | null
          max_room_temperature?: number | null
          min_room_temperature?: number | null
          nickname?: string | null
          notes?: string | null
          pets?: string[] | null
          room_temperature?: number | null
          species_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plants_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "plant_species"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
