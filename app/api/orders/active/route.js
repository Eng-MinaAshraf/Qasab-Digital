import { NextResponse } from 'next/server';
import { getOrderById, getOrders } from '../../../../lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * ==============================================================================
 * مسار جلب أحدث طلب نشط (Latest Active Order) للمستخدم الحالي أو الزائر
 * ==============================================================================
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestOrderId = searchParams.get('orderId');

    // 1. إذا تم تمرير رقم طلب صريح (Guest أو مباشر)
    if (guestOrderId) {
      const order = await getOrderById(guestOrderId);
      if (order) {
        return NextResponse.json({ success: true, order });
      }
    }

    // 2. فحص هوية المستخدم المسجل عبر Supabase
    let userId = null;
    try {
      const cookieStore = await cookies();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      }
    } catch (_) {}

    // 3. جلب جميع الطلبات واختيار أحدث طلب نشط
    const allOrders = await getOrders();
    let matchedOrder = null;

    if (userId) {
      matchedOrder = allOrders.find(
        (o) => o.user_id === userId && o.status !== 'cancelled'
      );
    }

    // إذا لم نجد طلب للمستخدم المسجل ولكن يوجد guestOrderId
    if (!matchedOrder && guestOrderId) {
      matchedOrder = allOrders.find((o) => o.id === guestOrderId);
    }

    return NextResponse.json({
      success: true,
      order: matchedOrder || null,
    });
  } catch (error) {
    console.error('Error in /api/orders/active:', error);
    return NextResponse.json(
      { success: false, message: 'تعذر جلب بيانات الطلب النشط' },
      { status: 500 }
    );
  }
}
