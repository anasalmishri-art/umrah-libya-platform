"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Phone, Building2, MapPin, FileText, Globe, Star, Loader2, LogIn, UserPlus } from "lucide-react";

export function AuthModals() {
  const { authModal, closeModals, setAuthModal } = useAppStore();
  const { toast } = useToast();

  return (
    <>
      <LoginModal
        open={authModal === "login"}
        onClose={closeModals}
        onSwitchToRegister={() => setAuthModal("register")}
      />
      <RegisterModal
        open={authModal === "register"}
        onClose={closeModals}
        onSwitchToLogin={() => setAuthModal("login")}
      />
    </>
  );
}

function LoginModal({ open, onClose, onSwitchToRegister }: { open: boolean; onClose: () => void; onSwitchToRegister: () => void }) {
  const { login } = useAuth();
  const { setView } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك في منصة عمرة" });
      setEmail("");
      setPassword("");

      // تحويل تلقائي للوحة التحكم المناسبة حسب الدور
      const role = result.user?.role;
      if (role === "SUPER_ADMIN") {
        setView("admin-dashboard");
      } else if (role === "COMPANY") {
        setView("company-dashboard");
      }
      onClose();
    } catch (e: any) {
      toast({ title: "فشل تسجيل الدخول", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <LogIn className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl">تسجيل الدخول</DialogTitle>
          <DialogDescription>أدخل بياناتك للوصول إلى حسابك</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email" className="mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> البريد الإلكتروني
            </Label>
            <Input
              id="login-email"
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@umrah.ly"
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="login-password" className="mb-1.5 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> كلمة المرور
            </Label>
            <Input
              id="login-password"
              type="password"
              required
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-right"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
          </Button>
        </form>

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <button onClick={onSwitchToRegister} className="text-primary font-medium hover:underline">
            سجّل شركتك الآن
          </button>
        </div>

        <div className="bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">حسابات تجريبية:</div>
          <div className="space-y-0.5" dir="ltr">
            <div>Admin: admin@umrah.ly / admin123</div>
            <div>Company: company@umrah.ly / company123</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegisterModal({ open, onClose, onSwitchToLogin }: { open: boolean; onClose: () => void; onSwitchToLogin: () => void }) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Account
    email: "",
    password: "",
    name: "",
    phone: "",
    // Company
    companyName: "",
    description: "",
    licenseNumber: "",
    companyPhone: "",
    whatsapp: "",
    companyEmail: "",
    address: "",
    city: "",
    country: "ليبيا",
    website: "",
  });

  const set = (key: string, val: string) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(form);
      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "سيتم مراجعة طلبك من قبل الإدارة قبل تفعيل الحساب",
      });
      onClose();
      // Reset
      setForm({
        email: "", password: "", name: "", phone: "",
        companyName: "", description: "", licenseNumber: "",
        companyPhone: "", whatsapp: "", companyEmail: "",
        address: "", city: "", country: "السعودية", website: "",
      });
      setStep(1);
    } catch (e: any) {
      toast({ title: "فشل التسجيل", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setStep(1); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl">تسجيل شركة عمرة جديدة</DialogTitle>
          <DialogDescription>أنشئ حساباً لشركتك على منصة عمرة وابدأ بعرض باقاتك</DialogDescription>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <StepIndicator step={1} current={step} label="بيانات الحساب" />
          <div className={`h-1 w-12 rounded ${step >= 2 ? "bg-primary" : "bg-border"}`} />
          <StepIndicator step={2} current={step} label="بيانات الشركة" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> الاسم الكامل *
                  </Label>
                  <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="اسم المسؤول" />
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> رقم الهاتف *
                  </Label>
                  <Input required dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+218 91XXX XXX / +218 92XXX XXX" className="text-right" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> البريد الإلكتروني *
                </Label>
                <Input required type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="company@example.ly" className="text-right" />
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> كلمة المرور *
                </Label>
                <Input required type="password" dir="ltr" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="text-right" />
                <p className="text-xs text-muted-foreground mt-1">يجب أن تكون 6 أحرف على الأقل</p>
              </div>
              <Button type="button" onClick={() => setStep(2)} disabled={!form.name || !form.phone || !form.email || !form.password} className="w-full bg-primary hover:bg-primary/90">
                التالي
              </Button>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> اسم الشركة *
                  </Label>
                  <Input required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="شركة كذا للعمرة" />
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> رقم الترخيص
                  </Label>
                  <Input dir="ltr" value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} placeholder="UMR-XXXX-XXXX" className="text-right" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> هاتف الشركة *
                  </Label>
                  <Input required dir="ltr" value={form.companyPhone} onChange={(e) => set("companyPhone", e.target.value)} placeholder="+218 91XXX XXX" className="text-right" />
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> واتساب
                  </Label>
                  <Input dir="ltr" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+218 91XXX XXX" className="text-right" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> بريد الشركة
                  </Label>
                  <Input type="email" dir="ltr" value={form.companyEmail} onChange={(e) => set("companyEmail", e.target.value)} placeholder="info@company.ly" className="text-right" />
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> الموقع الإلكتروني
                  </Label>
                  <Input dir="ltr" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="www.company.com" className="text-right" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> المدينة *
                  </Label>
                  <Select value={form.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="طرابلس">طرابلس</SelectItem>
                      <SelectItem value="بنغازي">بنغازي</SelectItem>
                      <SelectItem value="مصراتة">مصراتة</SelectItem>
                      <SelectItem value="الزاوية">الزاوية</SelectItem>
                      <SelectItem value="زليتن">زليتن</SelectItem>
                      <SelectItem value="صبراتة">صبراتة</SelectItem>
                      <SelectItem value="الخمس">الخمس</SelectItem>
                      <SelectItem value="سبها">سبها</SelectItem>
                      <SelectItem value="البيضاء">البيضاء</SelectItem>
                      <SelectItem value="طبرق">طبرق</SelectItem>
                      <SelectItem value="درنة">درنة</SelectItem>
                      <SelectItem value="ترهونة">ترهونة</SelectItem>
                      <SelectItem value="غريان">غريان</SelectItem>
                      <SelectItem value="صحيلا">صحيلا</SelectItem>
                      <SelectItem value="أوباري">أوباري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> الدولة
                  </Label>
                  <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="ليبيا" />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> العنوان التفصيلي
                </Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="الحي، الشارع..." />
              </div>

              <div>
                <Label className="mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> نبذة عن الشركة
                </Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="اكتب وصفاً موجزاً عن شركتك وخدماتها..." className="resize-none" />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>ملاحظة:</strong> بعد إرسال الطلب، ستقوم إدارة المنصة بمراجعة بيانات شركتك. سيتم تفعيل حسابك بعد الموافقة، وسيتم التواصل معك عبر البريد الإلكتروني.
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  رجوع
                </Button>
                <Button type="submit" disabled={loading || !form.companyName || !form.companyPhone || !form.city} className="flex-1 bg-primary hover:bg-primary/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                      <UserPlus className="ml-2 h-4 w-4" />
                      إنشاء الحساب
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>

        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <button onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
            تسجيل الدخول
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ step, current, label }: { step: number; current: number; label: string }) {
  const isActive = step === current;
  const isDone = step < current;
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {step}
      </div>
      <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}
