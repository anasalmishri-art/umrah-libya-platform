import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createOrderMessages } from "@/lib/auto-messages";
import bcrypt from "bcryptjs";
import {
  getClientIP,
  isValidEmail,
  isValidPhone,
  sanitizeText,
} from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit-redis";
import { isIPBanned } from "@/lib/audit-log";

// GET: list orders (admin: all, company: their own, customer: their own)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      // التحقق من صحة قيمة الـ status
      const validStatuses = ["PENDING_PAYMENT", "PAID", "CANCELLED", "COMPLETED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
      }
      where.status = status;
    }

    if (user.role === "SUPER_ADMIN") {
      // all orders
    } else if (user.role === "COMPANY" && user.company) {
      where.companyId = user.company.id;
    } else {
      where.customerId = user.id;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        package: { select: { id: true, title: true, type: true, durationDays: true, hotelName: true } },
        company: { select: { id: true, name: true, phone: true, whatsapp: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST: create a new order (customer or guest)
export async function POST(req: NextRequest) {
  try {
    // ===== Rate Limiting (Redis) =====
    const ip = getClientIP(req);

    // التحقق من حظر IP
    const banCheck = await isIPBanned(ip);
    if (banCheck.banned) {
      return NextResponse.json(
        { error: `تم حظر عنوان IP الخاص بك. السبب: ${banCheck.reason}` },
        { status: 403 }
      );
    }

    const rateLimitResult = await checkRateLimit("order", ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز عدد الطلبات المسموح. حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    const body = await req.json();
    const {
      packageId,
      customerName,
      customerPhone,
      customerEmail,
      numPersons,
      notes,
    } = body;

    // ===== التحقق من الحقول المطلوبة =====
    if (!packageId || !customerName || !customerPhone) {
      return NextResponse.json({ error: "البيانات الأساسية مطلوبة" }, { status: 400 });
    }

    // ===== التحقق من صحة المدخلات =====
    if (typeof packageId !== "string" || packageId.length > 100) {
      return NextResponse.json({ error: "معرف الباقة غير صحيح" }, { status: 400 });
    }

    const cleanName = sanitizeText(customerName, 100);
    if (cleanName.length < 3) {
      return NextResponse.json({ error: "الاسم قصير جداً" }, { status: 400 });
    }

    if (!isValidPhone(customerPhone)) {
      return NextResponse.json({ error: "رقم الهاتف غير صحيح" }, { status: 400 });
    }

    if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    }

    // التحقق من عدد الأشخاص
    const persons = parseInt(numPersons) || 1;
    if (persons < 1 || persons > 20) {
      return NextResponse.json({ error: "عدد الأشخاص غير صحيح (1-20)" }, { status: 400 });
    }

    const pkg = await db.package.findUnique({
      where: { id: packageId, isActive: true },
      include: { company: true },
    });

    if (!pkg || pkg.company.status !== "APPROVED") {
      return NextResponse.json({ error: "الباقة غير متاحة" }, { status: 404 });
    }

    const user = await getCurrentUser();
    let customerId: string | null = null;

    // Auto-create or link customer account
    if (user && user.role === "CUSTOMER") {
      customerId = user.id;
    } else if (customerEmail) {
      // Try to find existing customer by email, or create one
      const existingUser = await db.user.findUnique({ where: { email: customerEmail.toLowerCase() } });
      if (existingUser) {
        customerId = existingUser.id;
      } else {
        // Auto-create a customer account with random password
        const randomPassword = Math.random().toString(36).slice(-12) + "A1!"; // كلمة مرور قوية
        const hashedPassword = await bcrypt.hash(randomPassword, 12);
        const newCustomer = await db.user.create({
          data: {
            email: customerEmail.toLowerCase(),
            password: hashedPassword,
            name: cleanName,
            phone: sanitizeText(customerPhone, 20),
            role: "CUSTOMER",
          },
        });
        customerId = newCustomer.id;
      }
    }

    const totalPrice = pkg.price * persons;
    const orderNumber = `UMR-${Date.now().toString().slice(-8)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        packageId: pkg.id,
        companyId: pkg.companyId,
        customerId,
        customerName: cleanName,
        customerPhone: sanitizeText(customerPhone, 20),
        customerEmail: customerEmail ? customerEmail.toLowerCase() : null,
        numPersons: persons,
        notes: notes ? sanitizeText(notes, 500) : null,
        totalPrice,
        currency: pkg.currency,
        status: "PENDING_PAYMENT",
        paymentMethod: "WHATSAPP",
      },
      include: {
        package: { select: { title: true, type: true, durationDays: true, departureDate: true } },
        company: { select: { name: true, phone: true, whatsapp: true } },
      },
    });

    // Create auto messages for the customer
    if (customerId) {
      await createOrderMessages(order.id, customerId, cleanName, customerPhone, order);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 });
  }
}
