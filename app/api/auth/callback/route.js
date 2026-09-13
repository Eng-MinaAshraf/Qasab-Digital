import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';

/**
 * Route Handler لتبادل كود المصادقة (PKCE Code Exchange)
 * يُستخدم عند النقر على روابط تأكيد البريد الإلكتروني أو استعادة كلمة المرور
 * مع حماية صارمة ضد ثغرات التوجيه المفتوح (Open Redirect Protection)
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/account';

  // حماية Open Redirect: التأكد أن مسار التحويل يبدأ بـ / ولا يحتوي على بروتوكول خارجي
  let safeRedirectPath = '/account';
  if (next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) {
    safeRedirectPath = next;
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(safeRedirectPath, origin));
      }
      console.warn('Auth code exchange error:', error.message);
    }
  }

  // في حال عدم وجود كود أو فشل التبادل
  const fallbackUrl = new URL('/login', origin);
  fallbackUrl.searchParams.set('error', 'invalid_or_expired_link');
  return NextResponse.redirect(fallbackUrl);
}
