import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string | null;
          organization_id: string | null;
          role: 'RESELLER' | 'DISTRIBUTOR' | 'END_USER' | 'PLATFORM_ADMIN';
          phone_number: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          legal_name: string;
          type: 'DISTRIBUTOR' | 'RESELLER' | 'INDIVIDUAL';
          logo: string | null;
          description: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
