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
      bingo_boards: {
        Row: {
          created_at: string | null
          id: string
          team_id: string
          total_completed: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          team_id: string
          total_completed?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          team_id?: string
          total_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bingo_boards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      board_cells: {
        Row: {
          board_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          mission_id: number
          position: number
        }
        Insert: {
          board_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          mission_id: number
          position: number
        }
        Update: {
          board_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          mission_id?: number
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_cells_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "bingo_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_cells_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_missions: {
        Row: {
          bonus_points: number | null
          granted_at: string | null
          granted_by: string
          id: string
          mission_id: number | null
          reason: string | null
          team_id: string
        }
        Insert: {
          bonus_points?: number | null
          granted_at?: string | null
          granted_by: string
          id?: string
          mission_id?: number | null
          reason?: string | null
          team_id: string
        }
        Update: {
          bonus_points?: number | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          mission_id?: number | null
          reason?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_missions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          description: string | null
          display_order: number
          id: number
          is_free_cell: boolean | null
          title: string
        }
        Insert: {
          description?: string | null
          display_order: number
          id?: number
          is_free_cell?: boolean | null
          title: string
        }
        Update: {
          description?: string | null
          display_order?: number
          id?: number
          is_free_cell?: boolean | null
          title?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          cell_id: string
          id: string
          public_url: string
          storage_path: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          cell_id: string
          id?: string
          public_url: string
          storage_path: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          cell_id?: string
          id?: string
          public_url?: string
          storage_path?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "board_cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          id: string
          rank: number
          team_id: string
          total_score: number | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          id?: string
          rank: number
          team_id: string
          total_score?: number | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          id?: string
          rank?: number
          team_id?: string
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          cohort: string
          id: string
          joined_at: string | null
          major: string
          name: string
          school: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          cohort: string
          id?: string
          joined_at?: string | null
          major: string
          name: string
          school: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          cohort?: string
          id?: string
          joined_at?: string | null
          major?: string
          name?: string
          school?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          completed_lines: number | null
          created_at: string | null
          id: string
          is_mission_complete: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          completed_lines?: number | null
          created_at?: string | null
          id?: string
          is_mission_complete?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          completed_lines?: number | null
          created_at?: string | null
          id?: string
          is_mission_complete?: boolean | null
          name?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_team_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
