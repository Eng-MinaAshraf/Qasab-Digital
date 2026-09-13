/**
 * سكريبت فحص وتجربة إرسال OTP عبر Gmail SMTP الفعلي
 * الاستخدام:
 *   node scripts/test-gmail-otp.mjs <target-email>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// تحميل .env.local
const envPath = path.join(ROOT_DIR, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  }
}

async function testGmail() {
  const { sendOtpEmail, getEmailTransporter } = await import('../lib/email.js');
  const targetEmail = process.argv[2] || 'qasab.digital@gmail.com';

  console.log('\n======================================================');
  console.log('📧 فحص إرسال بريد حقيقي عبر Gmail SMTP');
  console.log(`👤 المرسل: ${process.env.GMAIL_USER || 'qasab.digital@gmail.com'}`);
  console.log(`🎯 المستلم: ${targetEmail}`);
  console.log('======================================================\n');

  const transporter = getEmailTransporter();
  if (!transporter) {
    console.error('❌ كلمة مرور التطبيق (GMAIL_APP_PASSWORD) غير موجودة بعد في .env.local');
    console.log('👉 يرجى فتح ملف .env.local واستبدال "ضع_كلمة_مرور_التطبيق_هنا" بكلمة مرور التطبيق الخاصة بـ Gmail.');
    process.exit(1);
  }

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`🔢 كود الـ OTP المولد: [${randomOtp}]`);
  console.log('🚀 جاري إرسال البريد عبر smtp.gmail.com:465...');

  const res = await sendOtpEmail({
    to: targetEmail,
    otpCode: randomOtp,
  });

  if (res.success) {
    console.log('\n🎉 تم إرسال البريد الإلكتروني بنجاح!');
    console.log('📨 Message ID:', res.messageId);
    console.log(`📬 افتح صندوق الوارد لـ [${targetEmail}] وستجد رسالة من متجر قصب بالكود: ${randomOtp}`);
  } else {
    console.error('\n❌ فشل الإرسال:', res.message);
  }
}

testGmail().catch((err) => {
  console.error('خطأ غير متوقع:', err);
  process.exit(1);
});
