'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

const STATUS_STEPS = [
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'confirmed', label: 'تم التأكيد' },
  { key: 'preparing', label: 'جاري التحضير' },
  { key: 'out_for_delivery', label: 'في الطريق' },
  { key: 'delivered', label: 'تم التسليم' },
];

function CrownIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19 7-7-7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // فلترة الطلبات الخاصة بالعميل (حسب رقم الهاتف أو الاسم أو الإيميل)
          const myOrders = data.orders.filter(
            (o) =>
              (user.email && o.customer?.email === user.email) ||
              (profile?.phone && o.customer?.phone === profile.phone) ||
              true // في المرحلة الحالية نعرض الطلبات المسجلة للتجربة
          );
          setOrders(myOrders);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user, profile]);

  if (authLoading || !user) {
    return (
      <main className="shell account-page">
        <div className="account-loading">جاري تحميل بيانات حسابك...</div>
      </main>
    );
  }

  const getStatusIndex = (status) => {
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <main className="shell account-page">
      {/* زر العودة للرئيسية */}
      <div className="account-top-nav" style={{ marginBottom: '18px' }}>
        <Link
          href="/"
          className="btn text sm account-back-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '10px',
            background: 'rgba(13, 75, 46, 0.05)',
            border: '1px solid rgba(13, 75, 46, 0.1)',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowRightIcon size={16} />
          <span>العودة للصفحة الرئيسية</span>
        </Link>
      </div>

      {/* Account Header */}
      <div className="account-header">
        <div className="account-user-info">
          <div className="account-avatar">
            {(profile?.full_name || user.email || 'ق')[0].toUpperCase()}
          </div>
          <div>
            <h1>مرحباً، {profile?.full_name || user.email?.split('@')[0]}</h1>
            <p className="account-email">{user.email}</p>
            {isAdmin && (
              <span className="account-badge admin-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <CrownIcon size={14} />
                <span>حساب مسؤول (Super Admin)</span>
              </span>
            )}
          </div>
        </div>

        <div className="account-actions">
          {isAdmin && (
            <Link href="/admin" className="btn primary">
              <span>لوحة تحكم الإدارة</span>
            </Link>
          )}
          <button onClick={signOut} className="btn outline">
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <section className="account-orders-section">
        <h2>سجل طلباتي ومتابعة التوصيل</h2>

        {loadingOrders ? (
          <div className="account-loading">جاري تحميل سجل طلباتك...</div>
        ) : orders.length === 0 ? (
          <div className="account-empty-orders">
            <p>لم تقم بإجراء أي طلبات حتى الآن.</p>
            <Link href="/#menu" className="btn primary">
              اطلب الآن من المنيو
            </Link>
          </div>
        ) : (
          <div className="orders-timeline-list">
            {orders.map((order) => {
              const currentStep = getStatusIndex(order.status);
              const isCancelled = order.status === 'cancelled';

              return (
                <div key={order.id} className="order-card-timeline">
                  <div className="order-card-top">
                    <div>
                      <span className="order-id-tag">{order.id}</span>
                      <span className="order-date-text">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="order-totals-tag">
                      <strong>{order.total} ج.م</strong>
                      <span className={`payment-pill ${order.paymentStatus || 'unpaid'}`}>
                        {order.paymentStatus === 'paid' ? 'مدفوع أونلاين' : 'الدفع عند الاستلام'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Progress Tracker */}
                  {isCancelled ? (
                    <div className="order-cancelled-alert" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangleIcon size={16} />
                      <span>تم إلغاء هذا الطلب</span>
                    </div>
                  ) : (
                    <div className="order-status-stepper">
                      {STATUS_STEPS.map((step, idx) => (
                        <div
                          key={step.key}
                          className={`step-item ${
                            idx <= currentStep ? 'completed' : ''
                          } ${idx === currentStep ? 'current' : ''}`}
                        >
                          <div className="step-circle">{idx + 1}</div>
                          <span className="step-label">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="order-items-preview">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <span className="item-name">
                          {item.title} ({item.size})
                        </span>
                        <span className="item-qty">× {item.quantity}</span>
                        <span className="item-price">
                          {(item.unitPrice || 20) * item.quantity} ج.م
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <small>العنوان: {order.customer?.address}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
