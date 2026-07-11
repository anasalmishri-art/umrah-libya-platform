"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import {
  Building2, Package, ShoppingCart, Plus, Edit, Trash2, Star,
  Phone, Mail, MapPin, FileText, Calendar, LayoutDashboard,
  TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle,
  Upload, FileImage, Sparkles, Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";

type TabKey = "overview" | "packages" | "orders" | "profile" | "upload";

export function CompanyDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const { setView } = useAppStore();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary">لوحة تحكم الشركة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مرحباً {user?.company?.name || user?.name} - إدارة باقاتك وطلباتك
          </p>
        </div>
        <Button variant="outline" onClick={() => setView("home")} size="sm">
          العودة للموقع
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <LayoutDashboard className="h-4 w-4" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Package className="h-4 w-4" />
            <span>الباقات</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Upload className="h-4 w-4" />
            <span>رفع ملف</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span>الطلبات</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Building2 className="h-4 w-4" />
            <span>بيانات الشركة</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="packages"><PackagesTab /></TabsContent>
        <TabsContent value="upload"><UploadTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============= OVERVIEW =============
function OverviewTab() {
  const { data: packagesData } = useFetch<{ packages: any[] }>("/api/packages?mine=true");
  const { data: ordersData } = useFetch<{ orders: any[] }>("/api/orders");

  const packages = packagesData?.packages || [];
  const orders = ordersData?.orders || [];

  const paidOrders = orders.filter((o) => o.status === "PAID" || o.status === "COMPLETED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING_PAYMENT");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const activePackages = packages.filter((p) => p.isActive);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Package} label="إجمالي الباقات" value={packages.length} sub={`${activePackages.length} فعّالة`} color="primary" />
        <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={orders.length} sub={`${pendingOrders.length} بانتظار الدفع`} color="chart-3" />
        <StatCard icon={DollarSign} label="الإيرادات" value={`${totalRevenue.toLocaleString()} د.ل`} sub={`${paidOrders.length} طلب مدفوع`} color="chart-4" />
        <StatCard icon={Star} label="متوسط التقييم" value={(0).toFixed(1)} sub="لا توجد تقييمات" color="accent" />
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            أحدث الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!orders.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-mono text-xs text-primary">{o.orderNumber}</div>
                    <div className="text-sm font-medium">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{o.package?.title}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-primary">{o.totalPrice.toLocaleString()} د.ل</div>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: any; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    "chart-3": "bg-chart-3/15 text-chart-3",
    "chart-4": "bg-chart-4/15 text-chart-4",
  };
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-extrabold leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        <div className="text-[10px] text-muted-foreground/70 mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

// ============= PACKAGES =============
function PackagesTab() {
  const { data, loading, refetch } = useFetch<{ packages: any[] }>("/api/packages?mine=true");
  const { toast } = useToast();
  const [modal, setModal] = useState<null | { mode: "create" | "edit"; pkg?: any }>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      toast({ title: "تم حذف الباقة" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const handleRequestFeature = async (packageId: string) => {
    try {
      const res = await fetch("/api/packages/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, action: "REQUEST" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "تم إرسال طلب التمييز", description: "سيتم مراجعته من قبل الإدارة" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">{data?.packages?.length || 0} باقة</h3>
        <Button size="sm" onClick={() => setModal({ mode: "create" })} className="bg-primary hover:bg-primary/90">
          <Plus className="ml-1 h-4 w-4" />
          إضافة باقة
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : !data?.packages?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد باقات بعد</p>
          <p className="text-xs mt-1">اضغط على "إضافة باقة" لإنشاء باقتك الأولى</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.packages.map((p: any) => (
            <Card key={p.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm line-clamp-2 flex-1">{p.title}</h3>
                  <div className="flex flex-col gap-1 items-end">
                    {p.isActive ? <Badge className="bg-green-100 text-green-700 text-[10px]">فعّالة</Badge> : <Badge className="bg-muted text-muted-foreground text-[10px]">موقوفة</Badge>}
                    {p.isFeatured && <Badge className="bg-accent text-accent-foreground text-[10px]">مميزة ✓</Badge>}
                    {p.featuredStatus === "PENDING" && <Badge className="bg-amber-100 text-amber-700 text-[10px]">تمييز معلّق</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{p.durationDays} أيام</span>
                  <span>{p.hotelStars} نجوم</span>
                  <span>{p.availableSeats} مقعد</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {p.oldPrice && <span className="text-xs text-muted-foreground line-through ml-2">{p.oldPrice.toLocaleString()}</span>}
                    <span className="font-bold text-primary">{p.price.toLocaleString()} {getCurrencySymbol(p.currency)}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setModal({ mode: "edit", pkg: p })}>
                    <Edit className="ml-1 h-3 w-3" /> تعديل
                  </Button>
                  {p.featuredStatus === "NONE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-accent text-accent-foreground hover:bg-accent/10"
                      onClick={() => handleRequestFeature(p.id)}
                    >
                      <Sparkles className="ml-1 h-3 w-3" /> طلب تمييز
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <PackageModal
          mode={modal.mode}
          pkg={modal.pkg}
          onClose={() => setModal(null)}
          onSaved={() => { refetch(); setModal(null); }}
        />
      )}
    </div>
  );
}

const packageTypes = [
  { value: "UMRAH", label: "عمرة" },
  { value: "RAMADAN", label: "عمرة رمضان" },
  { value: "HAJJ", label: "حج" },
  { value: "COMBINED", label: "عمرة وحج" },
];

function PackageModal({ mode, pkg, onClose, onSaved }: { mode: "create" | "edit"; pkg?: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<string[]>(pkg?.features ? JSON.parse(pkg.features) : [""]);
  const [form, setForm] = useState({
    id: pkg?.id || "",
    title: pkg?.title || "",
    description: pkg?.description || "",
    type: pkg?.type || "UMRAH",
    durationDays: pkg?.durationDays?.toString() || "7",
    price: pkg?.price?.toString() || "",
    oldPrice: pkg?.oldPrice?.toString() || "",
    hotelStars: pkg?.hotelStars?.toString() || "3",
    hotelName: pkg?.hotelName || "",
    departureDate: pkg?.departureDate || "",
    availableSeats: pkg?.availableSeats?.toString() || "0",
    includesTransport: pkg?.includesTransport ?? true,
    includesMeals: pkg?.includesMeals ?? false,
    includesGuide: pkg?.includesGuide ?? true,
    includesZiyarat: pkg?.includesZiyarat ?? true,
    isFeatured: pkg?.isFeatured ?? false,
    isActive: pkg?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, features: features.filter((f) => f.trim()) };
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch("/api/packages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: mode === "create" ? "تم إنشاء الباقة" : "تم تحديث الباقة" });
      onSaved();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "إضافة باقة جديدة" : "تعديل الباقة"}</DialogTitle>
          <DialogDescription>أدخل تفاصيل باقة العمرة التي تريد عرضها</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">عنوان الباقة *</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: باقة عمرة اقتصادية - 7 أيام" />
          </div>
          <div>
            <Label className="mb-1.5">وصف الباقة *</Label>
            <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="وصف تفصيلي للباقة..." className="resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packageTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">المدة (أيام) *</Label>
              <Input type="number" min="1" required value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">السعر (دينار ليبي) *</Label>
              <Input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">السعر القديم (للخصم)</Label>
              <Input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} placeholder="اتركه فارغاً إن لم يوجد خصم" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">اسم الفندق</Label>
              <Input value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} placeholder="فندق..." />
            </div>
            <div>
              <Label className="mb-1.5">تصنيف الفندق</Label>
              <Select value={form.hotelStars} onValueChange={(v) => setForm({ ...form, hotelStars: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((s) => <SelectItem key={s} value={s.toString()}>{s} نجوم</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">تاريخ الانطلاق</Label>
              <Input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">المقاعد المتاحة</Label>
              <Input type="number" min="0" value={form.availableSeats} onChange={(e) => setForm({ ...form, availableSeats: e.target.value })} />
            </div>
          </div>

          {/* Includes */}
          <div>
            <Label className="mb-2">تشمل الباقة</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-secondary/30">
                <Switch checked={form.includesTransport} onCheckedChange={(v) => setForm({ ...form, includesTransport: v })} />
                <span className="text-sm">النقل</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-secondary/30">
                <Switch checked={form.includesMeals} onCheckedChange={(v) => setForm({ ...form, includesMeals: v })} />
                <span className="text-sm">الوجبات</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-secondary/30">
                <Switch checked={form.includesGuide} onCheckedChange={(v) => setForm({ ...form, includesGuide: v })} />
                <span className="text-sm">مرشد ديني</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-secondary/30">
                <Switch checked={form.includesZiyarat} onCheckedChange={(v) => setForm({ ...form, includesZiyarat: v })} />
                <span className="text-sm">زيارات</span>
              </label>
            </div>
          </div>

          {/* Features list */}
          <div>
            <Label className="mb-2">المميزات التفصيلية</Label>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={f}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[i] = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    placeholder={`الميزة ${i + 1}`}
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setFeatures([...features, ""])}>
                <Plus className="ml-1 h-3 w-3" /> إضافة ميزة
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
              <span className="text-sm">باقة مميزة</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <span className="text-sm">فعّالة</span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "جارٍ الحفظ..." : "حفظ الباقة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============= ORDERS =============
function OrdersTab() {
  const { data, loading, refetch } = useFetch<{ orders: any[] }>("/api/orders");
  const [filter, setFilter] = useState("ALL");
  const { toast } = useToast();
  const [contactModal, setContactModal] = useState<any | null>(null);

  const orders = data?.orders || [];
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const openWhatsApp = (order: any) => {
    const phone = (order.company?.whatsapp || order.customerPhone || "").replace(/[^0-9]/g, "");
    const msg = `السلام عليكم ${order.customerName}،

بخصوص طلبك رقم ${order.orderNumber} للباقة "${order.package?.title}":
- الإجمالي: ${order.totalPrice.toLocaleString()} ${getCurrencySymbol(order.currency)}

أهلاً وسهلاً بك، نحن جاهزون لخدمتك.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setFilter("ALL")}>الكل ({orders.length})</Button>
        <Button variant={filter === "PENDING_PAYMENT" ? "default" : "outline"} size="sm" onClick={() => setFilter("PENDING_PAYMENT")}>بانتظار الدفع ({orders.filter(o => o.status === "PENDING_PAYMENT").length})</Button>
        <Button variant={filter === "PAID" ? "default" : "outline"} size="sm" onClick={() => setFilter("PAID")}>مدفوع ({orders.filter(o => o.status === "PAID").length})</Button>
        <Button variant={filter === "COMPLETED" ? "default" : "outline"} size="sm" onClick={() => setFilter("COMPLETED")}>مكتمل ({orders.filter(o => o.status === "COMPLETED").length})</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !filtered.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد طلبات في هذا القسم</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((o: any) => (
            <Card key={o.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-primary text-sm">{o.orderNumber}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <div className="text-sm font-medium">{o.package?.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div>العميل: {o.customerName}</div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{o.customerPhone}</span>
                        <span>•</span>
                        <span>{o.numPersons} أشخاص</span>
                      </div>
                      {o.notes && <div className="mt-1 text-amber-700">ملاحظات: {o.notes}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-bold text-primary">{o.totalPrice.toLocaleString()} {getCurrencySymbol(o.currency)}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("ar")}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openWhatsApp(o)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Phone className="ml-1 h-3 w-3" />
                      واتساب
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    PENDING_PAYMENT: { label: "بانتظار الدفع", class: "bg-amber-100 text-amber-700 border-amber-200" },
    PAID: { label: "تم الدفع", class: "bg-green-100 text-green-700 border-green-200" },
    CANCELLED: { label: "ملغى", class: "bg-red-100 text-red-700 border-red-200" },
    COMPLETED: { label: "مكتمل", class: "bg-blue-100 text-blue-700 border-blue-200" },
  };
  const s = map[status] || { label: status, class: "bg-muted text-muted-foreground" };
  return <Badge className={`${s.class} border`} variant="outline">{s.label}</Badge>;
}

// ============= PROFILE =============
function ProfileTab() {
  const { user } = useAuth();
  const company = user?.company;

  if (!company) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد بيانات شركة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          بيانات الشركة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4 pb-4 border-b">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.city}، {company.country}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span className="text-sm font-medium">{company.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <InfoRow icon={FileText} label="رقم الترخيص" value={company.licenseNumber || "غير محدد"} />
        <InfoRow icon={Phone} label="الهاتف" value={company.phone} />
        <InfoRow icon={Phone} label="واتساب" value={company.whatsapp || "غير محدد"} />
        <InfoRow icon={Mail} label="البريد الإلكتروني" value={company.email || "غير محدد"} />
        <InfoRow icon={MapPin} label="العنوان" value={company.address || "غير محدد"} />
        <InfoRow icon={Calendar} label="تاريخ التسجيل" value={new Date(company.createdAt).toLocaleDateString("ar")} />

        {company.description && (
          <div className="pt-4 border-t">
            <Label className="mb-2">نبذة عن الشركة</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 inline ml-1" />
          لتحديث بيانات شركتك، يرجى التواصل مع إدارة المنصة.
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium" dir={value.startsWith("+") ? "ltr" : "rtl"}>{value}</div>
      </div>
    </div>
  );
}

// ============= UPLOAD PDF/IMAGE with AI parsing =============
function UploadTab() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedPackages, setParsedPackages] = useState<any[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "نوع الملف غير مدعوم", description: "يسمح بـ: JPEG, PNG, WebP, GIF, PDF", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير", description: "الحد الأقصى 10 ميجابايت", variant: "destructive" });
      return;
    }

    setUploading(true);
    setParsedPackages(null);

    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      setUploading(false);
      setParsing(true);

      // Step 2: Convert to base64 for VLM
      const base64 = await fileToBase64(file);

      // Step 3: Parse with AI
      const parseRes = await fetch("/api/parse-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64,
          fileName: file.name,
          fileType: file.type === "application/pdf" ? "pdf" : "image",
        }),
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok || !parseData.success) {
        throw new Error(parseData.error || "فشل التحليل");
      }

      setParsedPackages(parseData.packages || []);
      toast({
        title: `تم استخراج ${parseData.packages?.length || 0} باقة`,
        description: "راجع البيانات قبل الحفظ",
      });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSaveAll = async () => {
    if (!parsedPackages || parsedPackages.length === 0) return;
    setSaving(true);
    let successCount = 0;
    let failCount = 0;

    for (const pkg of parsedPackages) {
      try {
        const res = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: pkg.title,
            description: pkg.description,
            type: pkg.type || "UMRAH",
            durationDays: pkg.durationDays || 7,
            price: pkg.price || 0,
            oldPrice: pkg.oldPrice,
            hotelStars: pkg.hotelStars || 3,
            hotelName: pkg.hotelName,
            includesTransport: pkg.includesTransport ?? true,
            includesMeals: pkg.includesMeals ?? false,
            includesGuide: pkg.includesGuide ?? true,
            includesZiyarat: pkg.includesZiyarat ?? true,
            departureDate: pkg.departureDate,
            availableSeats: pkg.availableSeats || 0,
            features: pkg.features || [],
          }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    toast({
      title: `تم حفظ ${successCount} باقة بنجاح`,
      description: failCount > 0 ? `فشل حفظ ${failCount} باقة` : undefined,
      variant: failCount > 0 ? "destructive" : "default",
    });
    setParsedPackages(null);
    setSaving(false);
  };

  const updatePackage = (index: number, field: string, value: any) => {
    if (!parsedPackages) return;
    const updated = [...parsedPackages];
    updated[index] = { ...updated[index], [field]: value };
    setParsedPackages(updated);
  };

  const removePackage = (index: number) => {
    if (!parsedPackages) return;
    setParsedPackages(parsedPackages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            رفع ملف الباقات (PDF / صورة)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            ارفع ملف PDF أو صورة يحتوي على تفاصيل باقات شركتك، وسيقوم النظام تلقائياً بقراءة المحتوى واستخراج الباقات.
          </p>
        </CardHeader>
        <CardContent>
          {!parsedPackages && !uploading && !parsing && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <FileImage className="h-16 w-16 mx-auto mb-3 text-primary/60" />
              <p className="text-sm font-medium mb-1">اسحب وأفلت الملف هنا</p>
              <p className="text-xs text-muted-foreground mb-4">أو اضغط لاختيار ملف</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <Button onClick={() => document.getElementById("file-upload")?.click()} variant="outline">
                <Upload className="ml-2 h-4 w-4" />
                اختيار ملف
              </Button>
              <p className="text-[10px] text-muted-foreground mt-3">
                الأنواع المدعومة: PDF, JPG, PNG, WebP • الحد الأقصى: 10 ميجابايت
              </p>
            </div>
          )}

          {uploading && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm font-medium">جارٍ رفع الملف...</p>
            </div>
          )}

          {parsing && (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <p className="text-sm font-medium mb-1">جارٍ تحليل المحتوى بالذكاء الاصطناعي...</p>
              <p className="text-xs text-muted-foreground">قد يستغرق هذا بعض الوقت</p>
            </div>
          )}

          {parsedPackages && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">تم استخراج {parsedPackages.length} باقة</h3>
                  <p className="text-xs text-muted-foreground">راجع البيانات أدناه وقم بتعديلها قبل الحفظ</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setParsedPackages(null)}>
                    إلغاء
                  </Button>
                  <Button size="sm" onClick={handleSaveAll} disabled={saving || parsedPackages.length === 0} className="bg-primary hover:bg-primary/90">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : `حفظ الكل (${parsedPackages.length})`}
                  </Button>
                </div>
              </div>

              {parsedPackages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>لم يتم العثور على باقات في الملف</p>
                  <p className="text-xs mt-1">جرّب رفع ملف أوضح أو أضف الباقات يدوياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedPackages.map((pkg, i) => (
                    <Card key={i} className="border-border/60">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground">باقة #{i + 1}</span>
                          <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => removePackage(i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="mb-1 text-xs">العنوان</Label>
                            <Input value={pkg.title || ""} onChange={(e) => updatePackage(i, "title", e.target.value)} className="text-sm" />
                          </div>
                          <div>
                            <Label className="mb-1 text-xs">النوع</Label>
                            <Select value={pkg.type || "UMRAH"} onValueChange={(v) => updatePackage(i, "type", v)}>
                              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UMRAH">عمرة</SelectItem>
                                <SelectItem value="RAMADAN">عمرة رمضان</SelectItem>
                                <SelectItem value="HAJJ">حج</SelectItem>
                                <SelectItem value="COMBINED">عمرة وحج</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="mb-1 text-xs">الوصف</Label>
                          <Textarea value={pkg.description || ""} onChange={(e) => updatePackage(i, "description", e.target.value)} rows={2} className="text-sm resize-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="mb-1 text-xs">المدة (أيام)</Label>
                            <Input type="number" value={pkg.durationDays || ""} onChange={(e) => updatePackage(i, "durationDays", parseInt(e.target.value) || 7)} className="text-sm" />
                          </div>
                          <div>
                            <Label className="mb-1 text-xs">السعر (د.ل)</Label>
                            <Input type="number" value={pkg.price || ""} onChange={(e) => updatePackage(i, "price", parseFloat(e.target.value) || 0)} className="text-sm" />
                          </div>
                          <div>
                            <Label className="mb-1 text-xs">الفندق (نجوم)</Label>
                            <Input type="number" min="1" max="5" value={pkg.hotelStars || ""} onChange={(e) => updatePackage(i, "hotelStars", parseInt(e.target.value) || 3)} className="text-sm" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="mb-1 text-xs">اسم الفندق</Label>
                            <Input value={pkg.hotelName || ""} onChange={(e) => updatePackage(i, "hotelName", e.target.value)} className="text-sm" />
                          </div>
                          <div>
                            <Label className="mb-1 text-xs">تاريخ الانطلاق</Label>
                            <Input type="date" value={pkg.departureDate || ""} onChange={(e) => updatePackage(i, "departureDate", e.target.value)} className="text-sm" />
                          </div>
                        </div>
                        {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                          <div>
                            <Label className="mb-1 text-xs">المميزات</Label>
                            <div className="flex flex-wrap gap-1">
                              {pkg.features.map((f: string, fi: number) => (
                                <Badge key={fi} variant="outline" className="text-[10px]">{f}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong className="block mb-1">كيف تعمل هذه الميزة؟</strong>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>ارفع ملف PDF أو صورة يحتوي على تفاصيل باقات شركتك</li>
                <li>سيقوم النظام بقراءة المحتوى باستخدام الذكاء الاصطناعي</li>
                <li>سيتم استخراج الباقات وعرضها للمراجعة</li>
                <li>عدّل البيانات إذا لزم الأمر</li>
                <li>احفظ الباقات وستظهر فوراً للعملاء</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
