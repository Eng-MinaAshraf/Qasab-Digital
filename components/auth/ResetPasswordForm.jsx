'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LockIcon, EyeIcon, EyeOffIcon, Spinner, CheckCircleIcon } from './AuthIcons';
import AuthCard from './AuthCard';

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', colorClass: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'ضعيفة', colorClass: 'weak' };
  if (score <= 3) return { score: 2, label: 'متوسطة', colorClass: 'medium' };
  return { score: 3, label: 'قوية جداً', colorClass: 'strong' };
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      const res = await updatePassword(password);
      if (res.success) {
        setSuccessMessage('تم تحديث كلمة المرور بنجاح! جاري تحويلك...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setErrorMessage(res.error || 'تعذر تحديث كلمة المرور، قد يكون الرابط منتهي الصلاحية');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء الاتصال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="تعيين كلمة مرور جديدة">
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
        {/* كلمة المرور الجديدة */}
        <div className="qasab-input-group">
          <label htmlFor="new-password" className="qasab-label">
            كلمة المرور الجديدة
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <LockIcon size={18} />
            </span>
            <input
              id="new-password"
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

          {password && (
            <div className="qasab-strength-meter">
              <div className="qasab-strength-bars">
                <div className={`qasab-strength-bar ${strength.score >= 1 ? strength.colorClass : ''}`} />
                <div className={`qasab-strength-bar ${strength.score >= 2 ? strength.colorClass : ''}`} />
                <div className={`qasab-strength-bar ${strength.score >= 3 ? strength.colorClass : ''}`} />
              </div>
              <span className={`qasab-strength-label ${strength.colorClass}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* تأكيد كلمة المرور */}
        <div className="qasab-input-group">
          <label htmlFor="confirm-new-password" className="qasab-label">
            تأكيد كلمة المرور الجديدة
          </label>
          <div className="qasab-input-wrapper">
            <span className="qasab-input-icon start">
              <LockIcon size={18} />
            </span>
            <input
              id="confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`qasab-input with-start-icon with-end-icon ${!passwordsMatch ? 'has-error' : ''}`}
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

        <button
          type="submit"
          className="qasab-btn qasab-btn-primary"
          disabled={loading || !passwordsMatch || password.length < 8}
        >
          {loading ? (
            <>
              <Spinner size={18} />
              <span>جاري حفظ كلمة المرور...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon size={18} />
              <span>حفظ كلمة المرور والدخول</span>
            </>
          )}
        </button>

        <div className="qasab-card-footer">
          <Link href="/login" className="qasab-link-muted">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
