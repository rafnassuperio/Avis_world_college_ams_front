import React from "react";
import { createBrowserRouter, RouterProvider, Navigate, type RouteObject } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";
import { OfflineFallback } from "@/components/common/OfflineFallback";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/common/PublicOnlyRoute";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { ROUTES } from "./routes";

// ============================================================================
// Lazy-Loaded Page Components (with automatic network retry & chunk recovery)
// ============================================================================
const DashboardPage = lazyWithRetry(() => import("@/features/dashboard/DashboardPage"), "DashboardPage");
const CollegePage = lazyWithRetry(() => import("@/features/college/CollegePage"), "CollegePage");
const StudentProfilePage = lazyWithRetry(() => import("@/features/college/StudentProfilePage"), "StudentProfilePage");
const CourseDetailPage = lazyWithRetry(() => import("@/features/college/CourseDetailPage"), "CourseDetailPage");
const PaymentPage = lazyWithRetry(() => import("@/features/payment/PaymentPage"), "PaymentPage");
const SettlePaymentPage = lazyWithRetry(() => import("@/features/payment/SettlePaymentPage"), "SettlePaymentPage");
const PaymentReportPage = lazyWithRetry(() => import("@/features/paymentReport/PaymentReportPage"), "PaymentReportPage");
const ReportsPage = lazyWithRetry(() => import("@/features/reports/ReportsPage"), "ReportsPage");
const AdminProfilePage = lazyWithRetry(() => import("@/features/profile/AdminProfilePage"), "AdminProfilePage");
const InstitutePage = lazyWithRetry(() => import("@/features/institute/InstitutePage"), "InstitutePage");
const TotalAdminsPage = lazyWithRetry(() => import("@/features/admins/TotalAdminsPage"), "TotalAdminsPage");
const TotalRepresentativesPage = lazyWithRetry(() => import("@/features/representatives/TotalRepresentativesPage"), "TotalRepresentativesPage");
const TotalAgentsPage = lazyWithRetry(() => import("@/features/agents/TotalAgentsPage"), "TotalAgentsPage");
const PartnerProfilePage = lazyWithRetry(() => import("@/features/partners/PartnerProfilePage"), "PartnerProfilePage");
const CourseCommissionPage = lazyWithRetry(() => import("@/features/courseCommission/CourseCommissionPage"), "CourseCommissionPage");
const LoginPage = lazyWithRetry(() => import("@/features/auth/LoginPage"), "LoginPage");

// ============================================================================
// Domain-Specific Route Definitions
// ============================================================================

/**
 * 1. College & Academic Routes
 */
const collegeRoutes: RouteObject = {
  path: "college",
  children: [
    {
      index: true,
      element: <CollegePage />,
    },
    // Match multi-segment student IDs (e.g., ATCG624/09/001)
    {
      path: "students/:studentId/*",
      element: <StudentProfilePage />,
    },
    // Match standard single-segment student IDs
    {
      path: "students/:studentId",
      element: <StudentProfilePage />,
    },
    {
      path: "students",
      element: (
        <Navigate
          to={ROUTES.COLLEGE.ROOT}
          replace
        />
      ),
    },
    {
      path: "courses/:courseId",
      element: <CourseDetailPage />,
    },
    {
      path: "courses",
      element: (
        <Navigate
          to={ROUTES.COLLEGE.ROOT}
          replace
        />
      ),
    },
  ],
};

/**
 * 2. Finance & Payment Routes
 */
const paymentRoutes: RouteObject[] = [
  {
    path: "payment",
    children: [
      {
        index: true,
        element: <PaymentPage />,
      },
      {
        path: "settle/:paymentId",
        element: <SettlePaymentPage />,
      },
      {
        path: "settle",
        element: <SettlePaymentPage />,
      },
    ],
  },
  {
    path: "payment_report",
    element: <PaymentReportPage />,
  },
];

/**
 * 3. Partners (Agents & Representatives) Routes
 */
const partnerRoutes: RouteObject[] = [
  {
    path: "agents",
    element: <TotalAgentsPage />,
  },
  {
    path: "representatives",
    element: <TotalRepresentativesPage />,
  },
  // Canonical partner profile routes (used by agents & reps modal/table navigation)
  {
    path: "partner/profile",
    element: <PartnerProfilePage />,
  },
  {
    path: "partner/:partnerType/:partnerId",
    element: <PartnerProfilePage />,
  },
  {
    path: "partner/:partnerType",
    element: <PartnerProfilePage />,
  },
  {
    path: "partner",
    element: (
      <Navigate
        to={ROUTES.AGENTS}
        replace
      />
    ),
  },
  // Direct shortcuts for agent and representative profiles
  {
    path: "agent/profile",
    element: <PartnerProfilePage />,
  },
  {
    path: "representative/profile",
    element: <PartnerProfilePage />,
  },
  // Course Commission Configuration Route
  {
    path: "commission-config",
    element: <CourseCommissionPage />,
  },
  {
    path: "course-commission",
    element: <CourseCommissionPage />,
  },
];

/**
 * 4. Administration & Governance Routes
 */
const adminRoutes: RouteObject[] = [
  {
    path: "admins",
    element: <TotalAdminsPage />,
  },
  {
    path: "profile",
    element: <AdminProfilePage />,
  },
  {
    path: "institute",
    element: <InstitutePage />,
  },
  {
    path: "report",
    element: <ReportsPage />,
  },
];

/**
 * 5. Legacy & Alias Redirects
 * Redirects legacy/alternative URLs to their canonical paths with HTTP 301-equivalent client navigation.
 */
const redirectRoutes: RouteObject[] = [
  // Admin aliases
  {
    path: "admin/profile",
    element: (
      <Navigate
        to={ROUTES.PROFILE}
        replace
      />
    ),
  },
  {
    path: "admin/admins",
    element: (
      <Navigate
        to={ROUTES.ADMINS}
        replace
      />
    ),
  },
  {
    path: "admin/total",
    element: (
      <Navigate
        to={ROUTES.ADMINS}
        replace
      />
    ),
  },
  {
    path: "total-admins",
    element: (
      <Navigate
        to={ROUTES.ADMINS}
        replace
      />
    ),
  },

  // Partner aliases
  {
    path: "total-representatives",
    element: (
      <Navigate
        to={ROUTES.REPRESENTATIVES}
        replace
      />
    ),
  },
  {
    path: "agent/representatives",
    element: (
      <Navigate
        to={ROUTES.REPRESENTATIVES}
        replace
      />
    ),
  },
  {
    path: "total-agents",
    element: (
      <Navigate
        to={ROUTES.AGENTS}
        replace
      />
    ),
  },
  {
    path: "agent/agents",
    element: (
      <Navigate
        to={ROUTES.AGENTS}
        replace
      />
    ),
  },
  {
    path: "commission/config",
    element: (
      <Navigate
        to={ROUTES.COMMISSION_CONFIG}
        replace
      />
    ),
  },
  {
    path: "course-commission-config",
    element: (
      <Navigate
        to={ROUTES.COMMISSION_CONFIG}
        replace
      />
    ),
  },

  // Report aliases
  {
    path: "reports",
    element: (
      <Navigate
        to={ROUTES.REPORT}
        replace
      />
    ),
  },
  {
    path: "payment-report",
    element: (
      <Navigate
        to={ROUTES.PAYMENT_REPORT}
        replace
      />
    ),
  },
  {
    path: "report/payment",
    element: (
      <Navigate
        to={ROUTES.PAYMENT_REPORT}
        replace
      />
    ),
  },
];

// ============================================================================
// Root Application Route Hierarchy
// ============================================================================
const routes: RouteObject[] = [
  // Standalone Fullscreen Authentication Routes (independent of Dashboard Shell)
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.SIGNIN,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },

  // Primary Dashboard App Shell (Protected behind Auth Guard)
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      // Dashboard Home
      {
        index: true,
        element: <DashboardPage />,
      },

      // Module Routes
      collegeRoutes,
      ...paymentRoutes,
      ...partnerRoutes,
      ...adminRoutes,

      // URL Normalization / Alias Redirects
      ...redirectRoutes,

      // In-app Offline Route
      {
        path: "offline",
        element: <OfflineFallback showBackButton />,
      },

      // 404 Catch-All Route
      {
        path: "*",
        element: <RouteErrorBoundary isNotFound />,
      },
    ],
  },

  // Standalone Fullscreen Routes (independent of Dashboard Layout)
  {
    path: ROUTES.OFFLINE_STANDALONE,
    element: (
      <OfflineFallback
        fullScreen
        showBackButton
      />
    ),
    errorElement: <RouteErrorBoundary />,
  },
];

/**
 * Browser Router Instance with React Router v7 future flags enabled
 */
const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

/**
 * AppRouter Component
 * Serves as the primary routing provider for the application.
 */
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
