-- =====================================================================

-- ملف بيانات البداية والترحيل لمتجر قصب (Qasab Juice Seed Data)

-- =====================================================================


-- 1. إدراج المنتجات مع التكلفة التقديرية (50%) والمخزون

INSERT INTO public.products (id, slug, title, "desc", long_desc, price, cost, is_cost_estimated, category, image, rating, reviews_count, is_best_seller, stock_quantity, is_available, sizes, nutrition_facts, tags)
VALUES (
  'p1',
  'qasab-classic',
  'قصب كلاسيك',
  'الطعم الأصيل من أجود المحاصيل',
  'عصير قصب طبيعي 100% يُعصر طازجاً من أعواد القصب المصرية الأصلية المزروعة في صعيد مصر. بدون إضافة ماء أو سكر أو مواد حافظة — حلاوة طبيعية ونكهة تراثية أصيلة في كل رشفة.',
  20,
  10,
  TRUE,
  'عصائر',
  'product-1.webp',
  5,
  92,
  TRUE,
  100,
  TRUE,
  '[{"name":"صغير","priceDiff":-5},{"name":"وسط","priceDiff":0},{"name":"كبير","priceDiff":5}]'::jsonb,
  '[{"label":"السعرات الحرارية","value":"180 كالوري"},{"label":"السكر الطبيعي","value":"40 جرام"},{"label":"الحديد","value":"1.2 مجم"},{"label":"فيتامين C","value":"15 مجم"}]'::jsonb,
  ARRAY['طبيعي', 'بدون سكر مضاف', 'طازج يومياً']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  updated_at = NOW();

INSERT INTO public.products (id, slug, title, "desc", long_desc, price, cost, is_cost_estimated, category, image, rating, reviews_count, is_best_seller, stock_quantity, is_available, sizes, nutrition_facts, tags)
VALUES (
  'p2',
  'qasab-lemon',
  'قصب بالليمون',
  'انتعاش الليمون البلدي مع سكر القصب',
  'مزيج منعش من عصير القصب الطازج مع عصير الليمون البلدي الطبيعي. توليفة مصرية أصيلة تجمع بين حلاوة القصب وحموضة الليمون المنعشة — مثالي لأيام الصيف الحارة.',
  25,
  12.5,
  TRUE,
  'عصائر',
  'product-2.webp',
  4.9,
  54,
  TRUE,
  100,
  TRUE,
  '[{"name":"صغير","priceDiff":-5},{"name":"وسط","priceDiff":0},{"name":"كبير","priceDiff":5}]'::jsonb,
  '[{"label":"السعرات الحرارية","value":"165 كالوري"},{"label":"السكر الطبيعي","value":"36 جرام"},{"label":"فيتامين C","value":"35 مجم"},{"label":"الحديد","value":"1.0 مجم"}]'::jsonb,
  ARRAY['منعش', 'ليمون بلدي', 'صيفي']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  updated_at = NOW();

INSERT INTO public.products (id, slug, title, "desc", long_desc, price, cost, is_cost_estimated, category, image, rating, reviews_count, is_best_seller, stock_quantity, is_available, sizes, nutrition_facts, tags)
VALUES (
  'p3',
  'qasab-mint',
  'قصب بالنعناع',
  'أوراق نعناع فريش تروي العطش',
  'عصير قصب طازج ممزوج بأوراق النعناع البلدي الطازجة — نكهة مصرية كلاسيكية بانتعاش مضاعف. يُقدم مثلجاً مع أوراق نعناع طازجة فوق الكوب لتجربة بصرية وذوقية مميزة.',
  25,
  12.5,
  TRUE,
  'عصائر',
  'product-3.webp',
  5,
  62,
  TRUE,
  100,
  TRUE,
  '[{"name":"صغير","priceDiff":-5},{"name":"وسط","priceDiff":0},{"name":"كبير","priceDiff":5}]'::jsonb,
  '[{"label":"السعرات الحرارية","value":"170 كالوري"},{"label":"السكر الطبيعي","value":"38 جرام"},{"label":"فيتامين C","value":"20 مجم"},{"label":"المنثول الطبيعي","value":"موجود"}]'::jsonb,
  ARRAY['منعش', 'نعناع طبيعي', 'الأكثر طلباً']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  updated_at = NOW();

INSERT INTO public.products (id, slug, title, "desc", long_desc, price, cost, is_cost_estimated, category, image, rating, reviews_count, is_best_seller, stock_quantity, is_available, sizes, nutrition_facts, tags)
VALUES (
  'p4',
  'qasab-fresh-concentrate',
  'قصب فريش مركز',
  'عصرة أولى ثقيلة وغنية بالفيتامينات',
  'العصرة الأولى المركزة من أعواد القصب — أغنى وأثقل في القوام واللون والنكهة. تحتوي على تركيز أعلى من المعادن والفيتامينات الطبيعية. الخيار المفضل لمن يبحث عن الطاقة والتغذية الطبيعية.',
  30,
  15,
  TRUE,
  'عصائر',
  'product-4.webp',
  4.9,
  48,
  TRUE,
  100,
  TRUE,
  '[{"name":"صغير","priceDiff":-5},{"name":"وسط","priceDiff":0},{"name":"كبير","priceDiff":5}]'::jsonb,
  '[{"label":"السعرات الحرارية","value":"220 كالوري"},{"label":"السكر الطبيعي","value":"52 جرام"},{"label":"الحديد","value":"2.1 مجم"},{"label":"فيتامين C","value":"25 مجم"}]'::jsonb,
  ARRAY['مركز', 'غني بالطاقة', 'العصرة الأولى']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  updated_at = NOW();

INSERT INTO public.products (id, slug, title, "desc", long_desc, price, cost, is_cost_estimated, category, image, rating, reviews_count, is_best_seller, stock_quantity, is_available, sizes, nutrition_facts, tags)
VALUES (
  'p5',
  'falafel-sandwich',
  'ساندوتش فلافل',
  'سناكس سخن وطازة رفيق القصب',
  'ساندوتش فلافل مقرمش بخلطة قصب الخاصة — طعمية مصرية أصلية بالكزبرة والبقدونس والثوم، مقلية لحظة التقديم. يُقدم في عيش بلدي طازج مع سلطة طحينة وخضروات مشكلة.',
  35,
  17.5,
  TRUE,
  'سناكس',
  'product-5.webp',
  4.8,
  36,
  TRUE,
  100,
  TRUE,
  '[{"name":"عادي","priceDiff":0},{"name":"دبل","priceDiff":10}]'::jsonb,
  '[{"label":"السعرات الحرارية","value":"320 كالوري"},{"label":"البروتين","value":"12 جرام"},{"label":"الألياف","value":"6 جرام"},{"label":"الدهون","value":"15 جرام"}]'::jsonb,
  ARRAY['سناكس', 'فلافل مصرية', 'مقرمش']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  updated_at = NOW();


-- 2. إدراج الطلبات المسجلة مسبقاً وتفاصيل عناصرها

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-6CSF',
  'عميل اختبار تجريبي',
  '01012345678',
  'شارع الجمهورية، الدور الثاني، أسيوط',
  'طلب فحص آلي',
  70,
  15,
  85,
  35,
  35,
  'cod',
  'unpaid',
  'pending',
  'test_idem_1789192901617_o1p0',
  '2026-09-12T06:01:41.626Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-6CSF',
  'قصب كلاسيك',
  'وسط',
  2,
  20,
  10,
  40,
  20,
  'product-1.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-6CSF',
  'قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-2.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-NDSR',
  'عميل اختبار تجريبي',
  '01012345678',
  'شارع الجمهورية، الدور الثاني، أسيوط',
  'طلب فحص آلي',
  70,
  15,
  85,
  35,
  35,
  'cod',
  'unpaid',
  'pending',
  'test_idem_1789192873944_k97w',
  '2026-09-12T06:01:13.949Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-NDSR',
  'قصب كلاسيك',
  'وسط',
  2,
  20,
  10,
  40,
  20,
  'product-1.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-NDSR',
  'قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-2.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-8I47',
  'Mina Ashraf',
  '01283956913',
  'assiut
assiut',
  '',
  140,
  15,
  155,
  70,
  70,
  'cod',
  'unpaid',
  'pending',
  'idem_1789178338276_92a51n6',
  '2026-09-12T01:59:14.269Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-8I47',
  'قصب كلاسيك',
  'وسط',
  7,
  20,
  10,
  140,
  70,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-VEXH',
  'Mina Ashraf',
  '01283956913',
  'assiut
assiut',
  '',
  145,
  15,
  160,
  72.5,
  72.5,
  'cod',
  'unpaid',
  'pending',
  'idem_1789178217986_ydeixcl',
  '2026-09-12T01:57:09.832Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-VEXH',
  'ساندوتش فلافل',
  'وسط',
  1,
  35,
  17.5,
  35,
  17.5,
  'product-5.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-VEXH',
  'قصب بالنعناع',
  'وسط',
  1,
  25,
  12.5,
  25,
  12.5,
  'product-3.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-VEXH',
  'قصب كلاسيك',
  'وسط',
  3,
  20,
  10,
  60,
  30,
  'product-1.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-VEXH',
  'قصب بالليمون',
  'وسط',
  1,
  25,
  12.5,
  25,
  12.5,
  'product-2.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-YBDO',
  'Mina Ashraf',
  '01283956913',
  'assiut
assiut',
  '',
  20,
  15,
  35,
  10,
  10,
  'cod',
  'unpaid',
  'pending',
  'idem_1789177078964_pn56mfy',
  '2026-09-12T01:38:12.657Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-YBDO',
  'قصب كلاسيك',
  'وسط',
  1,
  20,
  10,
  20,
  10,
  'product-1.jpg'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-LBG8',
  'عميل متزامن رقم 6',
  '01010000005',
  'شارع التحرير، الدقي، شقة رقم 6',
  'طلب متزامن 6',
  30,
  15,
  45,
  15,
  15,
  'cod',
  'unpaid',
  'pending',
  'concurrent_1789171357987_5_vq81nn6un3r',
  '2026-09-12T00:02:38.566Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-LBG8',
  'عصير قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-9WWT',
  'عميل متزامن رقم 5',
  '01010000004',
  'شارع التحرير، الدقي، شقة رقم 5',
  'طلب متزامن 5',
  30,
  15,
  45,
  15,
  15,
  'cod',
  'unpaid',
  'pending',
  'concurrent_1789171357985_4_drklro8i81',
  '2026-09-12T00:02:38.502Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-9WWT',
  'عصير قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-KI46',
  'عميل متزامن رقم 4',
  '01010000003',
  'شارع التحرير، الدقي، شقة رقم 4',
  'طلب متزامن 4',
  30,
  15,
  45,
  15,
  15,
  'cod',
  'unpaid',
  'pending',
  'concurrent_1789171357984_3_31ddvr0e01j',
  '2026-09-12T00:02:38.365Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-KI46',
  'عصير قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-H8MV',
  'عميل متزامن رقم 3',
  '01010000002',
  'شارع التحرير، الدقي، شقة رقم 3',
  'طلب متزامن 3',
  30,
  15,
  45,
  15,
  15,
  'cod',
  'unpaid',
  'pending',
  'concurrent_1789171357982_2_l27gjn6nl4e',
  '2026-09-12T00:02:38.207Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-H8MV',
  'عصير قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-P4GP',
  'عميل متزامن رقم 2',
  '01010000001',
  'شارع التحرير، الدقي، شقة رقم 2',
  'طلب متزامن 2',
  30,
  15,
  45,
  15,
  15,
  'cod',
  'unpaid',
  'pending',
  'concurrent_1789171357978_1_fauz2dzpjcr',
  '2026-09-12T00:02:38.113Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-P4GP',
  'عصير قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-A30I',
  'عميل متزامن رقم 1',
  '01010000000',
  'شارع التحرير، الدقي، شقة رقم 1',
  'طلب متزامن 1',
  30,
  15,
  45,
  15,
  15,
  'cod',
  'unpaid',
  'pending',
  'concurrent_1789171357974_0_jpgegljawdd',
  '2026-09-12T00:02:38.021Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-A30I',
  'عصير قصب بالليمون',
  'كبير',
  1,
  30,
  15,
  30,
  15,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-8KBD',
  'عمرو دياب',
  '01011223344',
  'شارع الهرم الرئيسي، الجيزة، مصر',
  'الطلب الأول للتجربة',
  20,
  15,
  35,
  10,
  10,
  'cod',
  'unpaid',
  'pending',
  'idem_test_1789171357801_ffefsgvkrwk',
  '2026-09-12T00:02:37.889Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-8KBD',
  'عصير قصب كلاسيك',
  'وسط',
  1,
  20,
  10,
  20,
  10,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-3KJC',
  'كريم عبد العزيز',
  '01012345678',
  '15 شارع مصدق، الدقي، الجيزة، الدور الثالث',
  'يرجى الاتصال عند الوصول',
  55,
  15,
  70,
  27.5,
  27.5,
  'cod',
  'unpaid',
  'pending',
  'init_QSB-2609-3KJC',
  '2026-09-11T23:45:22.787Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-3KJC',
  'عصير قصب كلاسيك',
  'وسط',
  2,
  20,
  10,
  40,
  20,
  'product-1.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-3KJC',
  'ساندوتش فلافل مصري',
  'ساندوتش كامل',
  1,
  15,
  7.5,
  15,
  7.5,
  'product-1.webp'
);

INSERT INTO public.orders (id, customer_name, customer_phone, customer_address, customer_notes, subtotal, delivery_fee, total, total_cost, gross_profit, payment_method, payment_status, status, idempotency_key, created_at)
VALUES (
  'QSB-2609-DL9E',
  'كريم عبد العزيز',
  '01012345678',
  '15 شارع مصدق، الدقي، الجيزة، الدور الثالث',
  'يرجى الاتصال عند الوصول',
  55,
  15,
  70,
  27.5,
  27.5,
  'cod',
  'unpaid',
  'pending',
  'init_QSB-2609-DL9E',
  '2026-09-11T23:44:05.493Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-DL9E',
  'عصير قصب كلاسيك',
  'وسط',
  2,
  20,
  10,
  40,
  20,
  'product-1.webp'
);

INSERT INTO public.order_items (order_id, title, size, quantity, unit_price, unit_cost, total_price, total_cost, image)
VALUES (
  'QSB-2609-DL9E',
  'ساندوتش فلافل مصري',
  'ساندوتش كامل',
  1,
  15,
  7.5,
  15,
  7.5,
  'product-1.webp'
);


-- 3. إدراج التقييمات السابقة

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789171357588_ctaq',
  'qasab-classic',
  'أحمد النجار',
  5,
  'طعم قصب تحفة ومنعش جداً',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-12T00:02:37.623Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789170321480_f6fs',
  'qasab-classic',
  'محمود عبد الفتاح',
  5,
  'طعم ممتاز ومنعش جداً وأصيل، تسلم إيديكم!',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-11T23:45:21.489Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789170245273_fliq',
  'qasab-classic',
  'محمود عبد الفتاح',
  5,
  'طعم ممتاز ومنعش جداً وأصيل، تسلم إيديكم!',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-11T23:44:05.273Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r1',
  'qasab-classic',
  'م. يوسف إبراهيم',
  5,
  'عصير قصب صافي حقيقي يرجعك لأيام زمان، بدون أي سكر مضاف وثقيل ومثلج مضبوط على الشعرة! أفضل قصب شربته في القاهرة.',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-10T12:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r2',
  'qasab-classic',
  'داليا النجار',
  5,
  'أحسن كوباية قصب ممكن تشربها في الحر ده.. طازة وريحة القصب الصعيدي واضحة جداً والنظافة فوق الممتازة.',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-08T15:30:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r1',
  'qasab-lemon',
  'حسام حسن',
  5,
  'الليمون البلدي مع القصب ميكس عبقري، بيكسر الحلاوة شوية ويديك انتعاش مش طبيعي! بقيت أطلبه شبه يومي.',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-11T10:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r2',
  'qasab-lemon',
  'نيرة المهدي',
  5,
  'طعم الليمون فريش والقصب مش مخفف بماية نهائي.. التغليف ممتاز ومثلج جداً.',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-09T18:45:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789171358853_11ck',
  'qasab-mint',
  'مقيم تجريبي 3',
  5,
  'تقييم سريع رقم 3 لاختبار حماية الـ Rate Limiting في السيرفر',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-12T00:02:38.854Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789171358808_6s3t',
  'qasab-mint',
  'مقيم تجريبي 2',
  5,
  'تقييم سريع رقم 2 لاختبار حماية الـ Rate Limiting في السيرفر',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-12T00:02:38.808Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789171358744_63do',
  'qasab-mint',
  'مقيم تجريبي 1',
  5,
  'تقييم سريع رقم 1 لاختبار حماية الـ Rate Limiting في السيرفر',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-12T00:02:38.755Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r_1789171358701_mmw5',
  'qasab-mint',
  'مقيم تجريبي 0',
  5,
  'تقييم سريع رقم 0 لاختبار حماية الـ Rate Limiting في السيرفر',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-12T00:02:38.702Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r1',
  'qasab-mint',
  'عمر فاروق',
  5,
  'ريحة النعناع الأخضر فايحة وطازة من أول رشفة.. أفضل مشروب لروقان المزاج بعد يوم شغل طويل.',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-09T14:20:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r2',
  'qasab-mint',
  'ريم فؤاد',
  5,
  'انتعاش لا يوصف في الصيف.. شكراً على الاهتمام بنظافة وجودة المكونات وطريقة التقديم الفخمة.',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-07T11:10:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r1',
  'qasab-fresh-concentrate',
  'كابتن طارق عبدالرحمن',
  5,
  'عصرة أولى ثقيلة ومركزة جداً تحس بالطاقة والفيتامينات في ثانية.. بديل طبيعي وصحي لمشروبات الطاقة!',
  'كبير',
  TRUE,
  TRUE,
  '2026-09-11T09:15:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r2',
  'qasab-fresh-concentrate',
  'مها الشاذلي',
  5,
  'قصب نقي ١٠٠٪ بدون تخفيف.. طعم غني جداً يروي القلب.',
  'وسط',
  TRUE,
  TRUE,
  '2026-09-10T16:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_slug, name, rating, comment, size, verified, is_approved, created_at)
VALUES (
  'r1',
  'falafel-sandwich',
  'مصطفى كامل',
  5,
  'ساندوتش فلافل سخن ومقرمش بالسمسم والطحينة مع كوباية القصب المثلجة كومبو مصري أصيل ما يتعوضش!',
  'ساندوتش كامل',
  TRUE,
  TRUE,
  '2026-09-12T01:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;