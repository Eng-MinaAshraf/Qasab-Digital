import { NextResponse } from 'next/server';
import { getFinancialSummary } from '../../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const expenses = parseFloat(searchParams.get('expenses') || '0');

    const summary = await getFinancialSummary({ period, fixedExpenses: expenses });
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Admin GET reports error:', error);
    return NextResponse.json({ success: false, message: 'تعذر حساب التقرير المالي' }, { status: 500 });
  }
}
