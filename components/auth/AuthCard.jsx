'use client';

import React from 'react';

/**
 * بطاقة المصادقة الرخامية الدافئة (Warm Cream Card)
 * تم تصميمها وفقاً للمواصفات المعيارية للهوية:
 * - لون الخلفية: #FCFAF5
 * - انحناء الزوايا: 24px على الشاشات الكبيرة، 20px على الموبايل
 * - إطار وتظليل هادئ فائق الجمال
 */
export default function AuthCard({ children, className = '', title }) {
  return (
    <div className={`qasab-auth-card ${className}`}>
      {title && (
        <div className="qasab-card-header">
          <h2 className="qasab-card-title">{title}</h2>
        </div>
      )}
      <div className="qasab-card-body">
        {children}
      </div>
    </div>
  );
}
