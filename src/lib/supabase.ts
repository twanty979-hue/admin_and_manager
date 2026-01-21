import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ✅ รับค่าจาก env

// Client ปกติ
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Admin Client (ใช้เฉพาะฝั่ง Server)
export const supabaseAdmin = (() => {
  // เช็คว่ามี Key ไหม และรันบน Server หรือไม่
  if (!supabaseServiceRoleKey || typeof window !== 'undefined') {
    return null; 
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();