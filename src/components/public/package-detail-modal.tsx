"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { useFetch } from "@/hooks/use-fetch";
import { Star, Clock, Users, MapPin, Plane, Utensils, Compass, Calendar, Building2, Phone, CheckCircle2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const typeLabels: Record<string, string> = {
  UMRAH: "عمرة", HAJJ: "حج", COMBINED: "عمرة وحج", RAMADAN: "عمرة رمضان",
};

export function PackageDetailModal() {
  const { authModal, selectedPackageId, closeModals, openOrderModal } = useAppStore();
  const open = authModal === "package-detail";
  const { data, loading } = useFetch<{ packages: any[] }>(
    selectedPackageId ? `/api/packages` : "/api/packages"
  );
  const pkg = data?.packages?.find((p: any) => p.id === selectedPackageId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModals()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>تفاصيل الباقة</DialogTitle>
          <DialogDescription>عرض تفاصيل الباقة الكاملة</DialogDescription>
        </DialogHeader>
        {loading || !pkg ? (
          <div className="p-6">
            <Skeleton className="h-64 w-full rounded-xl mb-4" />
            <Skeleton className="h-8 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <PackageDetailContent pkg={pkg} onBook={() => openOrderModal(pkg)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PackageDetailContent({ pkg, onBook }: { pkg: any; onBook: () => void }) {
  const features: string[] = pkg.features ? JSON.parse(pkg.features) : [];
  const discount = pkg.oldPrice ? Math.round(((pkg.oldPrice - pkg.price) / pkg.oldPrice) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="relative h-44 islamic-pattern">
        <button
          onClick={() => useAppStore.getState().closeModals()}
          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-primary-foreground/20 backdrop-blur text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/30"
        >
          <X className="h-4 w-4" />
        </button>
        <Badge className="absolute top-3 right-3 bg-primary-foreground/90 text-primary border-0">
          {typeLabels[pkg.type] || "باقة"}
        </Badge>
        {discount > 0 && (
          <div className="absolute top-3 left-14 bg-destructive text-destructive-foreground rounded-full px-3 py-1 text-xs font-bold">
            خصم {discount}%
          </div>
        )}
        <div className="absolute bottom-4 right-4 left-4 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{pkg.company?.name}</span>
            <Star className="h-3.5 w-3.5 fill-accent text-accent mr-1" />
            <span className="text-sm font-semibold">{pkg.company?.rating?.toFixed(1)}</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">{pkg.title}</h2>
          <div className="flex items-center gap-3 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {pkg.durationDays} أيام
            </span>
            {pkg.hotelName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {pkg.hotelName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Description */}
        <div>
          <h3 className="font-bold text-base mb-2 text-primary">عن الباقة</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoTile icon={Clock} label="المدة" value={`${pkg.durationDays} أيام`} />
          <InfoTile icon={Calendar} label="الانطلاق" value={pkg.departureDate || "حسب الطلب"} />
          <InfoTile icon={Users} label="المقاعد" value={pkg.availableSeats > 0 ? `${pkg.availableSeats} متاح` : "حسب الطلب"} />
          <InfoTile icon={MapPin} label="المدينة" value={pkg.company?.city || "مكة"} />
        </div>

        {/* Includes */}
        <div>
          <h3 className="font-bold text-base mb-3 text-primary">تشمل الباقة</h3>
          <div className="grid grid-cols-2 gap-2">
            <IncludeItem included={pkg.includesTransport} icon={Plane} label="النقل من وإلى المطار" />
            <IncludeItem included={pkg.includesMeals} icon={Utensils} label="الوجبات الغذائية" />
            <IncludeItem included={pkg.includesGuide} icon={Compass} label="مرشد ديني متخصص" />
            <IncludeItem included={pkg.includesZiyarat} icon={MapPin} label="جولات زيارة للأماكن المقدسة" />
          </div>
        </div>

        {/* Features list */}
        {features.length > 0 && (
          <div>
            <h3 className="font-bold text-base mb-3 text-primary">المميزات التفصيلية</h3>
            <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotel info */}
        <div>
          <h3 className="font-bold text-base mb-3 text-primary">معلومات الإقامة</h3>
          <div className="bg-card border border-border/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm">{pkg.hotelName || "حسب الباقة"}</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < pkg.hotelStars ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              تصنيف الفندق: {pkg.hotelStars} نجوم
            </div>
          </div>
        </div>

        <Separator />

        {/* Price + action */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {pkg.oldPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {pkg.oldPrice.toLocaleString()} {pkg.currency}
              </div>
            )}
            <div className="text-3xl font-extrabold text-primary">
              {pkg.price.toLocaleString()}
              <span className="text-base font-normal mr-1"> {pkg.currency}</span>
            </div>
            <div className="text-xs text-muted-foreground">السعر للفرد الواحد</div>
          </div>
          <Button
            size="lg"
            onClick={onBook}
            className="bg-primary hover:bg-primary/90 font-semibold shadow-md"
          >
            احجز الآن
          </Button>
        </div>

        {/* Company contact */}
        <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{pkg.company?.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span dir="ltr">{pkg.company?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-secondary/30 rounded-lg p-3 text-center">
      <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function IncludeItem({ included, icon: Icon, label }: { included: boolean; icon: any; label: string }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${included ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40 opacity-60"}`}>
      {included ? (
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="text-xs">{label}</span>
    </div>
  );
}
