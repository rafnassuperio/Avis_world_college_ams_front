export type CalcType = "Percent (%)" | "Fixed ($)";

export interface CommissionSplitRule {
  calcType: CalcType;
  value: number;
}

export interface CommissionTypeItem {
  id: string;
  typeName: string; // e.g. "Standard", "Executive", "Milestone Tier"
  agentShare: CommissionSplitRule;
  repShare: CommissionSplitRule;
}

export interface CourseCommissionConfig {
  id: string;
  courseId?: string;
  courseName: string;
  code: string;
  department?: string;
  level?: string;
  courseFee?: number;
  currency?: string;
  status?: "Active" | "Inactive";
  commissionTypes: CommissionTypeItem[];
  effectiveDate?: string;
  lastUpdated?: string;
}
