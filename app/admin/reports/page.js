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

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('all');
  const [fixedExpenses, setFixedExpenses] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (selectedPeriod, expenses) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reports?period=${selectedPeriod}&expenses=${expenses}`
      );
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error('Error fetching financial reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period, fixedExpenses);
  }, [period]);

  const handleExpensesChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setFixedExpenses(val);
    fetchReports(period, val);
  };

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
          <h1>التقارير المالية والأرباح والتنبؤات</h1>
          <p>
            حسابات دقيقة للإيرادات، تكلفة البضاعة المباعة (COGS)، هوامش الربح، وصافي الأرباح
          </p>
        </div>

        {/* Time Filters */}
        <div className="admin-filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${period === 'today' ? 'active' : ''}`}
            onClick={() => setPeriod('today')}
          >
            اليوم
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            آخر 7 أيام
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            هذا الشهر
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${period === 'all' ? 'active' : ''}`}
            onClick={() => setPeriod('all')}
          >
            كافة الفترات
          </button>
        </div>
      </div>

      {/* Warning banner for estimated costs */}
      {summary?.isAnyCostEstimated && (
        <div className="admin-cost-alert-banner">
          <div className="admin-alert-content">
            <span className="alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <div>
              <strong>ملاحظة هامة بخصوص التكلفة والأرباح:</strong>
              <p>
                بعض المنتجات ما زالت محسوبة بـ <strong>تكلفة تقديرية أولية (50% من سعر البيع)</strong>. الأرقام هنا استرشادية حتى يتم إدخال التكلفة الفعلية للأعواد والأكواب في صفحة{' '}
                <Link href="/admin/products">المنتجات والتكاليف</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading-screen"><p>جاري توليد التقرير المالي...</p></div>
      ) : (
        <>
          {/* P&L Financial Highlights Cards */}
          <div className="admin-kpi-grid pnl-grid">
            <div className="admin-kpi-card">
              <span className="kpi-title">إجمالي الإيرادات (Revenue)</span>
              <strong className="kpi-value">{summary?.grossRevenue || 0} ج.م</strong>
              <span className="kpi-sub">
                منها {summary?.productRevenue || 0} ج.م مبيعات منتجات
              </span>
            </div>

            <div className="admin-kpi-card">
              <span className="kpi-title">تكلفة البضاعة المباعة (COGS)</span>
              <strong className="kpi-value" style={{ color: '#dc2626' }}>
                {summary?.cogs || 0} ج.م
              </strong>
              <span className="kpi-sub">مجموع تكاليف الخامات والأكواب للطلبات</span>
            </div>

            <div className="admin-kpi-card highlight">
              <span className="kpi-title">إجمالي الربح (Gross Profit)</span>
              <strong className="kpi-value">{summary?.grossProfit || 0} ج.م</strong>
              <span className="kpi-sub">
                هامش ربح إجمالي {summary?.grossMarginPercent || 0}%
              </span>
            </div>

            <div className="admin-kpi-card net-profit-card">
              <span className="kpi-title">صافي الربح الفعلي (Net Profit)</span>
              <strong className="kpi-value">{summary?.netProfit || 0} ج.م</strong>
              <span className="kpi-sub">بعد خصم المصاريف التشغيلية الثابتة</span>
            </div>
          </div>

          {/* Operating Fixed Expenses Control */}
          <div className="admin-expenses-box">
            <div className="expenses-header">
              <div>
                <h3>المصاريف التشغيلية الثابتة (إيجار، كهرباء، رواتب، صيانة)</h3>
                <p>
                  أدخل المصاريف الثابتة للفترة المحددة لحساب صافي الربح الحقيقي بدقة:
                </p>
              </div>
              <div className="expenses-input-wrap">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={fixedExpenses}
                  onChange={handleExpensesChange}
                  placeholder="0"
                />
                <span>ج.م</span>
              </div>
            </div>
          </div>

          {/* Products Breakdown (Best Sellers vs Most Profitable) */}
          <div className="admin-analytics-grid">
            {/* Best Sellers */}
            <div className="analytics-card">
              <h2>المنتجات الأكثر مبيعاً (بالكمية)</h2>
              <table className="admin-table simple">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية المباعة</th>
                    <th>الإيراد الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.bestSellers || []).slice(0, 5).map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>{p.title}</strong></td>
                      <td><span className="stock-badge">{p.unitsSold} كوب</span></td>
                      <td><strong>{p.revenue} ج.م</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Most Profitable */}
            <div className="analytics-card">
              <h2>المنتجات الأكثر تحقيقاً للأرباح</h2>
              <table className="admin-table simple">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>إجمالي الربح المحقق</th>
                    <th>نسبة المساهمة</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.mostProfitable || []).slice(0, 5).map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>{p.title}</strong></td>
                      <td>
                        <strong style={{ color: '#15803d' }}>
                          {p.profit.toFixed(0)} ج.م
                        </strong>
                      </td>
                      <td>
                        <small>
                          {summary.grossProfit > 0
                            ? ((p.profit / summary.grossProfit) * 100).toFixed(0)
                            : 0}
                          % من أرباح المتجر
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Predictions & Forecasting Card */}
          <div className="admin-prediction-box">
            <div className="prediction-header">
              <div>
                <h2>التنبؤ بالمبيعات للأسبوع القادم (Sales Forecast)</h2>
                <p>
                  نموذج حساب المتوسط المتحرك (Moving Average) لتوقع حجم المبيعات والمخزون المطلوب
                </p>
              </div>
              <span className="confidence-tag">
                دقة التوقع: {summary?.predictions?.confidence}
              </span>
            </div>

            <div className="prediction-content">
              <div className="prediction-metric">
                <span>المبيعات المتوقعة خلال الـ 7 أيام القادمة:</span>
                <strong>{summary?.predictions?.nextWeekRevenue || 0} ج.م</strong>
              </div>
              <p className="prediction-note">
                <strong>توصية المخزون:</strong> بناءً على معدل الطلبات الحالي، يُنصح بتوفير مواد خام وأعواد قصب تكفي لتغطية ما يقارب{' '}
                <strong>
                  {Math.round((summary?.predictions?.nextWeekRevenue || 100) / 25)} كوب
                </strong>{' '}
                لتفادي نفاد المخزون في أوقات الذروة.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
