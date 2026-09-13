/**
 * قاعدة بيانات المنتجات المركزية لمتجر قصب
 * ─────────────────────────────────────────────
 * كل المنتجات مُعرّفة هنا بصيغة واحدة موحدة.
 * الـ slug يدوي ومكتوب بالإنجليزية لأنه يظهر في الـ URL.
 *
 * ⚠️ تحقق التفرد (Uniqueness Assert):
 *    عند الاستيراد، يتم فحص عدم تكرار أي slug تلقائياً —
 *    لو حصل تكرار، generateStaticParams() هتفشل بخطأ واضح.
 */

const allProducts = [
  {
    id: 'p1',
    slug: 'qasab-classic',
    title: 'قصب كلاسيك',
    desc: 'الطعم الأصيل من أجود المحاصيل',
    longDesc: 'عصير قصب طبيعي 100% يُعصر طازجاً من أعواد القصب المصرية الأصلية المزروعة في صعيد مصر. بدون إضافة ماء أو سكر أو مواد حافظة — حلاوة طبيعية ونكهة تراثية أصيلة في كل رشفة.',
    price: 20,
    priceFormatted: '20 ج.م',
    image: 'product-1.webp',
    category: 'عصائر',
    rating: '5.0',
    reviews: 92,
    isBestSeller: true,
    sizes: [
      { name: 'صغير', priceDiff: -5 },
      { name: 'وسط', priceDiff: 0 },
      { name: 'كبير', priceDiff: 5 },
    ],
    nutritionFacts: [
      { label: 'السعرات الحرارية', value: '180 كالوري' },
      { label: 'السكر الطبيعي', value: '40 جرام' },
      { label: 'الحديد', value: '1.2 مجم' },
      { label: 'فيتامين C', value: '15 مجم' },
    ],
    tags: ['طبيعي', 'بدون سكر مضاف', 'طازج يومياً'],
  },
  {
    id: 'p2',
    slug: 'qasab-lemon',
    title: 'قصب بالليمون',
    desc: 'انتعاش الليمون البلدي مع سكر القصب',
    longDesc: 'مزيج منعش من عصير القصب الطازج مع عصير الليمون البلدي الطبيعي. توليفة مصرية أصيلة تجمع بين حلاوة القصب وحموضة الليمون المنعشة — مثالي لأيام الصيف الحارة.',
    price: 25,
    priceFormatted: '25 ج.م',
    image: 'product-2.webp',
    category: 'عصائر',
    rating: '4.9',
    reviews: 54,
    isBestSeller: true,
    sizes: [
      { name: 'صغير', priceDiff: -5 },
      { name: 'وسط', priceDiff: 0 },
      { name: 'كبير', priceDiff: 5 },
    ],
    nutritionFacts: [
      { label: 'السعرات الحرارية', value: '165 كالوري' },
      { label: 'السكر الطبيعي', value: '36 جرام' },
      { label: 'فيتامين C', value: '35 مجم' },
      { label: 'الحديد', value: '1.0 مجم' },
    ],
    tags: ['منعش', 'ليمون بلدي', 'صيفي'],
  },
  {
    id: 'p3',
    slug: 'qasab-mint',
    title: 'قصب بالنعناع',
    desc: 'أوراق نعناع فريش تروي العطش',
    longDesc: 'عصير قصب طازج ممزوج بأوراق النعناع البلدي الطازجة — نكهة مصرية كلاسيكية بانتعاش مضاعف. يُقدم مثلجاً مع أوراق نعناع طازجة فوق الكوب لتجربة بصرية وذوقية مميزة.',
    price: 25,
    priceFormatted: '25 ج.م',
    image: 'product-3.webp',
    category: 'عصائر',
    rating: '5.0',
    reviews: 62,
    isBestSeller: true,
    sizes: [
      { name: 'صغير', priceDiff: -5 },
      { name: 'وسط', priceDiff: 0 },
      { name: 'كبير', priceDiff: 5 },
    ],
    nutritionFacts: [
      { label: 'السعرات الحرارية', value: '170 كالوري' },
      { label: 'السكر الطبيعي', value: '38 جرام' },
      { label: 'فيتامين C', value: '20 مجم' },
      { label: 'المنثول الطبيعي', value: 'موجود' },
    ],
    tags: ['منعش', 'نعناع طبيعي', 'الأكثر طلباً'],
  },
  {
    id: 'p4',
    slug: 'qasab-fresh-concentrate',
    title: 'قصب فريش مركز',
    desc: 'عصرة أولى ثقيلة وغنية بالفيتامينات',
    longDesc: 'العصرة الأولى المركزة من أعواد القصب — أغنى وأثقل في القوام واللون والنكهة. تحتوي على تركيز أعلى من المعادن والفيتامينات الطبيعية. الخيار المفضل لمن يبحث عن الطاقة والتغذية الطبيعية.',
    price: 30,
    priceFormatted: '30 ج.م',
    image: 'product-4.webp',
    category: 'عصائر',
    rating: '4.9',
    reviews: 48,
    isBestSeller: true,
    sizes: [
      { name: 'صغير', priceDiff: -5 },
      { name: 'وسط', priceDiff: 0 },
      { name: 'كبير', priceDiff: 5 },
    ],
    nutritionFacts: [
      { label: 'السعرات الحرارية', value: '220 كالوري' },
      { label: 'السكر الطبيعي', value: '52 جرام' },
      { label: 'الحديد', value: '2.1 مجم' },
      { label: 'فيتامين C', value: '25 مجم' },
    ],
    tags: ['مركز', 'غني بالطاقة', 'العصرة الأولى'],
  },
  {
    id: 'p5',
    slug: 'falafel-sandwich',
    title: 'ساندوتش فلافل',
    desc: 'سناكس سخن وطازة رفيق القصب',
    longDesc: 'ساندوتش فلافل مقرمش بخلطة قصب الخاصة — طعمية مصرية أصلية بالكزبرة والبقدونس والثوم، مقلية لحظة التقديم. يُقدم في عيش بلدي طازج مع سلطة طحينة وخضروات مشكلة.',
    price: 35,
    priceFormatted: '35 ج.م',
    image: 'product-5.webp',
    category: 'سناكس',
    rating: '4.8',
    reviews: 36,
    isBestSeller: true,
    sizes: [
      { name: 'عادي', priceDiff: 0 },
      { name: 'دبل', priceDiff: 10 },
    ],
    nutritionFacts: [
      { label: 'السعرات الحرارية', value: '320 كالوري' },
      { label: 'البروتين', value: '12 جرام' },
      { label: 'الألياف', value: '6 جرام' },
      { label: 'الدهون', value: '15 جرام' },
    ],
    tags: ['سناكس', 'فلافل مصرية', 'مقرمش'],
  },
];

// ─── تحقق التفرد (Uniqueness Assert) ────────────────────────
// يعمل تلقائياً عند الاستيراد — يكشف أي slug مكرر فوراً
const slugSet = new Set();
for (const product of allProducts) {
  if (slugSet.has(product.slug)) {
    throw new Error(
      `[data/products.js] ⚠️ Duplicate slug detected: "${product.slug}" — ` +
      `كل منتج لازم يكون له slug فريد عشان generateStaticParams() تشتغل صح.`
    );
  }
  slugSet.add(product.slug);
}

// ─── Helper Functions ────────────────────────────────────────

/** إرجاع كل المنتجات */
export function getAllProducts() {
  return allProducts;
}

/** البحث عن منتج بالـ slug — يُرجع null لو مش موجود */
export function getProductBySlug(slug) {
  return allProducts.find((p) => p.slug === slug) || null;
}

/** إرجاع المنتجات حسب الفئة */
export function getProductsByCategory(category) {
  return allProducts.filter((p) => p.category === category);
}

/** إرجاع الأكثر مبيعاً */
export function getBestSellers() {
  return allProducts.filter((p) => p.isBestSeller);
}

/** إرجاع كل الـ slugs (لـ generateStaticParams) */
export function getAllSlugs() {
  return allProducts.map((p) => p.slug);
}

export default allProducts;
