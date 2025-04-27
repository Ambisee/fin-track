export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      category: {
        Row: {
          created_by: string
          name: string
        }
        Insert: {
          created_by: string
          name: string
        }
        Update: {
          created_by?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
        ]
      }
      currency: {
        Row: {
          currency_name: string
          id: number
        }
        Insert: {
          currency_name: string
          id?: number
        }
        Update: {
          currency_name?: string
          id?: number
        }
        Relationships: []
      }
      default_category: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      entry: {
        Row: {
          amount: number
          category: string
          created_by: string
          date: string
          id: number
          is_positive: boolean
          ledger: number
          note: string | null
        }
        Insert: {
          amount: number
          category: string
          created_by: string
          date?: string
          id?: number
          is_positive: boolean
          ledger: number
          note?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_by?: string
          date?: string
          id?: number
          is_positive?: boolean
          ledger?: number
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_ledger_fkey"
            columns: ["ledger"]
            isOneToOne: false
            referencedRelation: "ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_ledger_fkey"
            columns: ["ledger"]
            isOneToOne: false
            referencedRelation: "month_groups"
            referencedColumns: ["ledger_id"]
          },
        ]
      }
      ledger: {
        Row: {
          created_by: string
          currency_id: number
          id: number
          name: string
        }
        Insert: {
          created_by: string
          currency_id: number
          id?: number
          name?: string
        }
        Update: {
          created_by?: string
          currency_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currency"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          allow_report: boolean
          current_ledger: number
          user_id: string
        }
        Insert: {
          allow_report?: boolean
          current_ledger?: number
          user_id: string
        }
        Update: {
          allow_report?: boolean
          current_ledger?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_current_ledger_fkey"
            columns: ["current_ledger"]
            isOneToOne: false
            referencedRelation: "ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_current_ledger_fkey"
            columns: ["current_ledger"]
            isOneToOne: false
            referencedRelation: "month_groups"
            referencedColumns: ["ledger_id"]
          },
          {
            foreignKeyName: "user_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      month_groups: {
        Row: {
          created_by: string | null
          ledger_id: number | null
          month: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
        ]
      }
      statistic: {
        Row: {
          category: string | null
          created_by: string | null
          is_positive: boolean | null
          ledger: number | null
          period: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_ledger_fkey"
            columns: ["ledger"]
            isOneToOne: false
            referencedRelation: "ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_ledger_fkey"
            columns: ["ledger"]
            isOneToOne: false
            referencedRelation: "month_groups"
            referencedColumns: ["ledger_id"]
          },
        ]
      }
      user_view: {
        Row: {
          allow_report: boolean | null
          current_ledger: number | null
          email: string | null
          id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_current_ledger_fkey"
            columns: ["current_ledger"]
            isOneToOne: false
            referencedRelation: "ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_current_ledger_fkey"
            columns: ["current_ledger"]
            isOneToOne: false
            referencedRelation: "month_groups"
            referencedColumns: ["ledger_id"]
          },
        ]
      }
    }
    Functions: {
      create_default_categories: {
        Args: { new: unknown }
        Returns: undefined
      }
      create_initial_ledger: {
        Args: { new: unknown }
        Returns: undefined
      }
      create_settings: {
        Args: { new: unknown }
        Returns: undefined
      }
      search_entry: {
        Args: { query: string }
        Returns: {
          amount: number
          category: string
          created_by: string
          date: string
          id: number
          is_positive: boolean
          ledger: number
          note: string | null
        }[]
      }
      update_password: {
        Args: { old_password: string; new_password: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
