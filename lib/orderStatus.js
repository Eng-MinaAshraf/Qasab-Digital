/**
 * ==============================================================================
 * التعيين المركزي الموحد لحالات الطلب ونسب التقدم (Order Status & Progress Mapping)
 * ==============================================================================
 * يعتمد على حالات الطلب الفعلية القادمة من قاعدة البيانات (Database Status)
 * ويحدد النسبة المئوية لملء كوب عصير القصب ومرحلة التوصيل بدقة وبدون أي نسب وهمية.
 */

export const ORDER_STATUS_MAP = {
  pending: {
    percentage: 15,
    cupFill: 15,
    label: 'قيد الانتظار',
    subLabel: 'تم استلام طلبك وجاري مراجعته وتأكيده',
    stage: 'received',
    isComplete: false,
    isActive: true,
    color: '#EAB308',
    iconType: 'clock',
  },
  confirmed: {
    percentage: 30,
    cupFill: 30,
    label: 'تم تأكيد الطلب',
    subLabel: 'تم اعتماد الطلب وتوجيهه لمعصرة قصب لبدء التجهيز',
    stage: 'confirmed',
    isComplete: false,
    isActive: true,
    color: '#84CC16',
    iconType: 'check',
  },
  preparing: {
    percentage: 55,
    cupFill: 55,
    label: 'جاري التحضير',
    subLabel: 'عيدان القصب الصعيدي بتتعصر طازة ومثلجة لحظة بلحظة',
    stage: 'preparing',
    isComplete: false,
    isActive: true,
    color: '#22C55E',
    iconType: 'juice',
  },
  ready: {
    percentage: 75,
    cupFill: 75,
    label: 'جاهز للتسليم',
    subLabel: 'تم تعبئة عصير القصب في زجاجات مثلجة ومعقمة بانتظار المندوب',
    stage: 'ready',
    isComplete: false,
    isActive: true,
    color: '#16A34A',
    iconType: 'package',
  },
  out_for_delivery: {
    percentage: 90,
    cupFill: 90,
    label: 'المندوب في الطريق',
    subLabel: 'مندوب قصب انطلق وفي طريقه لعنوانك بأسرع وقت',
    stage: 'delivery',
    isComplete: false,
    isActive: true,
    color: '#15803D',
    iconType: 'scooter',
  },
  delivered: {
    percentage: 100,
    cupFill: 100,
    label: 'تم التوصيل',
    subLabel: 'وصلك بالسلامة! استمتع بعصير القصب الطبيعي وبالهنا والشفا',
    stage: 'delivered',
    isComplete: true,
    isActive: false,
    color: '#14532D',
    iconType: 'celebrate',
  },
  cancelled: {
    percentage: 0,
    cupFill: 0,
    label: 'تم الإلغاء',
    subLabel: 'تم إلغاء هذا الطلب بناءً على رغبتك أو لعدم توفر العنوان',
    stage: 'cancelled',
    isComplete: true,
    isActive: false,
    color: '#EF4444',
    iconType: 'x',
  },
};

/**
 * الحصول على بيانات ومعلومات حالة الطلب
 */
export function getOrderStatusInfo(status) {
  const normalized = (status || 'pending').toLowerCase();
  return ORDER_STATUS_MAP[normalized] || ORDER_STATUS_MAP.pending;
}
