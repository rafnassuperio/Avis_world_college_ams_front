export type ReportTabId = "reports" | "document-count";

export interface ReportOverviewStats {
  studentEnrollment: {
    total: number;
    growth: string;
    local: number;
    international: number;
    period: string;
  };
  coursesOffered: {
    total: number;
    newCourses: number;
    categoriesCount: number;
    period: string;
  };
  thisMonthIntake: {
    total: number;
    growth: string;
    target: number;
    capacityPercentage: number;
    cohortName: string;
  };
}

export interface LocalInternationalDataPoint {
  period: string;
  local: number;
  international: number;
  total: number;
  localPercentage: number;
  internationalPercentage: number;
}

export interface PaymentStatusDataPoint {
  id: string;
  name: string;
  students: number;
  percentage: number;
  amount: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface IntakeDocumentCountItem {
  id: string;
  intakeName: string;
  term: string;
  academicYear: string;
  status: "ongoing" | "incoming" | "completed";
  cloo: number; // Conditional Letter of Offer
  loo: number; // Letter of Offer
  contract: number; // Student Contract
  advisoryNote: number; // Advisory Note
}

