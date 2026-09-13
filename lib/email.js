import nodemailer from 'nodemailer';

let transporter = null;

export function getEmailTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER || 'qasab.digital@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!pass || pass.includes('ضع_كلمة_مرور')) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: {
        user,
        pass: pass.replace(/\s+/g, ''),
      },
    });
  }

  return transporter;
}

/**
 * تصميم الغلاف الموحد لرسائل قصب البريدية
 */
function renderEmailShell({ title, content }) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FBF8F2; margin: 0; padding: 30px 15px; direction: rtl; text-align: right; }
        .card { max-width: 540px; margin: 0 auto; background: #FCFAF5; border-radius: 20px; padding: 36px 30px; box-shadow: 0 10px 30px rgba(20, 83, 45, 0.06); border: 1px solid rgba(22, 101, 52, 0.12); }
        .brand-header { text-align: center; margin-bottom: 28px; }
        .brand-title { font-size: 32px; font-weight: 900; color: #14532D; margin: 0; letter-spacing: -1px; }
        .brand-sub { font-size: 14px; font-weight: 700; color: #D97706; margin-top: 2px; }
        h1 { color: #14532D; font-size: 22px; font-weight: 800; margin-top: 0; text-align: center; }
        p { color: #475569; font-size: 15px; line-height: 1.7; margin: 12px 0; }
        .btn { display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-align: center; margin: 20px auto; }
        .btn-wrapper { text-align: center; }
        .otp-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #166534; font-family: monospace; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2ded5; padding-top: 18px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand-header">
          <div class="brand-title">قَصَبْ</div>
          <div class="brand-sub">عصير قصب طبيعي 100%</div>
        </div>
        ${content}
        <div class="footer">
          متجر قصب — الطعم الأصيل والمذاق المصري الفاخر © ${new Date().getFullYear()}<br>
          إذا لم تكن أنت صاحب هذا الطلب، يمكنك تجاهل هذه الرسالة بأمان تام.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 1. إرسال رمز OTP لتسجيل الدخول / تأكيد الحساب
 */
export async function sendOtpEmail({ to, otpCode }) {
  const mailer = getEmailTransporter();
  if (!mailer) {
    return { success: false, message: 'SMTP غير مهيأ بعد' };
  }

  const content = `
    <h1>رمز التأكيد السريع (OTP)</h1>
    <p>أهلاً بك! تلقينا طلباً للتحقق من هويتك في متجر قصب.</p>
    <p>استخدم رمز التأكيد السري التالي لإتمام الخطوة:</p>
    <div class="otp-box">
      <div class="otp-code">${otpCode}</div>
    </div>
    <p style="font-size: 13px; color: #64748b; text-align: center;">
      ⏳ هذا الرمز صالح لمدة 10 دقائق ولا تشاركه مع أي شخص.
    </p>
  `;

  try {
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"متجر قصب" <qasab.digital@gmail.com>',
      to,
      subject: `رمز الدخول إلى متجر قصب: ${otpCode}`,
      html: renderEmailShell({ title: 'رمز الدخول إلى متجر قصب', content }),
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * 2. إرسال بريد ترحيبي للعميل الجديد
 */
export async function sendWelcomeEmail({ to, name }) {
  const mailer = getEmailTransporter();
  if (!mailer) return { success: false };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasab-digital.vercel.app';
  const content = `
    <h1>أهلاً بك في عائلة قصب يا ${name || 'صديقنا العزيز'}!</h1>
    <p>يسعدنا جداً انضمامك إلينا في متجر قصب. نعدك بتجربة عصير قصب فريدة معصورة لحظة طلبك من أجود المزارع المصرية بأعلى معايير النظافة والجودة.</p>
    <div class="btn-wrapper">
      <a href="${siteUrl}/menu" class="btn">استكشف المنيو واطلب الآن</a>
    </div>
  `;

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"متجر قصب" <qasab.digital@gmail.com>',
      to,
      subject: 'مرحباً بك في متجر قصب',
      html: renderEmailShell({ title: 'مرحباً بك في متجر قصب', content }),
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * 3. إرسال بريد استعادة كلمة المرور
 */
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const mailer = getEmailTransporter();
  if (!mailer) return { success: false };

  const content = `
    <h1>استعادة كلمة المرور</h1>
    <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في متجر قصب.</p>
    <p>اضغط على الزر التالي لاختيار كلمة مرور جديدة لحسابك:</p>
    <div class="btn-wrapper">
      <a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">
      الرابط صالح لفترة محدودة. إذا لم تكن قد طلبت استعادة كلمة المرور، فلا داعي للقلق؛ حسابك آمن تماماً.
    </p>
  `;

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"متجر قصب" <qasab.digital@gmail.com>',
      to,
      subject: 'استعادة كلمة المرور — متجر قصب',
      html: renderEmailShell({ title: 'استعادة كلمة المرور', content }),
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
