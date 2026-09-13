import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * عميل Supabase للسيرفر (Server Component / Route Handler / Server Action Client)
 * يدعم قراءة وتحديث الجلسات عبر ملفات تعريف الارتباط الآمنة (Secure Cookies).
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // يمكن تجاهل الاستثناء إذا تم استدعاؤه من Server Component بحت
          // حيث يتولى الـ Middleware تحديث الجلسات
        }
      },
    },
  });
}
