"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Shield, Users, Building2, ArrowLeft, Plane, MapPin, Calendar, Tag, TrendingUp, Award, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";

export function HomeView() {
  const { setView, openPackageDetail } = useAppStore();
  const { data: featuredData, loading: featuredLoading } = useFetch<{ packages: any[] }>("/api/packages?featured=true");
  const { data: promosData } = useFetch<{ promotions: any[] }>("/api/promotions");
  const { data: companiesData } = useFetch<{ companies: any[] }>("/api/companies");

  const featuredPackages = featuredData?.packages?.slice(0, 3) || [];
  const promotions = promosData?.promotions || [];
  const companiesCount = companiesData?.companies?.length || 0;
  const packagesCount = featuredData?.packages?.length || 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 backdrop-blur">
              <Sparkles className="ml-1 h-3 w-3" />
              منصة عمرة المعتمدة
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight">
              رحلتك إلى بيت الله الحرام
              <br />
              <span className="text-accent">تبدأ من هنا</span>
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              منصة متكاملة تجمع أفضل شركات العمرة المعتمدة لتقدّم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة على مدار العام
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setView("packages")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg"
              >
                تصفّح الباقات
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView("promotions")}
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                <Tag className="ml-2 h-5 w-5" />
                العروض الحالية
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative">
          <svg viewBox="0 0 1440 60" className="w-full h-[40px] md:h-[60px]" preserveAspectRatio="none">
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="oklch(0.99 0.005 120)" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={Building2} value={`${companiesCount}+`} label="شركة معتمدة" />
          <StatCard icon={Plane} value={`${packagesCount}+`} label="باقة متاحة" />
          <StatCard icon={Users} value="10,000+" label="عميل سعيد" />
          <StatCard icon={Award} value="15+" label="سنة خبرة" />
        </div>
      </section>

      {/* Promotions banner (if any) */}
      {promotions.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="rounded-2xl bg-gradient-to-l from-accent/20 via-accent/10 to-transparent border border-accent/30 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Tag className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-accent-foreground/70 mb-1">عروض حصرية</div>
                <h3 className="text-lg md:text-xl font-bold text-accent-foreground mb-1">
                  {promotions[0].title}
                </h3>
                <p className="text-sm text-accent-foreground/80">{promotions[0].description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("promotions")}
                className="border-accent/40 text-accent-foreground hover:bg-accent/10 hidden md:flex"
              >
                كل العروض
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Packages */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">الباقات المميزة</h2>
            <p className="text-sm text-muted-foreground">أفضل الباقات المختارة من شركاتنا المعتمدة</p>
          </div>
          <Button variant="ghost" onClick={() => setView("packages")} className="text-primary hover:bg-primary/5">
            عرض الكل
            <ArrowLeft className="mr-1 h-4 w-4" />
          </Button>
        </div>

        {featuredLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        ) : featuredPackages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>لا توجد باقات مميزة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <FeaturedPackageCard key={pkg.id} pkg={pkg} onOpen={() => openPackageDetail(pkg.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">لماذا تختار منصة عمرة؟</h2>
          <p className="text-muted-foreground">نوفّر لك تجربة عمرة متكاملة وآمنة من البداية حتى النهاية</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureBlock
            icon={Shield}
            title="شركات موثوقة"
            desc="جميع الشركات معتمدة ومرخّصة، يتم التحقق منها قبل انضمامها للمنصة"
          />
          <FeatureBlock
            icon={TrendingUp}
            title="أسعار تنافسية"
            desc="قارن بين باقات متعددة من شركات مختلفة واختر الأنسب لميزانيتك"
          />
          <FeatureBlock
            icon={Clock}
            title="حجز سريع"
            desc="احجز باقتك خلال دقائق عبر واتساب وأكمل إجراءات الدفع بسهولة"
          />
          <FeatureBlock
            icon={Award}
            title="خدمة متميزة"
            desc="إشراف ديني متخصص ومرشدون ذوو خبرة لضمان رحلة مريحة ومباركة"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl islamic-pattern relative overflow-hidden p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-primary/90" />
          <div className="relative text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">هل أنت شركة عمرة؟</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              انضم إلى منصتنا واصنع حضوراً رقمياً قوياً. سجّل شركتك الآن وابدأ بعرض باقاتك على آلاف العملاء.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => useAppStore.getState().openRegister()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <Building2 className="ml-2 h-5 w-5" />
              سجّل شركتك الآن
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4 md:p-5 flex items-center gap-3">
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-lg md:text-xl font-extrabold text-foreground leading-tight">{value}</div>
          <div className="text-[11px] md:text-xs text-muted-foreground truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureBlock({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <Card className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all">
      <CardContent className="p-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function FeaturedPackageCard({ pkg, onOpen }: { pkg: any; onOpen: () => void }) {
  const discount = pkg.oldPrice ? Math.round(((pkg.oldPrice - pkg.price) / pkg.oldPrice) * 100) : 0;
  const typeLabels: Record<string, string> = {
    UMRAH: "عمرة", HAJJ: "حج", COMBINED: "عمرة وحج", RAMADAN: "عمرة رمضان",
  };

  return (
    <Card className="group flex flex-col overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <div className="relative h-28 islamic-pattern flex items-end p-4">
        <Badge className="absolute top-3 right-3 bg-primary-foreground/90 text-primary border-0">
          {typeLabels[pkg.type] || "باقة"}
        </Badge>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-xs font-bold">
            خصم {discount}%
          </div>
        )}
        <div className="text-primary-foreground relative z-10">
          <div className="text-2xl font-extrabold">{pkg.durationDays} أيام</div>
          <div className="text-xs opacity-90">{pkg.hotelName}</div>
        </div>
      </div>
      <CardContent className="flex-1 p-5 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Building2 className="h-3.5 w-3.5" />
          <span>{pkg.company?.name}</span>
          <Star className="h-3 w-3 fill-accent text-accent mr-1" />
          <span className="font-medium">{pkg.company?.rating?.toFixed(1)}</span>
        </div>
        <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {pkg.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
          {pkg.description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div>
            {pkg.oldPrice && (
              <div className="text-xs text-muted-foreground line-through">
                {pkg.oldPrice.toLocaleString()} {getCurrencySymbol(pkg.currency)}
              </div>
            )}
            <div className="text-lg font-extrabold text-primary">
              {pkg.price.toLocaleString()} <span className="text-xs">{getCurrencySymbol(pkg.currency)}</span>
            </div>
          </div>
          <Button size="sm" onClick={onOpen} className="bg-primary hover:bg-primary/90">
            التفاصيل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
