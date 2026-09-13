'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function Toast() {
  const { toast } = useCart();

  if (!toast.show) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast-pill">
        <div className="toast-icon">
          <CheckCircle2 size={18} />
        </div>
        <span className="toast-message">{toast.message}</span>
        <Sparkles size={14} className="toast-sparkle" />
      </div>
    </div>
  );
}
