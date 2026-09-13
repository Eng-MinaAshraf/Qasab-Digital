'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getOrderStatusInfo } from '../lib/orderStatus';

/* ─── Pure Professional SVG Icons (No Emojis) ─── */
function DeliveryScooterIcon({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* جسم وسكوتر التوصيل */}
      <circle cx="8" cy="24" r="4" strokeWidth="2.2" />
      <circle cx="24" cy="24" r="4" strokeWidth="2.2" />
      <path d="M8 24h6l4-10h4l2 6h-6" />
      <path d="M14 14l-2-6h-4" />
      <circle cx="18" cy="6" r="2.5" />
      {/* صندوق عصير قصب في الخلف */}
      <rect x="4" y="11" width="6" height="7" rx="1.5" stroke="#166534" fill="#84CC16" fillOpacity="0.25" strokeWidth="1.8" />
    </svg>
  );
}

function CupJuiceIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4h14l-2 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 4z" />
      <path d="M4 4h16" />
      <path d="M12 2v2" />
      <path d="M9 10c1.5 1 4.5 1 6 0" stroke="#EAB308" />
    </svg>
  );
}

function ChevronLeftIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

function CheckShieldIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function CloseIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

function SparklesVectorIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>
      <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
    </svg>
  );
}

export default function OrderTrackingCupWidget() {
  const [activeOrder, setActiveOrder] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pollIntervalRef = useRef(null);

  // 1. جلب الطلب النشط عند التحميل وبدء استطلاع ناعم (Polling)
  const fetchActiveOrder = async () => {
    try {
      let url = '/api/orders/active';
      if (typeof window !== 'undefined') {
        const guestId = localStorage.getItem('qasab_last_order_id');
        if (guestId) {
          url += `?orderId=${encodeURIComponent(guestId)}`;
        }
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.order) {
        setActiveOrder(data.order);

        // 2. التحقق من احتفال الـ 100% (Delivered Celebration Idempotency)
        if (data.order.status === 'delivered') {
          const celebrationKey = `qasab_celebrated_${data.order.id}`;
          const alreadyCelebrated = localStorage.getItem(celebrationKey);
          if (!alreadyCelebrated) {
            setShowCelebration(true);
            localStorage.setItem(celebrationKey, 'true');
            // إيقاف شاشة الاحتفال بعد 4 ثوانٍ تلقائياً
            setTimeout(() => {
              setShowCelebration(false);
            }, 4500);
          }
        }
      } else {
        setActiveOrder(null);
      }
    } catch (e) {
      console.warn('Could not fetch active order:', e);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
    fetchActiveOrder();

    // فحص دوري ناعم كل 15 ثانية لتحديث نسبة ملء الكوب وحالة المندوب لحظياً
    pollIntervalRef.current = setInterval(() => {
      fetchActiveOrder();
    }, 15000);

    return () => clearInterval(pollIntervalRef.current);
  }, []);

  if (!isHydrated || !activeOrder) return null;

  const statusInfo = getOrderStatusInfo(activeOrder.status);
  const percent = statusInfo.percentage || 15;
  const isDelivered = activeOrder.status === 'delivered';

  // حسابات المؤشر الدائري
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // ارتفاع السائل داخل كوب القصب (0 إلى 100%)
  const liquidHeight = Math.min(100, Math.max(10, statusInfo.cupFill || percent));

  return (
    <aside className="qasab-tracking-widget-root" aria-label="تتبع الطلب النشط" dir="rtl">
      {/* ─── الاحتفال بالـ Confetti عند الوصول لـ 100% (Delivered) ─── */}
      {showCelebration && (
        <div className="qasab-celebration-overlay" role="status" aria-live="polite">
          <div className="qasab-confetti-burst">
            {[...Array(24)].map((_, i) => (
              <span key={i} className={`qasab-confetti-particle p-${i % 6}`} />
            ))}
          </div>
          <div className="qasab-celebration-toast">
            <SparklesVectorIcon size={24} />
            <div className="qasab-celebration-msg">
              <strong>وصلك بالسلامة!</strong>
              <span>طلبك وصل… استمتع بعصير القصب البلدي الطازج!</span>
            </div>
          </div>
        </div>
      )}

      {isMinimized ? (
        /* زر عائم مصغر عند الرغبة في طي الويدجت */
        <button
          type="button"
          className="qasab-tracking-min-btn"
          onClick={() => setIsMinimized(false)}
          aria-label="عرض حالة الطلب النشط"
          title={`طلبك النشط: ${statusInfo.label}`}
        >
          <div className="qasab-min-pulse-ring" />
          <DeliveryScooterIcon size={20} className="qasab-min-icon" />
          <span className="qasab-min-badge">{percent}%</span>
        </button>
      ) : (
        /* البطاقة التفاعلية الكاملة مع مؤشر الكوب الدائري */
        <div className="qasab-tracking-card">
          <div className="qasab-tracking-header">
            <div className="qasab-tracking-badge-wrap">
              <span className="qasab-tracking-badge-pulse" />
              <span className="qasab-tracking-order-num">طلب #{activeOrder.id}</span>
            </div>
            <button
              type="button"
              className="qasab-tracking-close-btn"
              onClick={() => setIsMinimized(true)}
              aria-label="تصغير نافذة تتبع الطلب"
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <div className="qasab-tracking-content">
            {/* ─── Circular Delivery Progress Indicator + Cup Filling Concept ─── */}
            <div className="qasab-cup-indicator-wrap">
              <svg className="qasab-circular-svg" width="108" height="108" viewBox="0 0 108 108">
                <defs>
                  {/* تدرج لوني يعكس نقاء وحلاوة القصب الطبيعي */}
                  <linearGradient id="qasabJuiceGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#166534" />
                    <stop offset="50%" stopColor="#84CC16" />
                    <stop offset="100%" stopColor="#EAB308" />
                  </linearGradient>

                  {/* مسار شكل كوب القصب لقص السائل بداخله بدقة فنية */}
                  <clipPath id="qasabCupClip">
                    <path d="M38 32 L70 32 L65 78 A6 6 0 0 1 59 84 L49 84 A6 6 0 0 1 43 78 Z" />
                  </clipPath>
                </defs>

                {/* حلقة الخلفية الشفافة */}
                <circle
                  cx="54"
                  cy="54"
                  r={radius}
                  className="qasab-track-bg"
                />

                {/* حلقة التقدم الدائرية التفاعلية */}
                <circle
                  cx="54"
                  cy="54"
                  r={radius}
                  className="qasab-track-progress"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                  }}
                  transform="rotate(-90 54 54)"
                />

                {/* رسم حدود الكوب الزجاجي */}
                <path
                  d="M38 32 L70 32 L65 78 A6 6 0 0 1 59 84 L49 84 A6 6 0 0 1 43 78 Z"
                  className="qasab-cup-glass-outline"
                />
                {/* فوهة الكوب */}
                <ellipse cx="54" cy="32" rx="16" ry="3.5" className="qasab-cup-rim" />

                {/* السائل الممتلئ تدريجياً داخل الكوب بحسب نسبة الطلب */}
                <g clipPath="url(#qasabCupClip)">
                  <rect
                    x="30"
                    y={84 - (liquidHeight * 0.52)}
                    width="48"
                    height="54"
                    fill="url(#qasabJuiceGrad)"
                    className="qasab-liquid-rect"
                  />
                  {/* موجة حركة السائل العضوية في قمة الكوب */}
                  <path
                    d={`M32 ${84 - (liquidHeight * 0.52)} Q42 ${81 - (liquidHeight * 0.52)}, 54 ${84 - (liquidHeight * 0.52)} T76 ${84 - (liquidHeight * 0.52)} V88 H32 Z`}
                    fill="#BEF264"
                    fillOpacity="0.75"
                    className="qasab-liquid-wave"
                  />
                  {/* فقاعات عصير قصب صغيرة تصعد بلطف */}
                  <circle cx="50" cy={80 - (liquidHeight * 0.25)} r="1.5" fill="#FFFFFF" fillOpacity="0.7" className="qasab-bubble b1" />
                  <circle cx="58" cy={82 - (liquidHeight * 0.35)} r="1.2" fill="#FFFFFF" fillOpacity="0.6" className="qasab-bubble b2" />
                </g>

                {/* انعكاس زجاجي براق على الكوب */}
                <path d="M41 36 L43 76" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
              </svg>

              {/* أيقونة حركة المندوب / الكوب فوق المؤشر */}
              <div className="qasab-indicator-center-icon">
                {isDelivered ? (
                  <CheckShieldIcon size={24} />
                ) : (
                  <DeliveryScooterIcon size={24} className="qasab-scooter-animated" />
                )}
              </div>
            </div>

            {/* تفاصيل حالة الطلب الحقيقية */}
            <div className="qasab-tracking-info">
              <div className="qasab-tracking-status-row">
                <span className="qasab-status-title">{statusInfo.label}</span>
                <span className="qasab-status-pct">{percent}%</span>
              </div>
              <p className="qasab-status-desc">{statusInfo.subLabel}</p>

              <div className="qasab-tracking-actions">
                <Link href="/account" className="qasab-btn-track-action">
                  <span>متابعة تفاصيل الطلب</span>
                  <ChevronLeftIcon size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
