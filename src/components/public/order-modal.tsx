"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, User, Phone, Mail, Users, FileText, CheckCircle2, ArrowLeft } from "lucide-react";

export function OrderModal() {
  const { authModal, selectedPackageForOrder, closeModals } = useAppStore();
  const open = authModal === "order";
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    numPersons: "1",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  if (!selectedPackageForOrder) return null;

  const pkg = selectedPackageForOrder;
  const totalPrice = pkg.price * (parseInt(form.numPersons) || 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail,
          numPersons: form.numPersons,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessOrder(data.order);
      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "سيتم تحويلك الآن إلى واتساب لإتمام عملية الدفع",
      });
    } catch (e: any) {
      toast({
        title: "حدث خطأ",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsAppMessage = (order: any) => {
    const msg = `السلام عليكم ورحمة الله،

أرغب في حجز باقة العمرة التالية:

📦 *رقم الطلب:* ${order.orderNumber}
🕌 *الباقة:* ${pkg.title}
🏢 *الشركة:* ${order.company.name}
📅 *المدة:* ${pkg.durationDays} أيام

👤 *بيانات العميل:*
- الاسم: ${form.customerName}
- الهاتف: ${form.customerPhone}
${form.customerEmail ? `- البريد: ${form.customerEmail}` : ""}
- عدد الأشخاص: ${form.numPersons}

💰 *الإجمالي:* ${order.totalPrice.toLocaleString()} ${order.currency}
${form.notes ? `\n📝 *ملاحظات:* ${form.notes}` : ""}

أرجو تأكيد الحجز وطريقة الدفع. شكراً لكم.`;

    return encodeURIComponent(msg);
  };

  const openWhatsApp = (order: any) => {
    const phone = (order.company.whatsapp || order.company.phone || "").replace(/[^0-9]/g, "");
    const message = buildWhatsAppMessage(order);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    closeModals();
    setSuccessOrder(null);
    setForm({ customerName: "", customerPhone: "", customerEmail: "", numPersons: "1", notes: "" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          closeModals();
          setSuccessOrder(null);
          setForm({ customerName: "", customerPhone: "", customerEmail: "", numPersons: "1", notes: "" });
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">
            {successOrder ? "تم إنشاء طلبك بنجاح" : "حجز الباقة"}
          </DialogTitle>
          <DialogDescription>
            {successOrder
              ? "أكمل إجراءات الدفع عبر واتساب"
              : `املأ بياناتك لإتمام حجز باقة: ${pkg.title}`}
          </DialogDescription>
        </DialogHeader>

        {successOrder ? (
          // Success view
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="font-bold text-lg mb-1">تم استلام طلبك!</h3>
              <p className="text-sm text-muted-foreground">
                رقم طلبك: <span className="font-mono font-bold text-primary">{successOrder.orderNumber}</span>
              </p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الباقة:</span>
                <span className="font-medium">{pkg.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الأشخاص:</span>
                <span className="font-medium">{successOrder.numPersons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحالة:</span>
                <span className="font-medium text-amber-600">بانتظار الدفع</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الإجمالي:</span>
                <span className="font-bold text-primary text-lg">
                  {successOrder.totalPrice.toLocaleString()} {successOrder.currency}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>ملاحظة:</strong> سيتم تحويلك إلى واتساب للتواصل مع الشركة وإتمام عملية الدفع. بعد تأكيد الدفع، ستقوم إدارة المنصة بتحديث حالة طلبك إلى "تم الدفع".
            </div>

            <Button
              size="lg"
              onClick={() => openWhatsApp(successOrder)}
              className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold"
            >
              <MessageCircle className="ml-2 h-5 w-5" />
              المتابعة عبر واتساب
            </Button>

            <Button variant="outline" onClick={closeModals} className="w-full">
              إغلاق
            </Button>
          </div>
        ) : (
          // Form view
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order summary */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">الباقة:</span>
                <span className="font-medium">{pkg.title}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">سعر الفرد:</span>
                <span className="font-medium">{pkg.price.toLocaleString()} {pkg.currency}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">الإجمالي التقديري:</span>
                <span className="font-bold text-primary text-lg">
                  {totalPrice.toLocaleString()} {pkg.currency}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> الاسم الكامل *
              </Label>
              <Input
                id="name"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> رقم الهاتف / واتساب *
              </Label>
              <Input
                id="phone"
                required
                type="tel"
                dir="ltr"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="+966 5XX XXX XXX"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email" className="mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <Label htmlFor="persons" className="mb-1.5 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> عدد الأشخاص
                </Label>
                <Input
                  id="persons"
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.numPersons}
                  onChange={(e) => setForm({ ...form, numPersons: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> ملاحظات إضافية
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="أي ملاحظات أو طلبات خاصة..."
                className="resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <strong>كيف تتم عملية الحجز؟</strong>
              <ol className="list-decimal list-inside mt-1.5 space-y-0.5">
                <li>املأ البيانات وأرسل الطلب</li>
                <li>سيتم تحويلك إلى واتساب الشركة لإتمام الدفع</li>
                <li>بعد الدفع، ستقوم إدارة المنصة بتأكيد طلبك</li>
              </ol>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={closeModals} className="sm:ml-2">
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 flex-1">
                {submitting ? "جارٍ إنشاء الطلب..." : "إنشاء الطلب ومتابعة واتساب"}
                {!submitting && <ArrowLeft className="mr-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
