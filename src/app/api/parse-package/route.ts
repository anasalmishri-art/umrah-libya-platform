import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import ZAI from "z-ai-web-dev-sdk";

// POST: parse packages from uploaded PDF/image using VLM
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COMPANY" || !user.company) {
      return NextResponse.json({ error: "غير مصرح. يجب تسجيل الدخول كشركة" }, { status: 403 });
    }

    const body = await req.json();
    const { fileData, fileName, fileType } = body;

    if (!fileData) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    // Initialize the AI SDK
    const zai = await ZAI.create();

    // Build the prompt for parsing packages
    const prompt = `أنت مساعد ذكي متخصص في استخراج بيانات باقات العمرة من المستندات والصور.

قم بتحليل الملف المرفق واستخراج جميع باقات العمرة المذكورة فيه.

لكل باقة، استخرج البيانات التالية (إذا كانت متوفرة):
1. title: عنوان الباقة (مطلوب)
2. description: وصف الباقة (مطلوب)
3. type: نوع الباقة - اختر واحدة من: UMRAH (عمرة عادية), RAMADAN (عمرة رمضان), HAJJ (حج), COMBINED (عمرة وحج)
4. durationDays: عدد أيام الباقة (رقم)
5. price: السعر بالدينار الليبي (رقم فقط بدون رمز العملة)
6. oldPrice: السعر القديم إذا وجد (للخصم)
7. hotelStars: تصنيف الفندق من 1 إلى 5 (رقم)
8. hotelName: اسم الفندق
9. includesTransport: هل تشمل النقل؟ (true/false)
10. includesMeals: هل تشمل الوجبات؟ (true/false)
11. includesGuide: هل تشمل مرشد ديني؟ (true/false)
12. includesZiyarat: هل تشمل جولات الزيارة؟ (true/false)
13. departureDate: تاريخ الانطلاق (بصيغة YYYY-MM-DD إذا أمكن)
14. availableSeats: عدد المقاعد المتاحة (رقم)
15. features: قائمة بالمميزات (مصفوفة من النصوص)

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي:
{
  "packages": [
    {
      "title": "...",
      "description": "...",
      "type": "UMRAH",
      "durationDays": 7,
      "price": 8500,
      "oldPrice": null,
      "hotelStars": 3,
      "hotelName": "...",
      "includesTransport": true,
      "includesMeals": false,
      "includesGuide": true,
      "includesZiyarat": true,
      "departureDate": "2026-08-15",
      "availableSeats": 50,
      "features": ["ميزة 1", "ميزة 2"]
    }
  ]
}

إذا لم تجد أي باقات، أرجع: {"packages": []}
إذا كانت البيانات غير واضحة، استخرج ما تستطيع واترك الحقول الأخرى فارغة أو null.`;

    // Determine content type
    let contentItems: any[] = [{ type: "text", text: prompt }];

    if (fileType === "pdf" || fileName?.toLowerCase().endsWith(".pdf")) {
      // Use file_url for PDF
      contentItems.push({
        type: "file_url",
        file_url: { url: fileData },
      });
    } else {
      // Use image_url for images
      contentItems.push({
        type: "image_url",
        image_url: { url: fileData },
      });
    }

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: contentItems,
        },
      ],
      thinking: { type: "disabled" },
    });

    const content = response.choices[0]?.message?.content || "";

    // Try to extract JSON from the response
    let packages: any[] = [];
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        packages = parsed.packages || [];
      }
    } catch (e) {
      console.error("Failed to parse VLM response:", e);
      return NextResponse.json({
        success: false,
        error: "لم يتمكن النظام من قراءة المحتوى بشكل صحيح. يرجى المحاولة مرة أخرى أو إدخال الباقات يدوياً.",
        rawResponse: content,
      });
    }

    return NextResponse.json({
      success: true,
      packages,
      rawResponse: content,
    });
  } catch (error) {
    console.error("Parse package error:", error);
    return NextResponse.json({
      success: false,
      error: "حدث خطأ أثناء تحليل الملف. يرجى المحاولة مرة أخرى.",
    }, { status: 500 });
  }
}
