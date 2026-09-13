'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const prevUserRef = useRef(null);
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', icon: null });
  const [favorites, setFavorites] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  const openProductModal = useCallback((product) => {
    setActiveProductModal(product);
  }, []);

  const closeProductModal = useCallback(() => {
    setActiveProductModal(null);
  }, []);

  // تحميل السلة من localStorage مع معالجة آمنة للأخطاء
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem('qasab_cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
        const savedFavs = localStorage.getItem('qasab_favs');
        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }
      } catch (e) {
        console.warn('Could not read from localStorage:', e);
      }
      setIsHydrated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // حفظ السلة باستمرار في localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('qasab_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }, [items, isHydrated]);

  // حفظ المفضلة في localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('qasab_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favs to localStorage:', e);
    }
  }, [favorites, isHydrated]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3200);
  }, []);

  /**
   * 🛒 دمج سلة الضيف مع حساب المستخدم عند تسجيل الدخول (Guest Cart Merge)
   * يضمن الحفاظ التام على عناصر السلة الحالية للزائر ودمج أي عناصر سابقة لحسابه
   */
  const mergeGuestCart = useCallback((accountCartItems = null) => {
    const targetAccountItems = accountCartItems || (user?.user_metadata?.cart) || [];

    setItems((currentItems) => {
      if (!Array.isArray(targetAccountItems) || targetAccountItems.length === 0) {
        // لا توجد عناصر سابقة بالحساب: يتم حفظ سلة الضيف الحالية في الحساب دون أي مسح
        if (user) {
          const supabase = getSupabaseBrowserClient();
          if (supabase) {
            supabase.auth.updateUser({ data: { cart: currentItems } }).catch(() => {});
          }
        }
        return currentItems;
      }

      const mergedMap = new Map();

      // 1. إضافة عناصر سلة الضيف الحالية أولاً (لها الأولوية ولا تُمسح أبداً)
      for (const item of currentItems) {
        mergedMap.set(item.key, { ...item });
      }

      // 2. دمج عناصر حساب المستخدم السابق وتجميع الكميات لنفس المنتج والمقاس
      for (const accItem of targetAccountItems) {
        const key = accItem.key || `${accItem.title}_${accItem.size || 'وسط'}`;
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key);
          mergedMap.set(key, {
            ...existing,
            quantity: existing.quantity + (accItem.quantity || 1),
          });
        } else {
          mergedMap.set(key, { ...accItem, key });
        }
      }

      const finalItems = Array.from(mergedMap.values());
      try {
        localStorage.setItem('qasab_cart', JSON.stringify(finalItems));
      } catch (e) {
        console.warn('Could not save merged cart:', e);
      }

      // مزامنة السلة المدمجة مع حساب المستخدم في Supabase
      if (user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          supabase.auth.updateUser({ data: { cart: finalItems } }).catch(() => {});
        }
      }

      return finalItems;
    });

    showToast('تم مزامنة ودمج سلتك مع حسابك بنجاح');
  }, [user, showToast]);

  // رصد تسجيل الدخول ودمج سلة الضيف تلقائياً دون أي فقدان للبيانات
  useEffect(() => {
    if (!isHydrated) return;

    if (!prevUserRef.current && user) {
      const accountCart = user.user_metadata?.cart;
      if (Array.isArray(accountCart) && accountCart.length > 0) {
        mergeGuestCart(accountCart);
      } else if (items.length > 0) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          supabase.auth.updateUser({ data: { cart: items } }).catch(() => {});
        }
      }
    }
    prevUserRef.current = user;
  }, [user, isHydrated, mergeGuestCart, items]);

  const addToCart = useCallback((product, size = 'وسط', customQuantity = 1) => {
    let numericPrice = 25;
    if (typeof product.price === 'number') {
      numericPrice = product.price;
    } else if (typeof product.price === 'string') {
      const match = product.price.match(/\d+/);
      if (match) numericPrice = parseInt(match[0], 10);
    }

    if (size === 'كبير') numericPrice += 5;
    if (size === 'صغير') numericPrice = Math.max(15, numericPrice - 5);

    const itemKey = `${product.title}_${size}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.key === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.key === itemKey ? { ...i, quantity: i.quantity + customQuantity } : i
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          id: product.id || product.title,
          title: product.title,
          image: product.image,
          price: numericPrice,
          priceFormatted: `${numericPrice} ج.م`,
          size,
          quantity: customQuantity,
        },
      ];
    });

    showToast(`تمت إضافة "${product.title}" (${size}) إلى سلتك بنجاح`);
  }, [showToast]);

  const updateQuantity = useCallback((key, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
    showToast('تم حذف المنتج من السلة.');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const next = { ...prev, [productId]: !prev[productId] };
      showToast(next[productId] ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
      return next;
    });
  }, [showToast]);

  const toggleCart = useCallback((open) => {
    setIsCartOpen((prev) => (typeof open === 'boolean' ? open : !prev));
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const contextValue = useMemo(() => ({
    items,
    totalCount,
    subtotal,
    isCartOpen,
    activeProductModal,
    toast,
    favorites,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart,
    mergeGuestCart,
    openProductModal,
    closeProductModal,
    toggleFavorite,
    showToast,
  }), [
    items,
    totalCount,
    subtotal,
    isCartOpen,
    activeProductModal,
    toast,
    favorites,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart,
    mergeGuestCart,
    openProductModal,
    closeProductModal,
    toggleFavorite,
    showToast,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
