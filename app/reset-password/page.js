'use client';

import React, { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="تعيين كلمة المرور"
      subtitle="اختر كلمة مرور جديدة وقوية لحماية حسابك"
      mode="reset"
    >
      <Suspense fallback={<div className="qasab-auth-loading">جاري التحميل...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
