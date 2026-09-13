'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ImageModal({ images, activeIndex, onClose, onNavigate }) {
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        // In RTL, ArrowLeft navigates to next or previous
        onNavigate((activeIndex + 1) % images.length);
      } else if (e.key === 'ArrowRight') {
        onNavigate((activeIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, images.length, onClose, onNavigate]);

  if (activeIndex === null) return null;

  const currentImg = images[activeIndex];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="معرض صور لحظات من القصب"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="إغلاق المعرض">
          <X size={22} />
        </button>

        <button
          className="modal-nav-btn modal-prev"
          onClick={() => onNavigate((activeIndex - 1 + images.length) % images.length)}
          aria-label="الصورة السابقة"
        >
          <ChevronRight size={26} />
        </button>

        <div className="modal-image-wrapper">
          <Image
            src={'/images/' + currentImg}
            alt={`لحظة من القصب رقم ${activeIndex + 1}`}
            width={700}
            height={550}
            className="modal-image"
          />
          <div className="modal-caption">
            <span>لحظات من القصب الطازج • {activeIndex + 1} من {images.length}</span>
          </div>
        </div>

        <button
          className="modal-nav-btn modal-next"
          onClick={() => onNavigate((activeIndex + 1) % images.length)}
          aria-label="الصورة التالية"
        >
          <ChevronLeft size={26} />
        </button>
      </div>
    </div>
  );
}
