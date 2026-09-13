'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CartTrigger from './CartTrigger';
import BrandLogo from './BrandLogo';
import NotificationCenter from './NotificationCenter';
import { useAuth } from '../context/AuthContext';

/* ─── Inline SVG Icons ─── */
function HomeNavIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function ArrowLeftIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

/* ─── Product Flavor SVG Badges ─── */
function CaneMiniIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M8 5v14M16 5v14M8 9h8M8 15h8" />
    </svg>
  );
}

function LemonMiniIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6.5 6.5M12 12l-6.5 6.5M12 12l-9-3M12 12l9-3" />
    </svg>
  );
}

function MintMiniIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 11 3s7 4 7 10a7 7 0 0 1-7 7Z" />
      <path d="M11 20V11M11 15l4-3M11 17l-3-2" />
    </svg>
  );
}

function PureMiniIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function FalafelMiniIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
      <circle cx="15" cy="9" r="1.2" fill="currentColor" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LeafMiniIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

/* ─── Navigation Links Data ─── */
const NAV_LINKS = [
  { label: 'الرئيسية', href: '/#home', sectionId: 'home' },
  { label: 'المنيو', href: '/#menu', sectionId: 'menu', hasMegaMenu: true },
  { label: 'من نحن', href: '/#about', sectionId: 'about' },
  { label: 'آراء العملاء', href: '/#reviews', sectionId: 'reviews' },
  { label: 'لحظات القصب', href: '/#gallery', sectionId: 'gallery' },
  { label: 'تواصل معنا', href: '/#contact', sectionId: 'contact' },
];

/* ─── Mega Menu Products with Professional Images and Icons ─── */
const MEGA_MENU_ITEMS = [
  {
    id: 'classic',
    title: 'قصب كلاسيك',
    image: '/images/card-prod-1.webp',
    tag: 'الأكثر طلباً',
    price: '١٥ ج.م',
    desc: 'عصير قصب مصري بلدي طازج ومثلج على الأصول',
    Icon: CaneMiniIcon,
    href: '#menu',
  },
  {
    id: 'lemon',
    title: 'قصب بالليمون',
    image: '/images/card-prod-2.webp',
    tag: 'انتعاش بلدي',
    price: '١٨ ج.م',
    desc: 'مزيج الحمضيات الطبيعية مع حلاوة القصب الصافية',
    Icon: LemonMiniIcon,
    href: '#menu',
  },
  {
    id: 'mint',
    title: 'قصب بالنعناع',
    image: '/images/card-prod-3.webp',
    tag: 'روقان فائق',
    price: '٢٠ ج.م',
    desc: 'أوراق نعناع بلدي خضراء مع لمسة انتعاش مثلجة',
    Icon: MintMiniIcon,
    href: '#menu',
  },
  {
    id: 'fresh',
    title: 'قصب فريش مركز',
    image: '/images/card-prod-4.webp',
    tag: 'طاقة ونقاء',
    price: '٢٥ ج.م',
    desc: 'عصارة القصب الأولى الصافية غنية بالمعادن',
    Icon: PureMiniIcon,
    href: '#menu',
  },
  {
    id: 'falafel',
    title: 'ساندوتش فلافل مقرمش',
    image: '/images/card-prod-5.webp',
    tag: 'رفيق القصب',
    price: '١٢ ج.م',
    desc: 'طعمية بلدي سخنة ومقرمشة بالسمسم والطحينة',
    Icon: FalafelMiniIcon,
    href: '#menu',
  },
];

export default function Header() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  /* ─── State ─── */
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pillStyle, setPillStyle] = useState({ opacity: 0 });
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0, visible: false });
  const [isNavVisible, setIsNavVisible] = useState(false);

  /* ─── Refs ─── */
  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const headerRef = useRef(null);
  const megaMenuTimer = useRef(null);

  /* ─── 1. Staggered Entrance Animation ─── */
  useEffect(() => {
    const timer = setTimeout(() => setIsNavVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ─── 2. Scroll Effect: Shrink + Float ─── */
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ─── 3. Scroll Spy: Active Section Tracking ─── */
  useEffect(() => {
    const sectionIds = NAV_LINKS.map(l => l.sectionId);
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  /* ─── 4. Liquid Pill Indicator Position ─── */
  const updatePill = useCallback((idx) => {
    if (idx === null || !linkRefs.current[idx] || !navRef.current) {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const linkRect = linkRefs.current[idx].getBoundingClientRect();

    setPillStyle({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    if (hoveredIdx !== null) {
      updatePill(hoveredIdx);
    } else {
      const activeIdx = NAV_LINKS.findIndex(l => l.sectionId === activeSection);
      if (activeIdx !== -1) {
        updatePill(activeIdx);
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    }
  }, [hoveredIdx, activeSection, updatePill]);

  /* ─── 5. Mega Menu Open / Close with Debounce ─── */
  const openMegaMenu = () => {
    clearTimeout(megaMenuTimer.current);
    setMegaMenuOpen(true);
  };

  const closeMegaMenu = () => {
    megaMenuTimer.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 220);
  };

  const closeMegaMenuImmediately = useCallback(() => {
    clearTimeout(megaMenuTimer.current);
    setMegaMenuOpen(false);
  }, []);

  const keepMegaMenu = () => {
    clearTimeout(megaMenuTimer.current);
  };

  /* Close mega menu on outside click or Escape key */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        closeMegaMenuImmediately();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMegaMenuImmediately();
      }
    };
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMegaMenuImmediately]);

  /* ─── 6. Cursor Following Glow ─── */
  const handleNavMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleNavMouseLeave = () => {
    setGlowPos(prev => ({ ...prev, visible: false }));
    setHoveredIdx(null);
  };

  return (
    <header
      ref={headerRef}
      className={`header-flow ${isScrolled ? 'is-scrolled' : ''} ${isNavVisible ? 'is-visible' : ''}`}
    >
      <div className="header-flow-inner">
        {/* ─── Brand Logo (Right in RTL) ─── */}
        <Link
          href="/"
          className="header-flow-brand"
          aria-label="الصفحة الرئيسية لقصب"
          onClick={closeMegaMenuImmediately}
        >
          <BrandLogo priority />
        </Link>

        {/* ─── Navigation Center ─── */}
        <nav
          ref={navRef}
          className="header-flow-nav"
          aria-label="القائمة الرئيسية"
          onMouseMove={handleNavMouseMove}
          onMouseLeave={handleNavMouseLeave}
        >
          {/* Cursor-Following Glow */}
          <div
            className="nav-cursor-glow"
            style={{
              left: glowPos.x,
              top: glowPos.y,
              opacity: glowPos.visible ? 1 : 0,
            }}
            aria-hidden="true"
          />

          {/* Liquid Pill Indicator */}
          <div
            className="nav-liquid-pill"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
            }}
            aria-hidden="true"
          />

          {/* Navigation Links */}
          {NAV_LINKS.map((link, idx) => {
            const isHome = link.sectionId === 'home';
            const isActive = isHome
              ? (pathname === '/' && (activeSection === 'home' || !activeSection))
              : (activeSection === link.sectionId);

            return (
              <a
                key={link.sectionId}
                ref={el => { linkRefs.current[idx] = el; }}
                href={link.href}
                className={`nav-flow-link ${isHome ? 'nav-flow-link-home' : ''} ${isActive ? 'is-active' : ''}`}
                style={{ animationDelay: `${120 + idx * 60}ms` }}
                onClick={closeMegaMenuImmediately}
                onMouseEnter={() => {
                  setHoveredIdx(idx);
                  if (link.hasMegaMenu) openMegaMenu();
                }}
                onMouseLeave={() => {
                  if (link.hasMegaMenu) closeMegaMenu();
                }}
              >
                {isHome ? (
                  <span className="nav-home-badge-container">
                    <span className="nav-home-icon-circle" aria-hidden="true">
                      <HomeNavIcon size={14} />
                    </span>
                    <span className="nav-home-text">{link.label}</span>
                  </span>
                ) : (
                  link.label
                )}
              </a>
            );
          })}
        </nav>

        {/* ─── Actions (Left in RTL) ─── */}
        <div className="header-flow-actions">
          <a
            href="#menu"
            className="header-flow-icon-btn"
            aria-label="البحث عن منتج"
            style={{ animationDelay: '420ms' }}
            onClick={closeMegaMenuImmediately}
          >
            <SearchIcon size={17} />
          </a>

          {/* Notification Center */}
          <NotificationCenter />

          {/* Account / Login / Admin Link */}
          <Link
            href={isAdmin ? '/admin' : user ? '/account' : '/login'}
            className="header-flow-icon-btn"
            aria-label={isAdmin ? 'لوحة تحكم المدير' : user ? 'حسابي' : 'تسجيل الدخول'}
            style={{ animationDelay: '480ms' }}
            title={isAdmin ? 'لوحة تحكم المدير' : user ? 'حسابي' : 'تسجيل الدخول'}
          >
            <UserIcon size={17} />
            {user && <span className="user-logged-dot" />}
          </Link>

          <div style={{ animationDelay: '540ms' }} className="header-flow-cart-wrap">
            <CartTrigger />
          </div>
        </div>
      </div>

      {/* ─── Mega Menu for المنيو ─── */}
      <div
        className={`mega-menu-sheet ${megaMenuOpen ? 'is-open' : ''}`}
        onMouseEnter={keepMegaMenu}
        onMouseLeave={closeMegaMenu}
      >
        <div className="mega-menu-inner">
          <div className="mega-menu-header">
            <div className="mega-menu-header-info">
              <span className="mega-menu-title">أشهر طلبات القصب</span>
              <span className="mega-menu-subtitle">طبيعي ١٠٠٪ معصور لحظة طلبك</span>
            </div>
            <a
              href="#menu"
              className="mega-menu-view-all"
              onClick={closeMegaMenuImmediately}
            >
              <span>شاهد المنيو الكامل</span>
              <ArrowLeftIcon size={12} />
            </a>
          </div>

          <div className="mega-menu-grid">
            {MEGA_MENU_ITEMS.map((item, idx) => {
              const IconComponent = item.Icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="mega-menu-card"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={closeMegaMenuImmediately}
                >
                  <div className="mega-menu-card-visual">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={52}
                      height={52}
                      className="mega-menu-card-img"
                    />
                    <span className="mega-menu-card-icon-badge" aria-hidden="true">
                      <IconComponent size={12} />
                    </span>
                  </div>

                  <div className="mega-menu-card-body">
                    <div className="mega-menu-card-headline">
                      <strong className="mega-menu-card-title">{item.title}</strong>
                      <span className="mega-menu-card-tag">{item.tag}</span>
                      <span className="mega-menu-card-price">{item.price}</span>
                    </div>
                    <span className="mega-menu-card-desc">{item.desc}</span>
                  </div>

                  <div className="mega-menu-card-arrow" aria-hidden="true">
                    <ArrowLeftIcon size={13} />
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mega-menu-footer">
            <span className="mega-menu-footer-badge">
              <LeafMiniIcon size={13} />
              <span>طازج يومياً</span>
            </span>
            <span className="mega-menu-footer-text">عصير قصب صعيدي أصيل بدون سكر مضاف أو مواد حافظة</span>
          </div>
        </div>
      </div>
    </header>
  );
}
