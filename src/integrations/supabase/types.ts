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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          order_id: string
          room_id: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          order_id: string
          room_id: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          order_id?: string
          room_id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "design_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          admin_id: string | null
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          order_id: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_id: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_id?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "design_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      design_orders: {
        Row: {
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          description: string
          design_type: string
          estimated_delivery: string | null
          id: string
          priority: string
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_name: string
          client_phone: string
          created_at?: string
          description: string
          design_type: string
          estimated_delivery?: string | null
          id?: string
          priority?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          description?: string
          design_type?: string
          estimated_delivery?: string | null
          id?: string
          priority?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_files: {
        Row: {
          file_type: string
          id: string
          message_id: string
          name: string
          size_bytes: number
          uploaded_at: string
          url: string
        }
        Insert: {
          file_type: string
          id?: string
          message_id: string
          name: string
          size_bytes: number
          uploaded_at?: string
          url: string
        }
        Update: {
          file_type?: string
          id?: string
          message_id?: string
          name?: string
          size_bytes?: number
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_files: {
        Row: {
          file_type: string
          id: string
          name: string
          order_id: string
          size_bytes: number
          uploaded_at: string
          uploaded_by: string
          url: string
        }
        Insert: {
          file_type: string
          id?: string
          name: string
          order_id: string
          size_bytes: number
          uploaded_at?: string
          uploaded_by: string
          url: string
        }
        Update: {
          file_type?: string
          id?: string
          name?: string
          order_id?: string
          size_bytes?: number
          uploaded_at?: string
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "design_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_order_participant: {
        Args: { order_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
        }
        Returns: undefined
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
