'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useAuth } from '../context/AuthContext';

function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // browser auto-play policy
  }
}

export default function NotificationCenter() {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const recentPending = data.orders.filter((o) => o.status === 'pending');
        const notifs = recentPending.map((o) => ({
          id: `notif_${o.id}`,
          title: `طلب جديد: ${o.id}`,
          message: `${o.customer?.name} طلب بقيمة ${o.total} ج.م`,
          time: new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          link: '/admin/orders',
          isRead: false,
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.length);
      }
    } catch (e) {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchRecentNotifications();

    // الاشتراك في قنوات Supabase Realtime
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const channel = supabase
        .channel('realtime_orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            playChimeSound();
            fetchRecentNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Fallback: فحص دوري كل 25 ثانية
    const interval = setInterval(fetchRecentNotifications, 25000);
    return () => clearInterval(interval);
  }, [fetchRecentNotifications]);

  if (!isAdmin && !user) return null;

  return (
    <div className="notif-center-wrapper">
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="الإشعارات"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown" dir="rtl">
          <div className="notif-dropdown-header">
            <strong>الإشعارات الفورية</strong>
            <span className="notif-count-label">{unreadCount} جديد</span>
          </div>

          <div className="notif-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">لا توجد إشعارات جديدة حالياً.</div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  className="notif-item"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="notif-item-header">
                    <strong>{n.title}</strong>
                    <small>{n.time}</small>
                  </div>
                  <p>{n.message}</p>
                </Link>
              ))
            )}
          </div>

          {isAdmin && (
            <div className="notif-dropdown-footer">
              <Link href="/admin/orders" onClick={() => setIsOpen(false)}>
                الانتقال للوحة إدارة الطلبات ←
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
