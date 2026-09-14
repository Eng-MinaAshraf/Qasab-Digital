import crypto from 'crypto';
import { getSupabaseAdminClient } from './supabase/admin.js';

const localRecordedTransactions = new Set();

/**
 * ترتيب الحقول الإلزامية لحساب HMAC SHA-512 الخاص بـ Paymob (Webhook و Redirection)
 * مرتبة أبجدياً طبقاً للتوثيق الرسمي لبوابة Paymob
 */
const PAYMOB_HMAC_KEYS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
];

/**
 * استخراج قيمة الحقل بدقة سواء كان من URLSearchParams (GET Redirection) أو من JSON Webhook (POST)
 */
function extractPaymobField(source, fieldName) {
  const isParams = source instanceof URLSearchParams || (source && typeof source.get === 'function');
  
  if (isParams) {
    if (fieldName === 'order') {
      return source.get('order') || source.get('order_id') || '';
    }
    if (fieldName === 'source_data.pan') {
      return source.get('source_data.pan') || source.get('source_data_pan') || '';
    }
    if (fieldName === 'source_data.sub_type') {
      return source.get('source_data.sub_type') || source.get('source_data_sub_type') || '';
    }
    if (fieldName === 'source_data.type') {
      return source.get('source_data.type') || source.get('source_data_type') || '';
    }
    return source.get(fieldName) || '';
  }

  // في حالة JSON Body (Webhook POST)
  const obj = source?.obj || source || {};

  if (fieldName === 'order') {
    if (obj.order && typeof obj.order === 'object') {
      return obj.order.id !== undefined && obj.order.id !== null ? String(obj.order.id) : '';
    }
    if (obj.order !== undefined && obj.order !== null) return String(obj.order);
    if (obj.order_id !== undefined && obj.order_id !== null) return String(obj.order_id);
    return '';
  }

  if (fieldName === 'source_data.pan') {
    return obj.source_data?.pan ?? obj['source_data.pan'] ?? obj.source_data_pan ?? '';
  }
  if (fieldName === 'source_data.sub_type') {
    return obj.source_data?.sub_type ?? obj['source_data.sub_type'] ?? obj.source_data_sub_type ?? '';
  }
  if (fieldName === 'source_data.type') {
    return obj.source_data?.type ?? obj['source_data.type'] ?? obj.source_data_type ?? '';
  }

  const val = obj[fieldName];
  if (val === undefined || val === null) return '';
  return String(val);
}

/**
 * التحقق الأمني الإلزامي من توقيع HMAC القادم من Paymob لمنع أي تزوير
 * يدعم كل من الـ Webhook (POST) وتوجيه المتصفح (GET Redirection)
 */
export function verifyPaymobHmac(source, receivedHmac) {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

  // وضع المحاكاة والاختبار في حالة عدم توفر مفتاح البيئة
  if (!hmacSecret) {
    console.warn('⚠️ PAYMOB_HMAC_SECRET غير معرّف، جاري قبول عملية المحاكاة للاختبار المحلي.');
    return true;
  }

  if (!receivedHmac) {
    return false;
  }

  try {
    const concatenatedValues = PAYMOB_HMAC_KEYS.map((key) => extractPaymobField(source, key)).join('');

    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(concatenatedValues)
      .digest('hex');

    return calculatedHmac.toLowerCase() === (receivedHmac || '').toLowerCase();
  } catch (err) {
    console.error('Error verifying Paymob HMAC:', err);
    return false;
  }
}

/**
 * إنشاء جلسة دفع إلكتروني عبر Paymob
 * يدعم كلاً من:
 * 1. Paymob Unified Checkout الحديث (Intention API) مع Public & Secret Key
 * 2. التدفق الكلاسيكي (Tokens -> Orders -> Payment Keys -> Iframe)
 * 3. وضع المحاكاة الآمن عند عدم توفر المفاتيح
 */
export async function createPaymobPayment({ orderId, amount, customer, items }) {
  const secretKey = process.env.PAYMOB_SECRET_KEY;
  const publicKey = process.env.PAYMOB_PUBLIC_KEY;
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID || '5912399';
  const iframeId = process.env.PAYMOB_IFRAME_ID;

  const amountCents = Math.round(amount * 100);

  // إذا لم تكن مفاتيح Paymob مضافة، نُرجع رابط محاكاة تجريبي فوري
  if (!secretKey && !apiKey) {
    return {
      success: true,
      isSimulation: true,
      orderId,
      amount,
      paymentUrl: `/checkout/paymob-mock?orderId=${orderId}&amount=${amount}`,
    };
  }

  // ─── 1. التدفق الحديث: Paymob Unified Checkout (Intention API) ─────────────
  if (secretKey && publicKey) {
    try {
      const cleanPhone = customer.phone ? (customer.phone.startsWith('+2') ? customer.phone : `+2${customer.phone.replace(/[\s-]/g, '')}`) : '+201000000000';
      const parsedIntegration = parseInt(integrationId, 10) || 5912399;

      const intentionRes = await fetch('https://accept.paymob.com/v1/intention/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${secretKey}`,
        },
        body: JSON.stringify({
          amount: amountCents,
          currency: 'EGP',
          payment_methods: [parsedIntegration],
          special_reference: orderId,
          items: [{
            name: 'Total Order',
            amount: amountCents,
            quantity: 1,
            description: `Order ID: ${orderId}`,
          }],
          billing_data: {
            first_name: customer.name?.split(' ')[0] || 'Customer',
            last_name: customer.name?.split(' ').slice(1).join(' ') || 'Qasab',
            phone_number: cleanPhone,
            email: customer.email || 'customer@qasab.eg',
            street: customer.address || 'Cairo',
            building: '1',
            floor: '1',
            apartment: '1',
            city: 'Cairo',
            country: 'EG',
          },
          customer: {
            first_name: customer.name?.split(' ')[0] || 'Customer',
            last_name: customer.name?.split(' ').slice(1).join(' ') || 'Qasab',
            email: customer.email || 'customer@qasab.eg',
          },
        }),
      });

      const intentionData = await intentionRes.json();

      if (intentionData.client_secret) {
        const clientSecret = intentionData.client_secret;
        const paymobOrderId = intentionData.intention_order_id || intentionData.id;
        const paymentUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

        // توثيق المعاملة مسبقاً لربط رقم طلب المتجر بالـ paymobOrderId
        try {
          await recordPaymentTransaction({
            orderId,
            paymobOrderId: String(paymobOrderId),
            paymobTransactionId: `intention_${clientSecret.slice(-14)}`,
            amountCents,
            currency: 'EGP',
            status: 'pending',
            paymentMethod: 'card',
          });
        } catch (e) {
          console.warn('⚠️ فشل تسجيل المعاملة المبدئية (Intention) في Paymob:', e.message);
        }

        return {
          success: true,
          paymobOrderId,
          clientSecret,
          paymentUrl,
        };
      } else {
        console.warn('⚠️ Intention API returned alternative response, trying fallback:', intentionData);
      }
    } catch (intErr) {
      console.warn('⚠️ Paymob Intention API call error:', intErr.message);
    }
  }

  // ─── 2. التدفق الكلاسيكي: Tokens -> Orders -> Payment Keys ───────────────
  try {
    // 1. المصادقة وتوليد Auth Token
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    // 2. تسجيل الطلب في Paymob
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: 'false',
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: orderId,
        items: [{
          name: 'Total Order',
          amount_cents: amountCents,
          quantity: 1,
          description: `Order ID: ${orderId}`,
        }],
      }),
    });
    const paymobOrder = await orderRes.json();

    // 3. طلب مفتاح الدفع Payment Key
    const keyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: paymobOrder.id,
        billing_data: {
          first_name: customer.name?.split(' ')[0] || 'Customer',
          last_name: customer.name?.split(' ').slice(1).join(' ') || 'Qasab',
          email: customer.email || 'customer@qasab.eg',
          phone_number: customer.phone || '+201000000000',
          street: customer.address || 'Cairo',
          building: '1',
          floor: '1',
          apartment: '1',
          city: 'Cairo',
          country: 'EG',
        },
        currency: 'EGP',
        integration_id: integrationId,
      }),
    });
    const keyData = await keyRes.json();
    const paymentKey = keyData.token;

    const paymentUrl = iframeId
      ? `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`
      : `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey || ''}&clientSecret=${paymentKey}`;

    // حفظ الربط بين paymobOrderId ورقم طلب المتجر في جدول المعاملات مسبقاً
    try {
      await recordPaymentTransaction({
        orderId,
        paymobOrderId: String(paymobOrder.id),
        paymobTransactionId: `init_${paymobOrder.id}`,
        amountCents,
        currency: 'EGP',
        status: 'pending',
        paymentMethod: 'card',
          });
    } catch (e) {
      console.warn('⚠️ فشل تسجيل المعاملة المبدئية (Classic) في Paymob:', e.message);
    }

    return {
      success: true,
      paymobOrderId: paymobOrder.id,
      paymentUrl,
    };
  } catch (err) {
    console.error('Paymob API call error:', err);
    return {
      success: false,
      message: 'تعذر الاتصال ببوابة الدفع Paymob، يرجى المحاولة لاحقاً',
    };
  }
}

/**
 * فحص وتوثيق العملية في جدول payment_transactions لمنع التكرار (Idempotent)
 */
export async function recordPaymentTransaction({
  orderId,
  paymobOrderId,
  paymobTransactionId,
  amountCents,
  currency = 'EGP',
  status = 'success',
  paymentMethod = 'card',
  hmacValid = true,
  rawPayload = {},
}) {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      // فحص مسبق: هل تم معالجة هذا الـ transaction_id بالفعل؟
      const { data: existing } = await admin
        .from('payment_transactions')
        .select('id, status')
        .eq('paymob_transaction_id', String(paymobTransactionId))
        .maybeSingle();

      if (existing) {
        return { isDuplicate: true, transaction: existing };
      }

      const { data, error } = await admin
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          paymob_order_id: String(paymobOrderId || ''),
          paymob_transaction_id: String(paymobTransactionId),
          amount_cents: amountCents,
          currency,
          status,
          payment_method: paymentMethod,
          hmac_valid: hmacValid,
          raw_payload: rawPayload,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // خطأ انتهاك قيد التفرّد في الـ DB
          return { isDuplicate: true };
        }
        throw error;
      }

      return { isDuplicate: false, transaction: data };
    } catch (e) {
      console.warn('⚠️ تعذر تسجيل المعاملة في Supabase:', e.message);
    }
  }

  // Fallback: التوثيق المحلي لمنع تكرار الـ Webhook
  const key = String(paymobTransactionId);
  if (localRecordedTransactions.has(key)) {
    return { isDuplicate: true };
  }
  localRecordedTransactions.add(key);
  return { isDuplicate: false };
}

/**
 * البحث عن الطلب برقم معاملة أو رقم طلب Paymob أو رقم طلب المتجر
 */
export async function findOrderByPaymobData({ paymobOrderId, paymobTransactionId, merchantOrderId }) {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      // 1. فحص برقم طلب المتجر المباشر
      if (merchantOrderId) {
        const { data: order } = await admin
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', merchantOrderId)
          .maybeSingle();
        if (order) return order;
      }

      // 2. فحص برقم معاملة Paymob
      if (paymobTransactionId) {
        const { data: txn } = await admin
          .from('payment_transactions')
          .select('order_id')
          .eq('paymob_transaction_id', String(paymobTransactionId))
          .maybeSingle();
        if (txn?.order_id) {
          const { data: order } = await admin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', txn.order_id)
            .maybeSingle();
          if (order) return order;
        }
      }

      // 3. فحص برقم طلب Paymob
      if (paymobOrderId) {
        const { data: txn } = await admin
          .from('payment_transactions')
          .select('order_id')
          .eq('paymob_order_id', String(paymobOrderId))
          .maybeSingle();
        if (txn?.order_id) {
          const { data: order } = await admin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', txn.order_id)
            .maybeSingle();
          if (order) return order;
        }
      }
    } catch (e) {
      console.warn('⚠️ خطأ أثناء البحث عن الطلب في Supabase:', e.message);
    }
  }

  return null;
}
