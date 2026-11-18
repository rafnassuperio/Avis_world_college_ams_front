import React from "react";
import type { LucideProps } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Globe2,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Layers,
  LayoutDashboard,
  Percent,
  Receipt,
  ReceiptText,
  School,
  ShieldCheck,
  Tags,
  UploadCloud,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

/**
 * Curated static icon registry for tree-shakeable dynamic icon rendering.
 * Avoids `import * as LucideIcons` which balloons the production bundle by over 700kB.
 */
const ICON_REGISTRY: Record<string, React.ComponentType<LucideProps>> = {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Globe2,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Layers,
  LayoutDashboard,
  Percent,
  Receipt,
  ReceiptText,
  School,
  ShieldCheck,
  Tags,
  UploadCloud,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_REGISTRY[name] || HelpCircle;
  return <IconComponent {...props} />;
};

export default DynamicIcon;
