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
      blockchain_blocks: {
        Row: {
          block_hash: string
          block_number: number
          id: string
          is_validated: boolean | null
          merkle_root: string
          previous_block_hash: string | null
          timestamp: string
          validator_node: string
          votes_count: number | null
        }
        Insert: {
          block_hash: string
          block_number?: number
          id?: string
          is_validated?: boolean | null
          merkle_root: string
          previous_block_hash?: string | null
          timestamp?: string
          validator_node?: string
          votes_count?: number | null
        }
        Update: {
          block_hash?: string
          block_number?: number
          id?: string
          is_validated?: boolean | null
          merkle_root?: string
          previous_block_hash?: string | null
          timestamp?: string
          validator_node?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          created_at: string
          election_id: string | null
          id: string
          manifesto: string | null
          name: string
          party: string
          symbol: string
        }
        Insert: {
          created_at?: string
          election_id?: string | null
          id?: string
          manifesto?: string | null
          name: string
          party: string
          symbol: string
        }
        Update: {
          created_at?: string
          election_id?: string | null
          id?: string
          manifesto?: string | null
          name?: string
          party?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          constituency: string
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          total_voters: number | null
          type: string
          updated_at: string
        }
        Insert: {
          constituency: string
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          title: string
          total_voters?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          constituency?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          title?: string
          total_voters?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_code: string
          user_type: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp_code: string
          user_type: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          user_type?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          constituency: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_type: string
          verified: boolean | null
          voter_id: string | null
        }
        Insert: {
          constituency?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          user_type: string
          verified?: boolean | null
          voter_id?: string | null
        }
        Update: {
          constituency?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_type?: string
          verified?: boolean | null
          voter_id?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          block_hash: string
          candidate_id: string | null
          election_id: string | null
          id: string
          is_verified: boolean | null
          previous_block_hash: string | null
          timestamp: string
          verification_signature: string
          vote_hash: string
          voter_id: string | null
        }
        Insert: {
          block_hash: string
          candidate_id?: string | null
          election_id?: string | null
          id?: string
          is_verified?: boolean | null
          previous_block_hash?: string | null
          timestamp?: string
          verification_signature: string
          vote_hash: string
          voter_id?: string | null
        }
        Update: {
          block_hash?: string
          candidate_id?: string | null
          election_id?: string | null
          id?: string
          is_verified?: boolean | null
          previous_block_hash?: string | null
          timestamp?: string
          verification_signature?: string
          vote_hash?: string
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cast_vote: {
        Args: { p_election_id: string; p_candidate_id: string }
        Returns: Json
      }
      generate_block_hash: {
        Args: {
          p_block_number: number
          p_previous_hash: string
          p_merkle_root: string
          p_timestamp: string
        }
        Returns: string
      }
      generate_otp: {
        Args: { p_email: string; p_user_type: string }
        Returns: string
      }
      generate_vote_hash: {
        Args: {
          p_election_id: string
          p_candidate_id: string
          p_voter_id: string
          p_timestamp: string
        }
        Returns: string
      }
      verify_otp: {
        Args: { p_email: string; p_otp_code: string }
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
