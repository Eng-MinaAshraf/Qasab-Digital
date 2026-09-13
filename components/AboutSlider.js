'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function AboutBadgeIcon({ type = 'heart', size = 12 }) {
  switch (type) {
    case 'leaf':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
        </svg>
      );
    case 'snowflake':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
          <path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>
        </svg>
      );
    case 'heart':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      );
  }
}

const ABOUT_SLIDES = [
  {
    id: 1,
    image: '/images/about-slide-1.webp',
    alt: 'واجهة محل قصب مصر التراثية في قلب القاهرة',
    iconType: 'heart',
    tag: 'من قلب القاهرة',
    title: 'واجهتنا وأصول الصنعة',
    desc: 'حكاية بدأت بشغف وتراث مصري أصيل يعود لسنوات',
  },
  {
    id: 2,
    image: '/images/about-slide-2.webp',
    alt: 'عصر أعواد القصب الطازة بأحدث ماكينات الستانلس ستيل',
    iconType: 'leaf',
    tag: 'عصر طازج بلحظتها',
    title: 'ماكينات ستانلس نقية',
    desc: 'عصير طبيعي 100% يُعصر فريش أمامك بدون إضافات',
  },
  {
    id: 3,
    image: '/images/about-slide-3.webp',
    alt: 'كاسات قصب مثلجة برغوة غنية ولمسات ليمون ونعناع فريش',
    iconType: 'snowflake',
    tag: 'طعم يروي العطش',
    title: 'كوب مثلج برغوة غنية',
    desc: 'انتعاش بلدي أصيل يروي القلب في كل رشفة',
  },
];

export default function AboutSlider() {
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
      setCurrent((prev) => (prev + 1) % ABOUT_SLIDES.length);
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
    setCurrent((prev) => (prev + 1) % ABOUT_SLIDES.length);
    setAnimKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length);
    setAnimKey((prev) => prev + 1);
  };

  const activeSlide = ABOUT_SLIDES[current];

  return (
    <div
      ref={containerRef}
      className="about-photo visual-card about-slider-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="معرض تراث قصب مصر"
    >
      {/* Background Images with Crossfade & Ken Burns Zoom */}
      <div className="about-slides-track">
        {ABOUT_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`about-slide-img-wrap ${idx === current ? 'is-active' : ''}`}
            aria-hidden={idx !== current}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              unoptimized
              priority={idx === 0}
              sizes="(max-width: 960px) 100vw, 50vw"
              className="about-slide-img"
            />
          </div>
        ))}
      </div>

      {/* Soft Gradient Overlay for Crystal-Clear Text & Blend */}
      <div className="about-slider-gradient-overlay" aria-hidden="true" />

      {/* Slide Badge and Caption Box (Code Rendered) */}
      <div className="about-slider-caption-box" key={animKey}>
        <span className="about-slide-tag">
          <AboutBadgeIcon type={activeSlide.iconType} size={12} />
          <span>{activeSlide.tag}</span>
        </span>
        <h3 className="about-slide-title">{activeSlide.title}</h3>
        <p className="about-slide-desc">{activeSlide.desc}</p>
      </div>

      {/* Navigation Arrows on Hover */}
      <button
        className="about-slider-nav-btn prev-btn"
        onClick={prevSlide}
        aria-label="الصورة السابقة"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <button
        className="about-slider-nav-btn next-btn"
        onClick={nextSlide}
        aria-label="الصورة التالية"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* Indicators and 5s Countdown Progress Bar */}
      <div className="about-slider-indicators" role="tablist">
        {ABOUT_SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`about-indicator-pill ${idx === current ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
            role="tab"
            aria-selected={idx === current}
            aria-label={`عرض الصورة ${idx + 1}`}
          >
            {idx === current && !isPaused && (
              <span className="about-progress-fill" key={animKey} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
