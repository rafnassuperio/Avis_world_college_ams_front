export type PaymentReportTabId = "payment-report" | "cp-case-report";
export type PaymentSubTabId = "payment-report-sub" | "agent-rep-report";

export interface PaymentReportRecord {
  id: string;
  receiptNo: string;
  date: string;
  studentId: string;
  studentName: string;
  course: string;
  courseCode: string;
  intake: string;
  totalFee: number;
  amountToCollege: number;
  repCommission: number;
  agentCommission: number;
  currency: string;
  paymentMethod: "Credit Card" | "Bank Transfer" | "PayNow" | "Debit Card" | "Demand Draft";
  status: "Paid" | "Pending" | "Partially Paid" | "Refunded";
  agentName: string;
  repName: string;
  notes?: string;

  // Fee breakdown fields
  courseYield?: number;
  applicationFee?: number;
  ancillaryFee?: number;
  totalPayload?: number;
}

export interface AgentRepReportRecord {
  id: string;
  entityType: "Agent" | "Representative";
  name: string;
  organization: string;
  email: string;
  phone: string;
  studentsReferredCount: number;
  totalCourseVolume: number;
  commissionRate: number; // e.g. 10 (%)
  earnedCommission: number;
  amountPaid: number;
  amountPending: number;
  payoutStatus: "Settled" | "Pending" | "Processing";
  lastPayoutDate: string;
}

export interface CpCaseReportRecord {
  id: string;
  caseNumber: string;
  filingDate: string;
  studentId: string;
  studentName: string;
  course: string;
  corporatePartner: string;
  category: "Corporate Sponsorship" | "Fee Protection (FPS)" | "Progress Appeal" | "Special Consideration" | "Refund / Dispute";
  caseValue: number;
  settledValue: number;
  priority: "High" | "Medium" | "Low";
  status: "Under Review" | "Approved" | "Settled" | "Escalated" | "Closed";
  caseOfficer: string;
  remarks: string;

  // CP Financial & Schedule Breakdown
  shortfall?: number;
  cpPayable?: number;
  topUpCollected?: number;
  remainingCp?: number;
  dueStatus?: "Not Due" | "CP Due" | "CP Settled";
  cpStatus?: "Not Due" | "CP Due" | "CP Settled";
  channelPartner?: string;
  installment?: number | string;
  installmentAmount?: number;
  dueDate?: string;
  detectedDate?: string;
  detected?: string;
}

