'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymobMockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleSimulatePayment = async (isSuccess) => {
    setLoading(true);
    setStatusText('جاري الاتصال بالسيرفر ومعالجة إشعار Paymob Webhook...');

    try {
      const mockTransactionId = `txn_${Date.now()}`;
      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paymob-hmac': 'test_mock_hmac',
        },
        body: JSON.stringify({
          obj: {
            id: mockTransactionId,
            success: isSuccess,
            amount_cents: Math.round(Number(amount) * 100),
            currency: 'EGP',
            order: {
              id: `pm_order_${Date.now()}`,
              merchant_order_id: orderId,
            },
            source_data: {
              type: 'card',
              pan: '4111********1111',
              sub_type: 'Visa',
            },
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (isSuccess) {
          router.push(`/checkout/success?orderId=${orderId}`);
        } else {
          setStatusText('تم رفض الدفع (محاكاة فشل العملية)');
          setLoading(false);
        }
      } else {
        setStatusText(data.message || 'حدث خطأ أثناء محاكاة الدفع');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setStatusText('تعذر إرسال إشعار الدفع التجريبي');
      setLoading(false);
    }
  };

  return (
    <main className="shell paymob-mock-page">
      <div className="paymob-mock-card">
        <div className="paymob-mock-badge">بيئة اختبار Paymob التجريبية (Sandbox Mock)</div>
        <h1>بوابة الدفع الإلكتروني — Paymob</h1>
        <p>رقم الطلب في المتجر: <strong>{orderId}</strong></p>
        <p className="paymob-amount">المبلغ المطلوب سداده: <span>{amount} ج.م</span></p>

        <div className="paymob-notice">
          هذه شاشة محاكاة آمنة لاختبار تدفق الدفع الإلكتروني (Paymob API & Webhook HMAC) وتحديث حالة الطلب تلقائياً قبل وضع المفاتيح الإنتاجية.
        </div>

        {statusText && <div className="alert-box info">{statusText}</div>}

        <div className="paymob-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => handleSimulatePayment(true)}
            disabled={loading}
          >
            <span>{loading ? 'جاري التأكيد...' : 'محاكاة دفع ناجح (Visa / MasterCard)'}</span>
          </button>

          <button
            type="button"
            className="btn outline"
            onClick={() => handleSimulatePayment(false)}
            disabled={loading}
          >
            <span>محاكاة عملية مرفوضة (Failed Card)</span>
          </button>

          <Link href="/checkout" className="btn text">
            إلغاء والعودة لصفحة الطلب
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymobMockPage() {
  return (
    <Suspense fallback={<div className="shell"><p>جاري التحميل...</p></div>}>
      <PaymobMockContent />
    </Suspense>
  );
}
