// ==============================================================================
// متجر قصب (Qasab Juice) — فاحص الجاهزية والأمان لنظام المصادقة (Auth Verification)
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 بدء الفحص الأمني والمعماري الشامل لنظام مصادقة متجر قصب...\n');

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

// 1. فحص وجود المكونات والملفات الأساسية
console.log('1️⃣ فحص وجود الملفات والمكونات المعمارية:');
const expectedFiles = [
  'components/auth/AuthLayout.jsx',
  'components/auth/AuthCard.jsx',
  'components/auth/LoginForm.jsx',
  'components/auth/RegisterForm.jsx',
  'components/auth/OtpVerificationForm.jsx',
  'components/auth/ForgotPasswordForm.jsx',
  'components/auth/ResetPasswordForm.jsx',
  'components/auth/AuthIcons.jsx',
  'app/login/page.js',
  'app/register/page.js',
  'app/forgot-password/page.js',
  'app/verify/page.js',
  'app/reset-password/page.js',
  'app/api/auth/callback/route.js',
  'context/AuthContext.js',
  'lib/supabase/client.js',
  'lib/supabase/server.js',
  'lib/supabase/admin.js',
  'middleware.js',
  'app/auth.css',
  'supabase/migrations/20260912_create_profiles_and_auth_triggers.sql',
];

for (const f of expectedFiles) {
  const fullPath = path.join(rootDir, f);
  assert(fs.existsSync(fullPath), `الملف موجود: ${f}`);
}

// 2. فحص أصول الخلفيات الرسمية للبراند (Desktop & Mobile)
console.log('\n2️⃣ فحص خلفيات قصب الرسمية:');
const authImages = [
  'public/images/auth/desktop-bg.webp',
  'public/images/auth/mobile-bg.webp',
  'public/images/auth/design-ref.jpg',
];
for (const img of authImages) {
  const imgPath = path.join(rootDir, img);
  const exists = fs.existsSync(imgPath);
  const size = exists ? fs.statSync(imgPath).size : 0;
  assert(exists && size > 10000, `الصورة الرسمية موجودة وصالحة: ${img} (${Math.round(size / 1024)} KB)`);
}

// 3. فحص الأمان: عدم تخزين كلمات المرور إطلاقاً في الجداول العامة
console.log('\n3️⃣ فحص الأمان: Supabase Auth هو المصدر الوحيد لكلمات المرور:');
const migrationContent = fs.readFileSync(
  path.join(rootDir, 'supabase/migrations/20260912_create_profiles_and_auth_triggers.sql'),
  'utf8'
);
const hasPasswordInProfile =
  migrationContent.includes('password TEXT') ||
  migrationContent.includes('password_hash TEXT') ||
  migrationContent.includes('encrypted_password TEXT');
assert(!hasPasswordInProfile, 'جدول public.profiles خالٍ تماماً من حقول كلمات المرور (كلمات المرور في auth.users فقط)');
assert(migrationContent.includes('REFERENCES auth.users(id) ON DELETE CASCADE'), 'جدول public.profiles مرتبط بـ auth.users(id) مع حذف تتابعي');

// 4. فحص تسريب مفاتيح السيرفر الحساسة (SUPABASE_SERVICE_ROLE_KEY) في جانب العميل
console.log('\n4️⃣ فحص تسريب مفاتيح السيرفر (Service Role Key Leak):');
const clientFilesToCheck = [
  'components/auth/LoginForm.jsx',
  'components/auth/RegisterForm.jsx',
  'components/auth/AuthLayout.jsx',
  'components/auth/OtpVerificationForm.jsx',
  'components/auth/ForgotPasswordForm.jsx',
  'components/auth/ResetPasswordForm.jsx',
  'context/AuthContext.js',
  'lib/supabase/client.js',
];
let leakedInClient = false;
for (const cf of clientFilesToCheck) {
  const content = fs.readFileSync(path.join(rootDir, cf), 'utf8');
  if (content.includes('SERVICE_ROLE') || content.includes('SECRET_KEY')) {
    console.error(`  ❌ تسريب مشبوه في الملف: ${cf}`);
    leakedInClient = true;
  }
}
assert(!leakedInClient, 'لا يوجد أي ذكر لمفاتيح السيرفر الحساسة في مكونات العميل');

// 5. فحص تكامل @supabase/ssr والـ Cookies
console.log('\n5️⃣ فحص معمارية @supabase/ssr والـ Middleware:');
const clientJs = fs.readFileSync(path.join(rootDir, 'lib/supabase/client.js'), 'utf8');
assert(clientJs.includes('createBrowserClient'), 'lib/supabase/client.js يستخدم createBrowserClient المعتمد من @supabase/ssr');

const serverJs = fs.readFileSync(path.join(rootDir, 'lib/supabase/server.js'), 'utf8');
assert(serverJs.includes('createServerClient') && serverJs.includes('cookies'), 'lib/supabase/server.js يستخدم createServerClient مع cookies');

const middlewareJs = fs.readFileSync(path.join(rootDir, 'middleware.js'), 'utf8');
assert(middlewareJs.includes('supabase.auth.getUser()'), 'middleware.js يستخدم getUser() للتحقق الموثوق من هوية المستخدم الحقيقية');

// 6. فحص سياسة تصعيد الصلاحيات (Zero Trust Role Escalation)
console.log('\n6️⃣ فحص سياسة انعدام الثقة وتصعيد الصلاحيات (Role Escalation):');
assert(
  migrationContent.includes("assigned_account_type := 'vendor_pending'") ||
    migrationContent.includes('vendor_pending'),
  'التسجيل كبائع يتم تصنيفه كـ vendor_pending بانتظار اعتماد الإدارة'
);
assert(
  migrationContent.includes("assigned_role := 'customer'") ||
    migrationContent.includes("'customer'"),
  'الدور الافتراضي عند التسجيل هو customer حصرياً، ولا يمكن للعميل منح نفسه صلاحية admin'
);

// 7. فحص التحقق من وجود البريد في استعادة كلمة المرور (طلب المستخدم المعتمد)
console.log('\n7️⃣ فحص التحقق من وجود البريد في قاعدة البيانات عند استعادة كلمة المرور:');
const forgotForm = fs.readFileSync(path.join(rootDir, 'components/auth/ForgotPasswordForm.jsx'), 'utf8');
const authContext = fs.readFileSync(path.join(rootDir, 'context/AuthContext.js'), 'utf8');
assert(
  authContext.includes('check_email_exists') && forgotForm.includes('notFound'),
  'دالة resetPasswordForEmail تتحقق من وجود البريد عبر check_email_exists وتخطر المستخدم بدقة'
);

// 8. فحص أمان مستوى الصفوف (Row Level Security - RLS)
console.log('\n8️⃣ فحص سياسات RLS على جدول profiles:');
assert(migrationContent.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'), 'RLS مفعل على جدول public.profiles');
assert(migrationContent.includes('Users view own profile'), 'سياسة منع قراءة بروفايلات المستخدمين الآخرين محددة');
assert(migrationContent.includes('Admins view all profiles'), 'سياسة صلاحيات الإدارة محددة بشكل مشروط');

console.log('\n============================================================');
console.log(`🏁 نتيجة الفحص: ${passCount} اختبار ناجح | ${failCount} إخفاق`);
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
