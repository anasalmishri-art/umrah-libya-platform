"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFetch } from "@/hooks/use-fetch";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart, Bell, User, Clock, CheckCircle2, XCircle,
  MessageSquare, Package, Phone, Mail, Calendar, ArrowRight,
  BookOpen, AlertCircle, BellRing,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";

type TabKey = "overview" | "orders" | "messages" | "profile";

export function CustomerDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const { setView } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary">حسابي</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة طلباتك ورسائلك وملفك الشخصي</p>
        </div>
        <Button variant="outline" onClick={() => setView("home")} size="sm">
          العودة للموقع
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <User className="h-4 w-4" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span>طلباتي</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <Bell className="h-4 w-4" />
            <span>الرسائل</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2 text-xs md:text-sm">
            <User className="h-4 w-4" />
            <span>ملفي</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="messages"><MessagesTab /></TabsContent>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { data: ordersData } = useFetch<{ orders: any[] }>("/api/orders");
  const { data: messagesData } = useFetch<{ messages: any[] }>("/api/messages");

  const orders = ordersData?.orders || [];
  const messages = messagesData?.messages || [];
  const unreadMessages = messages.filter((m) => !m.isRead);
  const paidOrders = orders.filter((o) => o.status === "PAID" || o.status === "COMPLETED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING_PAYMENT");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card><CardContent className="p-4">
          <ShoppingCart className="h-8 w-8 text-primary mb-2" />
          <div className="text-2xl font-extrabold">{orders.length}</div>
          <div className="text-xs text-muted-foreground">إجمالي الطلبات</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <Clock className="h-8 w-8 text-amber-600 mb-2" />
          <div className="text-2xl font-extrabold">{pendingOrders.length}</div>
          <div className="text-xs text-muted-foreground">بانتظار الدفع</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
          <div className="text-2xl font-extrabold">{paidOrders.length}</div>
          <div className="text-xs text-muted-foreground">طلبات مؤكدة</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <BellRing className="h-8 w-8 text-blue-600 mb-2" />
          <div className="text-2xl font-extrabold">{unreadMessages.length}</div>
          <div className="text-xs text-muted-foreground">رسائل غير مقروءة</div>
        </CardContent></Card>
      </div>

      {unreadMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              أحدث الرسائل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unreadMessages.slice(0, 3).map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{m.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{m.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              أحدث الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders.slice(0, 3).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-mono text-xs text-primary">{o.orderNumber}</div>
                    <div className="text-sm font-medium">{o.package?.title}</div>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data, loading } = useFetch<{ orders: any[] }>("/api/orders");

  if (loading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  if (!data?.orders?.length) {
    return (
      <Card><CardContent className="py-12 text-center text-muted-foreground">
        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>لا توجد طلبات بعد</p>
        <p className="text-xs mt-1">تصفح الباقات واحجز عمرة أحلامك</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-2">
      {data.orders.map((o: any) => (
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
                  {o.company?.name} • {o.numPersons} أشخاص • {new Date(o.createdAt).toLocaleDateString("ar")}
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-primary">{o.totalPrice.toLocaleString()} {getCurrencySymbol(o.currency)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MessagesTab() {
  const { data, loading, refetch } = useFetch<{ messages: any[] }>("/api/messages");
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const markAsRead = async (messageId: string) => {
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  if (!data?.messages?.length) {
    return (
      <Card><CardContent className="py-12 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>لا توجد رسائل</p>
        <p className="text-xs mt-1">ستصلك رسائل تلقائية عند حجز باقة</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-2">
      {data.messages.map((m: any) => (
        <Card
          key={m.id}
          className={`border-border/60 cursor-pointer hover:border-primary/30 transition-all ${!m.isRead ? "bg-primary/5" : ""}`}
          onClick={() => {
            setSelectedMessage(m);
            if (!m.isRead) markAsRead(m.id);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${getMessageIcon(m.type).bg}`}>
                {getMessageIcon(m.type).icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm">{m.title}</h3>
                  {!m.isRead && <Badge className="bg-primary text-primary-foreground text-[10px]">جديد</Badge>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{m.content}</p>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(m.createdAt).toLocaleString("ar")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selectedMessage} onOpenChange={(v) => !v && setSelectedMessage(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">{selectedMessage?.title}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {selectedMessage?.content}
          </div>
          {selectedMessage?.order && (
            <div className="bg-secondary/30 rounded-lg p-3 mt-4 text-xs">
              <div className="font-semibold mb-1">الطلب المرتبط:</div>
              <div>رقم الطلب: {selectedMessage.order.orderNumber}</div>
              <div>الباقة: {selectedMessage.order.package?.title}</div>
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-4">
            {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString("ar")}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          ملفي الشخصي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
            {user.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg">{user.name}</h3>
            <Badge className="bg-primary/10 text-primary">{user.role === "CUSTOMER" ? "عميل" : user.role}</Badge>
          </div>
        </div>

        <InfoRow icon={Mail} label="البريد الإلكتروني" value={user.email} />
        <InfoRow icon={Phone} label="الهاتف" value={user.phone || "غير محدد"} />
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
        <div className="text-sm font-medium" dir={value.includes("@") || value.startsWith("+") ? "ltr" : "rtl"}>{value}</div>
      </div>
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

function getMessageIcon(type: string) {
  const map: Record<string, { icon: any; bg: string }> = {
    BOOKING_CONFIRMATION: { icon: <CheckCircle2 className="h-5 w-5 text-green-600" />, bg: "bg-green-100" },
    PAYMENT_INSTRUCTIONS: { icon: <AlertCircle className="h-5 w-5 text-amber-600" />, bg: "bg-amber-100" },
    PAYMENT_CONFIRMED: { icon: <CheckCircle2 className="h-5 w-5 text-green-600" />, bg: "bg-green-100" },
    UMRAH_GUIDE: { icon: <BookOpen className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
    PRE_DEPARTURE_CHECKLIST: { icon: <Package className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100" },
    APPOINTMENT_REMINDER: { icon: <Calendar className="h-5 w-5 text-purple-600" />, bg: "bg-purple-100" },
    STATUS_UPDATE: { icon: <Bell className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
    WELCOME: { icon: <User className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
  };
  return map[type] || { icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />, bg: "bg-muted" };
}
