import React, { Suspense } from 'react';
import CheckoutForm from './CheckoutForm';

export const metadata = {
  title: 'إتمام الطلب | قصب — عصير قصب طبيعي مصري',
  description: 'أكمل طلبك من قصب — راجع سلتك وأدخل بيانات التوصيل لاستلام طلبك طازجاً ومثلجاً.',
};

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <Suspense fallback={<div className="shell" style={{ padding: '3rem', textAlign: 'center' }}>جاري التحميل...</div>}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
