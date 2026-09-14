'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CheckCircleIcon, Spinner, ArrowLeftIcon } from './AuthIcons';
import AuthCard from './AuthCard';

export default function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnTo');
  const redirectUrl = redirectParam || '/';

  const { verifyOtp, signInWithOtp } = useAuth();
  const { mergeGuestCart } = useCart ? useCart() : { mergeGuestCart: () => {} };

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [shake, setShake] = useState(false);

  const inputRefs = useRef([]);

  // مؤقت إعادة الإرسال
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // التركيز على المربع الأول عند تحميل الصفحة
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // قبول الأرقام فقط
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // الانتقال التلقائي للخانة التالية
    if (digit && index < 7 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // إذا اكتملت الخانات الثمانية تلقائياً
    if (digit && index === 7 && newDigits.every((d) => d !== '')) {
      handleAutoSubmit(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        // إذا كانت الخانة فارغة وضغط مسح، ينتقل للخانة السابقة ويمسحها
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowRight' && index > 0) {
      // في اتجاه RTL السهم الأيمن يعود للخلف أو يتقدم حسب الديكور
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index < 7) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 8).split('');
    const newDigits = ['', '', '', '', '', '', '', ''];
    digits.forEach((d, i) => {
      newDigits[i] = d;
    });
    setOtpDigits(newDigits);

    // وضع التركيز على الخانة المناسبة
    const nextEmptyIndex = newDigits.findIndex((d) => d === '');
    if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    } else if (inputRefs.current[7]) {
      inputRefs.current[7].focus();
    }

    if (newDigits.every((d) => d !== '')) {
      handleAutoSubmit(newDigits.join(''));
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleAutoSubmit = async (fullToken) => {
    await submitToken(fullToken);
  };

  const submitToken = async (fullToken) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!emailParam) {
      setErrorMessage('البريد الإلكتروني مفقود، يرجى العودة لصفحة الدخول');
      triggerShake();
      return;
    }

    if (fullToken.length !== 8) {
      setErrorMessage('يرجى إدخال الرمز المكون من 8 أرقام كاملاً');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(emailParam, fullToken, 'signup');
      if (res.success) {
        setSuccessMessage('تم تأكيد الحساب بنجاح! جاري تحويلك...');
        if (typeof mergeGuestCart === 'function') {
          mergeGuestCart();
        }
        setTimeout(() => {
          router.push(redirectUrl);
        }, 800);
      } else {
        // محاولة التحقق كرمز سحري/تسجيل دخول
        const loginRes = await verifyOtp(emailParam, fullToken, 'magiclink');
        if (loginRes.success) {
          setSuccessMessage('تم تأكيد الدخول بنجاح! جاري تحويلك...');
          if (typeof mergeGuestCart === 'function') {
            mergeGuestCart();
          }
          setTimeout(() => {
            router.push(redirectUrl);
          }, 800);
        } else {
          setErrorMessage(loginRes.error || 'رمز التأكيد غير صحيح أو انتهت صلاحيته');
          triggerShake();
        }
      }
    } catch (err) {
      setErrorMessage('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const token = otpDigits.join('');
    submitToken(token);
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending || !emailParam) return;
    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await signInWithOtp(emailParam);
      if (res.success) {
        setSuccessMessage('تم إرسال رمز تحقق جديد إلى بريدك بنجاح.');
        setCountdown(60);
      } else {
        setErrorMessage(res.error || 'تعذر إعادة إرسال الرمز، حاول لاحقاً');
      }
    } catch (e) {
      setErrorMessage('حدث خطأ أثناء إعادة الإرسال');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard title="تأكيد الحساب">
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

      <div className="qasab-otp-header">
        <p className="qasab-otp-subtitle">
          أدخل رمز التحقق المكون من 8 أرقام المرسل إلى:
        </p>
        <span className="qasab-otp-email" dir="ltr">
          {emailParam || 'بريدك الإلكتروني'}
        </span>
      </div>

      <form onSubmit={handleManualSubmit} className="qasab-form">
        {/* مربعات إدخال الـ 8 أرقام */}
        <div
          className={`qasab-otp-boxes-grid ${shake ? 'qasab-shake' : ''}`}
          onPaste={handlePaste}
          dir="ltr"
        >
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`qasab-otp-box ${digit ? 'filled' : ''}`}
              disabled={loading}
              aria-label={`الرقم ${index + 1}`}
            />
          ))}
        </div>

        {/* زر التأكيد */}
        <button
          type="submit"
          className="qasab-btn qasab-btn-primary"
          disabled={loading || otpDigits.some((d) => d === '')}
        >
          {loading ? (
            <>
              <Spinner size={18} />
              <span>جاري التحقق...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon size={18} />
              <span>تأكيد الرمز والمتابعة</span>
            </>
          )}
        </button>

        {/* عداد وزر إعادة الإرسال */}
        <div className="qasab-otp-resend-row">
          {countdown > 0 ? (
            <span className="qasab-resend-countdown">
              إعادة الإرسال بعد ({countdown} ثانية)
            </span>
          ) : (
            <button
              type="button"
              className="qasab-btn-text"
              onClick={handleResendOtp}
              disabled={resending}
            >
              {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
            </button>
          )}
        </div>

        {/* روابط التنقل */}
        <div className="qasab-card-footer">
          <Link
            href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="qasab-link-muted"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
