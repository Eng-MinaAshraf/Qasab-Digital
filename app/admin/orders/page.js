'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

function ArrowRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19 7-7-7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}

const STATUS_LABELS = {
  all: 'الكل',
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التحضير',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // حالة مودال الاسترجاع المالي (Refund Modal)
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundRef, setRefundRef] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
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
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // معالجة تسجيل الاسترجاع المالي للطلبات الملغاة المدفوعة أونلاين
  const handleConfirmRefund = async () => {
    if (!refundModalOrder) return;
    setIsRefunding(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: refundModalOrder.id,
          status: 'cancelled',
          paymentStatus: 'refunded',
          refundReference: refundRef || `REF-${Date.now().toString().slice(-6)}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === refundModalOrder.id
              ? { ...o, status: 'cancelled', paymentStatus: 'refunded' }
              : o
          )
        );
        setRefundModalOrder(null);
        setRefundRef('');
      }
    } catch (e) {
      console.error('Refund error:', e);
    } finally {
      setIsRefunding(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const idMatch = o.id?.toLowerCase().includes(q);
    const nameMatch = o.customer?.name?.toLowerCase().includes(q);
    const phoneMatch = o.customer?.phone?.includes(q);
    return idMatch || nameMatch || phoneMatch;
  });

  if (loading) {
    return <div className="admin-loading-screen"><p>جاري تحميل قائمة الطلبات...</p></div>;
  }

  return (
    <div className="admin-page-container">
      {/* زر العودة للوحة الإدارة */}
      <div className="admin-back-row" style={{ marginBottom: '16px' }}>
        <Link
          href="/admin"
          className="admin-back-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'rgba(13, 75, 46, 0.06)',
            border: '1px solid rgba(13, 75, 46, 0.12)',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowRightIcon size={16} />
          <span>العودة للوحة الإدارة الرئيسية</span>
        </Link>
      </div>

      <div className="admin-page-header">
        <div>
          <h1>إدارة الطلبات ({orders.length})</h1>
          <p>متابعة الطلبات، تحديث الحالات التشغيلية، ومعالجة الدفع والاسترجاع</p>
        </div>

        {/* Search Bar */}
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-filter-tabs">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count =
            key === 'all'
              ? orders.length
              : orders.filter((o) => o.status === key).length;

          return (
            <button
              key={key}
              type="button"
              className={`filter-tab-btn ${filterStatus === key ? 'active' : ''}`}
              onClick={() => setFilterStatus(key)}
            >
              <span>{label}</span>
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>العناصر</th>
              <th>الإجمالي</th>
              <th>طريقة الدفع</th>
              <th>الحالة الحالية</th>
              <th>تحديث الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  لا توجد طلبات تطابق معايير البحث الحالية.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                    <div className="table-date-sub">
                      {new Date(o.createdAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td>
                    <div><strong>{o.customer?.name}</strong></div>
                    <small dir="ltr">{o.customer?.phone}</small>
                  </td>
                  <td>
                    <span className="items-count-badge">
                      {(o.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} عناصر
                    </span>
                  </td>
                  <td>
                    <strong>{o.total} ج.م</strong>
                    <div className="table-cost-sub">
                      <small>الربح: {(o.grossProfit !== undefined ? o.grossProfit : (o.total - (o.totalCost || 0))).toFixed(0)} ج.م</small>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-payment ${o.paymentStatus || 'unpaid'}`}>
                      {o.paymentMethod === 'cod' ? 'نقدًا عند الاستلام' : 'أونلاين (Paymob)'}
                      <br />
                      <small>
                        {o.paymentStatus === 'paid' && 'تم السداد'}
                        {o.paymentStatus === 'unpaid' && 'غير مسدد'}
                        {o.paymentStatus === 'refunded' && 'تم الاسترجاع'}
                        {o.paymentStatus === 'failed' && 'فشلت العملية'}
                      </small>
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${o.status}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-select-status"
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">تأكيد الطلب</option>
                      <option value="preparing">جاري التحضير</option>
                      <option value="out_for_delivery">في الطريق</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">إلغاء الطلب</option>
                    </select>
                  </td>
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn outline sm"
                        onClick={() => setSelectedOrder(o)}
                      >
                        تفاصيل
                      </button>

                      {/* زر الاسترجاع المالي إذا كان الطلب مدفوع أونلاين وتم إلغاؤه */}
                      {o.paymentMethod !== 'cod' && o.paymentStatus === 'paid' && (
                        <button
                          type="button"
                          className="btn text sm refund-btn"
                          title="استرجاع المبلغ للعميل عبر Paymob"
                          onClick={() => setRefundModalOrder(o)}
                        >
                          ↩️ استرجاع
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>تفاصيل الطلب: {selectedOrder.id}</h2>
              <button
                type="button"
                className="btn text"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="detail-section">
                <h3>بيانات العميل والتوصيل</h3>
                <p><strong>الاسم:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>الهاتف:</strong> {selectedOrder.customer?.phone}</p>
                <p><strong>العنوان:</strong> {selectedOrder.customer?.address}</p>
                {selectedOrder.customer?.notes && (
                  <p><strong>ملاحظات العميل:</strong> {selectedOrder.customer?.notes}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>عناصر الطلب والتكلفة التاريخية</h3>
                <div className="detail-items-list">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="detail-item-row">
                      <span>{it.title} ({it.size}) × {it.quantity}</span>
                      <span>{it.unitPrice * it.quantity} ج.م</span>
                      <small className="cost-tag">التكلفة التاريخية: {(it.unitCost || 10) * it.quantity} ج.م</small>
                    </div>
                  ))}
                </div>
                <div className="detail-totals">
                  <div><span>المجموع الفرعي:</span> <strong>{selectedOrder.subtotal} ج.م</strong></div>
                  <div><span>رسوم التوصيل:</span> <strong>{selectedOrder.deliveryFee || 15} ج.م</strong></div>
                  <div><span>الإجمالي:</span> <strong>{selectedOrder.total} ج.م</strong></div>
                  <div className="profit-highlight">
                    <span>إجمالي الربح المقدر لهذا الطلب:</span>
                    <strong>
                      {(selectedOrder.grossProfit || (selectedOrder.total - (selectedOrder.totalCost || 0))).toFixed(0)} ج.م
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn primary"
                onClick={() => setSelectedOrder(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ↩️ Refund Confirmation Modal (النقطة 4: تدفق الاسترجاع المالي) */}
      {refundModalOrder && (
        <div className="admin-modal-overlay" onClick={() => setRefundModalOrder(null)}>
          <div className="admin-modal-card refund-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>↩️ تسجيل استرجاع مالي للطلب {refundModalOrder.id}</h2>
              <button type="button" className="btn text" onClick={() => setRefundModalOrder(null)}>✕</button>
            </div>

            <div className="admin-modal-body">
              <div className="alert-box info">
                ℹ️ <strong>تعليمات الاسترجاع المالي (Paymob Refund):</strong>
                <ol style={{ marginTop: '8px', paddingRight: '20px' }}>
                  <li>توجه إلى لوحة تحكم Paymob الرسمية وابحث عن المعاملة: <code>{refundModalOrder.paymobTransactionId || 'معاملة الدفع'}</code></li>
                  <li>اضغط على "Refund" لإعادة مبلغ <strong>{refundModalOrder.total} ج.م</strong> إلى بطاقة أو محفظة العميل فورياً.</li>
                  <li>أدخل كود مرجع الاسترجاع في الحقل أدناه لتحديث حالة الدفع في قاعدة بيانات المتجر إلى <code>refunded</code>.</li>
                </ol>
              </div>

              <div className="login-field">
                <label>كود مرجع الاسترجاع (Refund Reference Code):</label>
                <input
                  type="text"
                  placeholder="مثال: REF-PAYMOB-88219"
                  value={refundRef}
                  onChange={(e) => setRefundRef(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn primary"
                onClick={handleConfirmRefund}
                disabled={isRefunding}
              >
                {isRefunding ? 'جاري الحفظ...' : 'تأكيد تسجيل الاسترجاع وإلغاء الطلب'}
              </button>
              <button
                type="button"
                className="btn outline"
                onClick={() => setRefundModalOrder(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
