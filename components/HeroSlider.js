'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'طازة .. طبيعية .. مصرية 100%',
    titleLine1: 'طعم القصب',
    titleLine2: 'على أصوله',
    desc: 'عصير قصب طبيعي 100%، يُعصر طازجاً من أجود أعواد القصب في مزارع الصعيد، بدون إضافة ماء أو سكر أو مواد حافظة.',
    descLines: [
      'عصير قصب طبيعي 100% من مزارع الصعيد،',
      'يُعصر طازجاً بلحظتها بدون ماء أو سكر مضاف،',
      'نكهة مصرية أصيلة تروي القلب في كل رشفة.',
    ],
    image: '/images/hero-slide-1.webp',
    alt: 'عصير قصب كلاسيك طبيعي مثلج مع ماكينة العصر وأعواد القصب',
    accentColor: '#dfb23e',
    trustItems: [
      {
        icon: 'snowflake',
        title: 'مقدم مثلج وفريش',
        desc: 'يُعصر ويقدم في نفس اللحظة',
      },
      {
        icon: 'cane',
        title: 'سكر على قدّه وطبيعي',
        desc: 'حلاوة طبيعية بدون أي إضافات',
      },
      {
        icon: 'leaf',
        title: 'قصب طازة كل يوم',
        desc: 'من أفضل مزارع القصب المصرية',
      },
    ],
  },
  {
    id: 2,
    tag: 'انتعاش الصيف المزدوج',
    titleLine1: 'قصب بالليمون',
    titleLine2: 'انتعاش بلدي أصيل',
    desc: 'مزيج منعش ومبتكر يجمع بين حلاوة سكر القصب الطبيعي ولمسة حموضة الليمون البلدي الفريش.',
    descLines: [
      'حلاوة القصب الطبيعي مع انتعاش الليمون الفريش،',
      'توليفة متوازنة تكسر حر الصيف وتروي العطش،',
      'مذاق بلدي أصيل يمنحك حيوية ونشاط فوري.',
    ],
    image: '/images/hero-slide-2.webp',
    alt: 'كوب عصير قصب مثلج مع شرائح ليمون فريش ونعناع',
    accentColor: '#ffd875',
    trustItems: [
      {
        icon: 'lemon',
        title: 'ليمون بلدي معصور فريش',
        desc: 'عصرة ليمون طبيعية بلحظتها',
      },
      {
        icon: 'snowflake',
        title: 'ترطيب وانتعاش فوري',
        desc: 'توازن ساحر بين السكر والحموضة',
      },
      {
        icon: 'leaf',
        title: 'غني بفيتامين C الطبيعي',
        desc: 'مناعة وطاقة صيفية متجددة',
      },
    ],
  },
  {
    id: 3,
    tag: 'نكهة منعشة تروي القلب',
    titleLine1: 'قصب بالنعناع',
    titleLine2: 'روقان وبرودة فائقة',
    desc: 'عصير قصب طازج ممزوج بأوراق النعناع البلدي الخضراء الطازة. يُقدم مثلجاً برغوة غنية.',
    descLines: [
      'عصير قصب طازج ممزوج بأوراق النعناع البلدي،',
      'يُقدم مثلجاً برغوة غنية وبرودة فائقة،',
      'أفضل خيار لروقان المزاج بعد يوم طويل.',
    ],
    image: '/images/hero-slide-3.webp',
    alt: 'كوب قصب مثلج برغوة غنية وأوراق نعناع بلدي فريش',
    accentColor: '#8ac433',
    trustItems: [
      {
        icon: 'mint',
        title: 'نعناع بلدي طازة ومورق',
        desc: 'أوراق خضراء عطرية تروي العطش',
      },
      {
        icon: 'snowflake',
        title: 'رغوة غنية وبرودة فائقة',
        desc: 'انتعاش وروقان حتى آخر رشفة',
      },
      {
        icon: 'cane',
        title: 'هضم خفيف ومريح',
        desc: 'مزيج طبيعي ومفيد للمعدة',
      },
    ],
  },
  {
    id: 4,
    tag: 'العصرة الأولى الخالصة',
    titleLine1: 'قصب فريش مركز',
    titleLine2: 'طاقة ونقاء 100%',
    desc: 'العصرة الأولى المكثفة والغنية بالمعادن والفيتامينات الطبيعية. قوام ثقيل وطعم قصب عميق.',
    descLines: [
      'خلاصة العصرة الأولى الخام بدون أي تخفيف،',
      'قوام غني ومكثف بالحديد والمعادن الطبيعية،',
      'جرعة نشاط حقيقية تمدك بالحيوية طوال اليوم.',
    ],
    image: '/images/hero-slide-4.webp',
    alt: 'زجاجة وكوب عصير قصب مركز عصرة أولى خام مع أعواد القصب',
    accentColor: '#dfb23e',
    trustItems: [
      {
        icon: 'cane',
        title: 'العصرة الأولى النقية',
        desc: 'خلاصة أعواد القصب المركزة',
      },
      {
        icon: 'sparkle',
        title: 'طاقة وحديد طبيعي',
        desc: 'جرعة نشاط حيوية بدون كافيين',
      },
      {
        icon: 'leaf',
        title: 'قوام غني ومكثف',
        desc: '100% عصير بيور بدون تخفيف',
      },
    ],
  },
  {
    id: 5,
    tag: 'رفيق القصب الأصيل',
    titleLine1: 'ساندوتش فلافل',
    titleLine2: 'مقرمش وطازة بلدي',
    desc: 'ساندوتش فلافل سخن ومقرمش بالسمسم بخلطتنا البلدية الخاصة، مقلية فور الطلب في عيش بلدي.',
    descLines: [
      'طعمية بلدي سخنة مقلية فور الطلب بالسمسم،',
      'تُقدم في عيش بلدي مع سلطة طحينة ومخلل،',
      'الرفيق الأشهى لكوب القصب المثلج.',
    ],
    image: '/images/hero-slide-5.webp',
    alt: 'ساندوتش فلافل مقرمش في عيش بلدي مع كوبين عصير قصب مثلج',
    accentColor: '#f7c844',
    trustItems: [
      {
        icon: 'flame',
        title: 'مقلية لحظة الطلب سخنة',
        desc: 'فلافل ذهبية مقرمشة بالسمسم',
      },
      {
        icon: 'leaf',
        title: 'خلطة بلدية بالكزبرة والثوم',
        desc: 'طعم مصري أصيل في عيش بلدي',
      },
      {
        icon: 'cane',
        title: 'الكومبو المثالي مع القصب',
        desc: 'وجبة متكاملة تشبع وتروق',
      },
    ],
  },
];

function RenderTrustIcon({ icon }) {
  switch (icon) {
    case 'snowflake':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4l-3 6"/><path d="m17 3-3 6h-4L7 3"/><path d="M2 12h20"/><path d="m20 10-2.5 1.25L18 14"/><path d="m4 10 2.5 1.25L6 14"/><path d="m20 14-2.5-1.25L18 10"/><path d="m4 14 2.5-1.25L6 10"/>
        </svg>
      );
    case 'cane':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 21V3M12 21V3M17 21V3"/>
          <path d="M7 8h5M12 13h5M7 16h5M12 7h5"/>
        </svg>
      );
    case 'lemon':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 3a9 9 0 0 1 9 9M12 3v9l6.36 6.36M12 12l-6.36 6.36M12 12H3"/>
        </svg>
      );
    case 'mint':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C12 22 4 17 4 10C4 6 7 2 12 2C17 2 20 6 20 10C20 17 12 22 12 22Z"/>
          <path d="M12 2V22"/>
          <path d="M12 8L16 11M12 14L17 16M12 8L8 11M12 14L7 16"/>
        </svg>
      );
    case 'sparkle':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>
        </svg>
      );
    case 'flame':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      );
    case 'leaf':
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 4 13C4 8 8 3 19 3c0 11-5 15-8 17Z"/>
          <path d="M19 3v4c0 6-4 10-10 13"/>
        </svg>
      );
  }
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Track viewport visibility to avoid main-thread work when off-screen
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

  // Auto-advance every 7 seconds ONLY when in view and not paused (with initial settling delay)
  useEffect(() => {
    if (isPaused || !isInView) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Allow 8 seconds initial window for page load and reading before auto-advance starts
    const initialDelay = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
        setAnimKey((prev) => prev + 1);
      }, 7000);
    }, 8000);

    return () => {
      clearTimeout(initialDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isInView]);

  const goToSlide = (index) => {
    setCurrent(index);
    setAnimKey((prev) => prev + 1);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    setAnimKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setAnimKey((prev) => prev + 1);
  };

  const activeSlide = HERO_SLIDES[current];

  return (
    <section 
      ref={containerRef}
      className="hero-slider-unified visual-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="مشروبات قصب الأكثر طلباً"
    >
      {/* Upper Main Banner with Slides, Gradients & Dynamic Typography */}
      <div className="hero-slider-main">
        {/* Background Images with Crossfade & Subtle Zoom */}
        <div className="hero-slider-track">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`hero-slide-img-wrap ${idx === current ? 'is-active' : ''}`}
              aria-hidden={idx !== current}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                unoptimized
                priority={idx === 0}
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="hero-slide-img"
              />
            </div>
          ))}
        </div>

        {/* Soft Dark Gradient Mask on the Right for Crystal-Clear Arabic Reading */}
        <div className="hero-slider-gradient-overlay" aria-hidden="true" />

        {/* Slide Content (Typography, Badge & Action Buttons) */}
        <div className="hero-slider-content-wrap" key={animKey}>
          <div className="hero-slider-text-box">
            <span className="hero-slide-badge" style={{ borderColor: activeSlide.accentColor }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>
              </svg>
              <span>{activeSlide.tag}</span>
            </span>

            <h1 className="hero-slide-title">
              <span className="hero-title-line-1">{activeSlide.titleLine1}</span>
              <span className="hero-title-line-2">{activeSlide.titleLine2}</span>
            </h1>

            <p className="hero-slide-desc">
              {activeSlide.descLines ? (
                activeSlide.descLines.map((line, lIdx) => (
                  <span key={lIdx} className="hero-desc-line">
                    {line}
                  </span>
                ))
              ) : (
                activeSlide.desc
              )}
            </p>

            <div className="hero-slider-actions">
              <a href="#menu" className="btn primary hero-order-btn">
                <span>اطلب دلوقتي</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
                </svg>
              </a>

              <a href="#menu" className="btn ghost hero-menu-btn">
                <span>شوف المنيو</span>
              </a>
            </div>
          </div>
        </div>

        {/* Hover Navigation Arrows */}
        <button
          className="hero-slider-nav-btn prev-btn"
          onClick={prevSlide}
          aria-label="المنتج السابق"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <button
          className="hero-slider-nav-btn next-btn"
          onClick={nextSlide}
          aria-label="المنتج التالي"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Indicator Pills with 5s Countdown Progress Bars */}
        <div className="hero-slider-indicators" role="tablist">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`hero-indicator-pill ${idx === current ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              role="tab"
              aria-selected={idx === current}
              aria-label={`عرض المنتج ${idx + 1}`}
            >
              {idx === current && !isPaused && (
                <span className="hero-progress-fill" key={animKey} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Integrated Bottom Trust Bar (Changes Dynamically with each Product) */}
      <div className="hero-trust-bar" key={`trust-${animKey}`}>
        {activeSlide.trustItems.map((item, idx) => (
          <div className="hero-trust-item" key={idx}>
            <div className="hero-trust-icon-wrap">
              <RenderTrustIcon icon={item.icon} />
            </div>
            <div className="hero-trust-text">
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
