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
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import {
  Building2, Package, ShoppingCart, Users, TrendingUp, Settings, CheckCircle2,
  XCircle, Clock, DollarSign, Tag, Plus, Edit, Trash2, Star, Phone, Mail,
  LayoutDashboard, FileText, Calendar, ArrowRight, AlertCircle, BadgeCheck,
  Sparkles, UserPlus, KeyRound, Copy, ImageIcon, FileImage,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";

type TabKey = "overview" | "companies" | "packages" | "orders" | "promotions" | "featured" | "cms" | "settings";

export function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const { setView } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary">لوحة تحكم الإدارة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة شاملة للمنصة والشركات والطلبات والمحتوى</p>
        </div>
        <Button variant="outline" onClick={() => setView("home")} size="sm">
          العودة للموقع
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <LayoutDashboard className="h-4 w-4" />
            <span>نظرة</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <Building2 className="h-4 w-4" />
            <span>الشركات</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <Package className="h-4 w-4" />
            <span>الباقات</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span>الطلبات</span>
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <Tag className="h-4 w-4" />
            <span>العروض</span>
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <Sparkles className="h-4 w-4" />
            <span>التمييز</span>
          </TabsTrigger>
          <TabsTrigger value="cms" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <Edit className="h-4 w-4" />
            <span>المحتوى</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col items-center gap-1 py-2 text-[11px] md:text-sm">
            <Settings className="h-4 w-4" />
            <span>الإعدادات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="companies"><CompaniesTab /></TabsContent>
        <TabsContent value="packages"><PackagesTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="promotions"><PromotionsTab /></TabsContent>
        <TabsContent value="featured"><FeaturedTab /></TabsContent>
        <TabsContent value="cms"><CMSTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============= OVERVIEW =============
function OverviewTab() {
  const { data, loading } = useFetch<any>("/api/stats");

  if (loading) return <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Building2} label="إجمالي الشركات" value={data.totalCompanies} sub={`${data.pendingCompanies} قيد المراجعة`} color="primary" />
        <StatCard icon={Package} label="إجمالي الباقات" value={data.totalPackages} sub={`${data.approvedCompanies} شركة فعّالة`} color="accent" />
        <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={data.totalOrders} sub={`${data.pendingPaymentOrders} بانتظار الدفع`} color="chart-3" />
        <StatCard icon={DollarSign} label="إجمالي الإيرادات" value={`${data.totalRevenue.toLocaleString()} د.ل`} sub={`${data.paidOrders} طلب مدفوع`} color="chart-4" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.pendingPaymentOrders}</div>
              <div className="text-xs text-muted-foreground">طلبات بانتظار الدفع</div>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.paidOrders}</div>
              <div className="text-xs text-muted-foreground">طلبات مكتملة الدفع</div>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.totalCustomers}</div>
              <div className="text-xs text-muted-foreground">عميل مسجّل</div>
            </div>
          </div>
        </CardContent></Card>
      </div>

      {data.companyRevenue?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              ترتيب الشركات حسب الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.companyRevenue.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.orders} طلب</div>
                  </div>
                  <div className="font-bold text-primary">{c.revenue.toLocaleString()} د.ل</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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

// ============= COMPANIES (with full info + create + reset password) =============
function CompaniesTab() {
  const { data: pendingData, refetch: refetchPending } = useFetch<{ companies: any[] }>("/api/companies?status=PENDING");
  const { data: approvedData, refetch: refetchApproved } = useFetch<{ companies: any[] }>("/api/companies?status=APPROVED");
  const { data: allData, refetch: refetchAll } = useFetch<{ companies: any[] }>("/api/companies");
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"PENDING" | "APPROVED" | "ALL">("PENDING");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState<any>(null);
  const [detailModal, setDetailModal] = useState<any>(null);

  const refetchAlls = () => { refetchPending(); refetchApproved(); refetchAll(); };

  const handleAction = async (companyId: string, action: string) => {
    setActionLoading(companyId);
    try {
      const res = await fetch("/api/companies/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: action === "APPROVED" ? "تمت الموافقة على الشركة" : action === "REJECTED" ? "تم رفض الشركة" : "تم إيقاف الشركة" });
      refetchAlls();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm("هل أنت متأكد من إعادة تعيين كلمة المرور؟ سيتم توليد كلمة مرور جديدة.")) return;
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCredentialsModal(data.user);
      toast({ title: "تم إعادة تعيين كلمة المرور" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  const list = subTab === "PENDING" ? pendingData?.companies : subTab === "APPROVED" ? approvedData?.companies : allData?.companies;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant={subTab === "PENDING" ? "default" : "outline"} size="sm" onClick={() => setSubTab("PENDING")}>
            قيد المراجعة ({pendingData?.companies?.length || 0})
          </Button>
          <Button variant={subTab === "APPROVED" ? "default" : "outline"} size="sm" onClick={() => setSubTab("APPROVED")}>
            مفعّلة ({approvedData?.companies?.length || 0})
          </Button>
          <Button variant={subTab === "ALL" ? "default" : "outline"} size="sm" onClick={() => setSubTab("ALL")}>
            الكل ({allData?.companies?.length || 0})
          </Button>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
          <UserPlus className="ml-1 h-4 w-4" />
          إنشاء حساب شركة
        </Button>
      </div>

      {list && list.length > 0 ? (
        <div className="space-y-3">
          {list.map((c: any) => (
            <Card key={c.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold">{c.name}</h3>
                      <StatusBadge status={c.status} />
                      {c.isFeatured && <Badge className="bg-accent text-accent-foreground">مميزة</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{c.phone}</span>
                      </div>
                      {c.user?.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate" dir="ltr">{c.user.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{c.city}</span>
                      </div>
                      {c.licenseNumber && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span dir="ltr">{c.licenseNumber}</span>
                        </div>
                      )}
                    </div>
                    {c.user && (
                      <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                        <span>المسؤول: {c.user.name || c.user.email}</span>
                        <button
                          onClick={() => handleResetPassword(c.user.id)}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <KeyRound className="h-3 w-3" />
                          إعادة تعيين كلمة المرور
                        </button>
                        <button
                          onClick={() => setDetailModal(c)}
                          className="text-primary hover:underline"
                        >
                          عرض كل التفاصيل
                        </button>
                      </div>
                    )}
                  </div>

                  {c.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => handleAction(c.id, "APPROVED")} disabled={actionLoading === c.id} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="ml-1 h-4 w-4" /> موافقة
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(c.id, "REJECTED")} disabled={actionLoading === c.id}>
                        <XCircle className="ml-1 h-4 w-4" /> رفض
                      </Button>
                    </div>
                  )}
                  {c.status === "APPROVED" && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(c.id, "SUSPENDED")} disabled={actionLoading === c.id} className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      إيقاف مؤقت
                    </Button>
                  )}
                  {c.status === "SUSPENDED" && (
                    <Button size="sm" onClick={() => handleAction(c.id, "APPROVED")} disabled={actionLoading === c.id}>
                      إعادة التفعيل
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد شركات في هذا القسم</p>
        </CardContent></Card>
      )}

      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(user) => {
            setCredentialsModal(user);
            setShowCreateModal(false);
            refetchAlls();
          }}
        />
      )}

      {/* Credentials display modal */}
      {credentialsModal && (
        <Dialog open onOpenChange={(v) => !v && setCredentialsModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                بيانات الدخول
              </DialogTitle>
              <DialogDescription>انسخ هذه البيانات وشاركها مع الشركة</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">البريد الإلكتروني</div>
                  <div className="font-mono font-bold" dir="ltr">{credentialsModal.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">كلمة المرور</div>
                  <div className="font-mono font-bold text-primary" dir="ltr">{credentialsModal.password}</div>
                </div>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`البريد: ${credentialsModal.email}\nكلمة المرور: ${credentialsModal.password}`);
                  toast({ title: "تم النسخ" });
                }}
                className="w-full"
              >
                <Copy className="ml-2 h-4 w-4" />
                نسخ البيانات
              </Button>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 inline ml-1" />
                احتفظ بهذه البيانات! لن تتمكن من رؤية كلمة المرور مرة أخرى.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Company detail modal */}
      {detailModal && (
        <Dialog open onOpenChange={(v) => !v && setDetailModal(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-primary">تفاصيل الشركة</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <DetailRow label="اسم الشركة" value={detailModal.name} />
              <DetailRow label="البريد الإلكتروني" value={detailModal.user?.email} />
              <DetailRow label="اسم المسؤول" value={detailModal.user?.name} />
              <DetailRow label="هاتف المسؤول" value={detailModal.user?.phone} />
              <DetailRow label="هاتف الشركة" value={detailModal.phone} />
              <DetailRow label="واتساب" value={detailModal.whatsapp} />
              <DetailRow label="بريد الشركة" value={detailModal.email} />
              <DetailRow label="رقم الترخيص" value={detailModal.licenseNumber} />
              <DetailRow label="المدينة" value={detailModal.city} />
              <DetailRow label="الدولة" value={detailModal.country} />
              <DetailRow label="العنوان" value={detailModal.address} />
              <DetailRow label="الموقع الإلكتروني" value={detailModal.website} />
              <DetailRow label="التقييم" value={detailModal.rating?.toFixed(1)} />
              <div>
                <div className="text-xs text-muted-foreground mb-1">الوصف</div>
                <div className="bg-secondary/30 rounded-lg p-3">{detailModal.description}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 pb-2 border-b border-border/40">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-sm" dir={value.includes("@") || value.startsWith("+") || /^\d/.test(value) ? "ltr" : "rtl"}>{value}</span>
    </div>
  );
}

function CreateCompanyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (user: any) => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    companyName: "",
    description: "",
    licenseNumber: "",
    companyPhone: "",
    whatsapp: "",
    companyEmail: "",
    address: "",
    city: "طرابلس",
    country: "ليبيا",
    website: "",
    autoApprove: true,
  });

  const set = (key: string, val: any) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/create-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "تم إنشاء الحساب بنجاح" });
      onCreated(data.user);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const pwd = Math.random().toString(36).slice(-10);
    set("password", pwd);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">إنشاء حساب شركة جديد</DialogTitle>
          <DialogDescription>أدخل بيانات الشركة. سيتم توليد بيانات الدخول تلقائياً ويمكنك مشاركتها مع الشركة.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2">بيانات الدخول</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5">البريد الإلكتروني *</Label>
                <Input required type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="company@umrah.ly" className="text-right" />
              </div>
              <div>
                <Label className="mb-1.5">كلمة المرور *</Label>
                <div className="flex gap-2">
                  <Input required dir="ltr" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="text-right" />
                  <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="توليد كلمة مرور عشوائية">
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">اسم المسؤول *</Label>
              <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="اسم المسؤول عن الحساب" />
            </div>
            <div>
              <Label className="mb-1.5">هاتف المسؤول</Label>
              <Input dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+218 91XXX XXX" className="text-right" />
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2">بيانات الشركة</h3>
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5">اسم الشركة *</Label>
                <Input required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="شركة كذا للعمرة" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">هاتف الشركة *</Label>
                  <Input required dir="ltr" value={form.companyPhone} onChange={(e) => set("companyPhone", e.target.value)} placeholder="+218 91XXX XXX" className="text-right" />
                </div>
                <div>
                  <Label className="mb-1.5">واتساب</Label>
                  <Input dir="ltr" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+218 91XXX XXX" className="text-right" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">بريد الشركة</Label>
                  <Input type="email" dir="ltr" value={form.companyEmail} onChange={(e) => set("companyEmail", e.target.value)} placeholder="info@company.ly" className="text-right" />
                </div>
                <div>
                  <Label className="mb-1.5">رقم الترخيص</Label>
                  <Input dir="ltr" value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} placeholder="UMR-LY-XXXX" className="text-right" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">المدينة *</Label>
                  <Select value={form.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["طرابلس","بنغازي","مصراتة","الزاوية","زليتن","صبراتة","الخمس","سبها","البيضاء","طبرق","درنة","ترهونة","غريان","أوباري"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5">الدولة</Label>
                  <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5">العنوان التفصيلي</Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="الحي، الشارع..." />
              </div>
              <div>
                <Label className="mb-1.5">نبذة عن الشركة</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="resize-none" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.autoApprove} onChange={(e) => set("autoApprove", e.target.checked)} className="rounded" />
            <span className="text-sm">تفعيل الشركة فوراً (بدون انتظار المراجعة)</span>
          </label>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============= PACKAGES =============
function PackagesTab() {
  const { data, loading } = useFetch<{ packages: any[] }>("/api/packages?mine=true");
  return (
    <div>
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : !data?.packages?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد باقات حالياً</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.packages.map((p: any) => (
            <Card key={p.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm line-clamp-1">{p.title}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    {p.isFeatured && <Badge className="bg-accent text-accent-foreground text-[10px]">مميزة</Badge>}
                    {p.featuredStatus === "PENDING" && <Badge className="bg-amber-100 text-amber-700 text-[10px]">تمييز معلّق</Badge>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{p.company?.name}</div>
                <div className="text-lg font-bold text-primary mb-1">{p.price.toLocaleString()} {getCurrencySymbol(p.currency)}</div>
                <div className="text-xs text-muted-foreground">{p.durationDays} أيام • {p.hotelStars} نجوم</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= ORDERS =============
function OrdersTab() {
  const { data, loading, refetch } = useFetch<{ orders: any[] }>("/api/orders");
  const { toast } = useToast();
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const orders = data?.orders || [];
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "تم تحديث حالة الطلب" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
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
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-sm font-medium">{o.package?.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {o.company?.name} • العميل: {o.customerName} ({o.customerPhone}) • {o.numPersons} أشخاص
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-bold text-primary">{o.totalPrice.toLocaleString()} {getCurrencySymbol(o.currency)}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("ar")}</div>
                    </div>
                    {o.status === "PENDING_PAYMENT" && (
                      <Button size="sm" onClick={() => updateStatus(o.id, "PAID")} disabled={updating === o.id} className="bg-green-600 hover:bg-green-700">
                        <BadgeCheck className="ml-1 h-4 w-4" /> تأكيد الدفع
                      </Button>
                    )}
                    {o.status === "PAID" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "COMPLETED")} disabled={updating === o.id}>إكمال</Button>
                    )}
                    {(o.status === "PENDING_PAYMENT" || o.status === "PAID") && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(o.id, "CANCELLED")} disabled={updating === o.id} className="text-destructive hover:text-destructive">إلغاء</Button>
                    )}
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

// ============= PROMOTIONS =============
function PromotionsTab() {
  const { data, loading, refetch } = useFetch<{ promotions: any[] }>("/api/promotions");
  const { toast } = useToast();
  const [modal, setModal] = useState<null | { mode: "create" | "edit"; promo?: any }>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      const res = await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      toast({ title: "تم حذف العرض" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/promotions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionId: id, action: "APPROVE" }),
      });
      if (!res.ok) throw new Error("فشل");
      toast({ title: "تمت الموافقة على العرض" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">{data?.promotions?.length || 0} عرض</h3>
        <Button size="sm" onClick={() => setModal({ mode: "create" })} className="bg-primary hover:bg-primary/90">
          <Plus className="ml-1 h-4 w-4" /> إضافة عرض
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : !data?.promotions?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد عروض حالياً</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {data.promotions.map((p: any) => (
            <Card key={p.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent text-accent-foreground">
                        {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `${p.discountValue} د.ل`}
                      </Badge>
                      <StatusBadge status={p.status} />
                    </div>
                    <h3 className="font-bold mt-2">{p.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                <div className="text-xs text-muted-foreground mb-3">من {p.startDate} إلى {p.endDate}</div>
                <div className="flex gap-2">
                  {p.status === "PENDING" && (
                    <Button size="sm" onClick={() => handleApprove(p.id)} className="bg-green-600 hover:bg-green-700 flex-1">
                      <CheckCircle2 className="ml-1 h-3 w-3" /> موافقة
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setModal({ mode: "edit", promo: p })}>
                    <Edit className="ml-1 h-3 w-3" /> تعديل
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <PromotionModal mode={modal.mode} promo={modal.promo} onClose={() => setModal(null)} onSaved={() => { refetch(); setModal(null); }} />
      )}
    </div>
  );
}

function PromotionModal({ mode, promo, onClose, onSaved }: { mode: "create" | "edit"; promo?: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: promo?.id || "",
    title: promo?.title || "",
    description: promo?.description || "",
    discountType: promo?.discountType || "PERCENTAGE",
    discountValue: promo?.discountValue?.toString() || "10",
    startDate: promo?.startDate || new Date().toISOString().slice(0, 10),
    endDate: promo?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: promo?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = "/api/promotions";
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: mode === "create" ? "تم إنشاء العرض" : "تم تحديث العرض" });
      onSaved();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "إضافة عرض جديد" : "تعديل العرض"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">عنوان العرض *</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: عرض رمضان - خصم 20%" />
          </div>
          <div>
            <Label className="mb-1.5">الوصف</Label>
            <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">نوع الخصم</Label>
              <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">نسبة مئوية %</SelectItem>
                  <SelectItem value="FIXED">مبلغ ثابت (د.ل)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">قيمة الخصم</Label>
              <Input type="number" min="0" step="0.1" required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">تاريخ البداية</Label>
              <Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">تاريخ النهاية</Label>
              <Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            <span>العرض فعّال</span>
          </label>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============= FEATURED APPROVALS =============
function FeaturedTab() {
  const { data: companiesData, refetch: refetchCompanies } = useFetch<{ companies: any[] }>("/api/companies");
  const { data: packagesData, refetch: refetchPackages } = useFetch<{ packages: any[] }>("/api/packages?mine=true");
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<"companies" | "packages">("companies");

  const handleFeatureAction = async (id: string, action: string, type: "company" | "package") => {
    try {
      const url = type === "company" ? "/api/companies/feature" : "/api/packages/feature";
      const bodyKey = type === "company" ? "companyId" : "packageId";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: action === "APPROVE" ? "تمت الموافقة على التمييز" : "تم رفض التمييز" });
      refetchCompanies();
      refetchPackages();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  const pendingCompanies = (companiesData?.companies || []).filter((c: any) => c.featuredStatus === "PENDING");
  const pendingPackages = (packagesData?.packages || []).filter((p: any) => p.featuredStatus === "PENDING");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={subTab === "companies" ? "default" : "outline"} size="sm" onClick={() => setSubTab("companies")}>
          شركات تطلب تمييزاً ({pendingCompanies.length})
        </Button>
        <Button variant={subTab === "packages" ? "default" : "outline"} size="sm" onClick={() => setSubTab("packages")}>
          باقات تطلب تمييزاً ({pendingPackages.length})
        </Button>
      </div>

      {subTab === "companies" ? (
        pendingCompanies.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>لا توجد طلبات تمييز شركات معلّقة</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pendingCompanies.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.city} • تقييم: {c.rating?.toFixed(1)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFeatureAction(c.id, "APPROVE", "company")} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="ml-1 h-4 w-4" /> موافقة
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleFeatureAction(c.id, "REJECT", "company")}>
                      <XCircle className="ml-1 h-4 w-4" /> رفض
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        pendingPackages.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>لا توجد طلبات تمييز باقات معلّقة</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pendingPackages.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.company?.name} • {p.price.toLocaleString()} {getCurrencySymbol(p.currency)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleFeatureAction(p.id, "APPROVE", "package")} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="ml-1 h-4 w-4" /> موافقة
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleFeatureAction(p.id, "REJECT", "package")}>
                      <XCircle className="ml-1 h-4 w-4" /> رفض
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ============= CMS (Content Management) =============
function CMSTab() {
  const { data, loading, refetch } = useFetch<{ settings: any }>("/api/settings");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("brand");
  const [logoUploading, setLogoUploading] = useState(false);

  // Local state for settings
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.settings) {
      setLocalSettings({ ...data.settings });
    }
  }, [data]);

  const set = (key: string, value: string) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: localSettings }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      toast({ title: "تم حفظ المحتوى بنجاح" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set("site_logo", data.url);
      toast({ title: "تم رفع الشعار" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  const sections = [
    { key: "brand", label: "الهوية والشعار" },
    { key: "hero", label: "القسم الرئيسي" },
    { key: "stats", label: "الإحصائيات" },
    { key: "why", label: "لماذا نختارنا" },
    { key: "sections", label: "عناوين الأقسام" },
    { key: "cta", label: "دعوة للتسجيل" },
    { key: "about", label: "من نحن" },
    { key: "contact", label: "التواصل" },
    { key: "footer", label: "التذييل" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <Button
            key={s.key}
            variant={activeSection === s.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(s.key)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{sections.find(s => s.key === activeSection)?.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSection === "brand" && (
            <>
              <div>
                <Label className="mb-1.5">اسم الموقع</Label>
                <Input value={localSettings.site_name || ""} onChange={(e) => set("site_name", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">الشعار (Tagline)</Label>
                <Input value={localSettings.site_tagline || ""} onChange={(e) => set("site_tagline", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">شعار الموقع (Logo)</Label>
                <div className="flex items-center gap-3">
                  {localSettings.site_logo && (
                    <img src={localSettings.site_logo} alt="logo" className="h-16 w-16 object-contain border rounded-lg" />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      disabled={logoUploading}
                    >
                      <ImageIcon className="ml-2 h-4 w-4" />
                      {logoUploading ? "جارٍ الرفع..." : "رفع شعار"}
                    </Button>
                    {localSettings.site_logo && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => set("site_logo", "")} className="mr-2 text-destructive">
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "hero" && (
            <>
              <div>
                <Label className="mb-1.5">شارة القسم الرئيسي</Label>
                <Input value={localSettings.hero_badge || ""} onChange={(e) => set("hero_badge", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">العنوان الرئيسي</Label>
                <Input value={localSettings.hero_title || ""} onChange={(e) => set("hero_title", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">النص الفرعي</Label>
                <Textarea value={localSettings.hero_subtitle || ""} onChange={(e) => set("hero_subtitle", e.target.value)} rows={2} className="resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">زر رئيسي</Label>
                  <Input value={localSettings.hero_cta_primary || ""} onChange={(e) => set("hero_cta_primary", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5">زر ثانوي</Label>
                  <Input value={localSettings.hero_cta_secondary || ""} onChange={(e) => set("hero_cta_secondary", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {activeSection === "stats" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">عدد الشركات</Label>
                  <Input value={localSettings.stat_companies || ""} onChange={(e) => set("stat_companies", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5">وصف الشركات</Label>
                  <Input value={localSettings.stat_companies_label || ""} onChange={(e) => set("stat_companies_label", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">عدد الباقات</Label>
                  <Input value={localSettings.stat_packages || ""} onChange={(e) => set("stat_packages", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5">وصف الباقات</Label>
                  <Input value={localSettings.stat_packages_label || ""} onChange={(e) => set("stat_packages_label", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">عدد العملاء</Label>
                  <Input value={localSettings.stat_customers || ""} onChange={(e) => set("stat_customers", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5">وصف العملاء</Label>
                  <Input value={localSettings.stat_customers_label || ""} onChange={(e) => set("stat_customers_label", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5">سنوات الخبرة</Label>
                  <Input value={localSettings.stat_experience || ""} onChange={(e) => set("stat_experience", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5">وصف الخبرة</Label>
                  <Input value={localSettings.stat_experience_label || ""} onChange={(e) => set("stat_experience_label", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {activeSection === "why" && (
            <>
              <div>
                <Label className="mb-1.5">العنوان</Label>
                <Input value={localSettings.why_title || ""} onChange={(e) => set("why_title", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">النص الفرعي</Label>
                <Input value={localSettings.why_subtitle || ""} onChange={(e) => set("why_subtitle", e.target.value)} />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-semibold">الميزة {i}</div>
                  <Input value={localSettings[`feature_${i}_title`] || ""} onChange={(e) => set(`feature_${i}_title`, e.target.value)} placeholder="العنوان" />
                  <Textarea value={localSettings[`feature_${i}_desc`] || ""} onChange={(e) => set(`feature_${i}_desc`, e.target.value)} placeholder="الوصف" rows={2} className="resize-none" />
                </div>
              ))}
            </>
          )}

          {activeSection === "sections" && (
            <>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                <div className="text-sm font-semibold">الشركات المميزة</div>
                <Input value={localSettings.featured_companies_title || ""} onChange={(e) => set("featured_companies_title", e.target.value)} placeholder="العنوان" />
                <Input value={localSettings.featured_companies_subtitle || ""} onChange={(e) => set("featured_companies_subtitle", e.target.value)} placeholder="النص الفرعي" />
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                <div className="text-sm font-semibold">العروض</div>
                <Input value={localSettings.promotions_title || ""} onChange={(e) => set("promotions_title", e.target.value)} placeholder="العنوان" />
                <Input value={localSettings.promotions_subtitle || ""} onChange={(e) => set("promotions_subtitle", e.target.value)} placeholder="النص الفرعي" />
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                <div className="text-sm font-semibold">كل الشركات</div>
                <Input value={localSettings.all_companies_title || ""} onChange={(e) => set("all_companies_title", e.target.value)} placeholder="العنوان" />
                <Input value={localSettings.all_companies_subtitle || ""} onChange={(e) => set("all_companies_subtitle", e.target.value)} placeholder="النص الفرعي" />
              </div>
            </>
          )}

          {activeSection === "cta" && (
            <>
              <div>
                <Label className="mb-1.5">العنوان</Label>
                <Input value={localSettings.cta_title || ""} onChange={(e) => set("cta_title", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">الوصف</Label>
                <Textarea value={localSettings.cta_desc || ""} onChange={(e) => set("cta_desc", e.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="mb-1.5">نص الزر</Label>
                <Input value={localSettings.cta_button || ""} onChange={(e) => set("cta_button", e.target.value)} />
              </div>
            </>
          )}

          {activeSection === "about" && (
            <>
              <div>
                <Label className="mb-1.5">العنوان</Label>
                <Input value={localSettings.about_title || ""} onChange={(e) => set("about_title", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">الوصف</Label>
                <Textarea value={localSettings.about_desc || ""} onChange={(e) => set("about_desc", e.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="mb-1.5">عنوان الرسالة</Label>
                <Input value={localSettings.about_mission_title || ""} onChange={(e) => set("about_mission_title", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">نص الرسالة</Label>
                <Textarea value={localSettings.about_mission_desc || ""} onChange={(e) => set("about_mission_desc", e.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="mb-1.5">عنوان الرؤية</Label>
                <Input value={localSettings.about_vision_title || ""} onChange={(e) => set("about_vision_title", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">نص الرؤية</Label>
                <Textarea value={localSettings.about_vision_desc || ""} onChange={(e) => set("about_vision_desc", e.target.value)} rows={3} className="resize-none" />
              </div>
            </>
          )}

          {activeSection === "contact" && (
            <>
              <div>
                <Label className="mb-1.5">رقم الهاتف</Label>
                <Input dir="ltr" value={localSettings.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} className="text-right" />
              </div>
              <div>
                <Label className="mb-1.5">واتساب</Label>
                <Input dir="ltr" value={localSettings.contact_whatsapp || ""} onChange={(e) => set("contact_whatsapp", e.target.value)} className="text-right" />
              </div>
              <div>
                <Label className="mb-1.5">البريد الإلكتروني</Label>
                <Input dir="ltr" value={localSettings.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} className="text-right" />
              </div>
              <div>
                <Label className="mb-1.5">العنوان</Label>
                <Input value={localSettings.contact_address || ""} onChange={(e) => set("contact_address", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">ساعات العمل</Label>
                <Input value={localSettings.contact_hours || ""} onChange={(e) => set("contact_hours", e.target.value)} />
              </div>
            </>
          )}

          {activeSection === "footer" && (
            <>
              <div>
                <Label className="mb-1.5">نبذة التذييل</Label>
                <Textarea value={localSettings.footer_about || ""} onChange={(e) => set("footer_about", e.target.value)} rows={2} className="resize-none" />
              </div>
              <div>
                <Label className="mb-1.5">حقوق النشر</Label>
                <Input value={localSettings.footer_copyright || ""} onChange={(e) => set("footer_copyright", e.target.value)} />
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= SETTINGS =============
function SettingsTab() {
  const { data, loading } = useFetch<{ settings: any }>("/api/settings");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    whatsapp_number: "",
  });

  useEffect(() => {
    if (data?.settings) {
      setForm({ whatsapp_number: data.settings.whatsapp_number || "" });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      toast({ title: "تم حفظ الإعدادات" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">إعدادات عامة</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">رقم واتساب الرئيسي</Label>
            <Input dir="ltr" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="text-right" />
            <p className="text-xs text-muted-foreground mt-1">يُستخدم للتواصل العام والاستفسارات</p>
          </div>
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    PENDING: { label: "قيد المراجعة", class: "bg-amber-100 text-amber-700 border-amber-200" },
    APPROVED: { label: "مفعّلة", class: "bg-green-100 text-green-700 border-green-200" },
    REJECTED: { label: "مرفوضة", class: "bg-red-100 text-red-700 border-red-200" },
    SUSPENDED: { label: "موقوفة", class: "bg-orange-100 text-orange-700 border-orange-200" },
    PENDING_PAYMENT: { label: "بانتظار الدفع", class: "bg-amber-100 text-amber-700 border-amber-200" },
    PAID: { label: "تم الدفع", class: "bg-green-100 text-green-700 border-green-200" },
    CANCELLED: { label: "ملغى", class: "bg-red-100 text-red-700 border-red-200" },
    COMPLETED: { label: "مكتمل", class: "bg-blue-100 text-blue-700 border-blue-200" },
    NONE: { label: "عادية", class: "bg-muted text-muted-foreground" },
  };
  const s = map[status] || { label: status, class: "bg-muted text-muted-foreground" };
  return <Badge className={`${s.class} border`} variant="outline">{s.label}</Badge>;
}
