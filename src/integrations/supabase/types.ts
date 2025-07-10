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
          message_type: Database["public"]["Enums"]["message_type"]
          order_id: string
          room_id: string
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: Database["public"]["Enums"]["message_type"]
          order_id: string
          room_id: string
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: Database["public"]["Enums"]["message_type"]
          order_id?: string
          room_id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["app_role"]
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
        ]
      }
      chat_rooms: {
        Row: {
          admin_id: string | null
          client_id: string
          created_at: string
          designer_id: string | null
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
          designer_id?: string | null
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
          designer_id?: string | null
          id?: string
          is_active?: boolean
          order_id?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
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
          assigned_designer_id: string | null
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          description: string
          design_type: string
          estimated_delivery: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["order_status"]
          total_price: number | null
          updated_at: string
        }
        Insert: {
          assigned_designer_id?: string | null
          client_id: string
          client_name: string
          client_phone: string
          created_at?: string
          description: string
          design_type: string
          estimated_delivery?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          assigned_designer_id?: string | null
          client_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          description?: string
          design_type?: string
          estimated_delivery?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_orders_assigned_designer_id_fkey"
            columns: ["assigned_designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          },
        ]
      }
      designers: {
        Row: {
          created_at: string
          email: string
          experience_years: number
          id: string
          name: string
          phone: string | null
          portfolio_url: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["designer_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          experience_years?: number
          id?: string
          name: string
          phone?: string | null
          portfolio_url?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["designer_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          experience_years?: number
          id?: string
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["designer_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          notification_types: Json
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_notifications: boolean
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          priority: Database["public"]["Enums"]["priority_level"]
          read_at: string | null
          related_order_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          priority?: Database["public"]["Enums"]["priority_level"]
          read_at?: string | null
          related_order_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          read_at?: string | null
          related_order_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "design_orders"
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
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
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
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin_or_designer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client" | "designer"
      designer_status: "active" | "inactive" | "pending"
      file_type: "image" | "document" | "design"
      message_type: "text" | "file" | "system"
      notification_type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "task"
        | "deadline"
      order_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "delivered"
        | "cancelled"
      priority_level: "low" | "medium" | "high" | "critical"
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
      app_role: ["admin", "client", "designer"],
      designer_status: ["active", "inactive", "pending"],
      file_type: ["image", "document", "design"],
      message_type: ["text", "file", "system"],
      notification_type: [
        "info",
        "success",
        "warning",
        "error",
        "task",
        "deadline",
      ],
      order_status: [
        "pending",
        "in_progress",
        "completed",
        "delivered",
        "cancelled",
      ],
      priority_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
