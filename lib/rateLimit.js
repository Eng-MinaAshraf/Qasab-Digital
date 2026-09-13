import { getSupabaseAdminClient } from './supabase/admin.js';

/**
 * مخزن محلي احتياطي (Fallback Store) للتشغيل بدون اتصال قاعدة بيانات
 */
const inMemoryStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryStore.entries()) {
    if (now > record.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}, 120000).unref?.();

/**
 * استخراج IP الحقيقي للعميل مع دعم Reverse Proxies و Cloudflare و Vercel
 */
export function getClientIp(request) {
  if (!request || !request.headers) return '127.0.0.1';

  const cfConnectingIp = request.headers.get?.('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const vercelForwarded = request.headers.get?.('x-vercel-forwarded-for');
  if (vercelForwarded) return vercelForwarded.split(',')[0].trim();

  const realIp = request.headers.get?.('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get?.('x-forwarded-for');
  if (forwarded) {
    const clientIp = forwarded.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  return '127.0.0.1';
}

/**
 * فحص Rate Limit باستخدام PostgreSQL الموزع (Supabase) لحماية حقيقية عبر كافة الـ Instances،
 * مع fallback ذكي للمخزن المحلي عند غياب الاتصال.
 *
 * ⚠️ ملاحظة معمارية موثقة (Architectural Trade-off):
 * الاستعلام عن rate_limits عبر PostgreSQL يوفر أماناً موزعاً بدون بنية تحتية إضافية وهو كافٍ
 * ومثالي لحجم المتجر الحالي. في حال التوسع والنمو العالي، يمكن ترقية المخزن إلى Upstash Redis
 * أو Vercel Edge Config للحصول على زمن استجابة دون الميلي ثانية في الذاكرة.
 */
export async function checkRateLimit(request, { windowMs = 300000, maxRequests = 5, prefix = 'general' } = {}) {
  const ip = getClientIp(request);
  const admin = getSupabaseAdminClient();

  if (admin) {
    try {
      const windowStartThreshold = new Date(Date.now() - windowMs).toISOString();

      // البحث عن سجل الفحص للـ IP الحالي في نافذة الوقت
      const { data: existingRecords, error: selectErr } = await admin
        .from('rate_limits')
        .select('id, count, window_start')
        .eq('ip', ip)
        .eq('action', prefix)
        .gte('window_start', windowStartThreshold)
        .order('window_start', { ascending: false })
        .limit(1);

      if (!selectErr && existingRecords && existingRecords.length > 0) {
        const record = existingRecords[0];
        const currentCount = (record.count || 0) + 1;
        const recordStartTime = new Date(record.window_start).getTime();
        const elapsed = Date.now() - recordStartTime;
        const resetSeconds = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));

        // تحديث العداد
        await admin
          .from('rate_limits')
          .update({ count: currentCount })
          .eq('id', record.id);

        if (currentCount > maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetSeconds,
            ip,
          };
        }

        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - currentCount),
          resetSeconds,
          ip,
        };
      }

      // إدراج سجل جديد لنافذة الوقت الحالية
      await admin.from('rate_limits').insert({
        ip,
        action: prefix,
        count: 1,
        window_start: new Date().toISOString(),
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetSeconds: Math.ceil(windowMs / 1000),
        ip,
      };
    } catch (err) {
      console.warn('⚠️ خطأ في PostgreSQL Rate Limit، جاري استخدام المخزن الاحتياطي:', err.message);
    }
  }

  // Fallback: المخزن المحلي في الذاكرة
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  let record = inMemoryStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    inMemoryStore.set(key, record);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
      ip,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
      ip,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - record.count),
    resetSeconds,
    ip,
  };
}

export function _resetRateLimits() {
  inMemoryStore.clear();
}
