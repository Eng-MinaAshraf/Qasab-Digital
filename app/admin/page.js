'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      const [ordersRes, reportRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/reports?period=all'),
      ]);
      const ordersData = await ordersRes.json();
      const reportData = await reportRes.json();

      if (ordersData.success) setOrders(ordersData.orders || []);
      if (reportData.success) setReport(reportData.summary);
    } catch (e) {
      console.error('Error loading admin overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="admin-loading-screen"><p>جاري تحميل المؤشرات...</p></div>;
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');

  return (
    <div className="admin-page-container">
      {/* Estimated Cost Alert Banner */}
      {report?.isAnyCostEstimated && (
        <div className="admin-cost-alert-banner">
          <div className="admin-alert-content">
            <span className="alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <div>
              <strong>تقارير الأرباح مبنية جزئياً على تكاليف تقديرية مبدئية (50%):</strong>
              <p>
                لتكون أرقام الأرباح دقيقة 100%، يمكنك إدخال تكلفة الخامات الحقيقية لكل منتج من صفحة{' '}
                <Link href="/admin/products">إدارة المنتجات والتكاليف</Link>.
              </p>
            </div>
          </div>
          <Link href="/admin/products" className="btn outline sm">
            تعديل التكاليف الآن
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="kpi-title">إجمالي المبيعات</span>
          <strong className="kpi-value">{report?.grossRevenue || 0} ج.م</strong>
          <span className="kpi-sub">{orders.length} إجمالي الطلبات المسجلة</span>
        </div>

        <div className="admin-kpi-card highlight">
          <span className="kpi-title">إجمالي الربح (Gross Profit)</span>
          <strong className="kpi-value">{report?.grossProfit || 0} ج.م</strong>
          <span className="kpi-sub">
            هامش ربح إجمالي {report?.grossMarginPercent || 0}%
          </span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-title">متوسط قيمة الطلب (AOV)</span>
          <strong className="kpi-value">{report?.aov || 0} ج.م</strong>
          <span className="kpi-sub">لكل طلب ناجح</span>
        </div>

        <div className="admin-kpi-card warning">
          <span className="kpi-title">طلبات تتطلب إجراء فوري</span>
          <strong className="kpi-value">{pendingOrders.length}</strong>
          <span className="kpi-sub">قيد الانتظار للتأكيد والتحضير</span>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="admin-section-header">
        <h2>أحدث الطلبات الواردة</h2>
        <Link href="/admin/orders" className="btn outline sm">
          عرض كل الطلبات ({orders.length})
        </Link>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>الهاتف</th>
              <th>المبلغ</th>
              <th>طريقة الدفع</th>
              <th>الحالة</th>
              <th>تحديث الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 8).map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>{o.id}</strong>
                  <small className="table-date-sub">
                    {new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </td>
                <td>{o.customer?.name}</td>
                <td dir="ltr" style={{ textAlign: 'right' }}>{o.customer?.phone}</td>
                <td><strong>{o.total} ج.م</strong></td>
                <td>
                  <span className={`badge-payment ${o.paymentStatus || 'unpaid'}`}>
                    {o.paymentMethod === 'cod' ? 'نقدًا' : 'أونلاين (Paymob)'}
                    {' '}({o.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'})
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${o.status}`}>
                    {o.status === 'pending' && 'قيد الانتظار'}
                    {o.status === 'confirmed' && 'تم التأكيد'}
                    {o.status === 'preparing' && 'جاري التحضير'}
                    {o.status === 'out_for_delivery' && 'في الطريق'}
                    {o.status === 'delivered' && 'تم التسليم'}
                    {o.status === 'cancelled' && 'ملغي'}
                  </span>
                </td>
                <td>
                  <select
                    className="admin-select-status"
                    value={o.status}
                    disabled={updatingId === o.id}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">تأكيد الطلب</option>
                    <option value="preparing">بدء التحضير</option>
                    <option value="out_for_delivery">انطلاق التوصيل</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">إلغاء الطلب</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
