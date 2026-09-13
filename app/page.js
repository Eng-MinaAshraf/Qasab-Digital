import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BestCard from '../components/BestCard';

import NewsletterForm from '../components/NewsletterForm';
import OfferSlider from '../components/OfferSlider';
import AboutSlider from '../components/AboutSlider';
import HeroSlider from '../components/HeroSlider';
import HeroSecondaryCard from '../components/HeroSecondaryCard';
const GallerySection = dynamic(() => import('../components/GallerySection'));
const QuickOrder = dynamic(() => import('../components/QuickOrder'));



// Pure Zero-Overhead SVG Icons for Server Components
function SparklesIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

function ArrowLeftIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

function SnowflakeIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4l-3 6"/><path d="m17 3-3 6h-4L7 3"/><path d="M2 12h20"/><path d="m20 10-2.5 1.25L18 14"/><path d="m4 10 2.5 1.25L6 14"/><path d="m20 14-2.5-1.25L18 10"/><path d="m4 14 2.5-1.25L6 10"/>
    </svg>
  );
}

function LeafIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function ClockIcon({ size = 13, style = {}, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function FlameIcon({ size = 22, color = '#dfb23e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

function CrownIcon({ size = 22, color = '#dfb23e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
  );
}

function MessageCircleIcon({ size = 21, color = '#dfb23e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  );
}

function LeafCircleIcon({ size = 26, style = {}, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" />
      <path d="M12 7.5c-2.5 0-4.5 2-4.5 4.5 0 2 1.5 3 3.5 3 2.5 0 4-2 4.5-4.5 0-1.5-1.5-3-3.5-3z" stroke="currentColor" />
      <path d="M12 15v-4" stroke="currentColor" />
    </svg>
  );
}

function UsersGroupIcon({ size = 26, style = {}, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="12" cy="7" r="3" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      <circle cx="4.5" cy="9.5" r="2" />
      <path d="M1.5 18a4 4 0 0 1 3.5-3.5" />
      <circle cx="19.5" cy="9.5" r="2" />
      <path d="M22.5 18a4 4 0 0 0-3.5-3.5" />
    </svg>
  );
}

function CalendarDaysIcon({ size = 26, style = {}, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <rect x="3" y="4.5" width="18" height="17" rx="3" />
      <path d="M8 2.5v4" />
      <path d="M16 2.5v4" />
      <path d="M3 10h18" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function AwardIcon({ size = 24, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}

function UsersIcon({ size = 24, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function CalendarIcon({ size = 24, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
    </svg>
  );
}

function MapPinIcon({ size = 13, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function StarIcon({ size = 13, fill = '#e4b833' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TikTokIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.38 6.38 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.32V8.92a8.28 8.28 0 0 0 3.91 1.25V6.69z"/>
    </svg>
  );
}

function TwitterIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
    </svg>
  );
}

import { getAllProducts, getBestSellers } from '../data/products';

const products = getAllProducts();
const best = getBestSellers();

const gallery = [
  'gallery-1.jpg',
  'gallery-2.jpg',
  'gallery-3.jpg',
  'gallery-4.jpg',
  'gallery-5.jpg',
  'gallery-6.jpg',
];

export default function Home() {
  return (
    <main id="home">
      <Header />

      {/* Duo Hero Section: Hero Slider (Right, Dominant) + Secondary Card (Left) */}
      <section className="hero-duo-container shell" aria-label="قسم الهيرو الرئيسي">
        <HeroSlider />
        <HeroSecondaryCard />
      </section>

      {/* Menu / Top Products */}
      <section id="menu" className="section shell">
        <div className="section-head">
          <h2>
            <FlameIcon size={22} color="#dfb23e" />
            أكثر المشروبات طلباً
          </h2>
          <a href="#menu" className="section-head-link">
            <span>عرض القائمة بالكامل</span>
            <ArrowLeftIcon size={13} />
          </a>
        </div>
        <div className="products">
          {products.map((p) => (
            <ProductCard item={p} key={p.id} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about shell">
        <AboutSlider />
        <div className="about-card visual-card">
          <div className="about-card-content">
            <p className="about-card-tag">عن قصب</p>
            <h2>مش بس عصير .. ده تراث</h2>
            <p className="about-card-desc">
              قصب بدأ من حبنا للقصب المصري الأصيل، وحرصنا على تقديمه بأفضل جودة وطعم. من قلب القاهرة وبأيدٍ مصرية، بنقدم لك عصير قصب طبيعي 100% بكل نكهاته اللي بنحبها.
            </p>
            <div>
              <a className="btn cream about-story-btn" href="#about">
                <span>اعرف قصتنا</span>
                <ArrowLeftIcon size={14} />
              </a>
            </div>
          </div>
          <div className="about-card-art-wrap" aria-hidden="true">
            <Image
              src="/images/about-sugarcane-art.webp"
              alt="أعواد القصب المصري الأصيل"
              width={260}
              height={360}
              className="about-card-sugarcane-art"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Special Offers Interactive Carousel */}
      <OfferSlider />


      {/* Best Sellers */}
      <section className="section shell">
        <div className="section-head">
          <h2>
            <CrownIcon size={22} color="#dfb23e" />
            الأكثر مبيعاً وتقييماً
          </h2>
          <a href="#menu" className="section-head-link">
            <span>تصفح الكل</span>
            <ArrowLeftIcon size={13} />
          </a>
        </div>
        <div className="best-grid">
          {best.map((p) => (
            <BestCard item={p} key={p.id} />
          ))}
        </div>
      </section>

      {/* Interactive Gallery */}
      <GallerySection gallery={gallery} />

      {/* Customer Reviews - Pure Static Server HTML */}
      <section id="reviews" className="reviews shell">
        <div className="section-head">
          <h2>
            <MessageCircleIcon size={21} color="#dfb23e" />
            آراء عملائنا
          </h2>
          <a href="#reviews" className="section-head-link">
            <span>عرض الكل</span>
            <ArrowLeftIcon size={13} />
          </a>
        </div>
        <div className="review-grid">
          {[
            { name: 'سارة محمد', role: 'عميلة دائمة', text: 'أحلى عصير قصب جربته في حياتي والساندوتش كمان لذيذ جداً', avatar: '/images/avatar-sara.jpg' },
            { name: 'كريم السيد', role: 'عميل دائم', text: 'خدمة ممتازة والطعم طبيعي 1000 أنصح به جداً', avatar: '/images/avatar-karim.jpg' },
            { name: 'منة الله', role: 'عميلة دائمة', text: 'القصب طازة جداً والناس في المكان محترمة ومحترمة. تجربة رائعة!', avatar: '/images/avatar-menna.jpg' },
            { name: 'أحمد رمضان', role: 'عميل دائم', text: 'الطعم يومه بجد. أحلى قصب في القاهرة وسعر مناسب. هطلب تاني أكيد!', avatar: '/images/avatar-ahmed.jpg' },
          ].map((r) => (
            <article className="review" key={r.name}>
              <div className="stars">
                {[...Array(5)].map((_, idx) => (
                  <StarIcon key={idx} size={13} fill="#e4b833" />
                ))}
              </div>
              <p>"{r.text}"</p>
              <div className="person">
                <div className="avatar avatar-img">
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    width={36}
                    height={36}
                    unoptimized
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                </div>
                <div>
                  <span>{r.name}</span>
                  <small>{r.role}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom Section: Quick Order & Stats */}
      <section className="bottom shell">
        <QuickOrder />

        <div className="stats-banner-card">
          <div className="stats-header">
            <span className="stats-header-title">أرقامنا تتحدث</span>
            <LeafCircleIcon size={16} className="stats-header-icon" />
          </div>
          <div className="stats-grid">
            <div className="stats-col">
              <LeafCircleIcon size={26} className="stats-metric-icon" />
              <b>100%</b>
              <span>قصب طازة</span>
            </div>
            <div className="stats-col">
              <UsersGroupIcon size={26} className="stats-metric-icon" />
              <b>50K+</b>
              <span>عميل سعيد</span>
            </div>
            <div className="stats-col">
              <CalendarDaysIcon size={26} className="stats-metric-icon" />
              <b>10+</b>
              <span>سنين خبرة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Pure Static Server HTML */}
      <footer id="contact">
        <div className="footer-main">
          {/* 1. Brand Logo (on the right in RTL) */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <Image
                src="/images/logo-footer.png"
                alt="قصب — عصير قصب مصري أصيل"
                width={130}
                height={44}
                unoptimized
                className="footer-brand-img"
              />
            </div>
            <p className="footer-brand-tagline">قصب طبيعي .. نكهة مصرية</p>
          </div>

          <div className="footer-divider" aria-hidden="true" />

          {/* 2. Quick links */}
          <div className="footer-links-col">
            <h4>روابط سريعة</h4>
            <a href="#home">الرئيسية</a>
            <a href="#menu">المنيو</a>
            <a href="#about">من نحن</a>
            <a href="#reviews">آراء العملاء</a>
            <a href="#contact">تواصل معنا</a>
          </div>

          <div className="footer-divider" aria-hidden="true" />

          {/* 3. Menu links */}
          <div className="footer-links-col">
            <h4>المنيو</h4>
            <a href="#menu">قصب كلاسيك</a>
            <a href="#menu">قصب بالليمون</a>
            <a href="#menu">قصب بالنعناع</a>
            <a href="#menu">قصب فريش</a>
            <a href="#menu">إضافات</a>
          </div>

          <div className="footer-divider" aria-hidden="true" />

          {/* 4. Social media links */}
          <div className="footer-social-col">
            <h4>تابعنا</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="فيسبوك قصب">
                <FacebookIcon size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="انستجرام قصب">
                <InstagramIcon size={14} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="تيك توك قصب">
                <TikTokIcon size={14} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="يوتيوب قصب">
                <YoutubeIcon size={14} />
              </a>
            </div>
          </div>

          <div className="footer-divider" aria-hidden="true" />

          {/* 5. Newsletter subscription */}
          <div className="footer-newsletter-col">
            <h4>اشترك في النشرة البريدية</h4>
            <p>احصل على أحدث العروض والأخبار مباشرة</p>
            <NewsletterForm />
          </div>

          {/* 6. Decorative sugarcane image (on the left in RTL) */}
          <div className="footer-deco-img">
            <Image
              src="/images/footer-logo-transparent.png"
              alt="القصب لذة الحياة"
              width={730}
              height={790}
              unoptimized
              className="footer-sugarcane-art"
            />
          </div>
        </div>

        {/* Copyright & Legal Links Bar */}
        <div className="copyright">
          <span>© 2026 ⊹ قصب. جميع الحقوق محفوظة</span>
          <span className="copyright-sep"> • </span>
          <Link href="/privacy">سياسة الخصوصية</Link>
          <span className="copyright-sep"> • </span>
          <Link href="/terms">شروط الاستخدام</Link>
          <span className="copyright-sep"> • </span>
          <Link href="/account">حسابي</Link>
          <span className="copyright-sep"> • </span>
          <Link href="/admin">لوحة الإدارة</Link>
        </div>
      </footer>
    </main>
  );
}
