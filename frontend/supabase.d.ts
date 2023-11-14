export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      entry: {
        Row: {
          amount: unknown
          amount_is_positive: boolean
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: number
        }
        Insert: {
          amount: unknown
          amount_is_positive: boolean
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: number
        }
        Update: {
          amount?: unknown
          amount_is_positive?: boolean
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "entry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
