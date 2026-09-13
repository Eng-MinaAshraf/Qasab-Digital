import { NextResponse } from 'next/server';
import { createOrder } from '../../../../lib/db';
import { createPaymobPayment } from '../../../../lib/paymob';
import { checkRateLimit } from '../../../../lib/rateLimit';

export async function POST(request) {
  try {
    const rateCheck = await checkRateLimit(request, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 8,
      prefix: 'payment_create',
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: 'تجاوزت الحد المسموح من محاولات الدفع، يرجى الانتظار قليلاً.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { customer, items, paymentMethod = 'paymob_card', idempotencyKey } = body;

    // 1. إنشاء الطلب بقاعدة البيانات بحالة unpaid
    const orderRes = await createOrder({
      customer,
      items,
      paymentMethod,
      idempotencyKey,
    });

    if (!orderRes.success) {
      return NextResponse.json(
        { success: false, message: 'بيانات الطلب غير صالحة', errors: orderRes.errors },
        { status: 400 }
      );
    }

    const order = orderRes.order;

    // 2. إنشاء جلسة الدفع عبر Paymob
    const paymobRes = await createPaymobPayment({
      orderId: order.id,
      amount: order.total,
      customer,
      items: order.items,
    });

    if (!paymobRes.success) {
      return NextResponse.json(
        { success: false, message: paymobRes.message || 'تعذر بدء عملية الدفع الإلكتروني' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: paymobRes.paymentUrl,
      isSimulation: !!paymobRes.isSimulation,
    });
  } catch (err) {
    console.error('Error in payment/create route:', err);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع أثناء تجهيز الدفع الإلكتروني' },
      { status: 500 }
    );
  }
}
