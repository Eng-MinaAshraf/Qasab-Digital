'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const SHOWCASE_SLIDES = [
  {
    id: 1,
    tag: 'مشروباتنا الطبيعية',
    titleLine1: 'من عصير القصب',
    titleLine2: 'وأكثر',
    desc: 'مجموعة متنوعة من النكهات الأصيلة اللي تحبها، كلها طبيعية ومحضرة بحب.',
    btnText: 'تصفح المنيو',
    btnHref: '#menu',
    image: '/images/hero-sec-banner-1.webp',
    alt: 'من عصير القصب وأكثر - نكهات طبيعية مصرية من قلب مصر',
    accentColor: '#dfb23e',
  },
  {
    id: 2,
    tag: 'انتعاش الصيف المزدوج',
    titleLine1: 'قصب بالليمون',
    titleLine2: 'والنعناع البلدي',
    desc: 'توليفة مصرية استثنائية تروي العطش وتنعش يومك بأعلى جودة وطبيعية 100%.',
    btnText: 'اطلب العرض الآن',
    btnHref: '#menu',
    image: '/images/hero-sec-banner-2.webp',
    alt: 'انتعاش القصب بالليمون والنعناع الفريش مع بسكويت القصب',
    accentColor: '#8ac433',
  },
  {
    id: 3,
    tag: 'العصرة الأولى النقية',
    titleLine1: 'طاقة ونقاء',
    titleLine2: '100% طبيعي',
    desc: 'خلاصة أعواد القصب الصعيدي المركز، غني بالمعادن الحيوية ونشاط يدوم طوال اليوم.',
    btnText: 'شوف العروض',
    btnHref: '#menu',
    image: '/images/hero-sec-banner-3.webp',
    alt: 'عصير قصب صعيدي خام عصرة أولى نقية',
    accentColor: '#ffd875',
  },
];

const CAROUSEL_CARDS = [
  {
    id: 'classic',
    title: 'قصب كلاسيك',
    image: '/images/card-prod-1.webp',
    alt: 'قصب كلاسيك مثلج فريش',
    targetSlug: 'qasab-classic',
  },
  {
    id: 'lemon',
    title: 'قصب بالليمون',
    image: '/images/card-prod-2.webp',
    alt: 'قصب بالليمون الطبيعي',
    targetSlug: 'qasab-lemon',
  },
  {
    id: 'mint',
    title: 'قصب بالنعناع',
    image: '/images/card-prod-3.webp',
    alt: 'قصب بأوراق النعناع الفريش',
    targetSlug: 'qasab-mint',
  },
  {
    id: 'fresh',
    title: 'قصب فريش',
    image: '/images/card-prod-4.webp',
    alt: 'قصب فريش مركز عصرة أولى',
    targetSlug: 'qasab-fresh-concentrate',
  },
  {
    id: 'edafat',
    title: 'إضافات',
    image: '/images/card-prod-5.webp',
    alt: 'ساندوتش فلافل وسناكس مقرمش',
    targetSlug: 'falafel-sandwich',
  },
];

export default function HeroSecondaryCard() {
  // Top Showcase Slider State (OfferSlider Style)
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  // 6 seconds auto-advance for top promotional slider
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
      setAnimKey((prev) => prev + 1);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, current]);

  const goToSlide = (idx) => {
    setCurrent(idx);
    setAnimKey((prev) => prev + 1);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    setAnimKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
    setAnimKey((prev) => prev + 1);
  };

  const activeSlide = SHOWCASE_SLIDES[current];

  // Bottom Cards Carousel: Strictly User-Controlled (Manual Drag & Navigation Only)
  const trackRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e) => {
    setIsMouseDown(true);
    setHasMoved(false);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollStart(trackRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) setHasMoved(true);
    trackRef.current.scrollLeft = scrollStart - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scrollStep = (direction) => {
    if (!trackRef.current) return;
    const stepSize = 110;
    const scrollAmount = direction === 'next' ? -stepSize : stepSize;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div 
      className="hero-secondary-card visual-card"
      aria-label="مشروباتنا وعروض النكهات الطبيعية"
    >
      {/* ─────────────────────────────────────────────────────────────
          PART 1: TOP PROMOTIONAL SHOWCASE SLIDER (بأسلوب قسم العروض)
          ───────────────────────────────────────────────────────────── */}
      <div 
        className="hero-sec-top"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full-Bleed Background Images with Crossfade & Subtle Zoom */}
        <div className="hero-sec-slides-track">
          {SHOWCASE_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`hero-sec-slide-img-wrap ${idx === current ? 'is-active' : ''}`}
              aria-hidden={idx !== current}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                unoptimized
                priority={idx === 0}
                sizes="(max-width: 1200px) 100vw, 600px"
                className="hero-sec-slide-img"
              />
            </div>
          ))}
        </div>

        {/* Soft Warm Cream Gradient Overlay on Right for Crystal-Clear Arabic Reading */}
        <div className="hero-sec-gradient-overlay" aria-hidden="true" />

        {/* Content Box Over Slide */}
        <div className="hero-sec-content-wrapper" key={animKey}>
          <div className="hero-sec-text-box">
            <span className="hero-sec-badge" style={{ borderColor: activeSlide.accentColor }}>
              <span className="hero-sec-badge-dot" />
              {activeSlide.tag}
            </span>

            <h2 className="hero-sec-title">
              {activeSlide.titleLine1}
              <br />
              <span className="hero-sec-title-accent">{activeSlide.titleLine2}</span>
            </h2>

            <p className="hero-sec-desc">{activeSlide.desc}</p>

            <a href={activeSlide.btnHref} className="btn primary hero-sec-cta-btn">
              <span>{activeSlide.btnText}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Slider Navigation Arrows (Hover) */}
        <button
          type="button"
          className="hero-sec-slider-nav prev-btn"
          onClick={prevSlide}
          aria-label="الشريحة السابقة"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <button
          type="button"
          className="hero-sec-slider-nav next-btn"
          onClick={nextSlide}
          aria-label="الشريحة التالية"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Progress Indicator Pills */}
        <div className="hero-sec-indicators" role="tablist">
          {SHOWCASE_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`hero-sec-indicator-pill ${idx === current ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              role="tab"
              aria-selected={idx === current}
              aria-label={`عرض الشريحة ${idx + 1}`}
            >
              {idx === current && !isPaused && (
                <span className="hero-sec-progress-fill" key={animKey} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 2: USER-CONTROLLED CARDS CAROUSEL (كروت وتتحرك بتحكم المستخدم)
          ───────────────────────────────────────────────────────────── */}
      <div className="hero-sec-bottom">
        {/* Navigation Buttons for manual user scrolling */}
        <div className="hero-sec-bottom-header">
          <span className="hero-sec-bottom-label">تصفح سريع بالنكهات</span>
          <div className="hero-sec-carousel-controls">
            <button
              type="button"
              className="hero-sec-arrow-btn prev-arrow"
              onClick={() => scrollStep('prev')}
              aria-label="الكرت السابق"
              title="السابق"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <button
              type="button"
              className="hero-sec-arrow-btn next-arrow"
              onClick={() => scrollStep('next')}
              aria-label="الكرت التالي"
              title="التالي"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Draggable & Touch-Scrollable Cards Track */}
        <div
          ref={trackRef}
          className={`hero-sec-cards-track ${isMouseDown ? 'is-dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          tabIndex={0}
          role="region"
          aria-label="قائمة المشروبات السريعة (اسحب للتحريك)"
        >
          {CAROUSEL_CARDS.map((card) => (
            <div
              key={card.id}
              className="hero-product-mini-card"
              onClick={(e) => {
                if (hasMoved) e.preventDefault();
              }}
            >
              <div className="hero-product-mini-img-wrap">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  unoptimized
                  sizes="90px"
                  className="hero-product-mini-img"
                  draggable={false}
                />
              </div>

              <span className="hero-product-mini-title">{card.title}</span>

              <a
                href={`#menu`}
                className="hero-product-mini-btn"
                aria-label={`تصفح ${card.title}`}
                onClick={(e) => {
                  if (hasMoved) e.preventDefault();
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
