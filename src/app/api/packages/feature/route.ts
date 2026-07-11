import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST: request featured status for a package (company)
// Or approve/reject featured status (admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { packageId, action } = body;
    // action: REQUEST (company) | APPROVE | REJECT (admin)

    if (!packageId || !action) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    if (action === "REQUEST") {
      // Company requests featured status
      if (user.role !== "COMPANY" || !user.company) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const pkg = await db.package.findUnique({ where: { id: packageId } });
      if (!pkg || pkg.companyId !== user.company.id) {
        return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
      }

      const updated = await db.package.update({
        where: { id: packageId },
        data: { featuredStatus: "PENDING" },
      });

      return NextResponse.json({ success: true, package: updated });
    }

    if (action === "APPROVE" || action === "REJECT") {
      // Admin approves or rejects
      if (user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
      const isFeatured = action === "APPROVE";

      const updated = await db.package.update({
        where: { id: packageId },
        data: { featuredStatus: newStatus, isFeatured },
      });

      return NextResponse.json({ success: true, package: updated });
    }

    if (action === "REMOVE") {
      // Company removes featured request
      if (user.role !== "COMPANY" || !user.company) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const pkg = await db.package.findUnique({ where: { id: packageId } });
      if (!pkg || pkg.companyId !== user.company.id) {
        return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
      }

      const updated = await db.package.update({
        where: { id: packageId },
        data: { featuredStatus: "NONE", isFeatured: false },
      });

      return NextResponse.json({ success: true, package: updated });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Feature package error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
