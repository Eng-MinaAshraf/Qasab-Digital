/**
 * سكريبت تصدير وترحيل البيانات إلى Supabase (PostgreSQL)
 * يقوم بقراءة المنتجات والطلبات والتقييمات الحالية وحساب التكاليف التقديرية (50%)
 * وتوليد ملف seed.sql متكامل بالإضافة إلى إمكانية الترحيل المباشر عبر العميل إذا توفرت المفاتيح.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllProducts } from '../data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const ORDERS_FILE = path.join(ROOT_DIR, 'data', 'orders.json');
const REVIEWS_FILE = path.join(ROOT_DIR, 'data', 'reviews.json');
const SEED_OUTPUT = path.join(ROOT_DIR, 'supabase', 'seed.sql');

function readJsonSafe(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    console.error(`خطأ في قراءة ${file}:`, e.message);
  }
  return fallback;
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function runMigration() {
  console.log('======================================================');
  console.log('🚀 بدء تحضير وترحيل بيانات متجر قصب إلى Supabase');
  console.log('======================================================\n');

  // 1. قراءة المنتجات وتحديد التكلفة المبدئية (50% من سعر البيع)
  const products = getAllProducts();
  console.log(`📦 تم تحميل ${products.length} منتجات من data/products.js`);

  const sqlStatements = [
    '-- =====================================================================',
    '-- ملف بيانات البداية والترحيل لمتجر قصب (Qasab Juice Seed Data)',
    '-- =====================================================================\n',
    '-- 1. إدراج المنتجات مع التكلفة التقديرية (50%) والمخزون'
  ];

  for (const p of products) {
    const defaultCost = Math.round(p.price * 0.5 * 10) / 10; // 50%
    const sql = `INSERT INTO public.products (id, slug, title, "desc", long_desc, price, cost, is_cost_estimated, category, image, rating, reviews_count, is_best_seller, stock_quantity, is_available, sizes, nutrition_facts, tags)
VALUES (
  ${escapeSql(p.id)},
  ${escapeSql(p.slug)},
  ${escapeSql(p.title)},
  ${escapeSql(p.desc)},
  ${escapeSql(p.longDesc || p.desc)},
  ${p.price},
  ${defaultCost},
  TRUE,
  ${escapeSql(p.category || 'عصائر')},
  ${escapeSql(p.image)},
  ${parseFloat(p.rating || 5.0)},
  ${p.reviews || 0},
  ${p.isBestSeller ? 'TRUE' : 'FALSE'},
  100,
  TRUE,
  ${escapeSql(JSON.stringify(p.sizes || []))}::jsonb,
  ${escapeSql(JSON.stringify(p.nutritionFacts || []))}::jsonb,
  ARRAY[${(p.tags || []).map(t => escapeSql(t)).join(', ')}]
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  updated_at = NOW();`;
    sqlStatements.push(sql);
  }

  // 2. قراءة الطلبات الحالية وترحيلها مع order_items وتجميد التكلفة التاريخية
  const orders = readJsonSafe(ORDERS_FILE, []);
  console.log(`📋 تم تحميل ${orders.length} طلبات من data/orders.json`);

  if (orders.length > 0) {
    sqlStatements.push('\n-- 2. إدراج الطلبات المسجلة مسبقاً وتفاصيل عناصرها');
  }

  let totalMigratedItems = 0;
  for (const order of orders) {
    let orderTotalCost = 0;

    // حساب تكلفة العناصر التقديرية
    const items = order.items || [];
    for (const it of items) {
      const unitCost = Math.round((it.unitPrice || 20) * 0.5 * 10) / 10;
      orderTotalCost += unitCost * (it.quantity || 1);
    }
    const grossProfit = Math.max(0, (order.subtotal || 0) - orderTotalCost);

    const orderSql = `INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  ${escapeSql(order.id)},
  ${escapeSql(order.customer?.name || 'عميل غير مسجل')},
  ${escapeSql(order.customer?.phone || '')},
  ${escapeSql(order.customer?.address || '')},
  ${escapeSql(order.customer?.notes || '')},
  ${order.subtotal || 0},
  ${order.deliveryFee || 15},
  ${order.total || 0},
  ${orderTotalCost},
  ${grossProfit},
  'cod',
  'unpaid',
  ${escapeSql(order.status || 'pending')},
  ${escapeSql(order.idempotencyKey || `init_${order.id}`)},
  ${escapeSql(order.createdAt || new Date().toISOString())}
)
ON CONFLICT (id) DO NOTHING;`;
    sqlStatements.push(orderSql);

    for (const it of items) {
      totalMigratedItems++;
      const unitCost = Math.round((it.unitPrice || 20) * 0.5 * 10) / 10;
      const totalCost = unitCost * (it.quantity || 1);
      const itemSql = `INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  ${escapeSql(order.id)},
  ${escapeSql(it.title || 'عصير قصب')},
  ${escapeSql(it.size || 'وسط')},
  ${it.quantity || 1},
  ${it.unitPrice || 20},
  ${unitCost},
  ${it.total || (it.unitPrice * it.quantity)},
  ${totalCost},
  ${escapeSql(it.image || 'product-1.webp')}
);`;
      sqlStatements.push(itemSql);
    }
  }

  // 3. قراءة التقييمات وترحيلها
  const reviewsMap = readJsonSafe(REVIEWS_FILE, {});
  let totalReviewsCount = 0;
  sqlStatements.push('\n-- 3. إدراج التقييمات السابقة');

  for (const [slug, revList] of Object.entries(reviewsMap)) {
    for (const rev of revList) {
      totalReviewsCount++;
      const revSql = `INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  ${escapeSql(rev.id)},
  ${escapeSql(slug)},
  ${escapeSql(rev.name)},
  ${rev.rating || 5},
  ${escapeSql(rev.comment)},
  ${escapeSql(rev.size || 'وسط')},
  ${rev.verified !== false ? 'TRUE' : 'FALSE'},
  TRUE,
  ${escapeSql(rev.createdAt || new Date().toISOString())}
)
ON CONFLICT (id) DO NOTHING;`;
      sqlStatements.push(revSql);
    }
  }
  console.log(`⭐ تم تحميل ${totalReviewsCount} مراجعة من data/reviews.json`);

  // حفظ الملف في supabase/seed.sql
  fs.writeFileSync(SEED_OUTPUT, sqlStatements.join('\n\n'), 'utf8');
  console.log(`\n✅ تم توليد ملف SQL بنجاح في: ${SEED_OUTPUT}`);
  console.log(`📊 الإحصائيات المرحّلة:`);
  console.log(`   - منتجات: ${products.length}`);
  console.log(`   - طلبات: ${orders.length}`);
  console.log(`   - عناصر طلبات: ${totalMigratedItems}`);
  console.log(`   - تقييمات: ${totalReviewsCount}`);
  console.log('======================================================\n');
}

runMigration().catch(err => {
  console.error('❌ حدث خطأ أثناء الترحيل:', err);
  process.exit(1);
});
