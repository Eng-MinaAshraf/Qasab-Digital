'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function ArrowRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19 7-7-7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (p) => {
    setEditingProduct({
      id: p.id,
      title: p.title,
      price: p.price,
      cost: p.cost,
      stockQuantity: p.stockQuantity || 100,
      isAvailable: p.isAvailable !== false,
      isCostEstimated: p.isCostEstimated,
    });
    setSaveMessage('');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          updates: {
            price: Number(editingProduct.price),
            cost: Number(editingProduct.cost),
            stockQuantity: Number(editingProduct.stockQuantity),
            isAvailable: Boolean(editingProduct.isAvailable),
            isCostEstimated: false, // تم تعديلها واعتمادها يدوياً من الأدمن!
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setSaveMessage('تم حفظ تعديلات المنتج بنجاح وتحديث حسابات الربح.');
        setTimeout(() => {
          setEditingProduct(null);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setSaveMessage('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading-screen"><p>جاري تحميل قائمة المنتجات والتكاليف...</p></div>;
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
          <h1>إدارة المنتجات والتكاليف والمخزون</h1>
          <p>
            تعديل أسعار البيع وتكلفة كل منتج لحظياً وتحديث المخزون دون الحاجة لتعديل الكود
          </p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الفئة</th>
              <th>سعر البيع</th>
              <th>تكلفة الوحدة (Cost)</th>
              <th>هامش الربح</th>
              <th>المخزون المتوفر</th>
              <th>حالة التوفر</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.price - (p.cost || 0);
              const marginPercent = p.price > 0 ? ((margin / p.price) * 100).toFixed(0) : 0;

              return (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <Image
                        src={`/images/${p.image || 'product-1.webp'}`}
                        alt={p.title}
                        width={44}
                        height={44}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                        unoptimized
                      />
                      <div>
                        <strong>{p.title}</strong>
                        <small className="table-date-sub">{p.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>{p.category || 'عصائر'}</td>
                  <td><strong>{p.price} ج.م</strong></td>
                  <td>
                    <strong>{p.cost} ج.م</strong>
                    {p.isCostEstimated ? (
                      <span className="cost-badge estimated" title="تكلفة تقديرية أولية (50%)">
                        تقديرية (50%)
                      </span>
                    ) : (
                      <span className="cost-badge verified" title="تم اعتماد التكلفة الفعلية">
                        معتمدة
                      </span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#15803d' }}>{margin.toFixed(1)} ج.م</strong>
                    <small className="table-cost-sub">({marginPercent}%)</small>
                  </td>
                  <td>
                    <span className={`stock-badge ${p.stockQuantity < 10 ? 'low' : ''}`}>
                      {p.stockQuantity} قطعة
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${p.isAvailable ? 'delivered' : 'cancelled'}`}>
                      {p.isAvailable ? 'متاح للطلب' : 'غير متوفر'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn primary sm"
                      onClick={() => handleEditClick(p)}
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>تعديل بيانات: {editingProduct.title}</h2>
              <button
                type="button"
                className="btn text"
                onClick={() => setEditingProduct(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-body">
              {saveMessage && <div className="alert-box info">{saveMessage}</div>}

              <div className="login-field">
                <label>سعر البيع للجمهور (ج.م)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="login-field">
                <label>
                  تكلفة الوحدة الفعلية (ج.م) — سعر القصب والخامات والأكواب:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editingProduct.cost}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, cost: e.target.value }))
                  }
                  required
                />
                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                  هامش الربح المتوقع:{' '}
                  <strong>
                    {(
                      Number(editingProduct.price) - Number(editingProduct.cost)
                    ).toFixed(1)}{' '}
                    ج.م
                  </strong>{' '}
                  (
                  {editingProduct.price > 0
                    ? (
                        ((Number(editingProduct.price) - Number(editingProduct.cost)) /
                          Number(editingProduct.price)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </small>
              </div>

              <div className="login-field">
                <label>الكمية المتوفرة بالمخزون</label>
                <input
                  type="number"
                  value={editingProduct.stockQuantity}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      stockQuantity: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="login-field checkbox-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        isAvailable: e.target.checked,
                      }))
                    }
                  />
                  <span>المنتج متاح للطلب في المنيو (Available in Menu)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="submit"
                  className="btn primary"
                  disabled={saving}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
                <button
                  type="button"
                  className="btn outline"
                  onClick={() => setEditingProduct(null)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
