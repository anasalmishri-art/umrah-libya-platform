import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeText } from "@/lib/security";

// أنواع الباقات المسموح بها
const VALID_PACKAGE_TYPES = ["UMRAH", "RAMADAN", "HAJJ", "COMBINED", "ALL"];

// GET: list packages (public gets only active, company gets their own, admin gets all)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const mine = searchParams.get("mine");
    const user = await getCurrentUser();

    const where: any = {};

    if (mine === "true" && user?.role === "COMPANY" && user.company) {
      where.companyId = user.company.id;
    } else if (mine === "true" && user?.role === "SUPER_ADMIN") {
      // admin sees all
    } else {
      where.isActive = true;
      where.company = { status: "APPROVED" };
      // تنظيف companyId من XSS
      if (companyId) {
        where.companyId = sanitizeText(companyId, 100);
      }
    }

    // التحقق من صحة type
    if (type && type !== "ALL" && VALID_PACKAGE_TYPES.includes(type)) {
      where.type = type;
    }
    if (featured === "true") where.isFeatured = true;

    const packages = await db.package.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, logo: true, rating: true, city: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("GET /api/packages error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST: create a new package (company only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COMPANY" || !user.company) {
      return NextResponse.json({ error: "غير مصرح. يجب تسجيل الدخول كشركة" }, { status: 403 });
    }
    if (user.company.status !== "APPROVED") {
      return NextResponse.json({ error: "حساب الشركة غير مفعّل" }, { status: 403 });
    }

    const body = await req.json();
    const pkg = await db.package.create({
      data: {
        companyId: user.company.id,
        title: body.title,
        description: body.description,
        type: body.type || "UMRAH",
        durationDays: parseInt(body.durationDays) || 7,
        price: parseFloat(body.price) || 0,
        oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
        currency: body.currency || "LYD",
        hotelStars: parseInt(body.hotelStars) || 3,
        hotelName: body.hotelName || null,
        includesTransport: !!body.includesTransport,
        includesMeals: !!body.includesMeals,
        includesGuide: !!body.includesGuide,
        includesZiyarat: !!body.includesZiyarat,
        departureDate: body.departureDate || null,
        availableSeats: parseInt(body.availableSeats) || 0,
        features: body.features ? JSON.stringify(body.features) : null,
        isFeatured: !!body.isFeatured,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الباقة" }, { status: 500 });
  }
}

// PUT: update a package (company owner only)
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COMPANY" || !user.company) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    const existing = await db.package.findUnique({ where: { id } });
    if (!existing || existing.companyId !== user.company.id) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    const updateData: any = {};
    const fields = [
      "title", "description", "type", "durationDays", "price", "oldPrice",
      "currency", "hotelStars", "hotelName", "departureDate", "availableSeats",
    ];
    fields.forEach((f) => {
      if (data[f] !== undefined) {
        if (["durationDays", "hotelStars", "availableSeats"].includes(f)) {
          updateData[f] = parseInt(data[f]);
        } else if (["price", "oldPrice"].includes(f)) {
          updateData[f] = data[f] ? parseFloat(data[f]) : null;
        } else {
          updateData[f] = data[f];
        }
      }
    });
    ["includesTransport", "includesMeals", "includesGuide", "includesZiyarat", "isFeatured", "isActive"].forEach((f) => {
      if (data[f] !== undefined) updateData[f] = !!data[f];
    });
    if (data.features) updateData.features = JSON.stringify(data.features);

    const pkg = await db.package.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error("Update package error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE: delete a package
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COMPANY" || !user.company) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف الباقة مطلوب" }, { status: 400 });

    const existing = await db.package.findUnique({ where: { id } });
    if (!existing || existing.companyId !== user.company.id) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    await db.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete package error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
