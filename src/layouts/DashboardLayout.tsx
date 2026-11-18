import React, { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";
import { SearchModal } from "@/components/ui/SearchModal";
import { SignOutModal } from "@/components/ui/SignOutModal";
import { Toaster } from "@/components/common/ToastMessage";
import { PageLoader } from "@/components/common/PageLoader";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export const DashboardLayout: React.FC = () => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary">
      {/* Scroll restoration on route change */}
      <ScrollRestoration />

      {/* Global Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[padding-left]",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-[276px]",
        )}
      >
        <Header />

        <main className="flex-1 px-4 pb-10 sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-[1896px]">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <SearchModal />
      <SignOutModal />
      <Toaster />
    </div>
  );
};
