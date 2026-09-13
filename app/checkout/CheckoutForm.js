'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function ArrowRightIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7-7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

function CheckCircleIcon({ size = 54 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function ShoppingBagIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function MapPinIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function PhoneIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function UserIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function NoteIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z"/>
    </svg>
  );
}

function CashIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function CardIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function UserPlusIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [isHydrated, setIsHydrated] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'paymob_card'

  const [idempotencyKey] = useState(() => `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

  const [dismissGuestBanner, setDismissGuestBanner] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setSubmitError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // 1. استرجاع مسودة بيانات الطلب المحفوظة (Restore Checkout Draft)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('qasab_checkout_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          setForm((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            phone: parsed.phone || prev.phone,
            address: parsed.address || prev.address,
            notes: parsed.notes || prev.notes,
          }));
          if (parsed.paymentMethod) {
            setPaymentMethod(parsed.paymentMethod);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read checkout draft:', e);
    }

    // التعبئة التلقائية للبيانات إذا كان المستخدم مسجل دخول
    if (profile || user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || profile?.full_name || user?.email?.split('@')[0] || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
    setIsHydrated(true);
  }, [profile, user]);

  // 2. الحفظ المستمر لمسودة البيانات لمنع أي فقدان أثناء تسجيل الدخول أو التحديث (Persist Draft)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        'qasab_checkout_draft',
        JSON.stringify({
          ...form,
          paymentMethod,
        })
      );
    } catch (e) {
      // silent
    }
  }, [form, paymentMethod, isHydrated]);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !orderSuccess) {
      router.push('/');
    }
  }, [isHydrated, items.length, orderSuccess, router]);

  const deliveryFee = 15;
  const grandTotal = subtotal + deliveryFee;

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      newErrors.name = 'الاسم لازم يكون 3 حروف على الأقل';
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    const cleanPhone = form.phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'رقم موبايل مصري صحيح: 01x-xxxx-xxxx';
    }

    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = 'العنوان لازم يكون تفصيلي (10 حروف على الأقل)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payloadItems = items.map((i) => ({
        id: i.id,
        title: i.title,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      }));

      // مسار 1: الدفع الإلكتروني عبر Paymob
      if (paymentMethod === 'paymob_card') {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            idempotencyKey,
            paymentMethod: 'paymob_card',
            customer: {
              ...form,
              email: user?.email || 'customer@qasab.eg',
            },
            items: payloadItems,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setSubmitError(data.message || 'تعذر بدء عملية الدفع عبر Paymob');
          setIsSubmitting(false);
          return;
        }

        // التوجيه إلى رابط بوابة Paymob أو رابط المحاكاة الآمن (يتم تفريغ السلة بعد نجاح الدفع في صفحة success)
        window.location.href = data.paymentUrl;
        return;
      }

      // مسار 2: الدفع نقدًا عند الاستلام (Cash on Delivery)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          idempotencyKey,
          paymentMethod: 'cod',
          customer: {
            ...form,
            email: user?.email || '',
          },
          items: payloadItems,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setSubmitError(data.message || 'حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة مرة أخرى.');
        }
        setIsSubmitting(false);
        return;
      }

      setOrderNumber(data.order.id);
      setOrderSuccess(true);
      clearCart();
      try {
        localStorage.removeItem('qasab_checkout_draft');
        localStorage.setItem('qasab_active_order_id', data.order.id);
        localStorage.setItem('qasab_last_order_id', data.order.id);
      } catch (e) {
        // silent
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      setSubmitError('تعذر الاتصال بالخادم، يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isHydrated) {
    return (
      <div className="checkout-loading shell">
        <p>جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  // شاشة النجاح المباشرة (COD)
  if (orderSuccess) {
    return (
      <div className="checkout-success shell">
        <div className="checkout-success-card">
          <Image
            src="/images/logo.webp"
            alt="قصب"
            width={130}
            height={47}
            style={{ height: '42px', width: 'auto', marginBottom: '20px' }}
          />
          <CheckCircleIcon size={64} />
          <h1>تم تأكيد طلبك بنجاح!</h1>
          <p className="checkout-order-num">
            رقم الطلب: <strong>{orderNumber}</strong>
          </p>
          <p>طريقة الدفع: <strong>الدفع نقدًا عند الاستلام</strong></p>
          <p>طلبك من قصب في طريقه للتحضير بأعلى طزاجة وجودة. هيوصلك طازج ومثلج في أقرب وقت.</p>

          <div className="checkout-actions-row">
            <Link href="/account" className="btn primary">
              <span>متابعة الطلب في حسابي</span>
            </Link>
            <Link href="/" className="btn outline">
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty shell">
        <ShoppingBagIcon size={48} />
        <h2>سلتك فاضية!</h2>
        <p>أضف منتجات من المنيو الأول عشان تقدر تكمل الطلب.</p>
        <Link href="/#menu" className="btn primary">
          تصفح المنيو
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container shell">
      <div className="checkout-header">
        <Link href="/" className="checkout-back-link">
          <ArrowRightIcon size={14} />
          <span>رجوع</span>
        </Link>
        <h1>إتمام الطلب</h1>
      </div>

      <div className="checkout-grid">
        {/* Delivery & Payment Form */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          {/* ─── بانر إتمام الطلب للزائر (Guest Checkout Options) ─── */}
          {!user && !dismissGuestBanner && (
            <div className="checkout-guest-banner" role="region" aria-label="خيارات تسجيل الدخول أو إتمام الطلب كزائر">
              <div className="guest-banner-icon-wrap">
                <UserPlusIcon size={22} />
              </div>
              <div className="guest-banner-body">
                <div className="guest-banner-title-row">
                  <strong>كمّل طلبك بسهولة</strong>
                  <span className="guest-banner-tag">سريع ومضمون</span>
                </div>
                <p>
                  أنشئ حسابك أو سجل الدخول علشان نقدر نحفظ طلبك ونتابع التوصيل معاك، أو تابع مباشرة كزائر بدون أي تأخير.
                </p>
                <div className="guest-banner-actions">
                  <Link href="/login?redirect=/checkout" className="btn primary guest-btn-sm">
                    تسجيل الدخول
                  </Link>
                  <Link href="/register?redirect=/checkout" className="btn outline guest-btn-sm">
                    إنشاء حساب جديد
                  </Link>
                  <button
                    type="button"
                    className="guest-btn-continue"
                    onClick={() => setDismissGuestBanner(true)}
                  >
                    المتابعة كزائر ←
                  </button>
                </div>
              </div>
            </div>
          )}

          <h2>بيانات التوصيل</h2>

          <div className={`checkout-field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="checkout-name">
              <UserIcon size={14} />
              <span>الاسم بالكامل</span>
            </label>
            <input
              id="checkout-name"
              type="text"
              placeholder="مثال: محمد أحمد علي"
              value={form.name}
              onChange={handleChange('name')}
              autoComplete="name"
            />
            {errors.name && <span className="checkout-error">{errors.name}</span>}
          </div>

          <div className={`checkout-field ${errors.phone ? 'has-error' : ''}`}>
            <label htmlFor="checkout-phone">
              <PhoneIcon size={14} />
              <span>رقم الموبايل</span>
            </label>
            <input
              id="checkout-phone"
              type="tel"
              placeholder="01x-xxxx-xxxx"
              value={form.phone}
              onChange={handleChange('phone')}
              autoComplete="tel"
              dir="ltr"
            />
            {errors.phone && <span className="checkout-error">{errors.phone}</span>}
          </div>

          <div className={`checkout-field ${errors.address ? 'has-error' : ''}`}>
            <label htmlFor="checkout-address">
              <MapPinIcon size={14} />
              <span>عنوان التوصيل</span>
            </label>
            <textarea
              id="checkout-address"
              placeholder="المنطقة، الشارع، رقم العمارة، الطابق، الشقة..."
              value={form.address}
              onChange={handleChange('address')}
              rows={3}
              autoComplete="street-address"
            />
            {errors.address && <span className="checkout-error">{errors.address}</span>}
          </div>

          <div className="checkout-field">
            <label htmlFor="checkout-notes">
              <NoteIcon size={14} />
              <span>ملاحظات إضافية (اختياري)</span>
            </label>
            <textarea
              id="checkout-notes"
              placeholder="مثلاً: من غير تلج، أو رن الجرس مرتين..."
              value={form.notes}
              onChange={handleChange('notes')}
              rows={2}
            />
          </div>

          {/* اختيار طريقة الدفع بأيقونات فكتور نقية (Payment Method Selector) */}
          <div className="checkout-payment-section">
            <h2>طريقة الدفع</h2>
            <div className="payment-options-grid">
              <label className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="payment-card-content">
                  <span className="payment-icon-svg">
                    <CashIcon size={22} />
                  </span>
                  <div>
                    <strong>الدفع نقدًا عند الاستلام (COD)</strong>
                    <small>سداد المبلغ نقداً لمندوب التوصيل فور وصول الطلب</small>
                  </div>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === 'paymob_card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paymob_card"
                  checked={paymentMethod === 'paymob_card'}
                  onChange={() => setPaymentMethod('paymob_card')}
                />
                <div className="payment-card-content">
                  <span className="payment-icon-svg">
                    <CardIcon size={22} />
                  </span>
                  <div>
                    <strong>الدفع الإلكتروني (Paymob)</strong>
                    <small>بطاقات فيزا، ماستركارد، ميزة، ومحافظ فودافون كاش الذكية</small>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {submitError && <div className="alert-box error">{submitError}</div>}

          <button type="submit" className="btn primary checkout-submit-btn" disabled={isSubmitting}>
            <span>
              {isSubmitting
                ? 'جاري المعالجة...'
                : paymentMethod === 'paymob_card'
                ? `المتابعة للدفع أونلاين (${grandTotal} ج.م)`
                : `تأكيد الطلب نقدًا (${grandTotal} ج.م)`}
            </span>
          </button>
        </form>

        {/* Order Summary */}
        <aside className="checkout-summary">
          <h2>ملخص الطلب</h2>

          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.key} className="checkout-item">
                <div className="checkout-item-img">
                  <Image
                    src={'/images/' + (item.image ? item.image.replace(/\.jpg(\.webp)?$/, '.webp').replace(/\.webp$/, '') + '.webp' : 'product-1.webp')}
                    alt={item.title}
                    width={56}
                    height={56}
                    unoptimized
                  />
                </div>
                <div className="checkout-item-info">
                  <span className="checkout-item-title">{item.title}</span>
                  <small>الحجم: {item.size} × {item.quantity}</small>
                </div>
                <strong className="checkout-item-price">
                  {item.price * item.quantity} ج.م
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>المجموع الفرعي</span>
              <span>{subtotal} ج.م</span>
            </div>
            <div className="checkout-total-row">
              <span>رسوم التوصيل</span>
              <span>{deliveryFee} ج.م</span>
            </div>
            <div className="checkout-total-row checkout-grand-total">
              <span>الإجمالي النهائي</span>
              <strong>{grandTotal} ج.م</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
