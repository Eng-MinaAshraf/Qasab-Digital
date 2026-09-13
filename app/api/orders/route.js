import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '../../../lib/db';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({
      success: true,
      totalCount: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 1. فحص الـ Rate Limiting (حد أقصى 10 طلبات لكل 5 دقائق لكل IP)
    const rateCheck = await checkRateLimit(request, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 10,
      prefix: 'orders_post',
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'لقد تجاوزت الحد المسموح من الطلبات، يرجى الانتظار بضع دقائق والمحاولة مجدداً.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetSeconds),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await request.json();
    const idempotencyKey =
      request.headers.get('idempotency-key') ||
      request.headers.get('x-idempotency-key') ||
      body.idempotencyKey;

    const result = await createOrder({
      ...body,
      idempotencyKey,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'بيانات الطلب غير صالحة',
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    const statusCode = result.isDuplicate ? 200 : 201;

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'تم تأكيد طلبك بنجاح!',
        order: result.order,
        isDuplicate: !!result.isDuplicate,
      },
      {
        status: statusCode,
        headers: {
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء حفظ الطلب' },
      { status: 500 }
    );
  }
}
