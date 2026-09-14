-- ==============================================================================
-- متجر قصب (Qasab Juice) — مخطط قاعدة بيانات PostgreSQL الشامل (Supabase)
-- ==============================================================================

-- تفعيل الامتدادات اللازمة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- دالة تحديث توقيت updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. جدول المنتجات (products)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    "desc" TEXT,
    long_desc TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (cost >= 0),
    is_cost_estimated BOOLEAN NOT NULL DEFAULT TRUE,
    category TEXT NOT NULL DEFAULT 'عصائر',
    image TEXT NOT NULL,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
    stock_quantity INTEGER NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    nutrition_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. جدول الملفات الشخصية (public.profiles) المرتبط بـ auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    account_type TEXT NOT NULL DEFAULT 'customer' CHECK (account_type IN ('customer', 'vendor_pending', 'vendor')),
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- جدول المستخدمين المتوافق تاريخياً (users) لمطابقة المفاتيح الأجنبية السابقة
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. جدول الطلبات (orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- صيغة الكود: QSB-YYMM-XXXX
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 15.00 CHECK (delivery_fee >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gross_profit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'paymob_card', 'paymob_wallet')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    idempotency_key TEXT UNIQUE, -- قيد التفرّد الصارم لحماية تكرار الطلب على مستوى الـ Database
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders(idempotency_key);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. جدول عناصر الطلب المجمدة بالتكلفة التاريخية (order_items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT 'وسط',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0), -- التكلفة التاريخية المجمدة
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 5. جدول التقييمات والمراجعات (reviews)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_slug TEXT NOT NULL REFERENCES public.products(slug) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    size TEXT DEFAULT 'وسط',
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON public.reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. جدول سجل عمليات الدفع لمنع التكرار (payment_transactions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    paymob_order_id TEXT,
    paymob_transaction_id TEXT UNIQUE NOT NULL, -- قيد التفرّد لمنع مضاعفة المعالجة عند تكرار وصول الـ Webhook
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EGP',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    payment_method TEXT,
    hmac_valid BOOLEAN NOT NULL DEFAULT FALSE,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_paymob_id ON public.payment_transactions(paymob_transaction_id);

-- ------------------------------------------------------------------------------
-- 7. جدول تقييد معدل الطلبات الموزع (rate_limits)
-- ⚠️ ملاحظة معمارية موثقة (Architectural Trade-off):
-- استخدام جدول rate_limits في PostgreSQL يوفر حماية متكاملة وموزعة عبر كافة الـ Instances دون الحاجة لأي بنية تحتية إضافية،
-- وهو ملائم وممتاز لحجم زيارات متجر محلي. في حال التوسع والنمو المستقبلي الهائل، يمكن ترقية هذه الطبقة اختيارياً
-- إلى Upstash Redis أو Vercel Edge Config لتوفير زمن استجابة في الذاكرة بأجزاء من الميلي ثانية.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'order_create',
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(ip, action, window_start);

-- دالة تنظيف سجلات Rate Limit المنتهية تلقائياً (أقدم من ساعة)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 8. جدول الإشعارات الفورية (notifications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL يعني إشعار عام للوحة الأدمن
    type TEXT NOT NULL DEFAULT 'order_created' CHECK (type IN ('order_created', 'order_status', 'low_stock', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. إعداد أمان مستوى الصفوف (Row Level Security - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- سياسات جدول الملفات الشخصية (profiles)
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Users update own profile fields" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND account_type = (SELECT account_type FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id 
        AND account_type IN ('customer', 'vendor_pending')
        AND (
            role = 'customer' 
            OR (role = 'admin' AND (auth.jwt()->>'email' IN ('admin@qasab.eg', 'qasab.digital@gmail.com', 'engminaashraf019@gmail.com')))
        )
    );

CREATE POLICY "Admins update all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- سياسات المنتجات: العامة تقرأ المتاح، والأدمن يقرأ ويعدل كل شيء
CREATE POLICY "Public products viewable" ON public.products
    FOR SELECT USING (is_available = TRUE OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin products modification" ON public.products
    FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

-- سياسات التقييمات: المعتمدة مقروءة للجميع، والإدراج متاح، والأدمن يديرها
CREATE POLICY "Approved reviews viewable" ON public.reviews
    FOR SELECT USING (is_approved = TRUE OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Insert review allowed" ON public.reviews
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin reviews modification" ON public.reviews
    FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

-- سياسات الطلبات: العميل يرى طلباته فقط، والأدمن يرى الجميع
CREATE POLICY "User views own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Insert order allowed" ON public.orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin orders modification" ON public.orders
    FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

-- سياسات عناصر الطلب:
CREATE POLICY "User views own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin')
        )
    );

CREATE POLICY "Insert order items allowed" ON public.order_items
    FOR INSERT WITH CHECK (TRUE);

-- سياسات الإشعارات:
CREATE POLICY "User views own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid() OR (user_id IS NULL AND (auth.jwt() ->> 'role') = 'admin'));

CREATE POLICY "User updates own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid() OR (user_id IS NULL AND (auth.jwt() ->> 'role') = 'admin'));

-- ------------------------------------------------------------------------------
-- 10. تفعيل قنوات Realtime لجدول الطلبات والإشعارات
-- ------------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
