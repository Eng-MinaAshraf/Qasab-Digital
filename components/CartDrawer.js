'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const drawerRef = useRef(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        toggleCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, toggleCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCheckoutSuccess(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const deliveryFee = subtotal > 0 ? 15 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setCheckoutSuccess(false);
      toggleCart(false);
    }, 2500);
  };

  return (
    <div className="cart-backdrop" onClick={() => toggleCart(false)} role="presentation">
      <div
        className="cart-drawer"
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
      >
        {/* Drawer Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} className="cart-header-icon" />
            <h3>سلة المشتريات</h3>
            <span className="cart-badge-count">{totalCount} منتج</span>
          </div>
          <button
            className="cart-close-btn"
            onClick={() => toggleCart(false)}
            aria-label="إغلاق السلة"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-body">
          {checkoutSuccess ? (
            <div className="cart-success-view">
              <CheckCircle size={54} className="cart-success-icon" />
              <h4>تم تأكيد طلبك بنجاح!</h4>
              <p>طلبك من قصب في طريقه للتحضير بأعلى طزاجة وجودة.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-empty-view">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={48} />
              </div>
              <h4>سلتك لسه فاضية!</h4>
              <p>استمتع بأحلى كوباية قصب فريش طبيعية ومنعشة دلوقتي.</p>
              <button
                className="btn primary"
                onClick={() => {
                  toggleCart(false);
                  const menuEl = document.getElementById('menu');
                  if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                تصفح المنيو الآن
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div className="cart-item-card" key={item.key}>
                  <div className="cart-item-img">
                    <Image
                      src={'/images/' + (item.image ? item.image.replace(/\.jpg(\.webp)?$/, '.webp').replace(/\.webp$/, '') + '.webp' : 'product-1.webp')}
                      alt={item.title}
                      width={64}
                      height={64}
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <span className="cart-item-title">{item.title}</span>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.key)}
                        aria-label={`حذف ${item.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <span className="cart-item-size">الحجم: {item.size}</span>
                    <div className="cart-item-bottom">
                      <div className="cart-item-stepper">
                        <button
                          onClick={() => updateQuantity(item.key, -1)}
                          aria-label="تقليل الكمية"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, 1)}
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <strong className="cart-item-price">
                        {item.price * item.quantity} ج.م
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && !checkoutSuccess && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>المجموع الفرعي</span>
              <span>{subtotal} ج.م</span>
            </div>
            <div className="cart-summary-row">
              <span>رسوم التوصيل السريع</span>
              <span>{deliveryFee} ج.م</span>
            </div>
            <div className="cart-summary-row cart-total-row">
              <span>الإجمالي النهائي</span>
              <strong>{grandTotal} ج.م</strong>
            </div>
            <Link
              href="/checkout"
              className="btn primary cart-checkout-btn"
              onClick={() => toggleCart(false)}
            >
              <span>إتمام الطلب الآن ({grandTotal} ج.م)</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
