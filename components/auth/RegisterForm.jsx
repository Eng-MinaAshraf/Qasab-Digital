'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  StoreIcon,
  UserPlusIcon,
  CheckCircleIcon,
  Spinner,
  EgyptFlagIcon,
  InfoIcon,
} from './AuthIcons';
import AuthCard from './AuthCard';

// دالة فحص قوة كلمة المرور
function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', colorClass: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'ضعيفة', colorClass: 'weak' };
  } else if (score <= 3) {
    return { score: 2, label: 'متوسطة', colorClass: 'medium' };
  } else {
    return { score: 3, label: 'قوية جداً', colorClass: 'strong' };
  }
}

// التحقق من صحة رقم الهاتف المصري
function validateEgyptianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // أرقام مصر تبدأ بـ 010, 011, 012, 015 مع 11 رقم، أو بدون 0 مع 10 أرقام، أو 201xxxxxxxxx
  return /^(20)?0?1[0125][0-9]{8}$/.test(cleaned);
}

function formatToEgyptianInternational(phone) {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  if (cleaned.startsWith('20')) return '+' + cleaned;
  if (cleaned.startsWith('01')) return '+20' + cleaned.substring(1);
  if (cleaned.startsWith('1')) return '+20' + cleaned;
  return '+20' + cleaned;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnTo');
  const redirectUrl = redirectParam || '/';

  const { signUp } = useAuth();
  const { mergeGuestCart } = useCart ? useCart() : { mergeGuestCart: () => {} };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('customer'); // 'customer' | 'vendor'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال اسمك بالكامل');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    if (!validateEgyptianPhone(phone)) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('كلمة المرور يجب أن لا تقل عن 8 خانات');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      const normalizedPhone = formatToEgyptianInternational(phone);
      const res = await signUp({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: normalizedPhone,
        account_type: accountType,
      });

      if (res.success) {
        if (typeof mergeGuestCart === 'function') {
          mergeGuestCart();
        }

        if (res.needsEmailVerification) {
          setSuccessMessage(
            'تم إنشاء حسابك بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد التسجيل والمتابعة.'
          );
          setTimeout(() => {
            router.push(`/verify?email=${encodeURIComponent(email.trim())}${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''}`);
          }, 1500);
        } else {
          setSuccessMessage('تم إنشاء حسابك بنجاح! جاري تحويلك...');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 800);
        }
      } else {
        setErrorMessage(res.error || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="معلوماتك الشخصية">
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
        {/* حقل الإسم بالكامل */}
        <div className="qasab-input-group">
          <label htmlFor="reg-name" className="qasab-label">
            الإسم بالكامل
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <UserIcon size={18} />
            </span>
            <input
              id="reg-name"
              type="text"
              placeholder="مثال: أحمد محمد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="qasab-input with-start-icon"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* حقل البريد الإلكتروني */}
        <div className="qasab-input-group">
          <label htmlFor="reg-email" className="qasab-label">
            البريد الإلكتروني
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <MailIcon size={18} />
            </span>
            <input
              id="reg-email"
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

        {/* حقل رقم الهاتف المصري */}
        <div className="qasab-input-group">
          <label htmlFor="reg-phone" className="qasab-label">
            رقم الهاتف المصري
          </label>
          <div className="qasab-input-wrapper qasab-phone-wrapper">
            <span className="qasab-input-icon start">
              <PhoneIcon size={18} />
            </span>
            <div className="qasab-phone-prefix" title="مصر (+20)">
              <span className="qasab-flag"><EgyptFlagIcon size={18} /></span>
              <span className="qasab-code">+20</span>
            </div>
            <input
              id="reg-phone"
              type="tel"
              placeholder="010XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="qasab-input with-phone-prefix"
              dir="ltr"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* حقل كلمة المرور */}
        <div className="qasab-input-group">
          <label htmlFor="reg-password" className="qasab-label">
            كلمة المرور
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <LockIcon size={18} />
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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

          {/* مؤشر قوة كلمة المرور */}
          {password && (
            <div className="qasab-strength-meter">
              <div className="qasab-strength-bars">
                <div
                  className={`qasab-strength-bar ${
                    strength.score >= 1 ? strength.colorClass : ''
                  }`}
                />
                <div
                  className={`qasab-strength-bar ${
                    strength.score >= 2 ? strength.colorClass : ''
                  }`}
                />
                <div
                  className={`qasab-strength-bar ${
                    strength.score >= 3 ? strength.colorClass : ''
                  }`}
                />
              </div>
              <span className={`qasab-strength-label ${strength.colorClass}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* حقل تأكيد كلمة المرور */}
        <div className="qasab-input-group">
          <label htmlFor="reg-confirm-password" className="qasab-label">
            تأكيد كلمة المرور
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <LockIcon size={18} />
            </span>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`qasab-input with-start-icon with-end-icon ${
                !passwordsMatch ? 'has-error' : ''
              }`}
              dir="ltr"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="qasab-input-icon end btn-icon"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
          {!passwordsMatch && (
            <span className="qasab-field-error">كلمتا المرور غير متطابقتين</span>
          )}
        </div>

        {/* اختيار نوع الحساب */}
        <div className="qasab-account-type-group">
          <span className="qasab-label">نوع الحساب</span>
          <div className="qasab-account-type-cards">
            {/* خيار العميل */}
            <div
              className={`qasab-type-card ${accountType === 'customer' ? 'active' : ''}`}
              onClick={() => setAccountType('customer')}
              role="radio"
              aria-checked={accountType === 'customer'}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setAccountType('customer');
              }}
            >
              {accountType === 'customer' && (
                <span className="qasab-check-badge">
                  <CheckCircleIcon size={16} />
                </span>
              )}
              <div className="qasab-type-icon">
                <UserIcon size={22} />
              </div>
              <span className="qasab-type-name">عميل</span>
              <span className="qasab-type-desc">اشتري واستمتع بالعصير</span>
            </div>

            {/* خيار البائع */}
            <div
              className={`qasab-type-card ${accountType === 'vendor' ? 'active' : ''}`}
              onClick={() => setAccountType('vendor')}
              role="radio"
              aria-checked={accountType === 'vendor'}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setAccountType('vendor');
              }}
            >
              {accountType === 'vendor' && (
                <span className="qasab-check-badge">
                  <CheckCircleIcon size={16} />
                </span>
              )}
              <div className="qasab-type-icon">
                <StoreIcon size={22} />
              </div>
              <span className="qasab-type-name">بائع</span>
              <span className="qasab-type-desc">أعرض منتجاتي</span>
            </div>
          </div>
          {accountType === 'vendor' && (
            <p className="qasab-vendor-notice">
              <InfoIcon size={15} className="inline-block align-middle ml-1" />
              <span>ملاحظة: طلبات حسابات البائعين تخضع للمراجعة والاعتماد الأمني من قبل الإدارة قبل تفعيلها.</span>
            </p>
          )}
        </div>

        {/* زر إنشاء الحساب */}
        <button
          type="submit"
          className="qasab-btn qasab-btn-primary"
          disabled={loading || !passwordsMatch}
        >
          {loading ? (
            <>
              <Spinner size={18} />
              <span>جاري إنشاء الحساب...</span>
            </>
          ) : (
            <>
              <UserPlusIcon size={18} />
              <span>إنشاء الحساب</span>
            </>
          )}
        </button>

        {/* إشعار الشروط والأحكام */}
        <p className="qasab-terms-notice">
          بإنشائك للحساب فأنت توافق على{' '}
          <Link href="/terms" className="qasab-link-highlight">
            الشروط والأحكام
          </Link>{' '}
          و{' '}
          <Link href="/privacy" className="qasab-link-highlight">
            سياسة الخصوصية
          </Link>
        </p>

        {/* رابط التبديل لتسجيل الدخول */}
        <div className="qasab-card-footer">
          <span>لديك حساب بالفعل؟ </span>
          <Link
            href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="qasab-link-highlight"
          >
            تسجيل الدخول
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
