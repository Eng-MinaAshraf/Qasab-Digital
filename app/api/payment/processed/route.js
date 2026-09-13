import { NextResponse } from 'next/server';
import { verifyPaymobHmac, recordPaymentTransaction } from '../../../../lib/paymob';
import { updatePaymentStatus } from '../../../../lib/db';

/**
 * ==============================================================================
 * Paymob — Transaction Processed Callback (Server-to-Server Webhook)
 * ==============================================================================
 * هذا المسار يستقبل الإشعارات المباشرة من خوادم Paymob (HTTP POST) فور اكتمال
 * أي محاولة دفع إلكتروني، ويتحقق أمنياً من التوقيع الرقمي HMAC ويحدث حالة الطلب.
 *
 * الرابط للاستخدام في لوحة تحكم Paymob:
 * https://<YOUR_DOMAIN>/api/payment/processed
 */

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryHmac = searchParams.get('hmac');

    const payload = await request.json();
    const obj = payload.obj || payload;

    const transactionId = obj.id;
    const merchantOrderId = obj.order?.merchant_order_id || obj.merchant_order_id;
    const amountCents = obj.amount_cents;
    const isSuccess = obj.success === true;
    const receivedHmac = queryHmac || request.headers.get('x-paymob-hmac') || payload.hmac;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'معرف المعاملة (transaction_id) مفقود' },
        { status: 400 }
      );
    }

    // ─── 1. الحماية الصارمة من تكرار الـ Webhook (Idempotency Guard) ───
    const recordCheck = await recordPaymentTransaction({
      orderId: merchantOrderId,
      paymobOrderId: obj.order?.id || obj.order,
      paymobTransactionId: transactionId,
      amountCents: amountCents || 0,
      currency: obj.currency || 'EGP',
      status: isSuccess ? 'success' : 'failed',
      paymentMethod: obj.source_data?.type || 'card',
      hmacValid: true,
      rawPayload: payload,
    });

    if (recordCheck.isDuplicate) {
      console.log(`ℹ️ [Processed Callback Idempotency] تم استلام إشعار مكرر للمعاملة ${transactionId}، تم التجاهل وإرجاع 200.`);
      return NextResponse.json(
        { success: true, message: 'المعاملة مسجلة مسبقاً (تم التعامل مع التكرار بنجاح)' },
        { status: 200 }
      );
    }

    // ─── 2. التحقق الأمني من توقيع HMAC SHA-512 لمنع أي تلاعب ───────────
    const isHmacValid = verifyPaymobHmac(payload, receivedHmac);
    if (!isHmacValid) {
      console.error('❌ توقيع HMAC غير صالح في Paymob Processed Callback');
      return NextResponse.json(
        { success: false, message: 'توقيع أمني غير صالح (Invalid HMAC Signature)' },
        { status: 400 }
      );
    }

    // ─── 3. تحديث حالة الطلب في قاعدة البيانات ───────────────────────────
    if (isSuccess && merchantOrderId) {
      await updatePaymentStatus(merchantOrderId, {
        status: 'paid',
        paymobTransactionId: transactionId,
        paymentMethod: obj.source_data?.type || 'paymob_card',
      });
      console.log(`✅ [Paymob Processed Callback] تم تأكيد دفع الطلب ${merchantOrderId} بنجاح.`);
    } else if (merchantOrderId) {
      await updatePaymentStatus(merchantOrderId, {
        status: 'failed',
        paymobTransactionId: transactionId,
      });
      console.warn(`⚠️ [Paymob Processed Callback] فشلت محاولة دفع الطلب ${merchantOrderId}.`);
    }

    return NextResponse.json({
      success: true,
      message: 'تمت معالجة الإشعار بنجاح (Processed callback received and handled)',
    });
  } catch (err) {
    console.error('Error in Paymob processed callback:', err);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء معالجة Processed Callback' },
      { status: 500 }
    );
  }
}

/**
 * دعم GET لفحص جاهزية الرابط (Health Check)
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'Paymob Transaction Processed Callback',
    expectedMethod: 'POST',
    timestamp: new Date().toISOString(),
  });
}
