import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    debug: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          roll_number: string;
          phone_number: string | null;
          hostel_block: string | null;
          room_number: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          roll_number: string;
          phone_number?: string | null;
          hostel_block?: string | null;
          room_number?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          roll_number?: string;
          phone_number?: string | null;
          hostel_block?: string | null;
          room_number?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          number: string;
          block: string;
          capacity: number;
          occupied: number;
          amenities: string[];
          rent: number;
          available: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      room_bookings: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          booking_date: string;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          room_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          booking_date?: string;
          start_date: string;
          end_date?: string | null;
        };
      };
      mess_menus: {
        Row: {
          id: string;
          day_of_week: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner';
          items: string[];
          meal_time: string;
          created_at: string;
          updated_at: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: 'maintenance' | 'mess' | 'security' | 'other';
          status: 'pending' | 'in-progress' | 'resolved';
          priority: 'low' | 'medium' | 'high';
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description: string;
          category: 'maintenance' | 'mess' | 'security' | 'other';
          status?: 'pending' | 'in-progress' | 'resolved';
          priority?: 'low' | 'medium' | 'high';
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          priority: 'low' | 'medium' | 'high';
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}