"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { HomeView } from "@/components/public/home-view";
import { PackagesView } from "@/components/public/packages-view";
import { CompaniesView } from "@/components/public/companies-view";
import { PromotionsView } from "@/components/public/promotions-view";
import { AboutView } from "@/components/public/about-view";
import { ContactView } from "@/components/public/contact-view";
import { PackageDetailModal } from "@/components/public/package-detail-modal";
import { OrderModal } from "@/components/public/order-modal";
import { AuthModals } from "@/components/auth/auth-modals";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { CompanyDashboard } from "@/components/company/company-dashboard";
import { useAppStore } from "@/lib/store";
import { useAuth, useInitAuth } from "@/hooks/use-auth";

export default function Home() {
  const { view } = useAppStore();
  const { user, loading } = useAuth();
  useInitAuth();

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  // Guard dashboards
  const showAdminDashboard = view === "admin-dashboard" && user?.role === "SUPER_ADMIN";
  const showCompanyDashboard = view === "company-dashboard" && user?.role === "COMPANY";

  // If user clicks dashboard but isn't authorized, fall back to home
  const effectiveView =
    view === "admin-dashboard" && user?.role !== "SUPER_ADMIN" ? "home" :
    view === "company-dashboard" && user?.role !== "COMPANY" ? "home" :
    view;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {showAdminDashboard ? (
          <AdminDashboard />
        ) : showCompanyDashboard ? (
          <CompanyDashboard />
        ) : (
          <>
            {effectiveView === "home" && <HomeView />}
            {effectiveView === "packages" && <PackagesView />}
            {effectiveView === "companies" && <CompaniesView />}
            {effectiveView === "promotions" && <PromotionsView />}
            {effectiveView === "about" && <AboutView />}
            {effectiveView === "contact" && <ContactView />}
          </>
        )}
      </main>

      {/* Hide footer on dashboard views */}
      {!showAdminDashboard && !showCompanyDashboard && <Footer />}

      {/* Modals */}
      <AuthModals />
      <PackageDetailModal />
      <OrderModal />
    </div>
  );
}
