import { NextResponse } from 'next/server';
import { getOrders, updateOrderStatus, updatePaymentStatus } from '../../../../lib/db';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Admin GET orders error:', error);
    return NextResponse.json({ success: false, message: 'تعذر جلب الطلبات' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, refundReference } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId مطلوب' }, { status: 400 });
    }

    if (status) {
      const res = await updateOrderStatus(orderId, status);
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
    }

    if (paymentStatus) {
      const res = await updatePaymentStatus(orderId, {
        status: paymentStatus,
        paymobTransactionId: refundReference,
      });
      if (!res.success) {
        return NextResponse.json(res, { status: 400 });
      }
    }

    const orders = await getOrders();
    const updated = orders.find((o) => o.id === orderId);

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Admin PATCH orders error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء تحديث الطلب' }, { status: 500 });
  }
}
