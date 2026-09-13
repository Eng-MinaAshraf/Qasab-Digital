'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check } from 'lucide-react';

export default function AddToCartButton({ item, label = 'أضف للسلة', size = 'وسط', iconSize = 13, style = {} }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item, size, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <button
      type="button"
      className={`product-add-btn ${isAdded ? 'btn-added' : ''}`}
      onClick={handleAdd}
      style={style}
      aria-label={`إضافة ${item.title} إلى السلة`}
    >
      {isAdded ? (
        <>
          <Check size={iconSize + 1} />
          <span>تمت الإضافة</span>
        </>
      ) : (
        <>
          <ShoppingBag size={iconSize} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
