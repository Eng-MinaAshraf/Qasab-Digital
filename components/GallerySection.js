'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ImageModal from './ImageModal';
import { Camera, Maximize2 } from 'lucide-react';

export default function GallerySection({ gallery }) {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(null);

  return (
    <section id="gallery" className="section shell">
      <div className="section-head">
        <h2>
          <Camera size={21} color="#0d4b2e" />
          لحظات من القصب
        </h2>
        <span className="section-head-link" style={{ cursor: 'default' }}>
          اضغط على أي صورة لتكبيرها
        </span>
      </div>
      <div className="gallery">
        {gallery.map((src, i) => {
          const webpSrc = src.replace('.jpg', '.webp');
          return (
            <div
              key={src}
              className="gallery-item"
              onClick={() => setActiveGalleryIndex(i)}
              role="button"
              tabIndex={0}
              aria-label={`عرض الصورة رقم ${i + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveGalleryIndex(i);
                }
              }}
            >
              <Image
                src={'/images/' + webpSrc}
                alt={'لحظة من القصب رقم ' + (i + 1)}
                width={180}
                height={150}
                loading="lazy"
                unoptimized
              />
              <div className="gallery-item-overlay">
                <Maximize2 size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <ImageModal
        images={gallery}
        activeIndex={activeGalleryIndex}
        onClose={() => setActiveGalleryIndex(null)}
        onNavigate={(newIdx) => setActiveGalleryIndex(newIdx)}
      />
    </section>
  );
}
