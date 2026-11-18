import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  BarChart3,
  ReceiptText,
  Users,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { sanitizeUrl } from "@/lib/security";
import { ROUTES } from "@/app/routes";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  target?: string;
}

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.HOME,
  },
  {
    id: "college",
    label: "College",
    icon: GraduationCap,
    path: ROUTES.COLLEGE.ROOT,
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    path: ROUTES.PAYMENT,
  },
  {
    id: "report",
    label: "Report",
    icon: BarChart3,
    path: ROUTES.REPORT,
  },
  {
    id: "payment_report",
    label: "Payment Report",
    icon: ReceiptText,
    path: ROUTES.PAYMENT_REPORT,
  },
  {
    id: "sms",
    label: "SMS",
    icon: Users,
    path: sanitizeUrl(
      typeof window !== "undefined" && window.location.origin === "http://localhost:4000"
        ? "http://localhost:5173/"
        : import.meta.env.VITE_AMS_URL || "https://sms.acetekcollege.com/",
    ),
    target: "_blank",
  },
  {
    id: "lms",
    label: "LMS",
    icon: BookOpen,
    path: sanitizeUrl(
      typeof window !== "undefined" && window.location.origin === "http://localhost:4000"
        ? "http://localhost:5173/"
        : import.meta.env.VITE_LMS_URL || "https://lms.acetekcollege.com/",
    ),
    target: "_blank",
  },
];
