export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      designers: {
        Row: {
          created_at: string
          email: string
          experience_years: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name: string
          phone: string | null
          portfolio_url: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name: string
          phone?: string | null
          portfolio_url?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      add_designer: {
        Args: {
          p_name: string
          p_email: string
          p_phone?: string
          p_specialization?: string
          p_experience_years?: number
          p_portfolio_url?: string
        }
        Returns: string
      }
      check_email_exists: {
        Args: { p_email: string }
        Returns: Json
      }
      get_all_orders_for_designers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          client_id: string
          client_name: string
          client_phone: string
          design_type: string
          description: string
          status: string
          priority: string
          total_price: number
          estimated_delivery: string
          created_at: string
          updated_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_designer_comprehensive: {
        Args: { p_email: string }
        Returns: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          specialization: string
          experience_years: number
          portfolio_url: string
          is_verified: boolean
          is_active: boolean
        }[]
      }
      is_designer: {
        Args: { user_id?: string }
        Returns: boolean
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
      verify_designer: {
        Args: { p_email: string }
        Returns: boolean
      }
      verify_designer_comprehensive: {
        Args: { p_email: string }
        Returns: boolean
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
