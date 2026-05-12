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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'agent'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'agent'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'agent'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          lifetime_value: number
          churn_risk_score: number | null
          vip_status: boolean
          personality_summary: string | null
          custom_fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          lifetime_value?: number
          churn_risk_score?: number | null
          vip_status?: boolean
          personality_summary?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          lifetime_value?: number
          churn_risk_score?: number | null
          vip_status?: boolean
          personality_summary?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          customer_id: string
          agent_id: string | null
          type: 'email' | 'chat' | 'call' | 'note' | 'ticket'
          direction: 'inbound' | 'outbound' | 'internal'
          content: string
          sentiment_score: number | null
          ai_summary: string | null
          interaction_date: string
        }
        Insert: {
          id?: string
          customer_id: string
          agent_id?: string | null
          type: 'email' | 'chat' | 'call' | 'note' | 'ticket'
          direction: 'inbound' | 'outbound' | 'internal'
          content: string
          sentiment_score?: number | null
          ai_summary?: string | null
          interaction_date?: string
        }
        Update: {
          id?: string
          customer_id?: string
          agent_id?: string | null
          type?: 'email' | 'chat' | 'call' | 'note' | 'ticket'
          direction?: 'inbound' | 'outbound' | 'internal'
          content?: string
          sentiment_score?: number | null
          ai_summary?: string | null
          interaction_date?: string
        }
      }
      transactions: {
        Row: {
          id: string
          customer_id: string
          amount: number
          currency: string
          status: 'completed' | 'pending' | 'refunded' | 'failed'
          transaction_date: string
        }
        Insert: {
          id?: string
          customer_id: string
          amount: number
          currency?: string
          status: 'completed' | 'pending' | 'refunded' | 'failed'
          transaction_date?: string
        }
        Update: {
          id?: string
          customer_id?: string
          amount?: number
          currency?: string
          status?: 'completed' | 'pending' | 'refunded' | 'failed'
          transaction_date?: string
        }
      }
      sf_profiles: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      sf_roles: {
        Row: {
          id: string
          name: string
          parent_role_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_role_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_role_id?: string | null
          created_at?: string
        }
      }
      sf_users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          alias: string
          email: string
          username: string
          nickname: string | null
          title: string | null
          company: string | null
          department: string | null
          role_id: string | null
          profile_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          alias: string
          email: string
          username: string
          nickname?: string | null
          title?: string | null
          company?: string | null
          department?: string | null
          role_id?: string | null
          profile_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          alias?: string
          email?: string
          username?: string
          nickname?: string | null
          title?: string | null
          company?: string | null
          department?: string | null
          role_id?: string | null
          profile_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sf_objects: {
        Row: {
          id: string
          label: string
          plural_label: string
          api_name: string
          is_custom: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          plural_label: string
          api_name: string
          is_custom?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          plural_label?: string
          api_name?: string
          is_custom?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sf_fields: {
        Row: {
          id: string
          object_id: string
          field_label: string
          field_api_name: string
          data_type: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'
          target_object_id: string | null
          is_required: boolean
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          object_id: string
          field_label: string
          field_api_name: string
          data_type: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'
          target_object_id?: string | null
          is_required?: boolean
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          object_id?: string
          field_label?: string
          field_api_name?: string
          data_type?: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'
          target_object_id?: string | null
          is_required?: boolean
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sf_records: {
        Row: {
          id: string
          object_id: string
          owner_id: string | null
          record_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          object_id: string
          owner_id?: string | null
          record_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          object_id?: string
          owner_id?: string | null
          record_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      sf_activities: {
        Row: {
          id: string
          record_id: string
          user_id: string | null
          type: 'Call' | 'Email' | 'Note' | 'Meeting'
          subject: string
          description: string | null
          activity_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          record_id: string
          user_id?: string | null
          type: 'Call' | 'Email' | 'Note' | 'Meeting'
          subject: string
          description?: string | null
          activity_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          user_id?: string | null
          type?: 'Call' | 'Email' | 'Note' | 'Meeting'
          subject?: string
          description?: string | null
          activity_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      sf_flows: {
        Row: {
          id: string
          name: string
          object_id: string
          trigger_type: 'onCreate' | 'onUpdate' | 'onSave'
          conditions: Json
          actions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          object_id: string
          trigger_type: 'onCreate' | 'onUpdate' | 'onSave'
          conditions?: Json
          actions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          object_id?: string
          trigger_type?: 'onCreate' | 'onUpdate' | 'onSave'
          conditions?: Json
          actions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sf_layouts: {
        Row: {
          id: string
          object_id: string
          layout_name: string
          layout_config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          object_id: string
          layout_name: string
          layout_config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          object_id?: string
          layout_name?: string
          layout_config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      sf_api_keys: {
        Row: {
          id: string
          key_hash: string
          owner_id: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key_hash: string
          owner_id: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key_hash?: string
          owner_id?: string
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          dashboard_config: Json
          locale: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          dashboard_config?: Json
          locale?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          dashboard_config?: Json
          locale?: string
          updated_at?: string
        }
      }
    }
  }
}
