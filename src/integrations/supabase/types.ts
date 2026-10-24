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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      object_facts: {
        Row: {
          created_at: string
          glyph: string
          id: string
          name: string
          reading_level: number
          text: string
        }
        Insert: {
          created_at?: string
          glyph: string
          id?: string
          name: string
          reading_level?: number
          text: string
        }
        Update: {
          created_at?: string
          glyph?: string
          id?: string
          name?: string
          reading_level?: number
          text?: string
        }
        Relationships: []
      }
      versus_members: {
        Row: {
          player_id: string
          room_id: string
          seat: number
          status: string
        }
        Insert: {
          player_id: string
          room_id: string
          seat: number
          status?: string
        }
        Update: {
          player_id?: string
          room_id?: string
          seat?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "versus_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "versus_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      versus_profiles: {
        Row: {
          avatar: string
          last_seen: string
          name: string
          player_id: string
        }
        Insert: {
          avatar?: string
          last_seen?: string
          name?: string
          player_id: string
        }
        Update: {
          avatar?: string
          last_seen?: string
          name?: string
          player_id?: string
        }
        Relationships: []
      }
      versus_rooms: {
        Row: {
          created_at: string
          found: Json
          host_id: string
          id: string
          level_id: number
          size: number
          status: string
          total: number
          turn_index: number
          turn_seq: number
          turn_started_at: string | null
        }
        Insert: {
          created_at?: string
          found?: Json
          host_id: string
          id?: string
          level_id: number
          size: number
          status?: string
          total: number
          turn_index?: number
          turn_seq?: number
          turn_started_at?: string | null
        }
        Update: {
          created_at?: string
          found?: Json
          host_id?: string
          id?: string
          level_id?: number
          size?: number
          status?: string
          total?: number
          turn_index?: number
          turn_seq?: number
          turn_started_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      versus_advance: {
        Args: { p_player: string; p_room: string; p_seq: number }
        Returns: boolean
      }
      versus_create_room: {
        Args: {
          p_host: string
          p_invitees: string[]
          p_level: number
          p_total: number
        }
        Returns: string
      }
      versus_invites: { Args: { p_player: string }; Returns: Json }
      versus_leave: {
        Args: { p_player: string; p_room: string }
        Returns: undefined
      }
      versus_register: {
        Args: { p_avatar: string; p_id: string; p_name: string }
        Returns: undefined
      }
      versus_respond: {
        Args: { p_accept: boolean; p_player: string; p_room: string }
        Returns: undefined
      }
      versus_state: { Args: { p_room: string }; Returns: Json }
      versus_tap: {
        Args: { p_obj: string; p_player: string; p_room: string }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
