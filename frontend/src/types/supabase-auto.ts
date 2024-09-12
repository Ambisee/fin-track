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
          id: number
          is_positive: boolean
          name: string
          user_created: boolean | null
        }
        Insert: {
          id?: number
          is_positive?: boolean
          name: string
          user_created?: boolean | null
        }
        Update: {
          id?: number
          is_positive?: boolean
          name?: string
          user_created?: boolean | null
        }
        Relationships: []
      }
      currencies: {
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
      entry: {
        Row: {
          amount: number
          amount_is_positive: boolean
          created_by: string | null
          date: string
          id: number
          note: string | null
          title: string | null
        }
        Insert: {
          amount: number
          amount_is_positive: boolean
          created_by?: string | null
          date?: string
          id?: number
          note?: string | null
          title?: string | null
        }
        Update: {
          amount?: number
          amount_is_positive?: boolean
          created_by?: string | null
          date?: string
          id?: number
          note?: string | null
          title?: string | null
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
            foreignKeyName: "entry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          allow_report: boolean
          currency_id: number
          id: number
          user_id: string
        }
        Insert: {
          allow_report?: boolean
          currency_id?: number
          id?: number
          user_id: string
        }
        Update: {
          allow_report?: boolean
          currency_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_data_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_category: {
        Row: {
          category_id: number | null
          id: number
          user_id: string | null
        }
        Insert: {
          category_id?: number | null
          id?: number
          user_id?: string | null
        }
        Update: {
          category_id?: number | null
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_category_link_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_category_link_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_category_link_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_view: {
        Row: {
          allow_report: boolean | null
          currency_name: string | null
          email: string | null
          id: string | null
          username: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      fetch_categories: {
        Args: {
          user_id: string
        }
        Returns: {
          id: number
          name: string
        }[]
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