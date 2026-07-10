"use client";

import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Tag, Calendar, Percent, Sparkles, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PromotionsView() {
  const { data, loading } = useFetch<{ promotions: any[] }>("/api/promotions");
  const { setView } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/15 text-accent-foreground px-3 py-1.5 rounded-full text-xs font-medium mb-3">
          <Tag className="h-4 w-4" />
          عروض حصرية
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">العروض والتخفيضات</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          استفدد من أفضل عروض العمرة المتاحة الآن. عروض لفترة محدودة على باقات مختارة من شركاتنا المعتمدة.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : data?.promotions?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">لا توجد عروض حالياً</p>
          <p className="text-sm mt-1">تابعنا للحصول على أحدث العروض</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {data?.promotions?.map((promo: any) => (
            <Card key={promo.id} className="overflow-hidden border-accent/30 hover:shadow-md transition-all">
              <div className="relative h-28 bg-gradient-to-l from-accent/30 to-accent/10 flex items-center justify-center">
                <div className="absolute top-3 right-3">
                  <Badge className="bg-accent text-accent-foreground border-0">
                    {promo.discountType === "PERCENTAGE" ? (
                      <><Percent className="ml-1 h-3 w-3" />{promo.discountValue}%</>
                    ) : (
                      <>{promo.discountValue} د.ل</>
                    )}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-accent-foreground">
                    {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `${promo.discountValue} د.ل`}
                  </div>
                  <div className="text-xs text-accent-foreground/70 mt-1">خصم</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{promo.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>صالح من {promo.startDate} إلى {promo.endDate}</span>
                </div>
                <Button
                  onClick={() => setView("packages")}
                  variant="outline"
                  className="w-full border-accent/40 text-accent-foreground hover:bg-accent/10"
                >
                  تصفّح الباقات
                  <ArrowLeft className="mr-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
