'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SugarcaneStalkIcon } from './AuthIcons';

/**
 * الغلاف العام لصفحات المصادقة (AuthLayout)
 * يدمج خلفيات قصب الرسمية (الديسك توب والموبايل) مع الهوية البصرية المصرية
 * والعلامة المائية المخطوطة "القصب ... لذة الحياة"
 */
export default function AuthLayout({
  children,
  title,
  subtitle,
  mode = 'login', // 'login' | 'register' | 'forgot' | 'verify' | 'reset'
}) {
  return (
    <div className="qasab-auth-container" dir="rtl">
      {/* ─── الخلفيات المتجاوبة الرسمية ─── */}
      <div className="qasab-auth-bg-wrapper" aria-hidden="true">
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/images/auth/mobile-bg.webp"
            type="image/webp"
          />
          <source
            media="(min-width: 641px)"
            srcSet="/images/auth/desktop-bg.webp"
            type="image/webp"
          />
          <img
            src="/images/auth/desktop-bg.webp"
            alt="خلفية قصب المصرية الأصلية"
            className="qasab-auth-bg-img"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        {/* طبقة حماية تباين ناعمة جداً لضمان القراءة الفائقة دون طمس اللوحة الفنية */}
        <div className="qasab-auth-overlay" />
      </div>

      {/* ─── الشريط العلوي (Top Header) ─── */}
      <header className="qasab-auth-header">
        <div className="qasab-auth-header-inner">
          {/* الشعار */}
          <Link href="/" className="qasab-auth-brand" aria-label="الرئيسية - متجر قصب">
            <div className="qasab-brand-badge">
              <span className="qasab-brand-title">قَصَبْ</span>
              <span className="qasab-brand-sub">عصير قصب</span>
            </div>
            <SugarcaneStalkIcon size={32} className="qasab-brand-stalks" />
          </Link>

          {/* زر التبديل السريع بالرأس */}
          <div className="qasab-auth-switch">
            {mode === 'login' ? (
              <div className="qasab-switch-group">
                <span className="qasab-switch-hint">ليس لديك حساب؟</span>
                <Link href="/register" className="qasab-switch-btn">
                  إنشاء حساب
                </Link>
              </div>
            ) : mode === 'register' ? (
              <div className="qasab-switch-group">
                <span className="qasab-switch-hint">لديك حساب بالفعل؟</span>
                <Link href="/login" className="qasab-switch-btn">
                  تسجيل الدخول
                </Link>
              </div>
            ) : (
              <Link href="/login" className="qasab-switch-btn">
                العودة لتسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── المحتوى المركزي ─── */}
      <main className="qasab-auth-main">
        {/* العناوين الترحيبية فوق البطاقة */}
        <div className="qasab-auth-hero">
          {title && <h1 className="qasab-auth-hero-title">{title}</h1>}
          {subtitle && <p className="qasab-auth-hero-sub">{subtitle}</p>}
          {mode === 'register' && <div className="qasab-gold-accent-line" />}
        </div>

        {/* بطاقة المصادقة الرئيسية */}
        <div className="qasab-auth-card-wrapper">
          {children}
        </div>

        {/* ─── العلامة المائية على الرصيف الحجري تحت البطاقة ─── */}
        <div className="qasab-auth-watermark-area" aria-hidden="true">
          <div className="qasab-watermark-calligraphy">
            <span className="qasab-swash">~</span>
            <span className="qasab-quote-main">القصب ... لذة الحياة</span>
          </div>
          
          {/* ظلال مآذن القاهرة التاريخية في الزاوية */}
          <div className="qasab-skyline-silhouette">
            <svg viewBox="0 0 160 50" fill="currentColor" className="qasab-skyline-svg">
              <path d="M10 50h140v-4h-5v-12h-3v-6h-2v-4h-2v4h-2v6h-3v12h-8V34h-4v-8h-3v-5h-1v-4h-1v4h-1v5h-3v8h-4v12h-12V24h-3v-8h-2v-6h-1v-4h-1v4h-1v6h-2v8h-3v22h-14V30h-4v-9h-2v-5h-1v-4h-1v4h-1v5h-2v9h-4v16H40V36h-3v-7h-2v-4h-1v-3h-1v3h-1v4h-2v7h-3v10H10z" />
            </svg>
          </div>
        </div>
      </main>

      {/* ─── تذييل عالي الوضوح والتباين للشروط والخصوصية ─── */}
      <footer className="qasab-auth-footer">
        <div className="qasab-auth-footer-badge">
          <div className="qasab-auth-footer-links">
            <Link href="/">الرئيسية</Link>
            <span className="qasab-auth-footer-dot">•</span>
            <Link href="/terms">الشروط والأحكام</Link>
            <span className="qasab-auth-footer-dot">•</span>
            <Link href="/privacy">سياسة الخصوصية</Link>
          </div>
          <p className="qasab-auth-copyright">
            © {new Date().getFullYear()} قصب — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
