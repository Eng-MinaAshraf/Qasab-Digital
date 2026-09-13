import { createBrowserClient } from '@supabase/ssr';

let browserClient = null;

/**
 * عميل Supabase للمتصفح (Browser Client)
 * يعتمد على @supabase/ssr لتخزين الجلسة والـ Tokens في ملفات تعريف الارتباط (Cookies)
 * بشكل متزامن مع الـ Middleware و Next.js App Router Server Components.
 */
export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
