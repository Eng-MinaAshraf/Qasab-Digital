'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';

export default function ProductCard({ item }) {
  const imageSrc = item.image.endsWith('.webp')
    ? item.image
    : item.image.replace(/\.(jpg|jpeg)$/, '') + '.webp';

  return (
    <article className="product-card">
      <Link
        href={`/menu/${item.slug}`}
        prefetch={true}
        className="product-card-link"
        title="اضغط لعرض تفاصيل وحجم المشروب"
      >
        <div className="product-img-wrap">
          <Image
            src={'/images/' + imageSrc}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, 240px"
            style={{ objectFit: 'cover' }}
            loading="lazy"
            unoptimized
          />
        </div>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <div className="product-card-bottom">
          <strong>{item.priceFormatted || item.price}</strong>
        </div>
      </Link>
      <AddToCartButton item={item} label="أضف للسلة" size="وسط" iconSize={13} />
    </article>
  );
}
