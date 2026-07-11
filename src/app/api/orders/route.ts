import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createOrderMessages } from "@/lib/auto-messages";
import bcrypt from "bcryptjs";

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
    if (status) where.status = status;

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
    const body = await req.json();
    const {
      packageId,
      customerName,
      customerPhone,
      customerEmail,
      numPersons,
      notes,
    } = body;

    if (!packageId || !customerName || !customerPhone) {
      return NextResponse.json({ error: "البيانات الأساسية مطلوبة" }, { status: 400 });
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
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const newCustomer = await db.user.create({
          data: {
            email: customerEmail.toLowerCase(),
            password: hashedPassword,
            name: customerName,
            phone: customerPhone,
            role: "CUSTOMER",
          },
        });
        customerId = newCustomer.id;
      }
    }

    const totalPrice = pkg.price * (parseInt(numPersons) || 1);
    const orderNumber = `UMR-${Date.now().toString().slice(-8)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        packageId: pkg.id,
        companyId: pkg.companyId,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        numPersons: parseInt(numPersons) || 1,
        notes,
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
      await createOrderMessages(order.id, customerId, customerName, customerPhone, order);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 });
  }
}
