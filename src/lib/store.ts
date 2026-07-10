import { create } from "zustand";

export type View =
  | "home"
  | "packages"
  | "companies"
  | "promotions"
  | "company-detail"
  | "admin-dashboard"
  | "company-dashboard"
  | "about"
  | "contact";

export type AuthModal = null | "login" | "register" | "package-detail" | "order" | "add-package" | "edit-package" | "company-register-success";

interface AppState {
  view: View;
  authModal: AuthModal;
  selectedPackageId: string | null;
  selectedCompanyId: string | null;
  selectedPackageForOrder: any | null;
  // navigation
  setView: (v: View) => void;
  setAuthModal: (m: AuthModal) => void;
  setSelectedPackageId: (id: string | null) => void;
  setSelectedCompanyId: (id: string | null) => void;
  setSelectedPackageForOrder: (pkg: any | null) => void;
  // helpers
  openLogin: () => void;
  openRegister: () => void;
  openPackageDetail: (id: string) => void;
  openOrderModal: (pkg: any) => void;
  closeModals: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  authModal: null,
  selectedPackageId: null,
  selectedCompanyId: null,
  selectedPackageForOrder: null,
  setView: (view) => set({ view, authModal: null }),
  setAuthModal: (authModal) => set({ authModal }),
  setSelectedPackageId: (selectedPackageId) => set({ selectedPackageId }),
  setSelectedCompanyId: (selectedCompanyId) => set({ selectedCompanyId }),
  setSelectedPackageForOrder: (selectedPackageForOrder) => set({ selectedPackageForOrder }),
  openLogin: () => set({ authModal: "login" }),
  openRegister: () => set({ authModal: "register" }),
  openPackageDetail: (id) => set({ selectedPackageId: id, authModal: "package-detail" }),
  openOrderModal: (pkg) => set({ selectedPackageForOrder: pkg, authModal: "order" }),
  closeModals: () => set({ authModal: null, selectedPackageId: null, selectedPackageForOrder: null }),
}));
