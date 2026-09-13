import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';
import { getAllProducts as getStaticProducts } from '../data/products.js';
import { getSupabaseAdminClient } from './supabase/admin.js';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');
const PRODUCTS_OVERRIDE_FILE = path.join(process.cwd(), 'data', 'products_override.json');

// ─── Concurrency Mutex Queue للملفات المحلية ─────────────────
const fileLocks = new Map();
export function withFileLock(filePath, callback) {
  const currentLock = fileLocks.get(filePath) || Promise.resolve();
  const operation = currentLock.then(async () => {
    return await callback();
  });
  fileLocks.set(filePath, operation.catch(() => {}));
  return operation;
}

function atomicWriteJSONSync(filePath, data) {
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

function readJSON(filePath, fallback = {}) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();
}

// ─── إدارة المنتجات والتكاليف (Products & Costs) ───────────────

/**
 * جلب جميع المنتجات مع تكاليفها (التكلفة الفعلية أو التقديرية 50%)
 */
export async function getProducts() {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          ...p,
          desc: p.desc || p['desc'],
          isCostEstimated: p.is_cost_estimated,
          stockQuantity: p.stock_quantity,
          isAvailable: p.is_available,
          isBestSeller: p.is_best_seller,
          reviews: p.reviews_count,
        }));
      }
    } catch (e) {
      console.warn('⚠️ تعذر جلب المنتجات من Supabase، جاري استخدام البيانات المحلية:', e.message);
    }
  }

  // Fallback: دمج المنتجات الثابتة مع التعديلات المحلية
  const base = getStaticProducts();
  const overrides = readJSON(PRODUCTS_OVERRIDE_FILE, {});

  return base.map((p) => {
    const override = overrides[p.id] || overrides[p.slug] || {};
    const price = typeof override.price === 'number' ? override.price : p.price;
    const defaultCost = Math.round(price * 0.5 * 10) / 10;
    const cost = typeof override.cost === 'number' ? override.cost : defaultCost;
    const isCostEstimated = override.isCostEstimated !== undefined ? override.isCostEstimated : (override.cost === undefined);

    return {
      ...p,
      price,
      cost,
      isCostEstimated,
      stockQuantity: typeof override.stockQuantity === 'number' ? override.stockQuantity : 100,
      isAvailable: override.isAvailable !== undefined ? override.isAvailable : true,
    };
  });
}

/**
 * تحديث سعر أو تكلفة أو مخزون منتج
 */
export async function updateProduct(idOrSlug, updates) {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const dbUpdates = {};
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.cost !== undefined) {
        dbUpdates.cost = updates.cost;
        dbUpdates.is_cost_estimated = updates.isCostEstimated !== undefined ? updates.isCostEstimated : false;
      }
      if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
      if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
      if (updates.title !== undefined) dbUpdates.title = updates.title;

      const { data, error } = await admin
        .from('products')
        .update(dbUpdates)
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .select()
        .single();

      if (!error && data) {
        return { success: true, product: data };
      }
    } catch (e) {
      console.warn('⚠️ تعذر تحديث المنتج في Supabase، جاري الحفظ المحلي:', e.message);
    }
  }

  // Fallback: الحفظ في ملف التعديلات المحلي
  return await withFileLock(PRODUCTS_OVERRIDE_FILE, async () => {
    const overrides = readJSON(PRODUCTS_OVERRIDE_FILE, {});
    overrides[idOrSlug] = {
      ...(overrides[idOrSlug] || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    atomicWriteJSONSync(PRODUCTS_OVERRIDE_FILE, overrides);
    return { success: true, overrides: overrides[idOrSlug] };
  });
}

// ─── إدارة الطلبات والـ Idempotency ─────────────────────────────

export async function getOrders() {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((o) => ({
          id: o.id,
          customer: {
            name: o.customer_name,
            phone: o.customer_phone,
            address: o.customer_address,
            notes: o.customer_notes,
          },
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.delivery_fee),
          total: Number(o.total),
          totalCost: Number(o.total_cost || 0),
          grossProfit: Number(o.gross_profit || 0),
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          status: o.status,
          createdAt: o.created_at,
          items: (o.order_items || []).map((i) => ({
            id: i.id,
            title: i.title,
            size: i.size,
            quantity: i.quantity,
            unitPrice: Number(i.unit_price),
            unitCost: Number(i.unit_cost || 0),
            total: Number(i.total_price),
            image: i.image,
          })),
        }));
      }
    } catch (e) {
      console.warn('⚠️ تعذر قراءة الطلبات من Supabase، جاري القراءة المحلية:', e.message);
    }
  }

  return readJSON(ORDERS_FILE, []);
}

export async function getOrderById(id) {
  const orders = await getOrders();
  return orders.find((o) => o.id === id) || null;
}

/**
 * إنشاء طلب جديد مع تدقيق الأسعار وحساب التكلفة التاريخية المجمدة،
 * وحماية تكرار الطلب عبر قيد UNIQUE على idempotency_key.
 */
export async function createOrder({ customer, items, idempotencyKey, paymentMethod = 'cod', userId = null }) {
  const cleanIdempotencyKey = (idempotencyKey || '').toString().trim();
  const errors = {};

  if (!customer || typeof customer !== 'object') {
    errors.customer = 'بيانات العميل مطلوبة';
  } else {
    const name = (customer.name || '').trim();
    const phone = (customer.phone || '').replace(/[\s-]/g, '');
    const address = (customer.address || '').trim();

    if (!name || name.length < 3) {
      errors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      errors.phone = 'رقم الهاتف يجب أن يكون رقم محمول مصري صحيح: 01x-xxxx-xxxx';
    }
    if (!address || address.length < 10) {
      errors.address = 'العنوان يجب أن يكون تفصيلياً (10 أحرف على الأقل)';
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.items = 'يجب أن تحتوي السلة على منتج واحد على الأقل';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // حساب وتدقيق الأسعار وتجميد التكلفة خادمياً
  const products = await getProducts();
  let verifiedSubtotal = 0;
  let verifiedTotalCost = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = products.find(
      (p) => p.title === item.title || p.slug === item.slug || p.id === item.id
    );

    const qty = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));
    const size = item.size || 'وسط';

    let unitPrice = product ? product.price : (item.price || 20);
    const unitCost = product ? (product.cost || Math.round(product.price * 0.5 * 10) / 10) : 10;

    if (product && product.sizes) {
      const sizeObj = product.sizes.find((s) => s.name === size);
      if (sizeObj && typeof sizeObj.priceDiff === 'number') {
        unitPrice = product.price + sizeObj.priceDiff;
      }
    } else {
      if (size === 'كبير') unitPrice += 5;
      if (size === 'صغير') unitPrice = Math.max(15, unitPrice - 5);
    }

    const itemTotal = unitPrice * qty;
    const itemTotalCost = unitCost * qty;

    verifiedSubtotal += itemTotal;
    verifiedTotalCost += itemTotalCost;

    verifiedItems.push({
      productId: product ? product.id : null,
      title: item.title,
      size,
      quantity: qty,
      unitPrice,
      unitCost, // التكلفة المجمدة وقت الطلب لحساب الأرباح بدقة مستقبلاً
      total: itemTotal,
      totalCost: itemTotalCost,
      image: item.image || (product ? product.image : 'product-1.webp'),
    });
  }

  const deliveryFee = 15;
  const verifiedGrandTotal = verifiedSubtotal + deliveryFee;
  const grossProfit = Math.max(0, verifiedSubtotal - verifiedTotalCost);

  // توليد كود الطلب بتنسيق QSB-YYMM-XXXX
  const now = new Date();
  const yearMonth = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderId = `QSB-${yearMonth}-${randomSuffix}`;

  const cleanCustomer = {
    name: sanitizeText(customer.name.trim()),
    phone: customer.phone.replace(/[\s-]/g, ''),
    address: sanitizeText(customer.address.trim()),
    notes: sanitizeText((customer.notes || '').trim()),
  };

  const admin = getSupabaseAdminClient();

  // 1. محاولة الإدراج في PostgreSQL عبر Supabase مع قيد UNIQUE على idempotency_key
  if (admin) {
    try {
      // فحص مسبق في حال إعادة إرسال نفس الطلب
      if (cleanIdempotencyKey) {
        const { data: existingOrder } = await admin
          .from('orders')
          .select('*, order_items(*)')
          .eq('idempotency_key', cleanIdempotencyKey)
          .maybeSingle();

        if (existingOrder) {
          return {
            success: true,
            isDuplicate: true,
            message: 'تم استرجاع الطلب المسبق بنجاح (حماية تكرار الطلب في قاعدة البيانات)',
            order: existingOrder,
          };
        }
      }

      // إدراج الطلب الرئيسي
      const { data: insertedOrder, error: orderErr } = await admin
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId,
          customer_name: cleanCustomer.name,
          customer_phone: cleanCustomer.phone,
          customer_address: cleanCustomer.address,
          customer_notes: cleanCustomer.notes,
          subtotal: verifiedSubtotal,
          delivery_fee: deliveryFee,
          total: verifiedGrandTotal,
          total_cost: verifiedTotalCost,
          gross_profit: grossProfit,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
          status: 'pending',
          idempotency_key: cleanIdempotencyKey || `auto_${orderId}`,
        })
        .select()
        .single();

      if (orderErr) {
        // فحص انتهاك قيد التفرّد في الـ Database (PostgreSQL Error 23505)
        if (orderErr.code === '23505' && cleanIdempotencyKey) {
          const { data: dupOrder } = await admin
            .from('orders')
            .select('*, order_items(*)')
            .eq('idempotency_key', cleanIdempotencyKey)
            .single();

          return {
            success: true,
            isDuplicate: true,
            message: 'تم تأكيد طلبك مسبقاً بنجاح!',
            order: dupOrder,
          };
        }
        throw orderErr;
      }

      // إدراج عناصر الطلب
      const itemsToInsert = verifiedItems.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        title: item.title,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        unit_cost: item.unitCost,
        total_price: item.total,
        total_cost: item.totalCost,
        image: item.image,
      }));

      await admin.from('order_items').insert(itemsToInsert);

      // إرسال إشعار فوري للأدمن
      await admin.from('notifications').insert({
        type: 'order_created',
        title: `طلب جديد وارد: ${orderId}`,
        message: `طلب من ${cleanCustomer.name} بقيمة ${verifiedGrandTotal} ج.م`,
        order_id: orderId,
        is_read: false,
      });

      return {
        success: true,
        order: {
          ...insertedOrder,
          items: verifiedItems,
        },
      };
    } catch (e) {
      console.warn('⚠️ تعذر حفظ الطلب في Supabase، جاري استخدام التخزين المحلي الآمن:', e.message);
    }
  }

  // 2. Fallback: التخزين المحلي في data/orders.json مع قفل التزامن وفحص Idempotency
  const newOrder = {
    id: orderId,
    customer: cleanCustomer,
    items: verifiedItems,
    subtotal: verifiedSubtotal,
    deliveryFee,
    total: verifiedGrandTotal,
    totalCost: verifiedTotalCost,
    grossProfit,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
    status: 'pending',
    createdAt: now.toISOString(),
    idempotencyKey: cleanIdempotencyKey || undefined,
  };

  const result = await withFileLock(ORDERS_FILE, async () => {
    const currentOrders = readJSON(ORDERS_FILE, []);

    if (cleanIdempotencyKey) {
      const existing = currentOrders.find((o) => o.idempotencyKey === cleanIdempotencyKey);
      if (existing) {
        return {
          success: true,
          isDuplicate: true,
          message: 'تم استرجاع الطلب المسبق بنجاح (حماية من التكرار)',
          order: existing,
        };
      }
    }

    currentOrders.unshift(newOrder);
    atomicWriteJSONSync(ORDERS_FILE, currentOrders);

    return { success: true, order: newOrder };
  });

  return result;
}

/**
 * تحديث حالة الطلب (Order Status Workflow)
 */
export async function updateOrderStatus(orderId, newStatus) {
  const allowedStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(newStatus)) {
    return { success: false, message: 'حالة الطلب غير صالحة' };
  }

  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        // إشعار العميل بتحديث الحالة
        if (data.user_id) {
          const statusLabels = {
            confirmed: 'تم تأكيد طلبك',
            preparing: 'طلبك جاري تحضيره طازجاً',
            out_for_delivery: 'طلبك في الطريق إليك مع مندوب التوصيل',
            delivered: 'تم تسليم طلبك بنجاح، بالهنا والشفا!',
            cancelled: 'تم إلغاء الطلب',
          };
          const msg = statusLabels[newStatus] || `تغيرت حالة طلبك إلى ${newStatus}`;
          await admin.from('notifications').insert({
            user_id: data.user_id,
            type: 'order_status',
            title: `تحديث طلب ${orderId}`,
            message: msg,
            order_id: orderId,
            is_read: false,
          });
        }

        return { success: true, order: data };
      }
    } catch (e) {
      console.warn('⚠️ تعذر تحديث حالة الطلب في Supabase، جاري التحديث محلياً:', e.message);
    }
  }

  // Fallback: التحديث المحلي
  return await withFileLock(ORDERS_FILE, async () => {
    const orders = readJSON(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      return { success: false, message: 'الطلب غير موجود' };
    }
    orders[idx].status = newStatus;
    orders[idx].updatedAt = new Date().toISOString();
    atomicWriteJSONSync(ORDERS_FILE, orders);
    return { success: true, order: orders[idx] };
  });
}

/**
 * تحديث حالة الدفع (Payment Status & Refund)
 */
export async function updatePaymentStatus(orderId, { status, paymobTransactionId = null, paymentMethod = null }) {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const updates = { payment_status: status };
      if (status === 'paid') updates.status = 'confirmed';

      const { data, error } = await admin
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        return { success: true, order: data };
      }
    } catch (e) {
      console.warn('⚠️ تعذر تحديث حالة الدفع في Supabase، جاري الحفظ محلياً:', e.message);
    }
  }

  // Fallback: التحديث المحلي
  return await withFileLock(ORDERS_FILE, async () => {
    const orders = readJSON(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { success: false, message: 'الطلب غير موجود' };

    orders[idx].paymentStatus = status;
    if (status === 'paid') orders[idx].status = 'confirmed';
    if (paymobTransactionId) orders[idx].paymobTransactionId = paymobTransactionId;
    if (paymentMethod) orders[idx].paymentMethod = paymentMethod;
    orders[idx].updatedAt = new Date().toISOString();

    atomicWriteJSONSync(ORDERS_FILE, orders);
    return { success: true, order: orders[idx] };
  });
}

// ─── إدارة التقييمات (Reviews) ─────────────────────────────────

export async function getReviews(productSlug) {
  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from('reviews')
        .select('*')
        .eq('product_slug', productSlug)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r) => ({
          id: r.id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          size: r.size,
          verified: r.verified,
          createdAt: r.created_at,
          date: 'مؤخراً',
        }));
      }
    } catch (e) {
      console.warn('⚠️ تعذر جلب المراجعات من Supabase، جاري القراءة المحلية:', e.message);
    }
  }

  const allReviews = readJSON(REVIEWS_FILE, {});
  return allReviews[productSlug] || [];
}

export async function addReview({ productSlug, name, rating, comment, size, userId = null }) {
  const errors = {};
  const trimmedName = (name || '').trim();
  const trimmedComment = (comment || '').trim();
  const numRating = parseInt(rating, 10);

  if (!productSlug) errors.productSlug = 'معرف المنتج مطلوب';
  if (!trimmedName || trimmedName.length < 3) errors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
  if (!numRating || numRating < 1 || numRating > 5) errors.rating = 'التقييم يجب أن يكون بين 1 و 5 نجوم';
  if (!trimmedComment || trimmedComment.length < 5) errors.comment = 'التعليق يجب أن يكون 5 أحرف على الأقل';

  if (Object.keys(errors).length > 0) return { success: false, errors };

  const reviewId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const cleanReview = {
    id: reviewId,
    product_slug: productSlug,
    user_id: userId,
    name: sanitizeText(trimmedName),
    rating: numRating,
    size: sanitizeText(size || 'وسط'),
    comment: sanitizeText(trimmedComment),
    verified: true,
    is_approved: true,
    created_at: new Date().toISOString(),
  };

  const admin = getSupabaseAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin.from('reviews').insert(cleanReview).select().single();
      if (!error && data) {
        const reviews = await getReviews(productSlug);
        return { success: true, review: data, reviews };
      }
    } catch (e) {
      console.warn('⚠️ تعذر إدراج التقييم في Supabase، جاري الحفظ محلياً:', e.message);
    }
  }

  // Fallback: الحفظ المحلي
  return await withFileLock(REVIEWS_FILE, async () => {
    const allReviews = readJSON(REVIEWS_FILE, {});
    if (!allReviews[productSlug]) allReviews[productSlug] = [];

    const localItem = {
      ...cleanReview,
      date: 'الآن',
      createdAt: cleanReview.created_at,
    };
    allReviews[productSlug].unshift(localItem);
    atomicWriteJSONSync(REVIEWS_FILE, allReviews);

    return {
      success: true,
      review: localItem,
      reviews: allReviews[productSlug],
    };
  });
}

// ─── التقارير المالية والتحليلات (Financial Analytics) ─────────

/**
 * حساب تقرير الأرباح والخسائر والمؤشرات المالية
 */
export async function getFinancialSummary({ period = 'all', fixedExpenses = 0 } = {}) {
  const orders = await getOrders();
  const products = await getProducts();

  const isAnyCostEstimated = products.some((p) => p.isCostEstimated);

  // فلترة الطلبات حسب الفترة الزمنية
  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    if (o.status === 'cancelled') return false;
    if (period === 'all') return true;

    const orderDate = new Date(o.createdAt);
    if (period === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    }
    if (period === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  let grossRevenue = 0;
  let totalDeliveryFees = 0;
  let cogs = 0; // تكلفة البضاعة المباعة
  const productPerformance = {};

  for (const o of filteredOrders) {
    grossRevenue += Number(o.total || 0);
    totalDeliveryFees += Number(o.deliveryFee || 15);

    const items = o.items || [];
    for (const item of items) {
      const unitCost = Number(item.unitCost || 10);
      const unitPrice = Number(item.unitPrice || 20);
      const qty = Number(item.quantity || 1);
      const itemCost = unitCost * qty;
      const itemRevenue = unitPrice * qty;
      const itemProfit = itemRevenue - itemCost;

      cogs += itemCost;

      const title = item.title || 'منتج';
      if (!productPerformance[title]) {
        productPerformance[title] = {
          title,
          unitsSold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      productPerformance[title].unitsSold += qty;
      productPerformance[title].revenue += itemRevenue;
      productPerformance[title].cost += itemCost;
      productPerformance[title].profit += itemProfit;
    }
  }

  // هامش الربح الإجمالي = الإيرادات من المنتجات - تكلفة المنتجات
  const productRevenue = grossRevenue - totalDeliveryFees;
  const grossProfit = Math.max(0, productRevenue - cogs);
  const grossMarginPercent = productRevenue > 0 ? ((grossProfit / productRevenue) * 100).toFixed(1) : '0.0';
  const netProfit = grossProfit - Number(fixedExpenses || 0);
  const aov = filteredOrders.length > 0 ? (grossRevenue / filteredOrders.length).toFixed(1) : '0';

  // أكثر المنتجات مبيعاً وأكثرها ربحية
  const performanceList = Object.values(productPerformance);
  const bestSellers = [...performanceList].sort((a, b) => b.unitsSold - a.unitsSold);
  const mostProfitable = [...performanceList].sort((a, b) => b.profit - a.profit);

  // التنبؤ بالمبيعات (Moving Average للأسبوع القادم بناءً على معدل المبيعات اليومي)
  const daysInSample = Math.max(1, Math.min(30, filteredOrders.length > 0 ? 14 : 7));
  const dailyAverageRevenue = grossRevenue / daysInSample;
  const predictedNextWeekRevenue = Math.round(dailyAverageRevenue * 7);

  return {
    period,
    orderCount: filteredOrders.length,
    grossRevenue,
    productRevenue,
    deliveryRevenue: totalDeliveryFees,
    cogs,
    grossProfit,
    grossMarginPercent,
    fixedExpenses: Number(fixedExpenses || 0),
    netProfit,
    aov,
    isAnyCostEstimated,
    bestSellers,
    mostProfitable,
    predictions: {
      nextWeekRevenue: predictedNextWeekRevenue,
      confidence: filteredOrders.length >= 10 ? 'جيدة' : 'مبدئية (تحتاج مزيداً من الطلبات)',
    },
  };
}
