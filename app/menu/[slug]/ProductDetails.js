'use client';

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';

function ShoppingBagIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

function MinusIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
    </svg>
  );
}

function PlusIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}

export default function ProductDetails({ product }) {
  const { addToCart, toggleCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.name || 'وسط');
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const sizeDiff = product.sizes.find((s) => s.name === selectedSize)?.priceDiff || 0;
  const unitPrice = product.price + sizeDiff;
  const totalPrice = unitPrice * qty;

  const handleAddToCart = () => {
    const imageFile = product.image?.endsWith('.webp')
      ? product.image
      : (product.image?.replace(/\.(jpg|jpeg)$/, '') || 'product-1') + '.webp';

    addToCart(
      {
        id: product.id,
        title: product.title,
        price: unitPrice,
        image: imageFile,
      },
      selectedSize,
      qty
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
    setTimeout(() => toggleCart(true), 500);
  };

  return (
    <div className="product-detail-controls">
      {/* Size Selector */}
      <div className="pd-field">
        <label className="pd-label">اختر الحجم</label>
        <div className="pd-size-selector">
          {product.sizes.map((s) => (
            <button
              key={s.name}
              type="button"
              className={`pd-size-btn ${selectedSize === s.name ? 'active' : ''}`}
              onClick={() => setSelectedSize(s.name)}
            >
              <span>{s.name}</span>
              <small>
                {s.priceDiff === 0
                  ? `${product.price} ج.م`
                  : `${product.price + s.priceDiff} ج.م`}
              </small>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="pd-field">
        <label className="pd-label">الكمية</label>
        <div className="pd-stepper">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="تقليل الكمية"
            className="pd-stepper-btn"
          >
            <MinusIcon size={16} />
          </button>
          <span className="pd-qty">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="زيادة الكمية"
            className="pd-stepper-btn"
          >
            <PlusIcon size={16} />
          </button>
        </div>
      </div>

      {/* Price + Add to Cart */}
      <div className="pd-action-row">
        <div className="pd-price-display">
          <span className="pd-price-label">الإجمالي</span>
          <strong className="pd-price-value">{totalPrice} ج.م</strong>
        </div>
        <button
          type="button"
          className={`btn primary pd-add-btn ${isAdded ? 'btn-added' : ''}`}
          onClick={handleAddToCart}
        >
          {isAdded ? (
            <>
              <CheckIcon size={16} />
              <span>تمت الإضافة</span>
            </>
          ) : (
            <>
              <ShoppingBagIcon size={16} />
              <span>أضف للسلة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
