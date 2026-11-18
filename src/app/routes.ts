/**
 * Application Route Registry
 * Centralized, type-safe route definitions and URL builders to eliminate
 * brittle hardcoded strings and maintain route consistency across the entire app.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNIN: "/signin",

  COLLEGE: {
    ROOT: "/college",
    STUDENTS: "/college/students",
    STUDENT_PROFILE: "/college/students/:studentId",
    getStudentProfile: (studentId: string) => `/college/students/${studentId}`,
    COURSES: "/college/courses",
    COURSE_DETAILS: "/college/courses/:courseId",
    getCourseDetails: (courseId: string) => `/college/courses/${courseId}`,
  },

  INSTITUTE: "/institute",

  PAYMENT: "/payment",
  SETTLE_PAYMENT: "/payment/settle/:paymentId",
  SETTLE_PAYMENT_BASE: "/payment/settle",
  getSettlePayment: (paymentId: string) => `/payment/settle/${paymentId}`,
  PAYMENT_REPORT: "/payment_report",

  COMMISSION_CONFIG: "/commission-config",
  COURSE_COMMISSION: "/commission-config",

  REPORT: "/report",

  ADMINS: "/admins",
  TOTAL_ADMINS: "/admins",

  REPRESENTATIVES: "/representatives",
  TOTAL_REPRESENTATIVES: "/representatives",

  AGENTS: "/agents",
  TOTAL_AGENTS: "/agents",

  PARTNER: "/partner",
  PARTNER_PROFILE: "/partner/profile",
  PARTNER_DETAIL: "/partner/:partnerType/:partnerId",
  AGENT_PROFILE: "/agent/profile",
  REPRESENTATIVE_PROFILE: "/representative/profile",
  getPartnerProfile: (type: "agent" | "representative", id: string) => `/partner/profile?type=${type}&id=${encodeURIComponent(id)}`,
  getPartnerDetailPath: (partnerType: "agent" | "representative", partnerId: string) => `/partner/${partnerType}/${encodeURIComponent(partnerId)}`,

  PROFILE: "/profile",
  ADMIN_PROFILE: "/profile",
  getAdminProfile: (adminId: string) => `/profile?id=${encodeURIComponent(adminId)}`,

  OFFLINE: "/offline",
  OFFLINE_STANDALONE: "/offline-standalone",
} as const;

export type AppRoutes = typeof ROUTES;
