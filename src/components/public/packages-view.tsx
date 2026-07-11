"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Star, Clock, Users, MapPin, Plane, Utensils, Compass, Calendar, Search, Sparkles, Tag, Building2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/currency";

interface Package {
  id: string;
  title: string;
  description: string;
  type: string;
  durationDays: number;
  price: number;
  oldPrice: number | null;
  currency: string;
  hotelStars: number;
  hotelName: string | null;
  includesTransport: boolean;
  includesMeals: boolean;
  includesGuide: boolean;
  includesZiyarat: boolean;
  departureDate: string | null;
  availableSeats: number;
  features: string | null;
  isFeatured: boolean;
  isActive: boolean;
  company: { id: string; name: string; rating: number; city: string };
}

const typeLabels: Record<string, string> = {
  UMRAH: "عمرة",
  HAJJ: "حج",
  COMBINED: "عمرة وحج",
  RAMADAN: "عمرة رمضان",
};

const typeColors: Record<string, string> = {
  UMRAH: "bg-primary/10 text-primary border-primary/20",
  HAJJ: "bg-accent/15 text-accent-foreground border-accent/30",
  COMBINED: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  RAMADAN: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

export function PackagesView() {
  const { data, loading } = useFetch<{ packages: Package[] }>("/api/packages");
  const { openPackageDetail, selectedCompanyId, setSelectedCompanyId } = useAppStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  let packages = data?.packages || [];

  // Filter by selected company (from home page click)
  if (selectedCompanyId) {
    packages = packages.filter((p) => p.company.id === selectedCompanyId);
  }

  // Filter
  if (search.trim()) {
    packages = packages.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.company.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (typeFilter !== "ALL") {
    packages = packages.filter((p) => p.type === typeFilter);
  }

  // Sort
  if (sortBy === "price-low") packages = [...packages].sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high") packages = [...packages].sort((a, b) => b.price - a.price);
  else if (sortBy === "duration") packages = [...packages].sort((a, b) => a.durationDays - b.durationDays);
  else if (sortBy === "rating") packages = [...packages].sort((a, b) => b.company.rating - a.company.rating);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        {selectedCompanyId && packages.length > 0 ? (
          <>
            <Badge className="bg-primary/10 text-primary mb-3">
              {packages[0].company.name}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">
              باقات {packages[0].company.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-3">
              {packages[0].company.city} • تقييم {packages[0].company.rating?.toFixed(1)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCompanyId(null)}
              className="text-primary hover:bg-primary/5"
            >
              عرض كل الباقات
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">باقات العمرة المتاحة</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اختر من بين أفضل باقات العمرة المقدمة من شركات معتمدة. جميع الباقات تشمل الإقامة والتنقل والإشراف الديني.
            </p>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8 bg-card rounded-xl border border-border/60 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن باقة أو شركة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأنواع</SelectItem>
            <SelectItem value="UMRAH">عمرة</SelectItem>
            <SelectItem value="RAMADAN">عمرة رمضان</SelectItem>
            <SelectItem value="HAJJ">حج</SelectItem>
            <SelectItem value="COMBINED">عمرة وحج</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="price-low">السعر: من الأقل</SelectItem>
            <SelectItem value="price-high">السعر: من الأعلى</SelectItem>
            <SelectItem value="duration">المدة: الأقصر</SelectItem>
            <SelectItem value="rating">التقييم: الأعلى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">لا توجد باقات مطابقة لبحثك</p>
          <p className="text-sm mt-1">جرّب تعديل عوامل التصفية</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} onOpen={() => openPackageDetail(pkg.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PackageCard({ pkg, onOpen }: { pkg: Package; onOpen: () => void }) {
  const features: string[] = pkg.features ? JSON.parse(pkg.features) : [];
  const discount = pkg.oldPrice ? Math.round(((pkg.oldPrice - pkg.price) / pkg.oldPrice) * 100) : 0;

  return (
    <Card className="group flex flex-col overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      {/* Top badge */}
      <div className="relative h-32 islamic-pattern flex items-end p-4">
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <Badge className={`${typeColors[pkg.type]} border`} variant="outline">
            {typeLabels[pkg.type]}
          </Badge>
          {pkg.isFeatured && (
            <Badge className="bg-accent text-accent-foreground border-0">
              <Sparkles className="ml-1 h-3 w-3" /> مميزة
            </Badge>
          )}
        </div>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-xs font-bold shadow">
            خصم {discount}%
          </div>
        )}
        <div className="text-primary-foreground relative z-10">
          <div className="text-2xl font-extrabold">{pkg.durationDays} أيام</div>
          <div className="text-xs opacity-90">{pkg.hotelName || "فندق حسب الباقة"}</div>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Building2 className="h-3.5 w-3.5" />
          <span>{pkg.company.name}</span>
          <span className="mr-1">•</span>
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="font-medium text-foreground">{pkg.company.rating.toFixed(1)}</span>
        </div>
        <h3 className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {pkg.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 pb-3 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Features icons */}
        <div className="flex flex-wrap gap-2">
          {pkg.includesTransport && <FeatureChip icon={Plane} label="نقل" />}
          {pkg.includesMeals && <FeatureChip icon={Utensils} label="وجبات" />}
          {pkg.includesGuide && <FeatureChip icon={Compass} label="مرشد" />}
          {pkg.includesZiyarat && <FeatureChip icon={MapPin} label="زيارات" />}
        </div>

        {/* Hotel stars */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>الفندق:</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < pkg.hotelStars ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>

        {/* Departure & seats */}
        <div className="flex items-center justify-between text-xs">
          {pkg.departureDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>تاريخ الانطلاق: {pkg.departureDate}</span>
            </div>
          )}
          {pkg.availableSeats > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <Users className="h-3.5 w-3.5" />
              <span>{pkg.availableSeats} مقعد متاح</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t bg-secondary/30">
        <div>
          {pkg.oldPrice && (
            <div className="text-xs text-muted-foreground line-through">
              {pkg.oldPrice.toLocaleString()} {getCurrencySymbol(pkg.currency)}
            </div>
          )}
          <div className="text-xl font-extrabold text-primary">
            {pkg.price.toLocaleString()} <span className="text-sm font-normal">{getCurrencySymbol(pkg.currency)}</span>
          </div>
        </div>
        <Button onClick={onOpen} size="sm" className="bg-primary hover:bg-primary/90">
          التفاصيل والحجز
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1 bg-primary/5 text-primary text-[11px] px-2 py-1 rounded-md border border-primary/10">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
  );
}
