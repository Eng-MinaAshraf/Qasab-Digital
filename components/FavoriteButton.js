'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { Heart } from 'lucide-react';

export default function FavoriteButton({ id, title }) {
  const { favorites, toggleFavorite } = useCart();
  const isFav = !!favorites[id];

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <button
      type="button"
      className={`heart-btn ${isFav ? 'active' : ''}`}
      onClick={handleToggle}
      aria-label={isFav ? `إزالة ${title} من المفضلة` : `إضافة ${title} للمفضلة`}
    >
      <Heart size={15} fill={isFav ? '#e53935' : 'none'} color={isFav ? '#e53935' : '#777'} />
    </button>
  );
}
