import { NextResponse } from 'next/server';
import { getProducts, updateProduct } from '../../../../lib/db';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Admin GET products error:', error);
    return NextResponse.json({ success: false, message: 'تعذر جلب المنتجات' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, message: 'معرف المنتج والتعديلات مطلوبة' }, { status: 400 });
    }

    const res = await updateProduct(id, updates);
    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Admin PUT products error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء تعديل المنتج' }, { status: 500 });
  }
}
