'use client';

import React, { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني لاستلام رابط آمن لتغيير كلمة المرور"
      mode="forgot"
    >
      <Suspense fallback={<div className="qasab-auth-loading">جاري التحميل...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
