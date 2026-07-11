import { db } from "@/lib/db";

export interface AutoMessage {
  type: string;
  title: string;
  content: string;
}

/**
 * Generate automatic messages for a new order
 * These messages guide the customer through the Umrah process
 */
export async function createOrderMessages(
  orderId: string,
  customerId: string | null,
  customerName: string,
  customerPhone: string,
  order: any
): Promise<void> {
  if (!customerId) return; // Only create messages for registered customers

  const messages: AutoMessage[] = [
    {
      type: "BOOKING_CONFIRMATION",
      title: "تم استلام طلبك بنجاح",
      content: `السلام عليكم ${customerName}،

تم استلام طلبك رقم ${order.orderNumber} للباقة "${order.package?.title}" بنجاح.

تفاصيل طلبك:
- رقم الطلب: ${order.orderNumber}
- الباقة: ${order.package?.title}
- عدد الأشخاص: ${order.numPersons}
- الإجمالي: ${order.totalPrice.toLocaleString()} ${order.currency}
- الحالة: بانتظار الدفع

الخطوة التالية: يرجى التواصل مع شركة ${order.company?.name} عبر واتساب لإتمام عملية الدفع.

شكراً لاختياركم منصة عمرة ليبيا. نسأل الله أن يتقبل عمركم.`,
    },
    {
      type: "PAYMENT_INSTRUCTIONS",
      title: "تعليمات الدفع",
      content: `مرحباً ${customerName}،

لإتمام عملية الدفع الخاصة بطلبكم رقم ${order.orderNumber}، يرجى اتباع الخطوات التالية:

1. التواصل مع شركة ${order.company?.name} عبر واتساب على الرقم: ${order.company?.whatsapp || order.company?.phone}
2. سيتم تحويلك لإتمام الدفع عبر إحدى الطرق التالية:
   - تحويل بنكي
   - الدفع النقدي في مقر الشركة
   - محفظة إلكترونية
3. بعد إتمام الدفع، أرسل إثبات الدفع للشركة
4. ستقوم إدارة المنصة بتأكيد الدفع وتحديث حالة طلبك

ملاحظة: لا يتم تأكيد الحجز إلا بعد إتمام عملية الدفع بالكامل.`,
    },
    {
      type: "UMRAH_GUIDE",
      title: "دليل أداء العمرة - خطوات تفصيلية",
      content: `نقدم لكم دليل مختصر لأداء العمرة:

1️⃣ الإحرام:
- الاغتسال والتطيب قبل الإحرام
- لبس ملابس الإحرام (للرجال: إزار ورداء أبيضين)
- النية: "لبيك عمرة"
- التلبية: "لبيك اللهم لبيك، لبيك لا شريك لك لبيك"

2️⃣ الطواف:
- الدخول من باب السلام
- الطواف 7 أشواط حول الكعبة
- الصلاة خلف مقام إبراهيم (ركعتان)

3️⃣ السعي:
- السعي 7 أشواط بين الصفا والمروة
- البدء من الصفا والانتهاء بالمروة

4️⃣ الحلق أو التقصير:
- يقوم المعتمر بحلق شعره أو تقصيره
- بذلك تكتمل العمرة

📅 موعدها: ${order.package?.departureDate || "حسب جدول الرحلة"}
🏢 الشركة: ${order.company?.name}

للمساعدة، تواصل مع مرشدكم الديني أو شركة ${order.company?.name}.`,
    },
    {
      type: "PRE_DEPARTURE_CHECKLIST",
      title: "قائمة التجهيزات قبل السفر",
      content: `قائمة التجهيزات المطلوبة لرحلتك إلى بيت الله الحرام:

📄 الأوراق المطلوبة:
- جواز سفر ساري المفعول (6 أشهر على الأقل)
- صور من جواز السفر
- تذكرة الطيران ذهاب وعودة
- تأشيرة العمرة

💰 المال:
- مبلغ نقدي للمصاريف الشخصية
- بطاقة بنكية دولية

🧳 الأمتعة:
- ملابس الإحرام (للرجال)
- ملابس محتشمة (للنساء)
- أحذية مريحة للمشي
- أدوات النظافة الشخصية
- أدوية شخصية
- شاحن الهاتف

📱 التطبيقات المفيدة:
- تطبيق توي Perception للحجز
- تطبيق رحلتي لمتابعة الرحلة
- تطبيق أوقات الصلاة

🕌 نصائح مهمة:
- احرص على شرب الماء بكثرة
- تجنب الزحام قدر الإمكان
- احتفظ بأرقام الطوارئ
- اتبع تعليمات المرشد الديني

موعد السفر: ${order.package?.departureDate || "سيتم تحديده لاحقاً"}
الشركة المسؤولة: ${order.company?.name}
رقم التواصل: ${order.company?.whatsapp || order.company?.phone}`,
    },
  ];

  for (const msg of messages) {
    await db.message.create({
      data: {
        customerId,
        orderId,
        type: msg.type,
        title: msg.title,
        content: msg.content,
        isRead: false,
      },
    });
  }
}

/**
 * Create a payment confirmation message
 */
export async function createPaymentConfirmationMessage(
  orderId: string,
  customerId: string | null,
  customerName: string,
  order: any
): Promise<void> {
  if (!customerId) return;

  await db.message.create({
    data: {
      customerId,
      orderId,
      type: "PAYMENT_CONFIRMED",
      title: "تم تأكيد الدفع - حجزك مؤكد",
      content: `السلام عليكم ${customerName}،

يسعدنا إبلاغكم بأنه تم تأكيد دفع طلبكم رقم ${order.orderNumber}.

تفاصيل الحجز المؤكد:
- رقم الطلب: ${order.orderNumber}
- الباقة: ${order.package?.title}
- الشركة: ${order.company?.name}
- عدد الأشخاص: ${order.numPersons}
- الإجمالي: ${order.totalPrice.toLocaleString()} ${order.currency}
- الحالة: مدفوع ✓

🎉 مبروك! حجزكم مؤكد الآن. 

سيتم التواصل معكم قريباً من قبل شركة ${order.company?.name} لتحديد موعد السفر وتفاصيل الاستلام.

يرجى مراجعة قسم "الرسائل" لمتابعة دليل العمرة وقائمة التجهيزات.

نسأل الله أن يتقبل عمركم وذنبكم.`,
      isRead: false,
    },
  });
}

/**
 * Create a status update message
 */
export async function createStatusUpdateMessage(
  orderId: string,
  customerId: string | null,
  customerName: string,
  order: any,
  newStatus: string
): Promise<void> {
  if (!customerId) return;

  const statusMessages: Record<string, { title: string; content: string }> = {
    COMPLETED: {
      title: "اكتملت رحلتك - تقبل الله",
      content: `السلام عليكم ${customerName}،

نسأل الله أن يتقبل عمركم وأن يجعله خالصاً لوجهه الكريم.

تم تحديث حالة طلبكم رقم ${order.orderNumber} إلى: مكتمل.

شكراً لاختياركم منصة عمرة ليبيا. نرجو منكم تقييم الخدمة لمساعدتنا في التحسين المستمر.

نتمنى لكم التوفيق ونرآكم في رحلات قادمة بإذن الله.`,
    },
    CANCELLED: {
      title: "تم إلغاء طلبك",
      content: `السلام عليكم ${customerName}،

نحيطكم علماً بأنه تم إلغاء طلبكم رقم ${order.orderNumber}.

إذا كان لديكم أي استفسار، يرجى التواصل مع شركة ${order.company?.name} أو إدارة المنصة.

نتمنى لكم التوفيق ونعود لنرآكم قريباً.`,
    },
  };

  const msg = statusMessages[newStatus];
  if (!msg) return;

  await db.message.create({
    data: {
      customerId,
      orderId,
      type: "STATUS_UPDATE",
      title: msg.title,
      content: msg.content,
      isRead: false,
    },
  });
}
