import { CourseCommissionConfig } from "../types";
import { safeStorage } from "@/lib/security";

export const STORAGE_KEY_COURSE_COMMISSION = "awc_course_commission_configs_v2";

export const defaultCourseCommissionList: CourseCommissionConfig[] = [
  {
    id: "ccc-1",
    courseId: "crs-1",
    courseName: "BSc Data Science & Artificial Intelligence",
    code: "BSc-DS",
    department: "School of Computing & AI",
    level: "Undergraduate",
    courseFee: 2452.5,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-11-10",
    commissionTypes: [
      {
        id: "ct-1-1",
        typeName: "Standard",
        agentShare: { calcType: "Percent (%)", value: 15 },
        repShare: { calcType: "Percent (%)", value: 3.5 },
      },
      {
        id: "ct-1-2",
        typeName: "Application Fee",
        agentShare: { calcType: "Fixed ($)", value: 50 },
        repShare: { calcType: "Fixed ($)", value: 20 },
      },
    ],
  },
  {
    id: "ccc-2",
    courseId: "crs-2",
    courseName: "Bachelor of Business Administration (Global Management)",
    code: "BBA-GBM",
    department: "School of Business",
    level: "Undergraduate",
    courseFee: 9800.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-01-15",
    lastUpdated: "2026-11-12",
    commissionTypes: [
      {
        id: "ct-2-1",
        typeName: "Standard",
        agentShare: { calcType: "Percent (%)", value: 16 },
        repShare: { calcType: "Percent (%)", value: 4.0 },
      },
      {
        id: "ct-2-2",
        typeName: "Milestone Tier",
        agentShare: { calcType: "Percent (%)", value: 18.5 },
        repShare: { calcType: "Percent (%)", value: 5.0 },
      },
    ],
  },
  {
    id: "ccc-3",
    courseId: "crs-3",
    courseName: "BSc Cybersecurity, Cloud & Computer Networks",
    code: "BSc-CSN",
    department: "School of Computing & AI",
    level: "Undergraduate",
    courseFee: 11200.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-02-01",
    lastUpdated: "2026-11-08",
    commissionTypes: [
      {
        id: "ct-3-1",
        typeName: "Standard",
        agentShare: { calcType: "Percent (%)", value: 14.5 },
        repShare: { calcType: "Percent (%)", value: 3.5 },
      },
      {
        id: "ct-3-2",
        typeName: "Advance Booking Incentive",
        agentShare: { calcType: "Fixed ($)", value: 300 },
        repShare: { calcType: "Fixed ($)", value: 100 },
      },
    ],
  },
  {
    id: "ccc-4",
    courseId: "crs-4",
    courseName: "Bachelor of Design in Interactive Media & UX",
    code: "BDes-IM",
    department: "School of Design",
    level: "Undergraduate",
    courseFee: 10400.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-10-28",
    commissionTypes: [
      {
        id: "ct-4-1",
        typeName: "Standard",
        agentShare: { calcType: "Percent (%)", value: 14.0 },
        repShare: { calcType: "Percent (%)", value: 3.0 },
      },
    ],
  },
  {
    id: "ccc-5",
    courseId: "crs-5",
    courseName: "MBA Executive Technology Management",
    code: "MBA-ETM",
    department: "School of Business",
    level: "Postgraduate",
    courseFee: 15000.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-03-01",
    lastUpdated: "2026-11-14",
    commissionTypes: [
      {
        id: "ct-5-1",
        typeName: "Executive",
        agentShare: { calcType: "Percent (%)", value: 20.0 },
        repShare: { calcType: "Percent (%)", value: 5.0 },
      },
      {
        id: "ct-5-2",
        typeName: "Corporate Cohort Bounty",
        agentShare: { calcType: "Fixed ($)", value: 1000 },
        repShare: { calcType: "Fixed ($)", value: 250 },
      },
    ],
  },
  {
    id: "ccc-6",
    courseId: "crs-6",
    courseName: "MSc Applied Artificial Intelligence & Machine Learning",
    code: "MSc-AAI",
    department: "School of Computing & AI",
    level: "Postgraduate",
    courseFee: 14500.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-01-20",
    lastUpdated: "2026-11-05",
    commissionTypes: [
      {
        id: "ct-6-1",
        typeName: "Standard",
        agentShare: { calcType: "Percent (%)", value: 18.0 },
        repShare: { calcType: "Percent (%)", value: 4.0 },
      },
    ],
  },
  {
    id: "ccc-7",
    courseId: "crs-7",
    courseName: "Diploma in International Hospitality & Resort Management",
    code: "DIP-IHM",
    department: "School of Hospitality",
    level: "Diploma",
    courseFee: 7800.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-02-15",
    lastUpdated: "2026-10-18",
    commissionTypes: [
      {
        id: "ct-7-1",
        typeName: "Standard",
        agentShare: { calcType: "Percent (%)", value: 12.5 },
        repShare: { calcType: "Percent (%)", value: 2.5 },
      },
      {
        id: "ct-7-2",
        typeName: "Upfront Tuition Bonus",
        agentShare: { calcType: "Fixed ($)", value: 150 },
        repShare: { calcType: "Fixed ($)", value: 50 },
      },
    ],
  },
  {
    id: "ccc-8",
    courseId: "crs-8",
    courseName: "Certificate in Full-Stack Web Development & Cloud",
    code: "CERT-FS",
    department: "School of Computing & AI",
    level: "Certificate",
    courseFee: 3200.0,
    currency: "SGD",
    status: "Active",
    effectiveDate: "2026-05-01",
    lastUpdated: "2026-11-01",
    commissionTypes: [
      {
        id: "ct-8-1",
        typeName: "Bootcamp Flat",
        agentShare: { calcType: "Fixed ($)", value: 450 },
        repShare: { calcType: "Fixed ($)", value: 100 },
      },
    ],
  },
];

export function getCourseCommissionList(): CourseCommissionConfig[] {
  return safeStorage.getItem<CourseCommissionConfig[]>(
    STORAGE_KEY_COURSE_COMMISSION,
    defaultCourseCommissionList
  );
}

export function saveCourseCommissionList(list: CourseCommissionConfig[]): void {
  safeStorage.setItem(STORAGE_KEY_COURSE_COMMISSION, list);
}

export function resetCourseCommissionList(): CourseCommissionConfig[] {
  safeStorage.setItem(STORAGE_KEY_COURSE_COMMISSION, defaultCourseCommissionList);
  return defaultCourseCommissionList;
}
