'use client';

import React, { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="أهلاً بك مجددًا"
      subtitle="استمتع بألذ عصير قصب في أي وقتٍ"
      mode="login"
    >
      <Suspense fallback={<div className="qasab-auth-loading">جاري التحميل...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
