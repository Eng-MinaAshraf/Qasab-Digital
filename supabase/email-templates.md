# قوالب البريد الإلكتروني الاحترافية لمتجر قصب (Supabase Email Templates)

هذه القوالب مصممة خصيصاً لتوضع في لوحة تحكم **Supabase** تحت مسار:
**Authentication ➔ Email Templates**

كل قالب مبني بلغة HTML المتوافقة بنسبة 100% مع كافة برامج البريد (Gmail, Apple Mail, Outlook) وتدعم الاتجاه العربي من اليمين لليسار (RTL)، مع الألوان الرسمية الفاخرة لمتجر قصب.

---

## 1. قالب تأكيد التسجيل (Confirm Signup)
* **المسار في Supabase:** `Authentication` ➔ `Email Templates` ➔ `Confirm signup`
* **عنوان الرسالة (Subject):** `تأكيد حسابك في متجر قصب 🌿`
* **كود الـ HTML:**

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد حسابك في متجر قصب</title>
</head>
<body style="margin: 0; padding: 30px 15px; background-color: #FBF8F2; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #FCFAF5; border-radius: 20px; border: 1px solid rgba(22, 101, 52, 0.12); box-shadow: 0 10px 30px rgba(20, 83, 45, 0.05);">
    <!-- رأس البراند -->
    <tr>
      <td style="padding: 36px 30px 10px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #14532D; letter-spacing: -1px;">قَصَبْ</h1>
        <div style="font-size: 13px; font-weight: 700; color: #D97706; margin-top: 4px;">عصير قصب طبيعي 100%</div>
        <div style="width: 40px; height: 3px; background-color: #F59E0B; margin: 12px auto 0 auto; border-radius: 2px;"></div>
      </td>
    </tr>

    <!-- المحتوى -->
    <tr>
      <td style="padding: 20px 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #14532D; margin: 0 0 12px 0; text-align: center;">مرحباً بك في عائلة قصب! 🥤</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 16px 0;">
          سعداء جداً بانضمامك إلينا! لتفعيل حسابك والبدء في طلب أشهى وألذ عصائر القصب الطبيعية المعصورة لحظة طلبك، يرجى استخدام رمز التأكيد أدناه أو الضغط على زر التفعيل:
        </p>

        <!-- مربع كود الـ OTP -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 14px; margin: 20px 0;">
          <tr>
            <td style="padding: 16px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">رمز التأكيد الخاص بك (OTP)</div>
              <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #14532D; font-family: monospace;">{{ .Token }}</div>
            </td>
          </tr>
        </table>

        <!-- زر التفعيل المباشر -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.25);">
            تأكيد وتفعيل الحساب مباشرة
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center; margin-top: 15px;">
          ⏳ هذا الرمز صالح لمدة 24 ساعة فقط.
        </p>
      </td>
    </tr>

    <!-- التذييل -->
    <tr>
      <td style="padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #e2ded5; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        متجر قصب — الطعم الأصيل والمذاق المصري الفاخر © 2026<br>
        إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان تام.
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. قالب استعادة كلمة المرور (Reset Password)
* **المسار في Supabase:** `Authentication` ➔ `Email Templates` ➔ `Reset password`
* **عنوان الرسالة (Subject):** `استعادة كلمة المرور — متجر قصب 🔑`
* **كود الـ HTML:**

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>استعادة كلمة المرور — متجر قصب</title>
</head>
<body style="margin: 0; padding: 30px 15px; background-color: #FBF8F2; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #FCFAF5; border-radius: 20px; border: 1px solid rgba(22, 101, 52, 0.12); box-shadow: 0 10px 30px rgba(20, 83, 45, 0.05);">
    <!-- رأس البراند -->
    <tr>
      <td style="padding: 36px 30px 10px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #14532D; letter-spacing: -1px;">قَصَبْ</h1>
        <div style="font-size: 13px; font-weight: 700; color: #D97706; margin-top: 4px;">عصير قصب طبيعي 100%</div>
        <div style="width: 40px; height: 3px; background-color: #F59E0B; margin: 12px auto 0 auto; border-radius: 2px;"></div>
      </td>
    </tr>

    <!-- المحتوى -->
    <tr>
      <td style="padding: 20px 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #14532D; margin: 0 0 12px 0; text-align: center;">طلب استعادة كلمة المرور 🔐</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 16px 0;">
          تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في متجر قصب. اضغط على الزر التالي لاختيار كلمة مرور جديدة لحسابك:
        </p>

        <!-- زر إعادة التعيين -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.25);">
            إعادة تعيين كلمة المرور الآن
          </a>
        </div>

        <!-- مربع الكود الاحتياطي (إذا كان مدعوماً) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0;">
          <tr>
            <td style="padding: 12px; text-align: center; font-size: 13px; color: #64748b;">
              أو استخدم رمز التحقق: <strong style="color: #166534; font-family: monospace; font-size: 16px; letter-spacing: 2px;">{{ .Token }}</strong>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #dc2626; line-height: 1.6; text-align: center; margin-top: 15px;">
          ⚠️ هذا الرابط صالح لفترة محدودة. إذا لم تكن قد طلبت استعادة كلمة المرور، فلا داعي للقلق؛ حسابك في أمان تام ويمكنك تجاهل هذه الرسالة.
        </p>
      </td>
    </tr>

    <!-- التذييل -->
    <tr>
      <td style="padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #e2ded5; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        متجر قصب — الطعم الأصيل والمذاق المصري الفاخر © 2026<br>
        أمان حسابك وخصوصيتك هي أولويتنا القصوى دائماً.
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. قالب الرابط السحري والدخول السريع (Magic Link)
* **المسار في Supabase:** `Authentication` ➔ `Email Templates` ➔ `Magic link`
* **عنوان الرسالة (Subject):** `رابط الدخول السريع إلى متجر قصب ✨`
* **كود الـ HTML:**

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رابط الدخول السريع — متجر قصب</title>
</head>
<body style="margin: 0; padding: 30px 15px; background-color: #FBF8F2; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #FCFAF5; border-radius: 20px; border: 1px solid rgba(22, 101, 52, 0.12); box-shadow: 0 10px 30px rgba(20, 83, 45, 0.05);">
    <!-- رأس البراند -->
    <tr>
      <td style="padding: 36px 30px 10px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #14532D; letter-spacing: -1px;">قَصَبْ</h1>
        <div style="font-size: 13px; font-weight: 700; color: #D97706; margin-top: 4px;">عصير قصب طبيعي 100%</div>
        <div style="width: 40px; height: 3px; background-color: #F59E0B; margin: 12px auto 0 auto; border-radius: 2px;"></div>
      </td>
    </tr>

    <!-- المحتوى -->
    <tr>
      <td style="padding: 20px 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #14532D; margin: 0 0 12px 0; text-align: center;">تسجيل دخول سريع بدون كلمة مرور ⚡</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 16px 0;">
          مرحباً بك! تلقينا طلباً لتسجيل الدخول إلى حسابك في متجر قصب. يمكنك الدخول فوراً بضغطة زر واحدة أدناه دون الحاجة لكتابة كلمة المرور:
        </p>

        <!-- زر الدخول السريع -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.25);">
            الدخول الفوري إلى حسابي
          </a>
        </div>

        <!-- مربع كود الـ OTP المباشر -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 14px; margin: 20px 0;">
          <tr>
            <td style="padding: 14px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">أو استخدم رمز التحقق (OTP):</div>
              <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #14532D; font-family: monospace;">{{ .Token }}</div>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center; margin-top: 15px;">
          ⏳ هذا الرابط والرمز صالحان للاستخدام لمرة واحدة فقط خلال 10 دقائق.
        </p>
      </td>
    </tr>

    <!-- التذييل -->
    <tr>
      <td style="padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #e2ded5; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        متجر قصب — الطعم الأصيل والمذاق المصري الفاخر © 2026<br>
        إذا لم تطلب تسجيل الدخول، يمكنك تجاهل هذه الرسالة بأمان تام.
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. قالب تغيير البريد الإلكتروني (Change Email Address)
* **المسار في Supabase:** `Authentication` ➔ `Email Templates` ➔ `Change email address`
* **عنوان الرسالة (Subject):** `تأكيد تغيير بريدك الإلكتروني في متجر قصب`
* **كود الـ HTML:**

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد تغيير البريد الإلكتروني — متجر قصب</title>
</head>
<body style="margin: 0; padding: 30px 15px; background-color: #FBF8F2; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #FCFAF5; border-radius: 20px; border: 1px solid rgba(22, 101, 52, 0.12); box-shadow: 0 10px 30px rgba(20, 83, 45, 0.05);">
    <tr>
      <td style="padding: 36px 30px 10px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #14532D; letter-spacing: -1px;">قَصَبْ</h1>
        <div style="font-size: 13px; font-weight: 700; color: #D97706; margin-top: 4px;">عصير قصب طبيعي 100%</div>
        <div style="width: 40px; height: 3px; background-color: #F59E0B; margin: 12px auto 0 auto; border-radius: 2px;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #14532D; margin: 0 0 12px 0; text-align: center;">تأكيد تغيير البريد الإلكتروني 📧</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 16px 0;">
          تلقينا طلباً لتحديث عنوان بريدك الإلكتروني المرتبط بحسابك في متجر قصب. لتأكيد هذا التغيير واعتماد البريد الجديد، يرجى الضغط على الزر التالي:
        </p>
        <div style="text-align: center; margin: 26px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.25);">
            تأكيد البريد الجديد الآن
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center; margin-top: 15px;">
          رمز التأكيد: <strong style="color: #14532D; font-family: monospace; font-size: 16px;">{{ .Token }}</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #e2ded5; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        متجر قصب — الطعم الأصيل والمذاق المصري الفاخر © 2026<br>
        إذا لم تطلب تغيير بريدك، يرجى التواصل معنا فوراً لتأمين حسابك.
      </td>
    </tr>
  </table>
</body>
</html>
```
