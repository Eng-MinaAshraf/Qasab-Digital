'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowLeftIcon,
  GoogleIcon,
  AppleIcon,
  Spinner,
} from './AuthIcons';
import AuthCard from './AuthCard';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnTo');
  const redirectUrl = redirectParam || '/';

  const { signInWithPassword, signInWithOAuth, authError } = useAuth();
  const { mergeGuestCart } = useCart ? useCart() : { mergeGuestCart: () => {} };

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني');
      return;
    }

    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);

    try {
      const res = await signInWithPassword({
        email: cleanIdentifier,
        password,
      });

      if (res.success) {
        setSuccessMessage('تم تسجيل الدخول بنجاح! جاري تحويلك...');
        if (typeof mergeGuestCart === 'function') {
          mergeGuestCart();
        }
        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      } else {
        setErrorMessage(res.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setErrorMessage('');
    setLoading(true);
    const res = await signInWithOAuth(provider);
    if (!res.success) {
      setErrorMessage(res.error || `تعذر بدء تسجيل الدخول باستخدام ${provider}`);
      setLoading(false);
    }
  };

  return (
    <AuthCard title="تسجيل الدخول">
      {/* تنبيهات النجاح والخطأ */}
      {errorMessage && (
        <div className="qasab-alert qasab-alert-error" role="alert">
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="qasab-alert qasab-alert-success" role="alert">
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="qasab-form" noValidate>
        {/* حقل البريد الإلكتروني أو الهاتف */}
        <div className="qasab-input-group">
          <label htmlFor="login-identifier" className="qasab-label">
            البريد الإلكتروني
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <MailIcon size={18} />
            </span>
            <input
              id="login-identifier"
              type="email"
              inputMode="email"
              placeholder="name@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="email"
              className="qasab-input with-start-icon"
              dir="ltr"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* حقل كلمة المرور */}
        <div className="qasab-input-group">
          <label htmlFor="login-password" className="qasab-label">
            كلمة المرور
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <LockIcon size={18} />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="qasab-input with-start-icon with-end-icon"
              dir="ltr"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="qasab-input-icon end btn-icon"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        {/* سطر تذكرني + نسيت كلمة المرور */}
        <div className="qasab-form-options">
          <label className="qasab-checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="qasab-checkbox"
            />
            <span>تذكرني</span>
          </label>
          <Link href="/forgot-password" className="qasab-link-muted">
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* زر تسجيل الدخول الرئيسي */}
        <button
          type="submit"
          className="qasab-btn qasab-btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size={18} />
              <span>جاري تسجيل الدخول...</span>
            </>
          ) : (
            <>
              <span>تسجيل الدخول</span>
              <ArrowLeftIcon size={18} className="qasab-btn-arrow" />
            </>
          )}
        </button>

        {/* فاصل "أو" */}
        <div className="qasab-divider">
          <span>أو</span>
        </div>

        {/* أزرار الدخول السريع */}
        <div className="qasab-social-buttons">
          <button
            type="button"
            className="qasab-social-btn"
            onClick={() => handleSocialLogin('Google')}
            disabled={loading}
          >
            <GoogleIcon size={18} />
            <span>متابعة عبر Google</span>
          </button>
          <button
            type="button"
            className="qasab-social-btn"
            onClick={() => handleSocialLogin('Apple')}
            disabled={loading}
          >
            <AppleIcon size={18} />
            <span>متابعة عبر Apple</span>
          </button>
        </div>

        {/* رابط التبديل لإنشاء حساب */}
        <div className="qasab-card-footer">
          <span>ليس لديك حساب؟ </span>
          <Link
            href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'}
            className="qasab-link-highlight"
          >
            إنشاء حساب
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
