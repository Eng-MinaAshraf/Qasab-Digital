/**
 * سكريبت التحقق الحي من كود الـ OTP الفعلي المستلم في صندوق البريد
 * الاستخدام:
 *   node scripts/verify-otp-live.mjs <email> <6-digit-otp>
 * أو لإرسال كود جديد:
 *   node scripts/verify-otp-live.mjs send <email>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  if (action === 'send') {
    const email = args[1];
    if (!email) {
      console.error('الرجاء إدخال البريد الإلكتروني: node scripts/verify-otp-live.mjs send <email>');
      process.exit(1);
    }
    console.log(`🚀 جاري إرسال رمز OTP الفعلي عبر Supabase إلى: ${email}...`);
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) {
      console.error('❌ خطأ في الإرسال من Supabase:', error.message);
      process.exit(1);
    }
    console.log('✅ تم إرسال الرمز بنجاح! تفقد صندوق بريدك الوارد (Inbox / Spam).');
    return;
  }

  const email = args[0];
  const token = args[1];

  if (!email || !token) {
    console.log('📖 دليل الاستخدام:');
    console.log('  1. لإرسال رمز: node scripts/verify-otp-live.mjs send <your-email>');
    console.log('  2. للتحقق من الرمز: node scripts/verify-otp-live.mjs <your-email> <6-digit-code>');
    process.exit(0);
  }

  console.log(`🔐 جاري التحقق من كود الـ OTP [${token}] للبريد [${email}] ضد خادم Supabase الحقيقي...`);
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) {
    console.error('❌ فشل التحقق من الكود:', error.message);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🎉 نجاح التحقق الفعلي الكامل بنسبة 100%!');
  console.log('👤 معرف المستخدم المسجل (UUID):', data.user.id);
  console.log('📧 البريد المؤكد:', data.user.email);
  console.log('🔑 توثيق الجلسة (JWT Session Token): صالح ونشط');
  console.log('⏰ تاريخ تأكيد الحساب:', data.user.confirmed_at || new Date().toISOString());
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('خطأ غير متوقع:', err);
  process.exit(1);
});
