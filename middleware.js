import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // تحديث الجلسة والتحقق من هوية المستخدم الحقيقية من خادم Supabase
  // استخدام getUser() بدلاً من getSession() لمنع أي تزوير محلي للـ JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. حماية مسار حساب العميل (/account)
  if (pathname.startsWith('/account')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. حماية مسارات لوحة التحكم الإدارية (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return supabaseResponse;
    }

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }

    // التحقق من الصلاحية: التحقق من وجود دور admin في app_metadata أو التحقق عبر الـ profile
    const isAdmin =
      user.app_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'admin' ||
      user.email === 'admin@qasab.eg' ||
      user.email === 'qasab.digital@gmail.com' ||
      user.email === 'engminaashraf019@gmail.com';

    if (!isAdmin) {
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(homeUrl);
    }
  }

  // 3. إعادة توجيه المستخدم المسجل بالفعل بعيداً عن صفحات الدخول والتسجيل
  if (
    (pathname === '/login' || pathname === '/register') &&
    user &&
    !request.nextUrl.searchParams.get('redirect')
  ) {
    // يمكن السماح بالتنقل إذا كان هناك معامل محدد، وإلا التوجيه لصفحة الحساب
    // نترك للمستخدم حرية البقاء إذا طلب ذلك
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * تطبيق الـ Middleware على جميع المسارات باستثناء:
     * - _next/static (الملفات الثابتة)
     * - _next/image (صور Next.js المحسنة)
     * - favicon.ico، أيقونات، صور عامة
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
