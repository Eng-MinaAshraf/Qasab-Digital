-- ==============================================================================
-- متجر قصب (Qasab Juice) — Migration: نظام الحسابات والملفات الشخصية والأمان
-- تاريخ الإنشاء: 2026-09-12
-- المتطلبات: Supabase Auth هو المصدر الوحيد للهوية، وربط public.profiles بـ auth.users
-- ==============================================================================

-- 1. إنشاء جدول الملفات الشخصية (public.profiles)
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

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- تحديث توقيت updated_at تلقائياً
CREATE OR REPLACE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. دالة وتريجر الإنشاء التلقائي للملف الشخصي عند تسجيل مستخدم جديد في Supabase Auth
-- 2. دالة وتريجر إنشاء الملف الشخصي بعد التحقق بنجاح من الـ OTP فقط
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_account_type TEXT;
    assigned_account_type TEXT;
    user_fullname TEXT;
    user_phone TEXT;
BEGIN
    -- التحقق الصارم: لا يتم تسجيل أي بيانات إطلاقاً إلا إذا تم التحقق من الـ OTP وتأكيد البريد بنجاح
    IF NEW.email_confirmed_at IS NULL AND NEW.confirmed_at IS NULL THEN
        RETURN NEW;
    END IF;

    -- استخراج البيانات المرفقة عند التسجيل من raw_user_meta_data
    requested_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer');
    user_fullname := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

    -- تطبيق مبدأ انعدام الثقة (Zero-Trust): لا يمكن للعميل منح نفسه صلاحية بائع معتمد أو أدمن مطلقاً
    IF requested_account_type = 'vendor' THEN
        assigned_account_type := 'vendor_pending';
    ELSE
        assigned_account_type := 'customer';
    END IF;

    -- إدراج في جدول profiles بعد التأكيد بالـ OTP
    INSERT INTO public.profiles (id, full_name, phone, account_type, role, avatar_url)
    VALUES (
        NEW.id,
        user_fullname,
        user_phone,
        assigned_account_type,
        'customer', -- الصلاحية دائماً customer بشكل افتراضي
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
        updated_at = NOW();

    -- مزامنة احتياطية لجدول public.users القائم بعد التأكيد
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        INSERT INTO public.users (id, email, phone, full_name, role)
        VALUES (
            NEW.id,
            NEW.email,
            user_phone,
            user_fullname,
            'customer'
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.users.full_name END,
            phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.users.phone END,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط التريجر بجدول auth.users عند التأكيد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;

CREATE TRIGGER on_auth_user_verified
    AFTER INSERT OR UPDATE OF email_confirmed_at, confirmed_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة فحص وجود البريد الإلكتروني في قاعدة البيانات لاستعادة كلمة المرور
CREATE OR REPLACE FUNCTION public.check_email_exists(lookup_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(TRIM(lookup_email))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;

-- 3. تفعيل وإعداد أمان مستوى الصفوف (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- سياسة 1: المستخدم يمكنه قراءة ملفه الشخصي فقط
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- سياسة 2: المدير (Admin) يمكنه استعراض جميع الملفات الشخصية
CREATE POLICY "Admins view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- سياسة 3: المستخدم يمكنه تعديل بياناته الشخصية (دون تعديل دوره أو نوع حسابه)
CREATE POLICY "Users update own profile fields" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND account_type = (SELECT account_type FROM public.profiles WHERE id = auth.uid())
    );

-- سياسة 4: المستخدم الموثق يمكنه إدراج بروفايله الخاص في حال لم ينفذ التريجر
CREATE POLICY "Users insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id 
        AND role = 'customer' 
        AND account_type IN ('customer', 'vendor_pending')
    );

-- سياسة 5: الإدارة يمكنها تعديل أي ملف شخصي (ترقية البائعين أو تغيير الأدوار)
CREATE POLICY "Admins update all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );
