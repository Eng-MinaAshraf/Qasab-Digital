/**
 * دوال مساعدة لإنشاء وإخراج كائنات البيانات الهيكلية (Structured Data - Schema.org)
 * متوافقة مع متطلبات Google Rich Results وإشارات AEO و GEO.
 */

import { getReviews } from './db.js';

/**
 * تسلسل آمن لكائن JSON-LD يمنع ثغرات XSS وإغلاق وسم </script> داخل صفحات الـ HTML
 * يقوم بترميز المحارف الخاصة إلى Unicode escapes مما يضمن توافق تام مع محركات البحث دون خطر أمني.
 *
 * @param {object} data
 * @returns {string}
 */
export function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * حساب إحصائيات التقييم المجمعة للمنتج (دمج الأساس من الكتالوج مع التقييمات الحية في reviews.json)
 *
 * @param {object} product
 * @returns {{ ratingValue: string, reviewCount: number }}
 */
export function getAggregateRating(product) {
  const baseCount = parseInt(product.reviews || 0, 10);
  const baseRating = parseFloat(product.rating || 5.0);

  try {
    const liveReviews = getReviews(product.slug);
    if (!liveReviews || liveReviews.length === 0) {
      return {
        ratingValue: baseRating.toFixed(1),
        reviewCount: Math.max(1, baseCount),
      };
    }

    const liveTotalScore = liveReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const totalCount = baseCount + liveReviews.length;
    const combinedAvg = (baseRating * baseCount + liveTotalScore) / totalCount;

    return {
      ratingValue: combinedAvg.toFixed(1),
      reviewCount: totalCount,
    };
  } catch {
    return {
      ratingValue: baseRating.toFixed(1),
      reviewCount: Math.max(1, baseCount),
    };
  }
}

/**
 * توليد كائن Schema.org Product متوافق مع Google Merchant Listings و Rich Snippets
 *
 * @param {object} product
 * @param {string} baseUrl
 * @returns {object}
 */
export function generateProductJsonLd(product, baseUrl = 'https://qasab.eg') {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const imageFile = product.image.endsWith('.webp')
    ? product.image
    : product.image.replace(/\.[a-zA-Z]+$/, '') + '.webp';
  const imageUrl = `${cleanBaseUrl}/images/${imageFile}`;
  const productUrl = `${cleanBaseUrl}/menu/${product.slug}`;

  const ratingStats = getAggregateRating(product);

  // استخراج حقائق التغذية كـ additionalProperty متوافقة رسمياً مع مواصفات Schema.org لنوع Product
  const additionalProperties = [];
  if (Array.isArray(product.nutritionFacts)) {
    for (const fact of product.nutritionFacts) {
      additionalProperties.push({
        '@type': 'PropertyValue',
        name: fact.label,
        value: fact.value,
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: product.longDesc || product.desc,
    image: [imageUrl],
    url: productUrl,
    inLanguage: 'ar-EG',
    brand: {
      '@type': 'Brand',
      name: 'قصب | Qasab',
    },
    category: product.category || 'عصائر طبيعية',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: productUrl,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'متجر قصب لعصير القصب الطبيعي',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingStats.ratingValue,
      reviewCount: ratingStats.reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    additionalProperty: additionalProperties.length > 0 ? additionalProperties : undefined,
  };
}

/**
 * توليد كائن Schema.org BreadcrumbList لمسار التنقل
 *
 * @param {object} product
 * @param {string} baseUrl
 * @returns {object}
 */
export function generateBreadcrumbJsonLd(product, baseUrl = 'https://qasab.eg') {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: `${cleanBaseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'قائمة المشروبات',
        item: `${cleanBaseUrl}/#menu`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${cleanBaseUrl}/menu/${product.slug}`,
      },
    ],
  };
}
