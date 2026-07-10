"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ContactView() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 800));
    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنتواصل معك في أقرب وقت ممكن",
    });
    setForm({ name: "", email: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">تواصل معنا</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نحن هنا لمساعدتك. تواصل معنا في أي وقت ولأي استفسار حول خدماتنا أو باقات العمرة المتاحة
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <ContactCard icon={Phone} title="اتصل بنا" lines={["+966 50 000 0000", "متاح يومياً 9ص - 9م"]} />
          <ContactCard icon={MessageCircle} title="واتساب" lines={["+966 50 000 0000", "للاستفسارات السريعة"]} />
          <ContactCard icon={Mail} title="البريد الإلكتروني" lines={["info@umrah-platform.com", "للاستفسارات الرسمية"]} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-primary">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الاسم الكامل</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الرسالة</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
                  {submitting ? "جارٍ الإرسال..." : (
                    <>
                      <Send className="ml-2 h-4 w-4" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-secondary/30 border-border/60">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-primary">معلومات التواصل</h2>
              <div className="space-y-5">
                <InfoRow icon={MapPin} title="العنوان" content="الرياض، المملكة العربية السعودية" />
                <InfoRow icon={Phone} title="الهاتف" content="+966 50 000 0000" />
                <InfoRow icon={Mail} title="البريد الإلكتروني" content="info@umrah-platform.com" />
                <InfoRow icon={Clock} title="ساعات العمل" content="السبت - الخميس: 9 صباحاً - 9 مساءً" />
              </div>
              <div className="mt-6 pt-6 border-t border-border/40">
                <h3 className="font-semibold mb-3">تابعنا على</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon"><MessageCircle className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon"><Mail className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, title, lines }: { icon: any; title: string; lines: string[] }) {
  return (
    <Card className="text-center hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-bold mb-2">{title}</h3>
        {lines.map((l, i) => (
          <p key={i} className={`text-sm text-muted-foreground ${i === 0 ? "font-medium text-foreground mb-1" : ""}`} dir={l.startsWith("+") ? "ltr" : "rtl"}>
            {l}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">{title}</div>
        <div className="text-sm font-medium" dir={content.startsWith("+") ? "ltr" : "rtl"}>{content}</div>
      </div>
    </div>
  );
}
