import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST: request featured status for a company
// Or approve/reject featured status (admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { companyId, action } = body;
    // action: REQUEST (company) | APPROVE | REJECT (admin)

    if (!companyId || !action) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    if (action === "REQUEST") {
      if (user.role !== "COMPANY" || !user.company || user.company.id !== companyId) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const updated = await db.company.update({
        where: { id: companyId },
        data: { featuredStatus: "PENDING" },
      });

      return NextResponse.json({ success: true, company: updated });
    }

    if (action === "APPROVE" || action === "REJECT") {
      if (user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
      const isFeatured = action === "APPROVE";

      const updated = await db.company.update({
        where: { id: companyId },
        data: { featuredStatus: newStatus, isFeatured },
      });

      return NextResponse.json({ success: true, company: updated });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Feature company error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
