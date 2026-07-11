"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Shield, Users, Building2, ArrowLeft, Plane, MapPin, Calendar, Tag, TrendingUp, Award, Clock, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";

export function HomeView() {
  const { setView, openPackageDetail, setSelectedCompanyId } = useAppStore();
  const { data: settingsData } = useFetch<{ settings: any }>("/api/settings");
  const s = settingsData?.settings || {};

  const { data: featuredData, loading: featuredLoading } = useFetch<{ packages: any[] }>("/api/packages?featured=true");
  const { data: promosData } = useFetch<{ promotions: any[] }>("/api/promotions");
  const { data: featuredCompaniesData } = useFetch<{ companies: any[] }>("/api/companies?featured=true");
  const { data: allCompaniesData } = useFetch<{ companies: any[] }>("/api/companies");

  const featuredPackages = featuredData?.packages?.slice(0, 3) || [];
  const promotions = promosData?.promotions || [];
  const featuredCompanies = featuredCompaniesData?.companies || [];
  const allCompanies = allCompaniesData?.companies || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden islamic-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            {s.hero_badge && (
              <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 backdrop-blur">
                <Sparkles className="ml-1 h-3 w-3" />
                {s.hero_badge}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight">
              {s.hero_title || "رحلتك إلى بيت الله الحرام تبدأ من ليبيا"}
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {s.hero_subtitle || ""}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setView("companies")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg"
              >
                {s.hero_cta_primary || "تصفّح الشركات"}
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              {promotions.length > 0 && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("promotions")}
                  className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Tag className="ml-2 h-5 w-5" />
                  {s.hero_cta_secondary || "العروض الحالية"}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1440 60" className="w-full h-[40px] md:h-[60px]" preserveAspectRatio="none">
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="oklch(0.99 0.005 120)" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={Building2} value={s.stat_companies || "50+"} label={s.stat_companies_label || "شركة معتمدة"} />
          <StatCard icon={Plane} value={s.stat_packages || "200+"} label={s.stat_packages_label || "باقة متاحة"} />
          <StatCard icon={Users} value={s.stat_customers || "10,000+"} label={s.stat_customers_label || "عميل سعيد"} />
          <StatCard icon={Award} value={s.stat_experience || "15+"} label={s.stat_experience_label || "سنة خبرة"} />
        </div>
      </section>

      {/* Featured Companies (only shows if there are featured companies) */}
      {featuredCompanies.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-1 flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-accent" />
                {s.featured_companies_title || "شركات مميزة"}
              </h2>
              <p className="text-sm text-muted-foreground">{s.featured_companies_subtitle || "شركات مختارة بعناية وموصى بها"}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCompanies.map((c: any) => (
              <Card
                key={c.id}
                className="border-accent/30 hover:border-accent hover:shadow-lg cursor-pointer transition-all"
                onClick={() => { setSelectedCompanyId(c.id); setView("packages"); }}
              >
                <CardContent className="p-5 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{c.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{c.city}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="text-sm font-semibold">{c.rating?.toFixed(1)}</span>
                  </div>
                  <div className="mt-3 text-xs text-primary font-medium">
                    {c._count?.packages || 0} باقة متاحة
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Promotions (only shows if there are active promotions) */}
      {promotions.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-primary mb-1">{s.promotions_title || "العروض الحالية"}</h2>
              <p className="text-xs text-muted-foreground">{s.promotions_subtitle || ""}</p>
            </div>
            <Button variant="ghost" onClick={() => setView("promotions")} className="text-primary hover:bg-primary/5 text-sm">
              عرض الكل <ArrowLeft className="mr-1 h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-2xl bg-gradient-to-l from-accent/20 via-accent/10 to-transparent border border-accent/30 p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Tag className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-accent-foreground/70 mb-1">عرض حصري</div>
                <h3 className="text-lg md:text-xl font-bold text-accent-foreground mb-1">{promotions[0].title}</h3>
                <p className="text-sm text-accent-foreground/80">{promotions[0].description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setView("promotions")} className="border-accent/40 text-accent-foreground hover:bg-accent/10 hidden md:flex">
                كل العروض
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* All Companies */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">{s.all_companies_title || "كل الشركات"}</h2>
          <p className="text-sm text-muted-foreground">{s.all_companies_subtitle || "تصفح جميع شركات العمرة المسجلة في المنصة"}</p>
        </div>

        {allCompanies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>لا توجد شركات مسجلة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCompanies.map((c: any) => (
              <Card
                key={c.id}
                className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                onClick={() => { setSelectedCompanyId(c.id); setView("packages"); }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">{c.name}</h3>
                        {c.isFeatured && <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{c.city}</span>
                        <span>•</span>
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span>{c.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description || ""}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-xs text-primary font-medium">{c._count?.packages || 0} باقة</span>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      عرض الباقات <ArrowLeft className="mr-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured Packages */}
      {featuredPackages.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">باقات مميزة</h2>
              <p className="text-sm text-muted-foreground">أفضل الباقات المختارة من شركاتنا المعتمدة</p>
            </div>
            <Button variant="ghost" onClick={() => setView("packages")} className="text-primary hover:bg-primary/5">
              عرض الكل <ArrowLeft className="mr-1 h-4 w-4" />
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPackages.map((pkg) => (
                <FeaturedPackageCard key={pkg.id} pkg={pkg} onOpen={() => openPackageDetail(pkg.id)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">{s.why_title || "لماذا تختار منصة عمرة؟"}</h2>
          <p className="text-muted-foreground">{s.why_subtitle || ""}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureBlock icon={Shield} title={s.feature_1_title || "شركات موثوقة"} desc={s.feature_1_desc || ""} />
          <FeatureBlock icon={TrendingUp} title={s.feature_2_title || "أسعار تنافسية"} desc={s.feature_2_desc || ""} />
          <FeatureBlock icon={Clock} title={s.feature_3_title || "حجز سريع"} desc={s.feature_3_desc || ""} />
          <FeatureBlock icon={Award} title={s.feature_4_title || "خدمة متميزة"} desc={s.feature_4_desc || ""} />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl islamic-pattern relative overflow-hidden p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-primary/90" />
          <div className="relative text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{s.cta_title || "هل أنت شركة عمرة؟"}</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">{s.cta_desc || ""}</p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => useAppStore.getState().openRegister()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <Building2 className="ml-2 h-5 w-5" />
              {s.cta_button || "سجّل شركتك الآن"}
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
        <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">{pkg.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{pkg.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div>
            {pkg.oldPrice && (
              <div className="text-xs text-muted-foreground line-through">{pkg.oldPrice.toLocaleString()} {getCurrencySymbol(pkg.currency)}</div>
            )}
            <div className="text-lg font-extrabold text-primary">{pkg.price.toLocaleString()} <span className="text-xs">{getCurrencySymbol(pkg.currency)}</span></div>
          </div>
          <Button size="sm" onClick={onOpen} className="bg-primary hover:bg-primary/90">التفاصيل</Button>
        </div>
      </CardContent>
    </Card>
  );
}
