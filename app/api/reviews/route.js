import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getReviews, addReview } from '../../../lib/db';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('productSlug');

    if (!productSlug) {
      return NextResponse.json(
        { success: false, message: 'مطلوب تحديد productSlug في الاستعلام' },
        { status: 400 }
      );
    }

    const reviews = await getReviews(productSlug);
    const count = reviews.length;
    const avg =
      count > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / count).toFixed(1)
        : '5.0';

    return NextResponse.json({
      success: true,
      productSlug,
      count,
      averageRating: avg,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء جلب التقييمات' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // فحص Rate Limit (حد أقصى 5 مراجعات لكل 5 دقائق لكل IP)
    const rateCheck = await checkRateLimit(request, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 5,
      prefix: 'reviews_post',
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'لقد تجاوزت الحد المسموح لإرسال التقييمات، يرجى الانتظار بضع دقائق والمحاولة لاحقاً.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetSeconds),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await request.json();
    const result = await addReview(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'بيانات التقييم غير صالحة',
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    // On-Demand ISR: إعادة توليد صفحة المنتج والـ Schema في الخلفية لتحديث الـ aggregateRating فورياً
    try {
      revalidatePath(`/menu/${body.productSlug}`);
    } catch (revalidateErr) {
      console.warn('Could not revalidate path:', revalidateErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تمت إضافة تقييمك بنجاح، شكراً لرأيك!',
        review: result.review,
        reviews: result.reviews,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      }
    );
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء حفظ التقييم' },
      { status: 500 }
    );
  }
}
