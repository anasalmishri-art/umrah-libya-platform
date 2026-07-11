"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield, Users, Award, Building2, Heart, Sparkles, Target, Eye } from "lucide-react";

export function AboutView() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
            <Star className="h-8 w-8 fill-current" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">من نحن</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            منصة عمرة هي أول منصة إلكترونية متكاملة في ليبيا متخصصة في تجميع شركات العمرة المعتمدة تحت مظلة واحدة، لتسهيل عملية البحث والحجز على العملاء.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">رسالتنا</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                تسهيل رحلة العمرة على المسلمين من خلال توفير منصة موحدة تعرض أفضل باقات العمرة من شركات معتمدة، مع ضمان الشفافية في الأسعار وجودة الخدمة، ليتمكن كل مسلم من أداء عمرته بكل يسر وسهولة.
              </p>
            </CardContent>
          </Card>
          <Card className="border-accent/30">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground mb-4">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-accent-foreground">رؤيتنا</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                أن نكون المنصة الأولى عربياً وإسلامياً في خدمات العمرة والحج، عبر تبني أحدث التقنيات الرقمية وتوسيع شبكة شركائنا من شركات العمرة المعتمدة في مختلف الدول، خدمةً لضيوف الرحمن.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-primary mb-6 text-center">قيمنا الأساسية</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard icon={Shield} title="الموثوقية" desc="نختار شركاءنا بعناية فائقة بعد التحقق من اعتمادهم وتراخيصهم" />
            <ValueCard icon={Heart} title="الشفافية" desc="أسعار واضحة وباقات مفصّلة بدون رسوم خفية أو مفاجآت" />
            <ValueCard icon={Award} title="الجودة" desc="نلتزم بأعلى معايير الجودة في كل باقة عرضها شركاؤنا" />
            <ValueCard icon={Users} title="خدمة العملاء" desc="فريق دعم متخصص لمساعدتك في كل خطوة من رحلتك" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatBlock value="50+" label="شركة عمرة معتمدة" />
          <StatBlock value="200+" label="باقة متاحة" />
          <StatBlock value="10,000+" label="عميل سعيد" />
          <StatBlock value="15+" label="سنة خبرة" />
        </div>

        {/* How it works */}
        <div className="bg-secondary/30 rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-primary mb-2 text-center">كيف تعمل المنصة؟</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">ثلاث خطوات بسيطة تفصلك عن رحلة العمر</p>
          <div className="grid gap-6 md:grid-cols-3">
            <StepCard step="1" title="تصفّح الباقات" desc="اختر باقة العمرة المناسبة لك من بين باقات شركات متعددة" />
            <StepCard step="2" title="تواصل عبر واتساب" desc="يتم تحويلك مباشرة للشركة عبر واتساب لإتمام عملية الحجز والدفع" />
            <StepCard step="3" title="استمتع برحلتك" desc="بعد تأكيد الدفع من الإدارة، تكون رحلتك جاهزة للانطلاق" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <Card className="border-border/60 hover:border-primary/30 transition-all">
      <CardContent className="p-5 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-bold mb-1.5">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{value}</div>
      <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-lg mb-3">
        {step}
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
