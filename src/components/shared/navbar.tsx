"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, LogOut, User, Building2, LayoutDashboard, X, Moon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", label: "الرئيسية" },
  { key: "packages", label: "الباقات" },
  { key: "companies", label: "الشركات" },
  { key: "promotions", label: "العروض" },
  { key: "about", label: "من نحن" },
  { key: "contact", label: "تواصل معنا" },
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const { view, setView, openLogin, openRegister } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (key: any) => {
    setView(key);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold leading-none text-primary">منصة عمرة</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">رحلتك إلى بيت الله الحرام</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                view === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth section */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-primary/5">
                  <Avatar className="h-8 w-8 bg-primary/15">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <div className="text-xs font-semibold leading-tight">{user.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {user.role === "SUPER_ADMIN" ? "مدير المنصة" : user.role === "COMPANY" ? "شركة عمرة" : "عميل"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user.role === "SUPER_ADMIN" && (
                  <DropdownMenuItem onClick={() => setView("admin-dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </DropdownMenuItem>
                )}
                {user.role === "COMPANY" && (
                  <DropdownMenuItem onClick={() => setView("company-dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </DropdownMenuItem>
                )}
                {user.role === "CUSTOMER" && (
                  <DropdownMenuItem onClick={() => setView("customer-dashboard")} className="cursor-pointer">
                    <User className="ml-2 h-4 w-4" />
                    <span>حسابي</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={openLogin} className="font-medium">
                تسجيل الدخول
              </Button>
              <Button onClick={openRegister} className="bg-primary hover:bg-primary/90 font-medium shadow-sm">
                <Building2 className="ml-2 h-4 w-4" />
                تسجيل شركة
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-right text-primary">منصة عمرة</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg text-right transition-colors",
                    view === item.key
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-primary/5"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 pt-4 border-t">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  {user.role === "SUPER_ADMIN" && (
                    <Button
                      variant="outline"
                      onClick={() => { setView("admin-dashboard"); setMobileOpen(false); }}
                    >
                      <LayoutDashboard className="ml-2 h-4 w-4" />
                      لوحة التحكم
                    </Button>
                  )}
                  {user.role === "COMPANY" && (
                    <Button
                      variant="outline"
                      onClick={() => { setView("company-dashboard"); setMobileOpen(false); }}
                    >
                      <LayoutDashboard className="ml-2 h-4 w-4" />
                      لوحة التحكم
                    </Button>
                  )}
                  {user.role === "CUSTOMER" && (
                    <Button
                      variant="outline"
                      onClick={() => { setView("customer-dashboard"); setMobileOpen(false); }}
                    >
                      <User className="ml-2 h-4 w-4" />
                      حسابي
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      openLogin();
                      setMobileOpen(false);
                    }}
                  >
                    تسجيل الدخول
                  </Button>
                  <Button
                    onClick={() => {
                      openRegister();
                      setMobileOpen(false);
                    }}
                  >
                    <Building2 className="ml-2 h-4 w-4" />
                    تسجيل شركة
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
