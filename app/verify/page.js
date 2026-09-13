'use client';

import React, { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import OtpVerificationForm from '../../components/auth/OtpVerificationForm';

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="تأكيد الحساب"
      subtitle="الخطوة الأخيرة لبدء تجربة قصب والاستمتاع بالعصير الطبيعي"
      mode="verify"
    >
      <Suspense fallback={<div className="qasab-auth-loading">جاري التحميل...</div>}>
        <OtpVerificationForm />
      </Suspense>
    </AuthLayout>
  );
}
