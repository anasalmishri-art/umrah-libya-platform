"use client";

import { Star, Phone, Mail, MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Footer() {
  const { setView } = useAppStore();

  return (
    <footer className="mt-auto border-t border-border/40 bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-lg font-extrabold text-primary">منصة عمرة</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة متكاملة تجمع أفضل شركات العمرة المعتمدة لتقدم لك باقات متنوعة بأسعار تنافسية وخدمة متميزة.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setView("home")} className="hover:text-primary">الرئيسية</button></li>
              <li><button onClick={() => setView("packages")} className="hover:text-primary">الباقات</button></li>
              <li><button onClick={() => setView("companies")} className="hover:text-primary">الشركات</button></li>
              <li><button onClick={() => setView("promotions")} className="hover:text-primary">العروض</button></li>
              <li><button onClick={() => setView("about")} className="hover:text-primary">من نحن</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">خدماتنا</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>باقات العمرة الموسمية</li>
              <li>باقات الحج المتميزة</li>
              <li>عمرة رمضان</li>
              <li>عمرة الإجازات</li>
              <li>عمرة العائلات</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">+966 50 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@umrah-platform.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 منصة عمرة. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-primary">سياسة الخصوصية</button>
            <button className="hover:text-primary">الشروط والأحكام</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
