import React from 'react';

/**
 * Loading Skeleton for /menu/[slug]
 * 
 * In Next.js App Router, this enables INSTANT (0ms) route navigation!
 * The moment the user clicks on any product card, the browser immediately
 * transitions and displays this luxury skeleton UI instead of freezing
 * on the home page.
 */
export default function ProductLoading() {
  return (
    <main className="product-page pd-loading-state" aria-busy="true" aria-label="جاري تحميل تفاصيل المنتج...">
      {/* Breadcrumb Skeleton */}
      <nav className="pd-breadcrumb shell" aria-hidden="true">
        <div className="skeleton-pill" style={{ width: '80px', height: '24px' }} />
        <span className="pd-breadcrumb-sep">/</span>
        <div className="skeleton-pill" style={{ width: '60px', height: '24px' }} />
        <span className="pd-breadcrumb-sep">/</span>
        <div className="skeleton-pill" style={{ width: '120px', height: '24px' }} />
      </nav>

      {/* Product Hero Skeleton */}
      <section className="pd-hero shell" aria-hidden="true">
        <div className="pd-image-wrap skeleton-box" style={{ minHeight: '380px' }}>
          <div className="skeleton-shimmer" />
        </div>

        <div className="pd-info">
          {/* Category Tag Skeleton */}
          <div className="skeleton-pill" style={{ width: '70px', height: '24px', marginBottom: '12px' }} />

          {/* Title Skeleton */}
          <div className="skeleton-line" style={{ width: '75%', height: '38px', marginBottom: '16px' }} />

          {/* Rating Skeleton */}
          <div className="skeleton-line" style={{ width: '45%', height: '20px', marginBottom: '20px' }} />

          {/* Description Lines Skeleton */}
          <div className="skeleton-line" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
          <div className="skeleton-line" style={{ width: '90%', height: '16px', marginBottom: '8px' }} />
          <div className="skeleton-line" style={{ width: '70%', height: '16px', marginBottom: '24px' }} />

          {/* Tags Skeleton */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            <div className="skeleton-pill" style={{ width: '65px', height: '26px' }} />
            <div className="skeleton-pill" style={{ width: '95px', height: '26px' }} />
            <div className="skeleton-pill" style={{ width: '80px', height: '26px' }} />
          </div>

          {/* Size Selector Skeleton */}
          <div style={{ marginBottom: '24px' }}>
            <div className="skeleton-line" style={{ width: '90px', height: '18px', marginBottom: '10px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="skeleton-box" style={{ width: '90px', height: '64px', borderRadius: '12px' }} />
              <div className="skeleton-box" style={{ width: '90px', height: '64px', borderRadius: '12px' }} />
              <div className="skeleton-box" style={{ width: '90px', height: '64px', borderRadius: '12px' }} />
            </div>
          </div>

          {/* Quantity & CTA Skeleton */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div className="skeleton-box" style={{ width: '120px', height: '48px', borderRadius: '14px' }} />
            <div className="skeleton-box" style={{ flex: 1, height: '48px', borderRadius: '14px' }} />
          </div>
        </div>
      </section>

      {/* Nutrition Skeleton */}
      <section className="pd-nutrition shell" aria-hidden="true" style={{ marginTop: '40px' }}>
        <div className="skeleton-line" style={{ width: '140px', height: '24px', marginBottom: '20px' }} />
        <div className="pd-nutrition-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-box" style={{ height: '80px', borderRadius: '14px' }} />
          ))}
        </div>
      </section>
    </main>
  );
}
