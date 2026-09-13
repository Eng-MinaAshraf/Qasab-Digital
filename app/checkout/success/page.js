'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../../context/CartContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();

  useEffect(() => {
    if (typeof clearCart === 'function') {
      clearCart();
    }
    try {
      localStorage.removeItem('qasab_checkout_draft');
      if (orderId) {
        localStorage.setItem('qasab_active_order_id', orderId);
        localStorage.setItem('qasab_last_order_id', orderId);
      }
    } catch (e) {
      // silent
    }
  }, [clearCart, orderId]);

  return (
    <main className="checkout-success shell">
      <div className="checkout-success-card">
        <Image
          src="/images/logo.webp"
          alt="قصب"
          width={130}
          height={47}
          style={{ height: '42px', width: 'auto', marginBottom: '20px' }}
        />
        <div className="success-icon-wrap">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1>تم استلام وتأكيد طلبك بنجاح!</h1>
        <p className="checkout-order-num">
          رقم الطلب: <strong>{orderId || 'QSB-CONFIRMED'}</strong>
        </p>
        <p>تم سداد الطلب وتأكيده رسمياً في نظام المتجر. عصير قصب في طريقه للتحضير بأعلى طزاجة وجودة.</p>

        <div className="checkout-disclaimer">
          <small>
            تم تسجيل المعاملة بنجاح مع التحقق الأمني الكامل من بوابة الدفع. يمكنك متابعة حالة الطلب ومساره من حسابك.
          </small>
        </div>

        <div className="success-buttons">
          <Link href="/account" className="btn primary">
            <span>متابعة حالة الطلب في حسابي</span>
          </Link>
          <Link href="/" className="btn outline">
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="shell"><p>جاري التحميل...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}
