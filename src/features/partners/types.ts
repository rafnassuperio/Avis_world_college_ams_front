export type PartnerType = "agent" | "representative";

export type PartnerTabId = "overview" | "performance";

export interface StudentApplicationItem {
  id: string;
  date?: string;
  appliedDate: string;
  studentName: string;
  studentId: string;
  course?: string;
  program: string;
  intake: string;
  status: "Enrolled" | "Visa Approved" | "Under Review" | "Conditional Offer" | "Rejected";
  tuitionFee: string;
  paidAmount?: string;
  commission: string;
  earnedCommission?: string;
}

export interface PartnerKPIs {
  totalStudents: number;
  activeApplications: number;
  visaApprovalRate: number;
  totalCommission: string;
  earnedCommission: string;
  pendingCommission: string;
  totalCommissionPaid: string;
  partnerTier: string;
  complianceRating: number;
  contractRenewalDate: string;
}
