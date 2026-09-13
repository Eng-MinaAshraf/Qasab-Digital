'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import AddToCartButton from './AddToCartButton';
import { useCart } from '../context/CartContext';

function StarIcon({ size = 14, fill = '#7a6000' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function BestCard({ item }) {
  const imageSrc = item.image.endsWith('.webp')
    ? item.image
    : item.image.replace(/\.(jpg|jpeg)$/, '') + '.webp';

  return (
    <article className="best-card">
      <FavoriteButton id={item.id} title={item.title} />
      <Link
        href={`/menu/${item.slug}`}
        prefetch={true}
        className="best-card-link"
        title="اضغط لمعاينة التفاصيل والأحجام"
      >
        <div className="best-card-img-wrap">
          <Image
            src={'/images/' + imageSrc}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, 200px"
            style={{ objectFit: 'cover' }}
            loading="lazy"
            unoptimized
          />
        </div>
        <div className="best-copy">
          <h3>{item.title}</h3>
          <div className="best-copy-bottom">
            <strong>{item.priceFormatted || item.price}</strong>
            <div className="stars" aria-label={`تقييم ${item.rating} من 5 نجوم`}>
              <StarIcon size={11} />
              <span>{item.rating}</span>
              <small>({item.reviews})</small>
            </div>
          </div>
        </div>
      </Link>
      <div className="best-card-action">
        <AddToCartButton
          item={item}
          label="طلب سريع"
          size="وسط"
          iconSize={12}
          style={{ marginTop: '8px', width: '100%' }}
        />
      </div>
    </article>
  );
}
