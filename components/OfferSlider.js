'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function OfferBadgeIcon({ type = 'star', size = 12 }) {
  switch (type) {
    case 'flame':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      );
    case 'leaf':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
        </svg>
      );
    case 'star':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
  }
}

const OFFERS = [
  {
    id: 1,
    iconType: 'star',
    badge: 'عرض خاص ومميز',
    title: 'كومبو السعادة',
    desc: '2 كوب قصب كلاسيك مثلج كبير + ساندوتش فلافل مقرمش بخلطتنا الخاصة',
    price: '45 ج.م',
    oldPrice: '60 ج.م',
    saving: 'وفر 15 ج.م',
    image: '/images/offer-slide-1.webp',
    alt: 'كومبو السعادة - عصير قصب كلاسيك مع ساندوتش فلافل',
    accentColor: '#dfb23e',
  },
  {
    id: 2,
    iconType: 'flame',
    badge: 'الأكثر طلباً للجمعات',
    title: 'عرض لِمّة الصحاب',
    desc: '4 زجاجات عصير قصب فريش حجم عائلي بنكهات مميزة (كلاسيك، برتقال، ليمون ونعناع)',
    price: '95 ج.م',
    oldPrice: '130 ج.م',
    saving: 'وفر 35 ج.م',
    image: '/images/offer-slide-2.webp',
    alt: 'عرض لمة الصحاب - 4 زجاجات عصير قصب بنكهات متنوعة',
    accentColor: '#ff9800',
  },
  {
    id: 3,
    iconType: 'leaf',
    badge: 'انتعاش الصيف',
    title: 'عرض التوينز المنعش',
    desc: '2 كوب قصب مثلج بالليمون والنعناع الفريش حجم كبير + كوكيز قصب مقرمش ولذيذ',
    price: '40 ج.م',
    oldPrice: '55 ج.م',
    saving: 'وفر 15 ج.م',
    image: '/images/offer-slide-3.webp',
    alt: 'عرض التوينز المنعش - عصير قصب بالليمون والنعناع مع كوكيز',
    accentColor: '#8ac433',
  },
];

export default function OfferSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-advance ONLY when visible in viewport
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 6 seconds auto-advance
  useEffect(() => {
    if (isPaused || !isInView) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % OFFERS.length);
      setAnimKey((prev) => prev + 1);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isInView]);

  const goToSlide = (index) => {
    setCurrent(index);
    setAnimKey((prev) => prev + 1);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % OFFERS.length);
    setAnimKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + OFFERS.length) % OFFERS.length);
    setAnimKey((prev) => prev + 1);
  };

  const activeOffer = OFFERS[current];

  return (
    <section 
      ref={containerRef}
      className="offer-slider-section shell visual-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="عروض قصب الحصرية"
    >
      {/* Background Images with Crossfade & Subtle Ken Burns Zoom */}
      <div className="offer-slides-track">
        {OFFERS.map((offer, idx) => (
          <div
            key={offer.id}
            className={`offer-slide-img-wrap ${idx === current ? 'is-active' : ''}`}
            aria-hidden={idx !== current}
          >
            <Image
              src={offer.image}
              alt={offer.alt}
              fill
              unoptimized
              priority={idx === 0}
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="offer-slide-img"
            />
          </div>
        ))}
      </div>

      {/* Seamless Soft Gradient & Glass Mask on the Right for Crystal-Clear Text Legibility */}
      <div className="offer-gradient-overlay" aria-hidden="true" />

      {/* Offer Content Block (Positioned on the Right Side) */}
      <div className="offer-content-wrapper" key={animKey}>
        <div className="offer-text-box">
          <div className="offer-badge-row">
            <span className="offer-badge" style={{ borderColor: activeOffer.accentColor }}>
              <OfferBadgeIcon type={activeOffer.iconType} size={12} />
              <span>{activeOffer.badge}</span>
            </span>
            <span className="offer-timer-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              لفترة محدودة
            </span>
          </div>

          <h2 className="offer-title">{activeOffer.title}</h2>
          <p className="offer-desc">{activeOffer.desc}</p>

          <div className="offer-bottom-row">
            <div className="offer-price-tag">
              <span className="offer-price-current">{activeOffer.price}</span>
              <span className="offer-price-old">{activeOffer.oldPrice}</span>
              <span className="offer-saving-pill">{activeOffer.saving}</span>
            </div>

            <a href="#order" className="offer-cta-btn">
              <span>اطلب العرض الآن</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Arrows (Hover) & Progress Indicator Dots */}
      <button 
        className="offer-nav-btn prev-btn" 
        onClick={prevSlide}
        aria-label="العرض السابق"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      <button 
        className="offer-nav-btn next-btn" 
        onClick={nextSlide}
        aria-label="العرض التالي"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Indicators and 5s Countdown Progress Bar */}
      <div className="offer-slider-indicators" role="tablist">
        {OFFERS.map((_, idx) => (
          <button
            key={idx}
            className={`offer-indicator-pill ${idx === current ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
            role="tab"
            aria-selected={idx === current}
            aria-label={`الانتقال إلى العرض ${idx + 1}`}
          >
            {idx === current && !isPaused && (
              <span className="offer-progress-fill" key={animKey} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
