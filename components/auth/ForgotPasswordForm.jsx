'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { MailIcon, Spinner, ArrowLeftIcon } from './AuthIcons';
import AuthCard from './AuthCard';

export default function ForgotPasswordForm() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setNotFound(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('يرجى كتابة بريد إلكتروني صالح');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (res.success) {
        setSubmitted(true);
        setMessage(res.message);
      } else if (res.notFound) {
        setNotFound(true);
        setErrorMessage(res.error);
      } else {
        setErrorMessage(res.error || 'تعذر إرسال رابط الاستعادة، يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="استعادة كلمة المرور">
      {errorMessage && (
        <div className="qasab-alert qasab-alert-error" role="alert">
          <span>{errorMessage}</span>
        </div>
      )}

      {submitted ? (
        <div className="qasab-forgot-success-box">
          <div className="qasab-alert qasab-alert-success" role="alert">
            <span>{message}</span>
          </div>
          <p className="qasab-forgot-hint">
            يرجى تفقد صندوق الوارد وملف الرسائل غير المرغوب فيها (Spam).
          </p>
          <div className="qasab-card-footer">
            <Link href="/login" className="qasab-link-highlight">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="qasab-form" noValidate>
          <p className="qasab-form-hint">
            أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات استعادة كلمة المرور بأمان.
          </p>

          <div className="qasab-input-group">
            <label htmlFor="forgot-email" className="qasab-label">
              البريد الإلكتروني
            </label>
            <div className="qasab-input-wrapper">
              <span className="qasab-input-icon start">
                <MailIcon size={18} />
              </span>
              <input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="qasab-input with-start-icon"
                dir="ltr"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="qasab-btn qasab-btn-primary"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Spinner size={18} />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <span>إرسال تعليمات الاستعادة</span>
                <ArrowLeftIcon size={18} className="qasab-btn-arrow" />
              </>
            )}
          </button>

          <div className="qasab-card-footer">
            {notFound ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <span>ليس لديك حساب؟ </span>
                <Link href="/register" className="qasab-link-highlight">
                  إنشاء حساب جديد الآن
                </Link>
              </div>
            ) : null}
            <Link href="/login" className="qasab-link-muted">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
