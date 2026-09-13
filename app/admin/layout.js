'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Package, GlassWater, DollarSign, Star, ShieldCheck, Globe } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login?redirect=/admin&error=admin_required');
    }
  }, [loading, isAdmin, router]);

  // فحص الطلبات الجديدة للتنبيهات
  useEffect(() => {
    async function checkPendingOrders() {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const pending = data.orders.filter((o) => o.status === 'pending').length;
          setNewOrdersCount(pending);
        }
      } catch (e) {
        // silent
      }
    }
    checkPendingOrders();
    const interval = setInterval(checkPendingOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !isAdmin) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>جاري التحقق من صلاحيات المدير...</p>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'نظرة عامة', Icon: BarChart3, exact: true },
    { href: '/admin/orders', label: 'إدارة الطلبات', Icon: Package, badge: newOrdersCount > 0 ? newOrdersCount : null },
    { href: '/admin/products', label: 'المنتجات والتكاليف', Icon: GlassWater },
    { href: '/admin/reports', label: 'التقارير المالية والأرباح', Icon: DollarSign },
    { href: '/admin/reviews', label: 'إدارة المراجعات', Icon: Star },
  ];

  return (
    <div className="admin-wrapper" dir="rtl">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/admin">
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', letterSpacing: '-0.5px' }}>قصب</span>
          </Link>
          <span className="admin-sub-tag">لوحة التحكم المركزية</span>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const IconComp = item.Icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">
                  <IconComp size={18} />
                </span>
                <span className="admin-nav-label">{item.label}</span>
                {item.badge && <span className="admin-badge-pulse">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info-row">
            <span className="admin-avatar">
              <ShieldCheck size={18} />
            </span>
            <div className="admin-user-details">
              <strong>{profile?.full_name || 'مدير قصب'}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <div className="admin-footer-links">
            <Link href="/" className="admin-btn-link" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Globe size={14} />
              <span>واجهة المتجر</span>
            </Link>
            <button onClick={signOut} className="admin-btn-logout">
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>لوحة التحكم</span>
            <span> / </span>
            <span className="current">
              {navItems.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label || 'الإدارة'}
            </span>
          </div>

          <div className="admin-topbar-actions">
            {newOrdersCount > 0 && (
              <Link href="/admin/orders" className="admin-alert-banner">
                <span className="pulse-dot" />
                <span>يوجد {newOrdersCount} طلبات جديدة قيد الانتظار!</span>
              </Link>
            )}
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
