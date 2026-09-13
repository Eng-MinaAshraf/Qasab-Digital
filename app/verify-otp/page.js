'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(params ? `/verify?${params}` : '/verify');
  }, [router, searchParams]);

  return <div style={{ textAlign: 'center', padding: '3rem' }}>جاري التحويل لصفحة التأكيد...</div>;
}

export default function VerifyOtpRedirectPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <VerifyRedirect />
    </Suspense>
  );
}
