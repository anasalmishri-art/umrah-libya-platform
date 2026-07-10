"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TabKey = "overview" | "companies" | "packages" | "orders" | "promotions" | "settings";

export function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const { setView } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary">لوحة تحكم الإدارة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة شاملة للمنصة والشركات والطلبات</p>
        </div>
        <Button variant="outline" onClick={() => setView("home")} size="sm">
          العودة للموقع
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <LayoutDashboard className="h-4 w-4" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Building2 className="h-4 w-4" />
            <span>الشركات</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Package className="h-4 w-4" />
            <span>الباقات</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span>الطلبات</span>
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Tag className="h-4 w-4" />
            <span>العروض</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Settings className="h-4 w-4" />
            <span>الإعدادات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="companies"><CompaniesTab /></TabsContent>
        <TabsContent value="packages"><PackagesTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="promotions"><PromotionsTab /></TabsContent>
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
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Building2} label="إجمالي الشركات" value={data.totalCompanies} sub={`${data.pendingCompanies} قيد المراجعة`} color="primary" />
        <StatCard icon={Package} label="إجمالي الباقات" value={data.totalPackages} sub={`${data.approvedCompanies} شركة فعّالة`} color="accent" />
        <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={data.totalOrders} sub={`${data.pendingPaymentOrders} بانتظار الدفع`} color="chart-3" />
        <StatCard icon={DollarSign} label="إجمالي الإيرادات" value={`${data.totalRevenue.toLocaleString()} ر.س`} sub={`${data.paidOrders} طلب مدفوع`} color="chart-4" />
      </div>

      {/* Quick stats */}
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

      {/* Company revenue ranking */}
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
                  <div className="font-bold text-primary">{c.revenue.toLocaleString()} ر.س</div>
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

// ============= COMPANIES =============
function CompaniesTab() {
  const { data, loading, refetch } = useFetch<{ companies: any[] }>("/api/companies?status=PENDING");
  const { data: approvedData, refetch: refetchApproved } = useFetch<{ companies: any[] }>("/api/companies?status=APPROVED");
  const { data: allData, refetch: refetchAll } = useFetch<{ companies: any[] }>("/api/companies");
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"PENDING" | "APPROVED" | "ALL">("PENDING");

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
      toast({
        title: action === "APPROVED" ? "تمت الموافقة على الشركة" : action === "REJECTED" ? "تم رفض الشركة" : "تم إيقاف الشركة",
      });
      refetch(); refetchApproved(); refetchAll();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const list = subTab === "PENDING" ? data?.companies : subTab === "APPROVED" ? approvedData?.companies : allData?.companies;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={subTab === "PENDING" ? "default" : "outline"} size="sm" onClick={() => setSubTab("PENDING")}>
          قيد المراجعة ({data?.companies?.length || 0})
        </Button>
        <Button variant={subTab === "APPROVED" ? "default" : "outline"} size="sm" onClick={() => setSubTab("APPROVED")}>
          مفعّلة ({approvedData?.companies?.length || 0})
        </Button>
        <Button variant={subTab === "ALL" ? "default" : "outline"} size="sm" onClick={() => setSubTab("ALL")}>
          الكل ({allData?.companies?.length || 0})
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : !list || list.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد شركات في هذا القسم</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {list.map((c: any) => (
            <Card key={c.id} className="border-border/60">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold">{c.name}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate" dir="ltr">{c.email}</span>
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
                      <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                        المسؤول: {c.user.email} • {c._count?.packages || 0} باقة • {c._count?.orders || 0} طلب
                      </div>
                    )}
                  </div>

                  {c.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAction(c.id, "APPROVED")}
                        disabled={actionLoading === c.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="ml-1 h-4 w-4" />
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(c.id, "REJECTED")}
                        disabled={actionLoading === c.id}
                      >
                        <XCircle className="ml-1 h-4 w-4" />
                        رفض
                      </Button>
                    </div>
                  )}
                  {c.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(c.id, "SUSPENDED")}
                      disabled={actionLoading === c.id}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      إيقاف مؤقت
                    </Button>
                  )}
                  {c.status === "SUSPENDED" && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(c.id, "APPROVED")}
                      disabled={actionLoading === c.id}
                    >
                      إعادة التفعيل
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
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
  };
  const s = map[status] || { label: status, class: "bg-muted text-muted-foreground" };
  return <Badge className={`${s.class} border`} variant="outline">{s.label}</Badge>;
}

// ============= PACKAGES (read only for admin) =============
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
                  {p.isActive ? <Badge className="bg-green-100 text-green-700">فعّالة</Badge> : <Badge className="bg-muted text-muted-foreground">موقوفة</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{p.company?.name}</div>
                <div className="text-lg font-bold text-primary mb-1">{p.price.toLocaleString()} {p.currency}</div>
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
        <Button variant={filter === "CANCELLED" ? "default" : "outline"} size="sm" onClick={() => setFilter("CANCELLED")}>ملغى ({orders.filter(o => o.status === "CANCELLED").length})</Button>
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
                      <div className="font-bold text-primary">{o.totalPrice.toLocaleString()} {o.currency}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("ar")}</div>
                    </div>
                    {o.status === "PENDING_PAYMENT" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(o.id, "PAID")}
                        disabled={updating === o.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <BadgeCheck className="ml-1 h-4 w-4" />
                        تأكيد الدفع
                      </Button>
                    )}
                    {o.status === "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(o.id, "COMPLETED")}
                        disabled={updating === o.id}
                      >
                        إكمال
                      </Button>
                    )}
                    {(o.status === "PENDING_PAYMENT" || o.status === "PAID") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(o.id, "CANCELLED")}
                        disabled={updating === o.id}
                        className="text-destructive hover:text-destructive"
                      >
                        إلغاء
                      </Button>
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
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">{data?.promotions?.length || 0} عرض</h3>
        <Button size="sm" onClick={() => setModal({ mode: "create" })} className="bg-primary hover:bg-primary/90">
          <Plus className="ml-1 h-4 w-4" />
          إضافة عرض
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : !data?.promotions?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد عروض حالياً</p>
          <p className="text-xs mt-1">اضغط على "إضافة عرض" لإنشاء عرض جديد</p>
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
                        {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `${p.discountValue} ر.س`}
                      </Badge>
                      {p.isActive ? <Badge className="bg-green-100 text-green-700">فعّال</Badge> : <Badge className="bg-muted text-muted-foreground">موقوف</Badge>}
                    </div>
                    <h3 className="font-bold mt-2">{p.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                <div className="text-xs text-muted-foreground mb-3">من {p.startDate} إلى {p.endDate}</div>
                <div className="flex gap-2">
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
        <PromotionModal
          mode={modal.mode}
          promo={modal.promo}
          onClose={() => setModal(null)}
          onSaved={() => { refetch(); setModal(null); }}
        />
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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
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
          <DialogDescription>أنشئ عروض تخفيضات على الباقات</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">عنوان العرض *</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: عرض رمضان - خصم 20%" />
          </div>
          <div>
            <Label className="mb-1.5">الوصف</Label>
            <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="وصف موجز للعرض" className="resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">نوع الخصم</Label>
              <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">نسبة مئوية %</SelectItem>
                  <SelectItem value="FIXED">مبلغ ثابت</SelectItem>
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
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============= SETTINGS =============
function SettingsTab() {
  const { data, loading } = useFetch<{ settings: any }>("/api/settings");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: "",
    whatsapp_number: "",
    hero_title: "",
    hero_subtitle: "",
  });

  // Initialize form when data loads
  useEffect(() => {
    if (data?.settings) {
      setForm({
        site_name: data.settings.site_name || "",
        whatsapp_number: data.settings.whatsapp_number || "",
        hero_title: data.settings.hero_title || "",
        hero_subtitle: data.settings.hero_subtitle || "",
      });
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
        <CardTitle className="text-base">إعدادات الموقع</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">اسم الموقع</Label>
            <Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">رقم واتساب الرئيسي</Label>
            <Input dir="ltr" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="text-right" />
          </div>
          <div>
            <Label className="mb-1.5">عنوان الصفحة الرئيسية</Label>
            <Input value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">النص الفرعي للصفحة الرئيسية</Label>
            <Textarea value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} rows={2} className="resize-none" />
          </div>
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
