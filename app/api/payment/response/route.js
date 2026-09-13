import { NextResponse } from 'next/server';
import { verifyPaymobHmac, findOrderByPaymobData } from '../../../../lib/paymob';
import { updatePaymentStatus } from '../../../../lib/db';

/**
 * ==============================================================================
 * Paymob — Transaction Response Callback (Client Browser Redirection)
 * ==============================================================================
 * هذا المسار يستقبل توجيه متصفح العميل (Browser Redirection عبر GET) بعد إنهاء عملية الدفع
 * أو صفحة الـ 3D Secure على Paymob، ويتحقق من التوقيع الرقمي HMAC، ويحدث حالة الدفع فوراً
 * ويوجه العميل إما إلى صفحة تأكيد الطلب (/checkout/success) أو العودة للسلة (/checkout) في حالة الفشل.
 *
 * الرابط للاستخدام في لوحة تحكم Paymob:
 * https://<YOUR_DOMAIN>/api/payment/response
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const receivedHmac = searchParams.get('hmac');
    const isSuccess = searchParams.get('success') === 'true' && searchParams.get('error_occured') !== 'true';
    const transactionId = searchParams.get('id');
    const paymobOrderId = searchParams.get('order');
    let merchantOrderId = searchParams.get('merchant_order_id');

    // ─── 1. التحقق من توقيع HMAC القادم مع معلمات التوجيه ───────────────
    const isHmacValid = verifyPaymobHmac(searchParams, receivedHmac);
    if (!isHmacValid) {
      console.warn('⚠️ [Paymob Response Callback] تم استلام توجيه بتوقيع HMAC غير صالح.');
      const errorMsg = 'تعذر التحقق من مصداقية عملية الدفع من بوابة Paymob (Invalid HMAC).';
      return NextResponse.redirect(new URL(`/checkout?error=${encodeURIComponent(errorMsg)}`, request.url));
    }

    // ─── 2. التعرف على رقم طلب المتجر ──────────────────────────────────
    if (!merchantOrderId && (paymobOrderId || transactionId)) {
      const matchedOrder = await findOrderByPaymobData({
        paymobOrderId,
        paymobTransactionId: transactionId,
      });
      if (matchedOrder) {
        merchantOrderId = matchedOrder.id;
      }
    }

    // ─── 3. في حالة نجاح الدفع ──────────────────────────────────────────
    if (isSuccess) {
      if (merchantOrderId) {
        // تأكيد تحديث حالة الطلب إلى paid فورياً لضمان عدم انتظار العميل للـ Webhook
        await updatePaymentStatus(merchantOrderId, {
          status: 'paid',
          paymobTransactionId: transactionId,
          paymentMethod: searchParams.get('source_data.type') || 'paymob_card',
        });
        console.log(`✅ [Paymob Response Callback] تم تأكيد دفع الطلب ${merchantOrderId} عبر التوجيه المباشر.`);
      }

      const successUrl = new URL('/checkout/success', request.url);
      if (merchantOrderId) successUrl.searchParams.set('orderId', merchantOrderId);
      if (transactionId) successUrl.searchParams.set('txnId', transactionId);

      return NextResponse.redirect(successUrl);
    }

    // ─── 4. في حالة فشل الدفع أو الإلغاء ────────────────────────────────
    const failReason =
      searchParams.get('data.message') ||
      searchParams.get('data_message') ||
      'تم إلغاء عملية الدفع الإلكتروني أو تم رفضها من البنك المصدر للبطاقة. يمكنك المحاولة مرة أخرى أو اختيار الدفع عند الاستلام.';

    if (merchantOrderId) {
      await updatePaymentStatus(merchantOrderId, {
        status: 'failed',
        paymobTransactionId: transactionId,
      });
    }

    const failUrl = new URL('/checkout', request.url);
    failUrl.searchParams.set('error', failReason);
    if (merchantOrderId) failUrl.searchParams.set('orderId', merchantOrderId);

    return NextResponse.redirect(failUrl);
  } catch (err) {
    console.error('Error handling Paymob Response Callback:', err);
    return NextResponse.redirect(
      new URL('/checkout?error=' + encodeURIComponent('حدث خطأ غير متوقع أثناء معالجة توجيه الدفع'), request.url)
    );
  }
}

/**
 * دعم POST في حالة تهيئة بوابة الدفع لإرسال التوجيه عبر Form Post
 */
export async function POST(request) {
  return GET(request);
}
