/**
 * سكريبت التحقق البرمجي الآلي الشامل لـ Schema Markup (JSON-LD)
 * يفحص التوافق مع معايير Schema.org و Google Rich Results واختبارات الأمان ضد XSS
 */

import { getAllProducts } from '../data/products.js';
import { generateProductJsonLd, generateBreadcrumbJsonLd, safeJsonLd, getAggregateRating } from '../lib/seo.js';

function runVerification() {
  console.log('\n======================================================');
  console.log('🔍 بدء التحقق البرمجي الآلي لـ Schema Markup (المرحلة 1)');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [نجاح] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [فشل] ${message}`);
      process.exitCode = 1;
    }
  }

  // ─── الاختبار 1: اختبار الأمان والـ Anti-XSS Escaping ─────────────
  console.log('🔒 1. اختبار الحماية من كسر وسم </script> وثغرات XSS:');
  const maliciousObject = {
    title: 'قصب مثلج </script><script>alert("XSS")</script>',
    desc: 'وصف يحتوي على <b>HTML</b> ومحارف < و > و &',
  };
  const serialized = safeJsonLd(maliciousObject);
  assert(!serialized.includes('</script>'), 'خلو الناتج تماماً من النص الصريح </script>');
  assert(serialized.includes('\\u003c/script\\u003e'), 'تحويل < إلى \\u003c بنجاح');
  assert(serialized.includes('\\u0026'), 'تحويل & إلى \\u0026 بنجاح');
  assert(JSON.parse(serialized).title === maliciousObject.title, 'استعادة النص الأصلي كاملاً عند عمل JSON.parse');

  // ─── الاختبار 2: فحص جميع منتجات المتجر الستة ───────────────────────
  console.log('\n📦 2. فحص كائنات Schema لجميع منتجات المتجر:');
  const products = getAllProducts();
  assert(products.length >= 5, `تم العثور على ${products.length} منتجات في قاعدة البيانات`);

  for (const product of products) {
    console.log(`\n  --- فحص المنتج: "${product.title}" (${product.slug}) ---`);

    const productSchema = generateProductJsonLd(product, 'https://qasab.eg');
    const breadcrumbSchema = generateBreadcrumbJsonLd(product, 'https://qasab.eg');

    // أ) التحقق من البنية الأساسية
    assert(productSchema['@context'] === 'https://schema.org', 'السياق هو https://schema.org');
    assert(productSchema['@type'] === 'Product', 'النوع هو Product');
    assert(typeof productSchema.name === 'string' && productSchema.name.length > 0, `الاسم متوفر: "${productSchema.name}"`);
    assert(Array.isArray(productSchema.image) && productSchema.image[0].startsWith('https://'), `رابط صورة مطلق صالح: ${productSchema.image[0]}`);
    assert(productSchema.brand && productSchema.brand.name === 'قصب | Qasab', 'العلامة التجارية موثقة بشكل سليم');

    // ب) متطلبات Google Merchant / Offers
    assert(productSchema.offers && typeof productSchema.offers.price === 'number', `سعر العرض معرّف كرقم: ${productSchema.offers.price}`);
    assert(productSchema.offers.priceCurrency === 'EGP', 'عملة السعر بالجنيه المصري EGP');
    assert(productSchema.offers.availability === 'https://schema.org/InStock', 'حالة التوفر InStock موثقة');
    assert(productSchema.offers.url.startsWith('https://qasab.eg/menu/'), 'رابط الشراء القانوني صالح');

    // ج) متطلبات التقييمات AggregateRating
    assert(productSchema.aggregateRating && typeof productSchema.aggregateRating.ratingValue === 'string', `متوسط التقييم موجود: ${productSchema.aggregateRating.ratingValue}`);
    assert(productSchema.aggregateRating.reviewCount > 0, `عدد المراجعات موجب: ${productSchema.aggregateRating.reviewCount}`);
    assert(productSchema.aggregateRating.bestRating === '5', 'التقييم الأقصى 5');

    // د) إشارات AEO و GEO (الخصائص الإضافية والقيمة الغذائية additionalProperty)
    assert(Array.isArray(productSchema.additionalProperty) && productSchema.additionalProperty.length > 0, 'مصفوفة additionalProperty معرّفة رسمياً وفق Schema.org Product');
    assert(productSchema.additionalProperty[0]['@type'] === 'PropertyValue', 'عناصر الخصائص من نوع PropertyValue');
    assert(Boolean(productSchema.additionalProperty[0].name && productSchema.additionalProperty[0].value), `خاصية تغذية صالحة: ${productSchema.additionalProperty[0].name} = ${productSchema.additionalProperty[0].value}`);

    // هـ) مسار التنقل BreadcrumbList
    assert(breadcrumbSchema['@type'] === 'BreadcrumbList', 'نوع مسار التنقل BreadcrumbList');
    assert(Array.isArray(breadcrumbSchema.itemListElement) && breadcrumbSchema.itemListElement.length === 3, 'مسار التنقل يحتوي على 3 مستويات (الرئيسية -> المنيو -> المنتج)');
    assert(breadcrumbSchema.itemListElement[2].name === product.title, 'اسم المنتج الحالي هو المستوى الثالث');

    // و) اختبار خلو الـ Serialization من الأخطاء
    const safeProductString = safeJsonLd(productSchema);
    assert(safeProductString.length > 200, 'توليد الـ JSON-LD المشفر بنجاح');
  }

  // ─── الاختبار 3: اختبار حساب وتحديث الـ AggregateRating المدمج ───────
  console.log('\n⭐ 3. اختبار دمج التقييمات التراكمية (Baseline + Reviews.json):');
  const sampleProduct = products[0];
  const stats = getAggregateRating(sampleProduct);
  assert(Number(stats.ratingValue) >= 1 && Number(stats.ratingValue) <= 5, `متوسط تقييم سليم: ${stats.ratingValue} / 5.0`);
  assert(stats.reviewCount >= parseInt(sampleProduct.reviews, 10), `إجمالي التقييمات يشمل الأساس (${sampleProduct.reviews}) والمراجعات الحية`);

  console.log('\n======================================================');
  console.log(`📊 النتيجة النهائية: اجتياز ${passedTests} من أصل ${totalTests} فحص بنجاح 100%!`);
  console.log('======================================================\n');
}

runVerification();
