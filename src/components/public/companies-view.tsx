"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Building2, Package, Phone } from "lucide-react";

export function CompaniesView() {
  const { data, loading } = useFetch<{ companies: any[] }>("/api/companies");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">شركات العمرة المعتمدة</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          تعرّف على أفضل شركات العمرة المسجّلة في منصتنا، جميعها معتمدة ومرخّصة من الجهات المختصة.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : data?.companies?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد شركات معتمدة حالياً</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.companies?.map((company: any) => (
            <Card key={company.id} className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight mb-1">{company.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>{company.city}، {company.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      <span className="text-sm font-semibold">{company.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground mr-1">التقييم</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {company.description || "لا يوجد وصف"}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    <span>{company._count?.packages || 0} باقة</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span dir="ltr">{company.phone}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("company", company.id);
                    window.history.pushState({}, "", url);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                >
                  عرض الباقات
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
