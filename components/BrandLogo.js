'use client';
import React from 'react';
import Image from 'next/image';

/**
 * BrandLogo Component — Luxury Egyptian Heritage Edition
 * 
 * Elegant brand presentation with:
 * - Crisp Arabic calligraphy for "قصب"
 * - Multi-layer golden aura glow on hover
 * - Smooth spring physics on hover / active
 * - Scaled smoothly when header shrinks on scroll
 */
export default function BrandLogo({ isWhite = false, className = '', priority = false }) {
  return (
    <div
      className={`brand-logo-premium ${isWhite ? 'is-white-mode' : ''} ${className}`}
      role="img"
      aria-label="شعار قصب — عصير قصب مصري فريش"
    >
      <div className="brand-logo-inner">
        <Image
          src={isWhite ? '/images/logo-text-white.webp' : '/images/logo-text-green.webp'}
          alt="قصب"
          width={1080}
          height={367}
          priority={priority}
          className="brand-logo-premium-img"
        />
      </div>
    </div>
  );
}
