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
            foreignKeyName: "fk_ledger"
            columns: ["ledger"]
            isOneToOne: false
            referencedRelation: "ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ledger"
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
        Args: {
          new: unknown
        }
        Returns: undefined
      }
      create_initial_ledger: {
        Args: {
          new: unknown
        }
        Returns: undefined
      }
      create_settings: {
        Args: {
          new: unknown
        }
        Returns: undefined
      }
      update_password: {
        Args: {
          old_password: string
          new_password: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
