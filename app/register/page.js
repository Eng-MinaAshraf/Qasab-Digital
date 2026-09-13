'use client';

import React, { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="انضم إلى تجربة قصب واستمتع بالمذاق الأصيل"
      mode="register"
    >
      <Suspense fallback={<div className="qasab-auth-loading">جاري التحميل...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
