import { createClient } from '@supabase/supabase-js';

let adminClient = null;

/**
 * عميل Supabase الإداري للسيرفر (Admin / Service Role Client)
 * يمتلك صلاحيات تجاوز الـ RLS للاستخدام الحصري في الـ Server Routes (مثل Webhook الدفع وتأكيد الحسابات).
 * ⚠️ تحذير أمني:
 * - لا يتم استدعاؤه مطلقاً في جانب المتصفح أو مكونات العميل.
 * - لا يستخدم المفتاح العام (Anon Key) كبديل لضمان عدم حدوث إخفاق صامت في الصلاحيات.
 */
export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
