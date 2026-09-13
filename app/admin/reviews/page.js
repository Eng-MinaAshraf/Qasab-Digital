'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProducts } from '../../../data/products.js';

function ArrowRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19 7-7-7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllReviews = async () => {
    try {
      const products = getAllProducts();
      const reviewPromises = products.map((p) =>
        fetch(`/api/reviews?productSlug=${p.slug}`).then((r) => r.json())
      );
      const results = await Promise.all(reviewPromises);

      const all = [];
      results.forEach((res) => {
        if (res.success && Array.isArray(res.reviews)) {
          res.reviews.forEach((r) => {
            all.push({ ...r, productSlug: res.productSlug });
          });
        }
      });

      // رتّب بالأحدث
      all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setReviews(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  if (loading) {
    return <div className="admin-loading-screen"><p>جاري تحميل المراجعات والتقييمات...</p></div>;
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
          <h1>إدارة ومراجعة تقييمات العملاء ({reviews.length})</h1>
          <p>مراجعة آراء العملاء وتتبع جودة المنتجات والتجربة في كافة الفروع</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العميل</th>
              <th>المنتج</th>
              <th>التقييم</th>
              <th>الحجم</th>
              <th>التعليق</th>
              <th>التاريخ</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, idx) => (
              <tr key={r.id || idx}>
                <td><strong>{r.name}</strong></td>
                <td><span className="stock-badge">{r.productSlug}</span></td>
                <td>
                  <span style={{ color: '#eab308' }}>
                    {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                  </span>{' '}
                  ({r.rating || 5})
                </td>
                <td>{r.size || 'وسط'}</td>
                <td style={{ maxWidth: '300px' }}>{r.comment}</td>
                <td>
                  <small className="table-date-sub">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : 'مؤخراً'}
                  </small>
                </td>
                <td>
                  <span className="status-pill delivered">معتمد</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
