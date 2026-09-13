// ==============================================================================
// فحص شامل وتأكيدي لمسارات Paymob Callbacks (Processed & Response)
// ==============================================================================

import crypto from 'crypto';
import { verifyPaymobHmac } from '../lib/paymob.js';

console.log('🧪 بدء اختبار وتدقيق مسارات وتكامل Paymob Callbacks...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ إخفاق: ${message}`);
    failCount++;
  }
}

// 1. اختبار حساب HMAC على حمولة Webhook (POST)
console.log('1️⃣ فحص صحة حساب وتحقق HMAC للـ Processed Callback (POST):');
const mockSecret = 'test_secret_key_12345';
process.env.PAYMOB_HMAC_SECRET = mockSecret;

const webhookPayload = {
  type: 'TRANSACTION',
  obj: {
    amount_cents: 10500,
    created_at: '2026-09-12T10:00:00.000Z',
    currency: 'EGP',
    error_occured: false,
    has_parent_transaction: false,
    id: 998877,
    integration_id: 4567,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: {
      id: 887766,
      merchant_order_id: 'QSB-TEST-001',
    },
    owner: 12345,
    pending: false,
    source_data: {
      pan: '2346',
      sub_type: 'MasterCard',
      type: 'card',
    },
    success: true,
  },
};

// حساب يدوي للمقارنة
const orderedValues = [
  '10500', // amount_cents
  '2026-09-12T10:00:00.000Z', // created_at
  'EGP', // currency
  'false', // error_occured
  'false', // has_parent_transaction
  '998877', // id
  '4567', // integration_id
  'true', // is_3d_secure
  'false', // is_auth
  'false', // is_capture
  'false', // is_refunded
  'true', // is_standalone_payment
  'false', // is_voided
  '887766', // order (order.id)
  '12345', // owner
  'false', // pending
  '2346', // source_data.pan
  'MasterCard', // source_data.sub_type
  'card', // source_data.type
  'true', // success
].join('');

const expectedHmac = crypto.createHmac('sha512', mockSecret).update(orderedValues).digest('hex');

const validWebhookHmac = verifyPaymobHmac(webhookPayload, expectedHmac);
assert(validWebhookHmac, 'تم التحقق بنجاح من توقيع HMAC لحمولة Webhook (Processed Callback)');

const invalidWebhookHmac = verifyPaymobHmac(webhookPayload, 'invalid_fake_hmac');
assert(!invalidWebhookHmac, 'تم رفض توقيع HMAC مزور لحمولة Webhook بنجاح');

// 2. اختبار حساب HMAC على معلمات التوجيه URLSearchParams (GET Redirection)
console.log('\n2️⃣ فحص صحة حساب وتحقق HMAC للـ Response Callback (GET Redirection):');
const params = new URLSearchParams({
  amount_cents: '10500',
  created_at: '2026-09-12T10:00:00.000Z',
  currency: 'EGP',
  error_occured: 'false',
  has_parent_transaction: 'false',
  id: '998877',
  integration_id: '4567',
  is_3d_secure: 'true',
  is_auth: 'false',
  is_capture: 'false',
  is_refunded: 'false',
  is_standalone_payment: 'true',
  is_voided: 'false',
  order: '887766',
  owner: '12345',
  pending: 'false',
  'source_data.pan': '2346',
  'source_data.sub_type': 'MasterCard',
  'source_data.type': 'card',
  success: 'true',
});

const validRedirectHmac = verifyPaymobHmac(params, expectedHmac);
assert(validRedirectHmac, 'تم التحقق بنجاح من توقيع HMAC لمعلمات التوجيه (Response Callback)');

// 3. فحص وجود وتوفر ملفات المسارات المطلوبة
console.log('\n3️⃣ فحص تكامل ملفات المسارات (Processed & Response Endpoints):');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const requiredFiles = [
  'app/api/payment/processed/route.js',
  'app/api/payment/webhook/route.js',
  'app/api/payment/response/route.js',
  'app/api/payment/callback/route.js',
  'app/api/payment/create/route.js',
  'lib/paymob.js',
];

for (const f of requiredFiles) {
  assert(fs.existsSync(path.join(rootDir, f)), `المسار متوفر وجاهز: ${f}`);
}

console.log('\n============================================================');
console.log(`🏁 نتيجة الفحص: ${passCount} اختبار ناجح | ${failCount} إخفاق`);
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
