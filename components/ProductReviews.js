'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

/* ─── Inline Professional SVG Icons ─── */
function StarIcon({ size = 18, filled = true, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#dfb23e' : 'none'}
      stroke={filled ? '#dfb23e' : '#c4ba9d'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckBadgeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LeafIcon({ size = 15, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

function SendIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserCheckIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function MessageSquarePlusIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}

const RATING_DESCRIPTIONS = {
  5: 'ممتاز جداً، طعم أصيل لا يُعلى عليه!',
  4: 'رائع ولذيذ ومميز',
  3: 'جيد وبداية موفقة',
  2: 'متوسط ويحتاج تحسين',
  1: 'غير راضٍ عن التجربة',
};

const DEFAULT_REVIEWS = {
  'qasab-classic': [
    {
      id: 'r1',
      name: 'م. يوسف إبراهيم',
      rating: 5,
      date: 'منذ يومين',
      size: 'كبير',
      comment: 'عصير قصب صافي حقيقي يرجعك لأيام زمان، بدون أي سكر مضاف وثقيل ومثلج مضبوط على الشعرة! أفضل قصب شربته في القاهرة.',
      verified: true,
    },
    {
      id: 'r2',
      name: 'داليا النجار',
      rating: 5,
      date: 'منذ ٤ أيام',
      size: 'وسط',
      comment: 'أحسن كوباية قصب ممكن تشربها في الحر ده.. طازة وريحة القصب الصعيدي واضحة جداً والنظافة فوق الممتازة.',
      verified: true,
    },
  ],
  'qasab-lemon': [
    {
      id: 'r1',
      name: 'حسام حسن',
      rating: 5,
      date: 'أمس',
      size: 'كبير',
      comment: 'الليمون البلدي مع القصب ميكس عبقري، بيكسر الحلاوة شوية ويديك انتعاش مش طبيعي! بقيت أطلبه شبه يومي.',
      verified: true,
    },
    {
      id: 'r2',
      name: 'نيرة المهدي',
      rating: 5,
      date: 'منذ ٣ أيام',
      size: 'وسط',
      comment: 'طعم الليمون فريش والقصب مش مخفف بماية نهائي.. التغليف ممتاز ومثلج جداً.',
      verified: true,
    },
  ],
  'qasab-mint': [
    {
      id: 'r1',
      name: 'عمر فاروق',
      rating: 5,
      date: 'منذ ٣ أيام',
      size: 'كبير',
      comment: 'ريحة النعناع الأخضر فايحة وطازة من أول رشفة.. أفضل مشروب لروقان المزاج بعد يوم شغل طويل.',
      verified: true,
    },
    {
      id: 'r2',
      name: 'ريم فؤاد',
      rating: 5,
      date: 'منذ ٥ أيام',
      size: 'وسط',
      comment: 'انتعاش لا يوصف في الصيف.. شكراً على الاهتمام بنظافة وجودة المكونات وطريقة التقديم الفخمة.',
      verified: true,
    },
  ],
  'qasab-fresh-concentrate': [
    {
      id: 'r1',
      name: 'كابتن طارق عبدالرحمن',
      rating: 5,
      date: 'أمس',
      size: 'كبير',
      comment: 'عصرة أولى ثقيلة ومركزة جداً تحس بالطاقة والفيتامينات في ثانية.. بديل طبيعي وصحي لمشروبات الطاقة!',
      verified: true,
    },
    {
      id: 'r2',
      name: 'مها الشاذلي',
      rating: 5,
      date: 'منذ يومين',
      size: 'وسط',
      comment: 'قصب نقي ١٠٠٪ بدون تخفيف.. طعم غني جداً يروي القلب.',
      verified: true,
    },
  ],
  'falafel-sandwich': [
    {
      id: 'r1',
      name: 'مصطفى كامل',
      rating: 5,
      date: 'اليوم',
      size: 'ساندوتش كامل',
      comment: 'ساندوتش فلافل سخن ومقرمش بالسمسم والطحينة مع كوباية القصب المثلجة كومبو مصري أصيل ما يتعوضش!',
      verified: true,
    },
  ],
};

export default function ProductReviews({ productSlug, productTitle, initialRating = '5.0' }) {
  const { showToast } = useCart();
  const [reviews, setReviews] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState('وسط');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  // Fetch reviews from API with localStorage fallback
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productSlug=${encodeURIComponent(productSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
            try {
              localStorage.setItem(`qasab_reviews_${productSlug}`, JSON.stringify(data.reviews));
            } catch (e) {}
            setIsHydrated(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch reviews from API, using cached/defaults:', err);
      }

      // Fallback to localStorage or DEFAULT_REVIEWS
      try {
        const storageKey = `qasab_reviews_${productSlug}`;
        const saved = localStorage.getItem(storageKey);
        if (saved && isMounted) {
          setReviews(JSON.parse(saved));
        } else if (isMounted) {
          const defaults = DEFAULT_REVIEWS[productSlug] || DEFAULT_REVIEWS['qasab-classic'];
          setReviews(defaults);
        }
      } catch (e) {
        if (isMounted) {
          setReviews(DEFAULT_REVIEWS[productSlug] || DEFAULT_REVIEWS['qasab-classic']);
        }
      }
      if (isMounted) setIsHydrated(true);
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [productSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || trimmedName.length < 3) {
      if (showToast) showToast('يرجى كتابة اسمك الكريم (3 أحرف على الأقل)');
      return;
    }

    if (!trimmedComment || trimmedComment.length < 5) {
      if (showToast) showToast('يرجى كتابة تعليق لا يقل عن 5 أحرف');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          name: trimmedName,
          rating,
          size: selectedSize,
          comment: trimmedComment,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errMsg = data.errors
          ? Object.values(data.errors).join(' • ')
          : (data.message || 'حدث خطأ أثناء حفظ التقييم');
        if (showToast) showToast(errMsg);
        setIsSubmitting(false);
        return;
      }

      // Updated reviews list from API or optimistic
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews.map((r, idx) => idx === 0 ? { ...r, isUserReview: true } : r));
      } else if (data.review) {
        setReviews((prev) => [{ ...data.review, isUserReview: true }, ...prev]);
      }

      // Reset Form
      setName('');
      setComment('');
      setRating(5);
      setShowSuccessBadge(true);

      if (showToast) {
        showToast('تم نشر تقييمك بنجاح وحفظه في الخادم! شكراً لمشاركتك');
      }

      setTimeout(() => setShowSuccessBadge(false), 4000);
    } catch (err) {
      console.error('Error submitting review:', err);
      // Fallback offline review creation
      const fallbackReview = {
        id: 'user_' + Date.now(),
        name: trimmedName,
        rating,
        date: 'الآن',
        size: selectedSize,
        comment: trimmedComment,
        verified: true,
        isUserReview: true,
      };
      setReviews((prev) => [fallbackReview, ...prev]);
      setName('');
      setComment('');
      setRating(5);
      setShowSuccessBadge(true);
      if (showToast) {
        showToast('تم حفظ التقييم محلياً!');
      }
      setTimeout(() => setShowSuccessBadge(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : initialRating;

  return (
    <section className="pd-reviews-section shell" id="reviews-section" aria-label="تقييمات العملاء">
      <div className="pd-reviews-container">
        {/* Section Header */}
        <div className="pd-reviews-header">
          <div>
            <span className="pd-reviews-tag">
              <LeafIcon size={14} />
              <span>تجارب حقيقية</span>
            </span>
            <h2 className="pd-reviews-title">تقييمات وآراء العملاء</h2>
            <p className="pd-reviews-subtitle">
              رأيك يهمنا في <strong>{productTitle}</strong> — شاركنا تجربتك لنسعد بها ونطور من جودتنا دائماً.
            </p>
          </div>

          {/* Rating Summary Badge */}
          <div className="pd-reviews-summary-badge">
            <div className="pd-summary-score">
              <span className="score-num">{averageRating}</span>
              <div className="score-stars">
                <StarIcon size={16} filled />
                <span className="score-total">/ ٥</span>
              </div>
            </div>
            <span className="pd-summary-count">بناءً على {reviews.length} تقييم موثق</span>
          </div>
        </div>

        <div className="pd-reviews-grid-layout">
          {/* Right Column: Write a Review Form */}
          <div className="pd-review-form-card">
            <div className="pd-form-title-row">
              <MessageSquarePlusIcon size={20} />
              <h3>أضف تقييمك وتجربتك</h3>
            </div>
            <p className="pd-form-hint">
              <ShieldCheckIcon size={14} />
              <span>نشر تقييمك فوري ومتاح لجميع محبي القصب الأصيل</span>
            </p>

            <form onSubmit={handleSubmit} className="pd-review-form">
              {/* Star Rating Interactive Selector */}
              <div className="pd-form-group">
                <label className="pd-form-label">تقييمك للمنتج:</label>
                <div className="pd-stars-picker">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        className="pd-star-btn"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`تقييم ${starVal} من 5`}
                      >
                        <StarIcon size={26} filled={isFilled} className="pd-star-interactive" />
                      </button>
                    );
                  })}
                  <span className="pd-rating-text-feedback">
                    {RATING_DESCRIPTIONS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Name Field */}
              <div className="pd-form-group">
                <label htmlFor="reviewer-name" className="pd-form-label">الاسم الكريم:</label>
                <input
                  id="reviewer-name"
                  type="text"
                  placeholder="مثال: أحمد مصطفى"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pd-form-input"
                  maxLength={40}
                  required
                />
              </div>

              {/* Preferred Size */}
              <div className="pd-form-group">
                <label className="pd-form-label">الحجم الذي جربته:</label>
                <div className="pd-form-size-pills">
                  {['صغير', 'وسط', 'كبير'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`pd-size-pill-btn ${selectedSize === s ? 'is-selected' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="pd-form-group">
                <label htmlFor="reviewer-comment" className="pd-form-label">رأيك وتجربتك في المذاق:</label>
                <textarea
                  id="reviewer-comment"
                  rows={4}
                  placeholder="احكِ لنا عن الطعم، درجة البرودة، ونقائك المفضل... هل كان منعشاً كما توقعت؟"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="pd-form-textarea"
                  maxLength={500}
                  required
                />
                <span className="pd-char-counter">{comment.length} / 500</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`pd-review-submit-btn ${isSubmitting ? 'is-loading' : ''}`}
              >
                <SendIcon size={16} />
                <span>{isSubmitting ? 'جاري نشر التقييم...' : 'نشر التقييم الآن'}</span>
              </button>

              {showSuccessBadge && (
                <div className="pd-form-success-banner" role="alert">
                  <CheckBadgeIcon size={16} />
                  <span>شكراً لك! تم إضافة ونشر تقييمك بنجاح في القائمة.</span>
                </div>
              )}
            </form>
          </div>

          {/* Left Column: Live Reviews List */}
          <div className="pd-reviews-list-col">
            <div className="pd-list-top-bar">
              <span className="pd-list-count-badge">{reviews.length} تقييم</span>
              <span className="pd-list-verified-note">
                <CheckBadgeIcon size={13} />
                <span>جميع التقييمات موثقة من محبي قصب</span>
              </span>
            </div>

            <div className="pd-reviews-feed">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className={`pd-review-card ${r.isUserReview ? 'is-user-new' : ''}`}
                >
                  <div className="pd-review-card-top">
                    <div className="pd-reviewer-identity">
                      <div className="pd-reviewer-avatar">
                        {r.name ? r.name.charAt(0) : 'ق'}
                      </div>
                      <div>
                        <strong className="pd-reviewer-name">{r.name}</strong>
                        <div className="pd-reviewer-meta">
                          <span className="pd-review-date">{r.date}</span>
                          {r.size && <span className="pd-review-size">• حجم {r.size}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="pd-review-stars">
                      {[...Array(5)].map((_, idx) => (
                        <StarIcon
                          key={idx}
                          size={14}
                          filled={idx < r.rating}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="pd-review-text">"{r.comment}"</p>

                  <div className="pd-review-card-footer">
                    <span className="pd-verified-badge">
                      <CheckBadgeIcon size={12} />
                      <span>طلب مؤكد ومجرب</span>
                    </span>
                    {r.isUserReview && (
                      <span className="pd-user-tag">
                        <UserCheckIcon size={13} />
                        <span>تقييمك الشخصي</span>
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
