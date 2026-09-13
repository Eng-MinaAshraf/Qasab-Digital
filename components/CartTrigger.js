'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

export default function CartTrigger() {
  const { totalCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      className="header-icon-btn cart-icon-btn"
      onClick={() => toggleCart(true)}
      aria-label={`سلة التسوق، تحتوي على ${totalCount} عناصر`}
    >
      <ShoppingBag size={19} />
      {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
    </button>
  );
}
