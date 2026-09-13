'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { Plus, Minus, MapPin } from 'lucide-react';

export default function QuickOrder() {
  const { addToCart, toggleCart } = useCart();
  const [size, setSize] = useState('وسط');
  const [qty, setQty] = useState(1);
  const [isDriving, setIsDriving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const basePrices = {
    'قصب كلاسيك': 20,
  };

  const sizeMultiplier = {
    صغير: -5,
    وسط: 0,
    كبير: 5,
  };

  const unitPrice = (basePrices['قصب كلاسيك'] || 20) + (sizeMultiplier[size] || 0);

  const handleOrderClick = () => {
    if (isDriving) return;

    setIsDriving(true);

    // After motorcycle accelerates across with cane juice steam:
    setTimeout(() => {
      addToCart(
        {
          title: 'قصب كلاسيك',
          price: unitPrice,
          image: 'product-1.jpg',
        },
        size,
        qty
      );
      setShowSuccess(true);
    }, 600);

    // Open shopping cart drawer smoothly
    setTimeout(() => {
      toggleCart(true);
    }, 850);

    // Reset button state
    setTimeout(() => {
      setIsDriving(false);
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="order-banner-card">
      {/* Right side: Transparent Delivery Hero Image */}
      <div className="order-banner-img-wrap">
        <Image
          src="/images/order-hero-transparent.webp"
          alt="توصيل لحد باب بيتك"
          width={280}
          height={240}
          priority
          unoptimized
          className="order-banner-hero-img"
        />
      </div>

      {/* Middle/Left side: Heading & Controls */}
      <div className="order-banner-content">
        {/* Header with Title on Right, and Logo Sugarcane Cup on the Left opposite to it */}
        <div className="order-banner-header">
          <div className="order-banner-header-text">
            <h3>اطلب قصبك</h3>
            <p>من بيتك لحد باب بيتك</p>
          </div>
          <div className="order-header-cup" title="قصب طبيعي فريش">
            <Image
              src="/images/logo-juice-glass.svg"
              alt="كوب عصير قصب مثلج"
              width={48}
              height={48}
              unoptimized
              className="order-header-cup-img"
            />
          </div>
        </div>

        {/* 3 Pills Row */}
        <div className="order-banner-pills-row">
          {/* 1. Location pill */}
          <div className="order-pill-card location-card">
            <div className="pill-top">
              <span className="pill-label">فروعنا</span>
              <MapPin size={13} className="pill-icon" />
            </div>
            <div className="pill-val">القاهرة - مصر</div>
          </div>

          {/* 2. Size Card (Cup removed, clean title and options only) */}
          <div className="order-pill-card size-card matched-card">
            <div className="pill-top size-pill-top">
              <span className="pill-label size-heading-label">الحجم</span>
            </div>

            {/* Size selector: كبير / وسط / صغير */}
            <div className="pill-size-options-sketch">
              {['كبير', 'وسط', 'صغير'].map((s, idx) => (
                <React.Fragment key={s}>
                  <button
                    type="button"
                    className={`pill-size-sketch-btn ${size === s ? 'active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                  {idx < 2 && <span className="pill-slash-sketch">/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 3. Quantity stepper pill */}
          <div className="order-pill-card qty-card">
            <div className="pill-top">
              <span className="pill-label">الكمية</span>
            </div>
            <div className="pill-stepper">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="pill-step-btn"
                aria-label="تقليل الكمية"
              >
                <Minus size={11} />
              </button>
              <span className="pill-qty-val">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="pill-step-btn"
                aria-label="زيادة الكمية"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Order CTA Button placed OUTSIDE the size card, centered directly underneath */}
        <div className="order-sketch-btn-wrap">
          <button
            type="button"
            className={`order-scooter-btn ${isDriving ? 'is-driving' : ''} ${
              isHovered && !isDriving ? 'is-hovered' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOrderClick}
            disabled={isDriving}
            aria-label="اطلب الآن مع توصيل سريع"
          >
            {/* 1. Motorcycle Courier is on the LEFT */}
            <div className="scooter-track">
              <div className="scooter-mover">
                <Image
                  src="/images/delivery-courier.png"
                  alt="سائق توصيل قصب"
                  width={44}
                  height={52}
                  unoptimized
                  priority
                  className="scooter-courier-img"
                />

                {/* Sugarcane Juice Steam / Exhaust Bubbles (Behind scooter on the left) */}
                <div className={`cane-juice-steam ${isDriving ? 'active' : ''}`}>
                  <span className="juice-puff puff-1" />
                  <span className="juice-puff puff-2" />
                  <span className="juice-puff puff-3" />
                  <span className="juice-drop drop-1" />
                  <span className="juice-drop drop-2" />
                  <span className="juice-drop drop-3" />
                  <span className="juice-drop drop-4" />
                  <span className="juice-splash-ring" />
                </div>
              </div>
            </div>

            {/* 2. Text: "اطلب الآن" on the RIGHT */}
            <span className="scooter-btn-text">
              {showSuccess ? 'تمت الإضافة!' : 'اطلب الآن'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
