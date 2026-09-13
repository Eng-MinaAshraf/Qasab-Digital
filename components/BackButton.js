'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * BackButton Component
 * 
 * Solves the slowness of returning to the home page by using
 * window.history.back() to instantly restore the previous page state
 * from memory (BFCache) in 0ms without re-compiling app/page.js.
 * 
 * Also provides a vibrant, high-contrast, prestigious Egyptian brand
 * styling so it never looks dull or washed out.
 */
export default function BackButton({ fallbackHref = '/#menu' }) {
  const router = useRouter();

  const handleBack = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="pd-back-luxury-btn"
      aria-label="العودة لقائمة المنيو"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pd-back-icon"
      >
        <path d="m12 19 7-7-7-7" />
        <path d="M19 12H5" />
      </svg>
      <span>العودة للمنيو</span>
    </button>
  );
}
