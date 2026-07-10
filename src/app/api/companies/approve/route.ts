import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST: approve / reject / suspend a company
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { companyId, action } = body; // action: APPROVED | REJECTED | SUSPENDED

    if (!companyId || !action) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const company = await db.company.update({
      where: { id: companyId },
      data: { status: action },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Approve company error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
