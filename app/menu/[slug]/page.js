import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, getProductBySlug, getAllProducts } from '../../../data/products';
import { generateProductJsonLd, generateBreadcrumbJsonLd, safeJsonLd } from '../../../lib/seo';
import ProductDetails from './ProductDetails';
import BackButton from '../../../components/BackButton';
import ProductReviews from '../../../components/ProductReviews';

// ─── ISR: Static pre-rendering with background revalidation (60s / on-demand)
export const dynamic = 'force-static';
export const revalidate = 60;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ─── Dynamic SEO Metadata ────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: 'منتج غير موجود | قصب' };
  }
  const imageFile = product.image.endsWith('.webp')
    ? product.image
    : product.image.replace('.jpg', '') + '.webp';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasab.eg';
  const canonicalUrl = `${siteUrl}/menu/${product.slug}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${product.title} | قصب — عصير قصب طبيعي مصري`,
    description: product.longDesc.slice(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} — قصب`,
      description: product.desc,
      url: canonicalUrl,
      siteName: 'قصب | Qasab',
      locale: 'ar_EG',
      type: 'website',
      images: [
        {
          url: `/images/${imageFile}`,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} — قصب`,
      description: product.desc,
      images: [`/images/${imageFile}`],
    },
  };
}

// ─── SVG Icons (Zero-overhead Server Components) ─────────────
function ArrowRightIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7-7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

function StarIcon({ size = 14, fill = '#e4b833' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TagIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  );
}

// ─── Product Page (Server Component) ─────────────────────────
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const imageSrc = product.image.endsWith('.webp')
    ? product.image
    : product.image.replace('.jpg', '') + '.webp';

  // Get related products (same category, excluding current)
  const related = getAllProducts()
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  // SEO / AEO / GEO Structured Data (Zero Client-side JS overhead)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasab.eg';
  const productJsonLd = generateProductJsonLd(product, siteUrl);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(product, siteUrl);

  return (
    <main className="product-page">
      {/* Schema.org Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="pd-breadcrumb shell" aria-label="التنقل">
        <Link href="/" className="pd-brand-home" aria-label="الرئيسية">
          <Image
            src="/images/logo.webp"
            alt="قصب"
            width={95}
            height={34}
            style={{ height: '26px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }}
          />
        </Link>
        <span className="pd-breadcrumb-sep">/</span>
        <Link href="/#menu">المنيو</Link>
        <span className="pd-breadcrumb-sep">/</span>
        <span className="pd-breadcrumb-current">{product.title}</span>
      </nav>

      {/* Product Hero */}
      <section className="pd-hero shell">
        <div className="pd-image-wrap">
          <Image
            src={`/images/${imageSrc}`}
            alt={product.title}
            width={600}
            height={400}
            priority
            unoptimized
            className="pd-image"
          />
          {product.isBestSeller && (
            <span className="pd-bestseller-badge">الأكثر مبيعاً</span>
          )}
        </div>

        <div className="pd-info">
          <div className="pd-category-tag">
            <TagIcon size={12} />
            <span>{product.category}</span>
          </div>

          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-rating">
            <div className="pd-stars">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={16} />
              ))}
            </div>
            <span className="pd-rating-text">
              {product.rating} ({product.reviews} تقييم)
            </span>
          </div>

          <p className="pd-long-desc">{product.longDesc}</p>

          <div className="pd-tags">
            {product.tags.map((tag) => (
              <span key={tag} className="pd-tag">{tag}</span>
            ))}
          </div>

          {/* Client Island: Interactive Controls */}
          <ProductDetails product={product} />
        </div>
      </section>

      {/* Nutrition Facts */}
      <section className="pd-nutrition shell">
        <h2 className="pd-section-title">القيمة الغذائية</h2>
        <div className="pd-nutrition-grid">
          {product.nutritionFacts.map((fact) => (
            <div key={fact.label} className="pd-nutrition-card">
              <span className="pd-nutrition-value">{fact.value}</span>
              <span className="pd-nutrition-label">{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews & Experiences */}
      <ProductReviews
        productSlug={product.slug}
        productTitle={product.title}
        initialRating={product.rating}
      />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pd-related shell">
          <h2 className="pd-section-title">منتجات مشابهة</h2>
          <div className="pd-related-grid">
            {related.map((p) => {
              const relImgSrc = p.image.endsWith('.webp')
                ? p.image
                : p.image.replace('.jpg', '') + '.webp';
              return (
                <Link href={`/menu/${p.slug}`} prefetch={true} key={p.slug} className="pd-related-card">
                  <Image
                    src={`/images/${relImgSrc}`}
                    alt={p.title}
                    width={200}
                    height={130}
                    style={{ width: '100%', height: 'auto', aspectRatio: '200 / 130' }}
                    loading="lazy"
                    unoptimized
                    className="pd-related-img"
                  />
                  <div className="pd-related-info">
                    <h3>{p.title}</h3>
                    <strong>{p.priceFormatted}</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Back to Menu */}
      <div className="pd-back-wrap shell">
        <BackButton fallbackHref="/#menu" />
      </div>
    </main>
  );
}
